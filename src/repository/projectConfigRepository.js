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

export function destroy(){
    return pouchDb().destroy()
        .then(()=>db = undefined);
}

// TODO: writing backup to goog drive:
// https://github.com/pouchdb-community/pouchdb-replication-stream#dumping-to-a-string

function pouchDb() {
    if (!db) {
        db = new PouchDb('projectConfig', { adapter });
    }
    return db;
}

export function insert(config) {
    return pouchDb().put(config);
}

export function update(_id, changes) {
    return pouchDb()
    .get(_id)
    .then(toChange => {
        let newRecord = {
            ...toChange,
            ...changes
        };
        return pouchDb().put(newRecord).then(()=>newRecord);
    }).catch(result=>{
        // If it doesn't exist, just create a new one.
        if (result.status === 404) {
            let newRecord = {
                _id,
                ...changes
            };
            return pouchDb().put(newRecord).then(()=>newRecord);
        }
    });
}

export function getById(_id) {
    return pouchDb().get(_id);
}
export function loadProjectConfig() {
    // Index that does the actual sorting via map-reduce
    const ddoc = {
        _id: '_design/current',
        views: {
            current: {
                map: `function mapFun(doc) {
                        emit(doc.current);
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
            pouchDb().query('current', {
                startKey: true,
                endKey: true,
                include_docs: true // eslint-disable-line
            })
        )
        .then(result => {
            return result.rows.map(r => r.doc);
        });
}
