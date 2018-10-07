import expect from 'expect';
import cuid from 'cuid';
import treeNodeReducer from '../../../src/reducers/treeNodeReducer';
describe('modelReducer', () => {
    describe('load_project_modelChildren_success', () => {
        it('merges children under parentId in state', () => {
            let id1 = cuid();
            let id2 = cuid();
            let parentId1 = cuid();
            let state = {
                [parentId1]: [{_id: id1, parentId: parentId1}]
            };
            let newState = treeNodeReducer(state, {
                type: 'load_project_modelChildren_success',
                load: {
                    parentId: parentId1,
                    models: [{_id: id2, parentId: parentId1}]
                }
            });
            expect(newState[parentId1][0]._id).toEqual(id2);
        });
        it('retains unchanged state', () => {
            let id1 = cuid();
            let id2 = cuid();
            let id3 = cuid();
            let parentId1 = cuid();
            let parentId2 = cuid();
            let state = {
                [parentId1]: [{_id: id1, parentId: parentId1}],
                [parentId2]: [{_id: id3, parentId: parentId2}]
            };
            let newState = treeNodeReducer(state, {
                type: 'load_project_modelChildren_success',
                load: {
                    parentId: parentId1,
                    models: [{_id: id2, parentId: parentId1}]
                }
            });
            expect(newState[parentId2][0]._id).toEqual(id3);
        });
    });
});