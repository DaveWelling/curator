import expect from 'expect';
import cuid from 'cuid';
import projectConfigReducer from '../../../src/reducers/projectConfigReducer';

describe('projectConfigReducer', () => {
    describe('load_project_config_success', () => {
        it('puts the results into state', () => {
            let action = {
                type: 'load_project_config_success',
                load: {
                    id: cuid(),
                    title: cuid()
                }
            };
            let state = projectConfigReducer({}, action);
            expect(state._id).toEqual(action.load._id);
            expect(state.loading).toBe(false);
        });
    });
    describe('update_project_config_success', () => {
        it('should change the project config state', () => {
            let initialState = {
                _id: cuid(),
                title: cuid()
            };
            let action = {
                type: 'update_project_config_success',
                update: {
                    newConfig: {
                        _id: initialState._id,
                        title: cuid()
                    }
                }
            };
            let state = projectConfigReducer(initialState, action);
            expect(state._id).toEqual(initialState._id);
            expect(state.title).toEqual(action.update.newConfig.title);
            expect(state.loading).toBe(false);
        });
    });
    describe('insert_project_config_success', () => {
        it('adds the new config to project config state', () => {
            let insert = {
                _id: cuid(),
                title: cuid()
            };
            let action = {
                type: 'insert_project_config_success',
                insert
            };
            let state = projectConfigReducer({}, action);
            expect(state._id).toEqual(insert._id);
            expect(state.title).toEqual(insert.title);
            expect(state.loading).toBe(false);
        });
    });
});