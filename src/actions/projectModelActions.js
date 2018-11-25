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

export function projectModelChange(value, propertyPath, modelId) {
    return dispatch => {
        let changes = [
            {
                propertyPath,
                value
            }
        ];
        return repository.update(modelId, changes).then(result => {
            dispatch({
                type: 'update_project_model_success',
                update: result
            });
            return result;
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

export function setAsNextSiblingOfModel(modelIdGettingSibling, newSiblingModelId) {
    throw new Error('not implemented');
}

export function createNextSiblingOfModel(modelId, nextSiblingModel) {
    return (dispatch, getState) => {
        let state = getState();
        let currentModel = state.modelsById[modelId];
        let siblings = state.treeNodesByParentId[currentModel.parentId];

        set(nextSiblingModel, 'ui.sequence', getNewSequence(currentModel, siblings));
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
    };
}

function getNewSequence(currentModel, siblings) {
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
