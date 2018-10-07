import * as repository from '../../../src/repository/projectModelsRepository';
import expect, {spyOn, createSpy, restoreSpies} from 'expect';
import {getChildrenByParentId, getModel, projectModelChange, createDefaultModel} from '../../../src/actions/projectModelActions';
import cuid from 'cuid';

describe('projectModelActions', () => {
    afterEach(()=>restoreSpies());
    describe('getChildrenByParentId', () => {
        let getChildrenSpy, parentId = cuid(), dispatchSpy, getStoreSpy;
        let expectedModels = [];
        beforeEach((done) => {
            dispatchSpy = createSpy();
            getStoreSpy = createSpy();
            getChildrenSpy = spyOn(repository, 'getChildren').andReturn(Promise.resolve(expectedModels));
            getChildrenByParentId(parentId)(dispatchSpy, getStoreSpy).then(()=>done()).catch(done);
        });
        it('requests getChildren from repository', () => {
            expect(getChildrenSpy).toHaveBeenCalled();
        });
        it('should dispatch the results with load_project_modelChildren_success action', () => {
            let successCall = dispatchSpy.calls.find(c=>c.arguments && c.arguments[0].type === 'load_project_modelChildren_success');
            expect(successCall).toExist();
            expect(successCall.arguments[0].load.models).toBe(expectedModels);
            expect(successCall.arguments[0].load.parentId).toBe(parentId);
        });
    });
    describe('getModel', () => {
        let getByIdSpy, _id = cuid(), dispatchSpy, getStoreSpy;
        let expectedModel = {_id};
        beforeEach((done) => {
            dispatchSpy = createSpy();
            getStoreSpy = createSpy();
            getByIdSpy = spyOn(repository, 'getById').andReturn(Promise.resolve(expectedModel));
            getModel(_id)(dispatchSpy, getStoreSpy).then(()=>done()).catch(done);
        });
        it('requests getById from repository', () => {
            expect(getByIdSpy).toHaveBeenCalled();
        });
        it('dispatches load_project_model_success', () => {
            let successCall = dispatchSpy.calls.find(c=>c.arguments && c.arguments[0].type === 'load_project_model_success');
            expect(successCall).toExist();
            expect(successCall.arguments[0].load._id).toBe(_id);
        });
    });
    describe('projectModelChange', function(){
        let updateSpy, _id = cuid(), dispatchSpy;
        let newTitle = cuid();
        let expectedModel = {_id, title: newTitle};
        let startingModel = {_id, 'title': cuid()};

        beforeEach(() => {
            dispatchSpy = createSpy();
            updateSpy = spyOn(repository, 'update');
        });
        it('requests update', (done) => {
            updateSpy.andCall((updateId, changes)=>{
                expect(updateId).toBe(_id);
                expect(changes[0].propertyPath).toEqual('ui.collapsed');
                expect(changes[0].value).toBe(false);
                return Promise.resolve({});
            });
            projectModelChange(false, 'ui.collapsed', startingModel)(dispatchSpy).then(()=>done()).catch(done);
            expect(updateSpy).toHaveBeenCalled();
        });
        it('dispatches update_project_model_success', (done) => {
            updateSpy.andReturn(Promise.resolve({
                newModel:expectedModel,
                oldModel: startingModel
            }));
            projectModelChange(cuid(), 'title', startingModel)(dispatchSpy).then(()=>{
                let successCall = dispatchSpy.calls.find(c=>c.arguments && c.arguments[0].type === 'update_project_model_success');
                expect(successCall).toExist();
                expect(successCall.arguments[0].update.newModel._id).toBe(_id);
                expect(successCall.arguments[0].update.newModel.title).toBe(newTitle);
                done();
            }).catch(done);
        });
    });
    describe('createDefaultModel', () => {
        let dispatchSpy, insertSpy, parentId = cuid();
        beforeEach((done) => {
            dispatchSpy = createSpy();
            insertSpy = spyOn(repository, 'insert').andReturn(Promise.resolve());
            createDefaultModel(parentId)(dispatchSpy).then(()=>done()).catch(done);
        });
        it('request an insert', () => {
            expect(insertSpy).toHaveBeenCalled();
        });
        it('dispatches insert_project_model_success', () => {
            let successCall = dispatchSpy.calls.find(c=>c.arguments && c.arguments[0].type === 'insert_project_model_success');
            expect(successCall).toExist();
            expect(successCall.arguments[0].insert.parentId).toBe(parentId);
            expect(successCall.arguments[0].insert.title).toBe('');
        });
    });
});