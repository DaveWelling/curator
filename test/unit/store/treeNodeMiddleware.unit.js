import expect, {spyOn, createSpy, restoreSpies} from 'expect';
import * as projectModelActions from '../../../src/actions/projectModelActions';
import cuid from 'cuid';
import treeNodeMiddleware from '../../../src/store/treeNodeMiddleware';

describe('treeNodeMiddleware', () => {
    let getChildrenByParentIdSpy;
    beforeEach(() => {
        getChildrenByParentIdSpy = spyOn(projectModelActions, 'getChildrenByParentId').andReturn(()=>{});
    });
    describe('insert_project_model_success', () => {
        it('calls getChildrenByParentId for the new model\'s parent', () => {
            let action = {
                type: 'insert_project_model_success',
                insert: {}
            };
            treeNodeMiddleware({})(()=>{})(action);
            expect(getChildrenByParentIdSpy).toHaveBeenCalled();
        });
    });

    describe('update_project_model_success', () => {
        describe('parentId changes', () => {
            const oldParentId = cuid();
            const newParentId = cuid();
            it('calls getChildrenByParentId for the new model\'s parent', () => {
                let action = {
                    type: 'update_project_model_success',
                    update: {
                        oldModel: {parentId: oldParentId},
                        newModel: {parentId: newParentId}
                    }
                };
                treeNodeMiddleware({})(()=>{})(action);
                expect(getChildrenByParentIdSpy).toHaveBeenCalledWith(newParentId);
                expect(getChildrenByParentIdSpy).toHaveBeenCalledWith(oldParentId);
            });
        });
    });
});
