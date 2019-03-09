import expect from 'expect';
import {createFreshStore} from '../../../src/store';
import * as projectConfigRepository from '../../../src/repository/projectConfigRepository';
import * as projectModelRepository from '../../../src/repository/projectModelsRepository';
import * as projectConfigActions from '../../../src/actions/projectConfigActions';
import get from 'lodash.get';

describe('projectConfigActions', function(){
    let store;
    beforeEach(()=>{
        store = createFreshStore();
        return projectConfigRepository.destroy();
    });

    describe('loadProjectConfig', function(){
        describe('No config exists', function(){
            it('creates a default model in the database', function(done){
                store.dispatch(projectConfigActions.loadProjectConfig()).then(config=>{
                    return projectModelRepository.getChildren(config._id).then(result=>{
                        expect(result[0]).toExist();
                        expect(result[0].parentId).toEqual(config._id);
                        done();
                    });
                }).catch(done);
            });
        });
    });
    describe('insertProjectConfig', function(){
        let unsubscribe;
        afterEach(function(){
            if (unsubscribe) unsubscribe();
        });
        function insert(overrides){
            return store.dispatch(projectConfigActions.insertProjectConfig({
                _id: '123456',
                title: 'test project config',
                loading: false,
                current: true,
                ...overrides
            }));
        }
        it('adds the new config to the database', function(done){
            insert().then(()=>{
                return projectConfigRepository.loadProjectConfig().then(result=>{
                    expect(result.length).toEqual(1);
                    expect(result[0]._id).toEqual('123456');
                    done();
                });
            }).catch(done);
        });
        it('adds the new config to global state', function(done){
            unsubscribe = store.subscribe(()=>{
                let state = store.getState();
                if (get(state, 'project_config._id') === '123456') {
                    done();
                }
            });
            insert();
        });
    });
});