import * as repository from '../../../src/repository/projectConfigRepository';
import expect, {spyOn, createSpy, restoreSpies} from 'expect';
import {loadProjectConfig, projectConfigChange} from '../../../src/actions/projectConfigActions';
import cuid from 'cuid';

describe('projectConfigActions', () => {
    afterEach(() => {
        restoreSpies();
    });
    describe('loadProjectConfig', () => {
        let loadProjectConfigSpy, dispatchSpy, target, result;
        beforeEach(()=>{
            result = [];
            loadProjectConfigSpy = spyOn(repository, 'loadProjectConfig').andReturn(Promise.resolve(result));
            target = loadProjectConfig();
            dispatchSpy = createSpy();
        });
        it('should request project config from repo', () => {
            target(dispatchSpy);
            expect(loadProjectConfigSpy).toHaveBeenCalled();
        });
        it('should dispatch load_project_config_success', (done) => {
            target(dispatchSpy).then(()=>{
                expect(dispatchSpy.calls[0].arguments[0].type).toEqual('load_project_config_success');
                done();
            }).catch(done);
        });
        describe('when there are not project configs', () => {
            it('should dispatch a default config', (done) => {
                target(dispatchSpy).then(()=>{
                    let action = dispatchSpy.calls[0].arguments[0];
                    expect(action.load.loading).toBe(false);
                    expect(action.load.title).toEqual('');
                    expect(action.load._id).toExist();
                    done();
                }).catch(done);
            });
        });
        describe('when there is a config', () => {
            beforeEach(()=>{
                result.push({_id: '1', title:'test'});
            });
            it('should return that config', (done) => {
                target(dispatchSpy).then(()=>{
                    let action = dispatchSpy.calls[0].arguments[0];
                    expect(action.load.loading).toBe(false);
                    expect(action.load.title).toEqual('test');
                    expect(action.load._id).toExist();
                    done();
                }).catch(done);

            });
        });
    });
    describe('projectConfigChange', function(){
        let updateSpy, dispatchSpy, projectConfig, getState, target, _id;
        beforeEach(() => {
            _id = cuid();
            updateSpy = spyOn(repository, 'update').andReturn(
                Promise.resolve({
                    title: 'merged',
                    _id
                })
            );
            dispatchSpy = createSpy();
            projectConfig = {
                _id,
                title: '',
                loading: false
            };
            getState = ()=>({
                // eslint-disable-next-line camelcase
                project_config: projectConfig
            });
            target = projectConfigChange('newTitle');
            return target(dispatchSpy, getState);
        });
        it('should send an update to the repository', () => {
            expect(updateSpy).toHaveBeenCalled();
            let _id = updateSpy.calls[0].arguments[0];
            let changes = updateSpy.calls[0].arguments[1];
            expect(_id).toEqual(projectConfig._id);
            expect(changes.title).toEqual('newTitle');
        });
        it('should dispatch update_project_config with the new title', () => {
            let action = dispatchSpy.calls[0].arguments[0];
            expect(action.type).toEqual('update_project_config_success');
            expect(action.update.newConfig.title).toEqual('merged');
            expect(action.update.newConfig._id).toEqual(projectConfig._id);
        });
    });
});