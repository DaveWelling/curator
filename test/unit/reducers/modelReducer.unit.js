import expect from 'expect';
import cuid from 'cuid';
import modelReducer from '../../../src/reducers/modelReducer';
describe('modelReducer', () => {
    describe('update_project_model_success', () => {
        it('merges changed model into state', () => {
            let id1 = cuid();
            let state = {
                [id1]: {_id: id1, some: 'stuff'}
            };
            let newState = modelReducer(state, {
                type: 'update_project_model_success',
                update: {
                    newModel: {
                        _id: id1,
                        some: 'differentStuff'
                    }
                }
            });
            expect(newState[id1].some).toEqual('differentStuff');
        });
        it('retains unchanged state', () => {
            let id1 = cuid();
            let id2 = cuid();
            let state = {
                [id1]: {_id: id1, some: 'stuff'},
                [id2]: {_id: id2, some: 'stuff2'}
            };
            let newState = modelReducer(state, {
                type: 'update_project_model_success',
                update: {
                    newModel: {
                        _id: id1,
                        some: 'differentStuff'
                    }
                }
            });
            expect(newState[id2].some).toEqual('stuff2');
        });
    });
    describe('insert_project_model_success', () => {
        it('adds new model into state', () => {
            let id1 = cuid();
            let id2 = cuid();
            let state = {
                [id1]: {_id: id1, some: 'stuff'}
            };
            let newState = modelReducer(state, {
                type: 'insert_project_model_success',
                insert: {
                    _id: id2,
                    some: 'stuff2'
                }
            });
            expect(newState[id2].some).toEqual('stuff2');
        });
    });
});