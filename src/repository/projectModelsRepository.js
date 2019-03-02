import set from 'lodash.set';
import PouchDb from 'pouchdb';
import pouchdbFind from 'pouchdb-find';

PouchDb.plugin(pouchdbFind);

let adapter;
let db;

// eslint-disable-next-line
if (global.__TESTING__) {
    PouchDb.plugin(require('pouchdb-adapter-memory'));
    adapter = 'memory';
}

// TODO: writing backup to goog drive:
// https://github.com/pouchdb-community/pouchdb-replication-stream#dumping-to-a-string

export function destroy() {
    return pouchDb()
        .destroy()
        .then(() => (db = undefined));
}

function pouchDb() {
    if (!db) {
        db = new PouchDb('projectModel', { adapter });
    }
    return db;
}

export function getChildren(parentId) {
    // Index that does the actual sorting via map-reduce
    // const ddoc = {
    //     _id: '_design/parentSort',
    //     views: {
    //         parentSort: {
    //             map: `function mapFun(doc) {
    //                     if (doc.parentId) {
    //                         emit(doc.parentId);
    //                     }
    //                 }`
    //         }
    //     }
    // };
    // Create the index - noop if it already exists.
    return pouchDb()
        .createIndex({
            index: {
                fields: ['parentId', 'ui.sequence']
            }
        })
        .catch(function(err) {
            if (err.name !== 'conflict') {
                throw err;
            }
            // ignore if doc already exists
        })
        .then(() =>
            pouchDb().find({
                selector: {parentId},
                fields: ['_id', 'title', 'type', 'parentId', 'ui'],
                sort: ['parentId', 'ui.sequence']
            })
        )
        .then(result => {
            return result.docs;
        })
        .catch(err=>{
            if (err.status === 404) return [];
            throw err;
        });
}

export function insert(model) {
    if (typeof model.parentId === 'undefined') {
        throw new Error('A parent ID is required to insert a model.');
    }
    // ensure ui sequence exists (necessary to allow index to work correctly)
    let sequencedModel = {
        ...model,
        ui: {
            sequence: 0,
            ...model.sequence
        }
    };
    return pouchDb().put(sequencedModel);
}

const debounce = require('debounce-promise');
const existingDebounces = {};
export function clearDebounceCache() {
    Object.keys(existingDebounces).forEach(k => delete existingDebounces[k]);
}

/**
 * See https://www.npmjs.com/package/debounce-promise
 * This will accumulate the arguments passed to the debounced function and pass them to the
 * toDebounce function as an array which contains arrays of the passed params.
 * It expectes the toDebounce function to return an array of results which will be
 * the value of the resolved (or failed) promise.
 * @param {function} toDebounce the function that should be debounced
 * @param {function} idFunc the function that takes the arguments and returns the _id of the document that is being operated on by the DAL
 * @param {number} waitTime the debounce time
 * @param  {...any} args the paraameters for the function being debounced
 */
export function debounceById(toDebounce, idFunc, waitTime, ...args) {
    if (idFunc) {
        let id = idFunc(...args);
        if (!existingDebounces[toDebounce] || !existingDebounces[toDebounce][id]) {
            if (!existingDebounces[toDebounce]) {
                existingDebounces[toDebounce] = {};
            }
            existingDebounces[toDebounce][id] = debounce(toDebounce, waitTime, { accumulate: true });
        }
        return existingDebounces[toDebounce][id](...args);
    } else {
        if (!existingDebounces[toDebounce]) {
            existingDebounces[toDebounce] = debounce(toDebounce, waitTime, { accumulate: true });
        }
        return existingDebounces[toDebounce](...args);
    }
}

export function update(_id, changes) {
    return debounceById(innerUpdate, args => args._id, 300, _id, changes);
}

export function remove(model) {
    return pouchDb().get(model._Id).then(toRemove=>{
        return pouchDb().remove(toRemove);
    }).catch(error => {
        if (error.status !== 404) {
            throw error;
        }
    });
}

function innerUpdate(accumulatedParams) {
    let expectedResultLength = accumulatedParams.length;
    // Create an array the same length as the number of calls so we can send the results back
    // to the proper callers.
    let toReturn = Array(expectedResultLength);
    // Reduce the changes to one array per ID
    let changesById = accumulatedParams.reduce((result, params, index) =>{
        let id = params[0];
        let change = params[1];

        if (result[id]) {
            result[id] = {changes: [...result[id].changes, ...change], originalIndexes: [...result[id].originalIndexes, index]};
        } else {
            result[id] = {changes: change, originalIndexes: [index]};
        }

        return result;
    }, {});
    //let changes = accumulatedParams.reduce((accumulated, params) => [...accumulated, ...params[1]], []);
    Object.keys(changesById).forEach(_id => {
        let changes = changesById[_id].changes;
        let result = pouchDb()
            .get(_id) // Get the current value to work off of
            .then(oldDocument => {
                // Create a new document, applying each change to the retrieved current value.
                let newDocument = { ...oldDocument };
                changes.forEach(change => {
                    set(newDocument, change.propertyPath, change.value);
                });

                // Update the database with the resulting document
                return pouchDb()
                    .put(newDocument)
                    .then(() => {
                        return {
                            oldModel: oldDocument,
                            newModel: newDocument
                        };
                    });
            })
            .catch(error => {
                if (error.status === 404) {
                    throw new Error('An existing document was not found to update.');
                }
                throw error;
            });

        // Sends the proper result promise to each caller of the debouncing function.
        changesById[_id].originalIndexes.forEach(i=>{
            toReturn[i] = result;
        });
    });
    return toReturn;
}

export function getById(id) {
    return pouchDb()
    .get(id)
    .catch(err=>{
        if (err.status === 404) return;
        throw err;
    });
}

export function getModelsForTitle(title) {
    // Index that does the actual sorting via map-reduce
    const ddoc = {
        _id: '_design/titleSort',
        views: {
            titleSort: {
                map: `function mapFun(doc) {
                        if (doc.title) {
                            emit(doc.title);
                        }
                    }`
            }
        }
    };
    // Create the index - noop if it already exists.
    return pouchDb()
        .put(ddoc)
        .catch(function(err) {
            if (err.name !== 'conflict') {
                throw err;
            }
            // ignore if doc already exists
        })
        .then(() =>
            pouchDb().query('titleSort', {
                startKey: title,
                endKey: title,
                include_docs: true // eslint-disable-line
            })
        )
        .then(result => {
            return result.rows.map(r => r.doc);
        });
}
