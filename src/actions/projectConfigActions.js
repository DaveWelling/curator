import cuid from 'cuid';
import get from 'lodash.get';
import { Q } from '@nozbe/watermelondb';
import { switchMap } from 'rxjs/operators';
import { of } from 'rxjs';
import * as projectConfigRepository from '../repository/projectConfigRepository';
import * as projectModelActions from './projectModelActions';

const defaultConfig = {
    title: '',
    _id: cuid()
};

export function projectConfigChange(title) {
    return (dispatch, getState) => {
        const projectConfig = get(getState(), 'project_config');
        return projectConfigRepository
            .update(projectConfig._id, {
                title
            })
            .then(result => dispatch({
                type: 'update_project_config_success',
                payload: {
                    newConfig: result
                }
            }));
    };
}

export function insertProjectConfig(projectConfig) {
    return dispatch => projectConfigRepository.insert(projectConfig).then(() => {
        dispatch({
            type: 'insert_project_config_success',
            payload: {
                ...projectConfig
            }
        });
        return projectConfig;
    });
}

export function loadProjectConfig() {
    return dispatch => projectConfigRepository.loadProjectConfig().then((loadResult) => {
        let result = loadResult;
        if (result.length > 1) throw new Error('More than one project config is set to be active.');
        if (result.length === 0) {
            result = defaultConfig;
            return Promise.all([
                insertProjectConfig(result)(dispatch),
                projectModelActions.createRootModel(defaultConfig._id)(dispatch)
            ]).then(allResults => allResults[0]); // only return insert project config result
        }
        result = result[0];
        dispatch({
            type: 'load_project_config_success',
            payload: {
                ...result[0],
                loading: false
            }
        });
        return result;
    });
}

export async function createDefaultProject(database, rootModel) {
    return database.action(async () => database.collections.get('project').create(project => {
        project.title = '';
        project.current = true;
        project.rootModel.set(rootModel);
    }));
}

export function newLoadProjectConfig(database) {
    return database.collections.get('project').query(Q.where('current', true))
        .observe()
        .pipe(switchMap(async current => {
            if (current.length > 0) return of(current[0]);
            const newConfig = await database.action(async action => {
                const rootModel = await action.subAction(async () =>
                    projectModelActions.createRootModel(database));
                const defaultProject = await action.subAction(async () =>
                    createDefaultProject(database, rootModel));
                return defaultProject;
            });
            return of(newConfig);
        }));
}