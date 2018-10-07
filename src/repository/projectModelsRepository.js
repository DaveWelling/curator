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

export function destroy(){
    return pouchDb().destroy()
        .then(()=>db = undefined);
}

function pouchDb(){
    if (!db) {
        db = new PouchDb('projectModel', { adapter });
    }
    return db;
}




export function getChildren(parentId){

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
            .then(() => pouchDb()
            .query('parentSort', {
                startKey: parentId,
                endKey: parentId,
                include_docs: true // eslint-disable-line
            }))
            .then(result => {
                return result.rows.map(r=>({_id: r.doc._id, title: r.doc.title, ui: r.doc.ui || {}}));
            });
}

export function insert(model){
    return pouchDb().put(model);
}

export function update(_id, changes) {
    return pouchDb()
    .get(_id)
    .then(toChange => {
        let newRecord = {...toChange};
        changes.forEach(change=>{
            set(newRecord, change.propertyPath, change.value);
        });

        return pouchDb().put(newRecord).then(()=>({
            oldModel: toChange,
            newModel: newRecord
        }));
    }).catch(result=>{
        if (result.status === 404) {
            throw new Error('An existing document was not found to update.');
        }
    });
}

export function getById(id){
    return pouchDb().get(id);
}

export function getModelsForTitle(title){

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
            .then(() => pouchDb()
            .query('titleSort', {
                startKey: title,
                endKey: title,
                include_docs: true // eslint-disable-line
            }))
            .then(result => {
                return result.rows.map(r=>r.doc);
            });
}