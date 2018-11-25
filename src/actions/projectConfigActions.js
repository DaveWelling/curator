import * as projectConfigRepository from '../repository/projectConfigRepository';
import * as projectModelActions from '../actions/projectModelActions';
import cuid from 'cuid';
import get from 'lodash.get';
let defaultConfig = {
    title: '',
    _id: cuid()
};

export function projectConfigChange(title) {
    return (dispatch, getState) => {
        let projectConfig = get(getState(), 'project_config');
        return projectConfigRepository
            .update(projectConfig._id, {
                title
            })
            .then(result => {
                dispatch({
                    type: 'update_project_config_success',
                    update: {
                        newConfig: result
                    }
                });
            });
    };
}

export function loadProjectConfig() {
    return dispatch => {
        return projectConfigRepository.loadProjectConfig().then(result => {
            if (result.length > 1) throw new Error('More than one project config is set to be active.');
            if (result.length === 0) {
                result = defaultConfig;
                return Promise.all([
                    insertProjectConfig(result)(dispatch),
                    projectModelActions.createDefaultModel(defaultConfig._id)(dispatch)
                ]);
            } else {
                result = result[0];
                dispatch({
                    type: 'load_project_config_success',
                    load: {
                        ...result,
                        loading: false
                    }
                });
                return result;
            }
        });
    };
}

export function insertProjectConfig(projectConfig) {
    return dispatch => {
        return projectConfigRepository.insert(projectConfig).then(() => {
            dispatch({
                type: 'insert_project_config_success',
                insert: {
                    ...projectConfig
                }
            });
            return projectConfig;
        });
    };
}
