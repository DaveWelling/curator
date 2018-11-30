import * as repository from '../repository/projectModelsRepository';
import set from 'lodash.set';
import get from 'lodash.get';
import cuid from 'cuid';

/**
 * Gather children from the database and put them into state.
 * Once this is done, middleware will be responsible for updating them.
 * @param {string} parentId
 */
export function getChildrenByParentId(parentId) {
    return dispatch => {
        return repository.getChildren(parentId).then(children => {
            dispatch({
                type: 'load_project_modelChildren_success',
                load: {
                    parentId,
                    models: children
                }
            });
            return children;
        });
    };
}

export function getModel(_id) {
    return dispatch => {
        return repository.getById(_id).then(model => {
            dispatch({
                type: 'load_project_model_success',
                load: {
                    ...model
                }
            });
            return model;
        });
    };
}

export function getCachedModel(_id, state, dispatch) {
    let foundModel = state.modelsById[_id];
    if (!foundModel) {
        return getModel(_id)(dispatch).then(dbModel=>{
            return dbModel;
        });
    } else {
        return Promise.resolve(foundModel);
    }
}

export function projectModelChange(value, propertyPath, model) {
    return (dispatch, getState) => {
        return projectModelChanges([{
            propertyPath,
            value
        }], model)(dispatch, getState);
    };
}
export function projectModelChanges(changes, model) {
    return (dispatch, getState) => {
        return getCachedModel(model._id, getState(), dispatch).then(oldModel=>{
            let newModel = {...oldModel};
            changes.forEach(c=>{
                set(newModel, c.propertyPath, c.value);
            });
            dispatch({
                type: 'update_project_model',
                update: {
                    oldModel,
                    newModel
                }
            });

            return repository.update(model._id, changes).then(result => {
                dispatch({
                    type: 'update_project_model_confirm',
                    update: result
                });
                return result;
            }).catch(err=>{
                dispatch({
                    type: 'update_project_model_rollback',
                    update: {
                        oldModel,
                        newModel,
                        err
                    }
                });
            });
        });
    };
}

export function createDefaultModel(rootParentId) {
    return dispatch => {
        let defaultModel = { _id: cuid(), parentId: rootParentId, title: '', ui: { sequence: 0, collapsed: true } };
        return repository.insert(defaultModel).then(() => {
            dispatch({
                type: 'insert_project_model_success',
                insert: {
                    ...defaultModel
                }
            });
            return defaultModel;
        });
    };
}

export function createNextSiblingOfModel(modelId, nextSiblingModel) {
    return (dispatch, getState) => {
        let state = getState();
        return getCachedModel(modelId, state, dispatch).then(currentModel=>{
            let siblings = state.treeNodesByParentId[currentModel.parentId];

            set(nextSiblingModel, 'ui.sequence', getNewSequenceAfterCurrentModel(currentModel, siblings));
            nextSiblingModel.parentId = currentModel.parentId;

            return repository.insert(nextSiblingModel).then(() => {
                dispatch({
                    type: 'insert_project_model_success',
                    insert: {
                        ...nextSiblingModel
                    }
                });
                return nextSiblingModel;
            });
        });
    };
}

export function getNewSequenceAfterCurrentModel(currentModel, siblings) {
    // Do not mutate state.
    let orderedSiblings = [...siblings].sort((a, b) => get(a, 'ui.sequence', 0) - get(b, 'ui.sequence', 0));
    let currentIndex = orderedSiblings.findIndex(m => m._id === currentModel._id);
    let currentModelSequence = get(currentModel, 'ui.sequence', 0);
    // No nextSibling
    if (currentIndex + 1 >= orderedSiblings.length) {
        return currentModelSequence + 1;
    }

    let currentNextSibling = orderedSiblings[currentIndex + 1];
    let currentNextSiblingSequence = get(currentNextSibling, 'ui.sequence', currentModelSequence + 1);
    return (currentNextSiblingSequence - currentModelSequence) / 2 + currentModelSequence;
}
