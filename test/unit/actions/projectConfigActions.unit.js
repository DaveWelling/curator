import * as repository from '../../../src/repository/projectConfigRepository';
import expect, { spyOn, createSpy, restoreSpies } from 'expect';
import * as testActions from '../../../src/actions/projectConfigActions';
import * as projectModelActions from '../../../src/actions/projectModelActions';

import cuid from 'cuid';

describe('projectConfigActions', () => {
    let dispatchSpy;
    beforeEach(() => {
        dispatchSpy = createSpy();
    });
    afterEach(restoreSpies);
    describe('loadProjectConfig', () => {
        let loadProjectConfigSpy, target, result;
        let createDefaultModelSpy;
        beforeEach(() => {
            result = [];
            loadProjectConfigSpy = spyOn(repository, 'loadProjectConfig').andReturn(Promise.resolve(result));
            createDefaultModelSpy = spyOn(projectModelActions, 'createDefaultModel').andReturn(()=>Promise.resolve());

            target = testActions.loadProjectConfig();
        });
        it('should request project config from repo', () => {
            target(dispatchSpy);
            expect(loadProjectConfigSpy).toHaveBeenCalled();
        });
        it('should dispatch load_project_config_success', done => {
            result.push({_id: cuid(), title: 'test project config'});
            target(dispatchSpy)
                .then(() => {
                    expect(dispatchSpy.calls[0].arguments[0].type).toEqual('load_project_config_success');
                    done();
                })
                .catch(done);
        });
        describe('when there are not project configs', () => {
            let insertSpy;
            beforeEach(() => {
                // spying on insertProjectConfig won't work because the function is called directly inside the module.
                insertSpy = spyOn(repository, 'insert').andReturn(Promise.resolve());
            });
            it('should request insert of a default config', done => {
                target(dispatchSpy)
                    .then(() => {
                        expect(insertSpy).toHaveBeenCalled();
                        done();
                    })
                    .catch(done);
            });
            it('should request a createDefaultModel', done => {
                target(dispatchSpy)
                    .then(() => {
                        expect(createDefaultModelSpy).toHaveBeenCalled();
                        done();
                    })
                    .catch(done);
            });
        });
        describe('when there is a config', () => {
            beforeEach(() => {
                result.push({ _id: '1', title: 'test' });
            });
            it('should return that config', done => {
                target(dispatchSpy)
                    .then(() => {
                        let action = dispatchSpy.calls[0].arguments[0];
                        expect(action.load.loading).toBe(false);
                        expect(action.load.title).toEqual('test');
                        expect(action.load._id).toExist();
                        done();
                    })
                    .catch(done);
            });
        });
    });
    describe('projectConfigChange', function() {
        let updateSpy, projectConfig, getState, target, _id;
        beforeEach(() => {
            _id = cuid();
            updateSpy = spyOn(repository, 'update').andReturn(
                Promise.resolve({
                    title: 'merged',
                    _id
                })
            );
            projectConfig = {
                _id,
                title: '',
                loading: false
            };
            getState = () => ({
                // eslint-disable-next-line camelcase
                project_config: projectConfig
            });
            target = testActions.projectConfigChange('newTitle');
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
    describe('insertProjectConfig', () => {
        let insertSpy, target, projectConfig, _id;
        beforeEach((done) => {
            insertSpy = spyOn(repository, 'insert').andReturn(Promise.resolve());
            _id = cuid();
            projectConfig = {
                _id,
                title: '',
                loading: false
            };
            target = testActions.insertProjectConfig(projectConfig);
            target(dispatchSpy).then(()=>done()).catch(done);
        });
        it('should send an insert to the repository', () => {
            expect(insertSpy).toHaveBeenCalled();
            let actualConfig = insertSpy.calls[0].arguments[0];
            expect(actualConfig._id).toEqual(projectConfig._id);
            expect(actualConfig.title).toEqual(projectConfig.title);
        });
        it('should dispatch insert_project_config_success with the config', () => {
            let action = dispatchSpy.calls[0].arguments[0];
            expect(action.type).toEqual('insert_project_config_success');
            expect(action.insert.title).toEqual(projectConfig.title);
            expect(action.insert._id).toEqual(projectConfig._id);
        });
    });
});
