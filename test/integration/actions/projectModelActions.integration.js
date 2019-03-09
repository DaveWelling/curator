import expect from 'expect';
import {createFreshStore} from '../../../src/store';
import * as projectConfigActions from '../../../src/actions/projectConfigActions';
import * as projectModelActions from '../../../src/actions/projectModelActions';
import * as projectConfigRepository from '../../../src/repository/projectConfigRepository';
import * as projectModelRepository from '../../../src/repository/projectModelsRepository';
import get from 'lodash.get';

describe('projectModelActions', function(){
    let store, projectConfig;
    beforeEach(()=>{
        store = createFreshStore();
        return Promise.all([
            projectConfigRepository.destroy(),
            projectModelRepository.destroy()
        ]).then(
            ()=>store.dispatch(projectConfigActions.loadProjectConfig())
        ).then(config=>{
            projectConfig = config;
        });
    });
    describe('projectModelChange of title', function(){
        let newTitle = 'newTitle', onlyModel, unsubscribe;
        beforeEach(function(){
            return store.dispatch(projectModelActions.getChildrenByParentId(projectConfig._id)).then(result=>{
                onlyModel = result[0];
            });
        });
        afterEach(function(){
            if (unsubscribe) unsubscribe();
        });
        it('changes the tree node in state', function(done){
            unsubscribe = store.subscribe(()=>{
                let state = store.getState();
                let children = get(state, 'treeNodesByParentId.' + projectConfig._id);
                if (children && children.length) {
                    if (children[0].title === newTitle) {
                        unsubscribe();
                        unsubscribe = undefined;
                        done();
                    }
                }
            });
            projectModelRepository.getChildren(projectConfig._id).then(children=>{
                expect(children.length).toEqual(1);
                store.dispatch(projectModelActions.projectModelChange(newTitle, 'title', onlyModel));
            });
        });
        it('changes the model in state', function(done){
            unsubscribe = store.subscribe(()=>{
                let state = store.getState();
                let models = state.modelsById;
                let keys = Object.keys(models);
                expect(keys.length).toBeLessThan(2);
                if (keys.length) {
                    if (models[keys[0]].title === newTitle) {
                        unsubscribe();
                        unsubscribe = undefined;
                        done();
                    }
                }
            });
            projectModelRepository.getChildren(projectConfig._id).then(children=>{
                expect(children.length).toEqual(1);
                store.dispatch(projectModelActions.projectModelChange(newTitle, 'title', onlyModel));
            });
        });
        it('changes the model in the database', function(done){
            store.dispatch(projectModelActions.projectModelChange(newTitle, 'title', onlyModel)).then(()=>{
                projectModelRepository.getModelsForTitle(newTitle).then(result=>{
                    expect(result).toExist();
                    expect(result[0].title).toEqual(newTitle);
                    done();
                }).catch(done);
            });
        });
    });
});