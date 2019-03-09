import expect from 'expect';
import {createFreshStore} from '../../../src/store';
import * as projectConfigRepository from '../../../src/repository/projectConfigRepository';
import * as projectModelRepository from '../../../src/repository/projectModelsRepository';
import * as projectConfigActions from '../../../src/actions/projectConfigActions';
import * as projectModelActions from '../../../src/actions/projectModelActions';
import * as treeTextActions from '../../../src/actions/treeTextActions';
import get from 'lodash.get';
import {subscribe} from '../../../src/store/eventSink';

describe('treeTextActions', function(){
    let store, projectConfig, onlyModel;
    beforeEach(()=>{
        store = createFreshStore();

        return Promise.all([
            projectConfigRepository.destroy(),
            projectModelRepository.destroy()
        ]).then(
            ()=>store.dispatch(projectConfigActions.loadProjectConfig())
        ).then(config=>{
            projectConfig = config;
            return projectModelRepository.getChildren(config._id);
        }).then(children=>{
            onlyModel = children[0];
            return store.dispatch(projectModelActions.projectModelChange('abc123', 'title', onlyModel));
        });
    });
    describe('Enter button', function(){
        describe('treeText has cursor inside content', function(){
            function sendEnterButton(inputState) {
                return store.dispatch(treeTextActions.keyDown(13, ()=>{}, inputState, onlyModel, false));
            }
            it('creates new tree node in state', function(done){
                let unsubscribe = store.subscribe(()=>{
                    let state = store.getState();
                    let children = get(state, 'treeNodesByParentId.' + projectConfig._id);
                    let found = children.find(c=>c.title === '123');
                    if (found) {
                        expect(found.ui.sequence).toEqual(1);
                        unsubscribe();
                        done();
                    }
                });
                sendEnterButton({
                    value: 'abc123',
                    selectionStart: 3
                });
            });
            it('creates new model in state', function(done){
                let unsubscribe = store.subscribe(()=>{
                    let state = store.getState();
                    let children = get(state, 'modelsById');
                    children = Object.values(children);
                    let found = children.find(c=>c.title === '123');
                    if (found) {
                        expect(found.ui.sequence).toEqual(1);
                        unsubscribe();
                        done();
                    }
                });
                sendEnterButton({
                    value: 'abc123',
                    selectionStart: 3
                });
            });
            it.only('creates new model in the database', function(done){
                let updates = 0;
                let unsubscribe = subscribe('update_project_model_confirm', (action)=>{
                    debugger;
                    updates++;
                    if (updates === 2) {
                        projectModelRepository.getChildren(projectConfig._id).then(result=>{
                            expect(result.length).toEqual(2);
                            expect(result.some(m=>m.title === 'abc')).toEqual(true);
                            expect(result.some(m=>m.title === '123')).toEqual(true);
                            unsubscribe();
                            done();
                        }).catch(err=>{
                            unsubscribe();
                            done(err);
                        });
                    }
                });
                sendEnterButton({
                    value: 'abc123',
                    selectionStart: 3
                });
            });
            it('updates the old tree node in state', function(){
                throw new Error('not implemented');
            });
            it('updates the old model in state', function(){
                throw new Error('not implemented');
            });
            it('updates the old model in the database', function(){
                throw new Error('not implemented');
            });
        });
    });
});

