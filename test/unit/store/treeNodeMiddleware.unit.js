import expect, {spyOn, createSpy} from 'expect';
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
                payload: {}
            };
            treeNodeMiddleware({})(()=>{})(action);
            expect(getChildrenByParentIdSpy).toHaveBeenCalled();
        });
    });

    describe('update_project_model', () => {
        let dispatchSpy, getStateSpy, _id, parentId, store, startingModel;
        beforeEach(function(){
            _id = cuid();
            parentId = cuid();
            startingModel = {
                _id, parentId, title: 'starting title'
            };
            dispatchSpy = createSpy();
            getStateSpy = createSpy().andReturn({
                treeNodesByParentId: {
                    [parentId]: [startingModel]
                }
            });
            store = {
                dispatch: dispatchSpy,
                getState: getStateSpy
            };
        });
        describe('title of a model changes', function(){
            it('dispatches a load_project_modelChildren_success with the change', function(){
                let action = {
                    type: 'update_project_model',
                    payload: {
                        oldModel: startingModel,
                        newModel: {
                            ...startingModel,
                            title: 'new title'
                        }
                    }
                };
                treeNodeMiddleware(store)(()=>{})(action);
                expect(dispatchSpy).toHaveBeenCalled();
                expect(dispatchSpy.calls.length).toEqual(2);
                expect(dispatchSpy.calls[0].arguments[0].type).toEqual('load_project_modelChildren_success');
                let newModels = dispatchSpy.calls[0].arguments[0].payload.models;
                expect(newModels.length).toEqual(1);
                expect(newModels[0].title).toEqual('new title');
            });
        });
        describe('parentId changes', () => {
            const newParentId = cuid();
            it('dispatches a load_project_modelChildren_success for both the new and old parentId', function(){
                let action = {
                    type: 'update_project_model',
                    payload: {
                        oldModel: startingModel,
                        newModel: {
                            ...startingModel,
                            parentId: newParentId
                        }
                    }
                };
                treeNodeMiddleware(store)(()=>{})(action);
                expect(dispatchSpy).toHaveBeenCalled();
                expect(dispatchSpy.calls.length).toEqual(3);
                expect(dispatchSpy.calls[0].arguments[0].type).toEqual('load_project_modelChildren_success');
                expect(dispatchSpy.calls[0].arguments[0].payload.parentId).toEqual(parentId);
                let newSourceModels = dispatchSpy.calls[0].arguments[0].payload.models;
                expect(newSourceModels.length).toEqual(0);

                expect(dispatchSpy.calls[1].arguments[0].type).toEqual('load_project_modelChildren_success');
                expect(dispatchSpy.calls[1].arguments[0].payload.parentId).toEqual(newParentId);
                let newDestinationModels = dispatchSpy.calls[1].arguments[0].payload.models;
                expect(newDestinationModels.length).toEqual(1);
                expect(newDestinationModels[0].parentId).toEqual(newParentId);
            });
        });
    });
});
