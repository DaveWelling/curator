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
    const ddoc = {
        _id: '_design/parentSort',
        views: {
            parentSort: {
                map: `function mapFun(doc) {
                        if (doc.parentId) {
                            emit(doc.parentId);
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
            pouchDb().query('parentSort', {
                startKey: parentId,
                endKey: parentId,
                include_docs: true // eslint-disable-line
            })
        )
        .then(result => {
            return result.rows.map(r => ({ _id: r.doc._id, title: r.doc.title, type: r.doc.type, parentId: r.doc.parentId, ui: r.doc.ui || {} }));
        });
}

export function insert(model) {
    return pouchDb().put(model);
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

function innerUpdate(accumulatedParams) {
    let expectedResultLength = accumulatedParams.length;
    let _id = accumulatedParams[0][0]; // Should be the same _id for every call
    // Reduce down the changes to a single hash.
    let changes = accumulatedParams.reduce((accumulated, params) => [...accumulated, ...params[1]], []);
    let result = pouchDb()
        .get(_id)
        .then(toChange => {
            let newRecord = { ...toChange };
            changes.forEach(change => {
                set(newRecord, change.propertyPath, change.value);
            });

            return pouchDb()
                .put(newRecord)
                .then(() => {
                    return {
                        oldModel: toChange,
                        newModel: newRecord
                    };
                });
        })
        .catch(error => {
            if (error.status === 404) {
                throw new Error('An existing document was not found to update.');
            }
            throw error;
        });
    // Sends the same result promise to every caller of the debouncing function.
    let toReturn = [];
    for (let index = 0; index < expectedResultLength; index++) {
        toReturn.push(result);
    }
    return toReturn;
}

export function getById(id) {
    return pouchDb().get(id);
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
