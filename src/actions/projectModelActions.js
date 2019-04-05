import set from 'lodash.set';
import get from 'lodash.get';
import cuid from 'cuid';
import * as repository from '../repository/projectModelsRepository';

/**
 * Gather children from the database and put them into state.
 * Once this is done, middleware will be responsible for updating them.
 * @param {string} parentId
 */
export function getChildrenByParentId(parentId) {
    return dispatch =>
        repository.getChildren(parentId).then(children => {
            dispatch({
                type: 'load_project_modelChildren_success',
                payload: {
                    parentId,
                    models: children
                }
            });
            return children;
        });
}

export function getModel(_id) {
    if (typeof _id === 'undefined') throw new Error('_id not defined.');
    return dispatch =>
        repository.getById(_id).then(model => {
            if (typeof model !== 'undefined') {
                dispatch({
                    type: 'load_project_model_success',
                    payload: {
                        ...model
                    }
                });
            }
            return model;
        });
}

export function getCachedModel(_id, state, dispatch) {
    const foundModel = state.modelsById[_id];
    if (foundModel) return Promise.resolve(foundModel);

    return getModel(_id)(dispatch);
}

export function projectModelChanges(changes, model) {
    return (dispatch, getState) =>
        getCachedModel(model._id, getState(), dispatch).then(oldModel => {
            const newModel = { ...oldModel };
            changes.forEach(c => set(newModel, c.propertyPath, c.value));
            dispatch({
                type: 'update_project_model',
                payload: {
                    oldModel,
                    newModel
                }
            });

            return repository
                .update(model._id, changes)
                .then(result => {
                    dispatch({
                        type: 'update_project_model_confirm',
                        payload: result
                    });
                    return result;
                })
                .catch(err =>
                    dispatch({
                        type: 'update_project_model_rollback',
                        payload: {
                            oldModel,
                            newModel,
                            err
                        }
                    }));
        });
}

export function projectModelChange(value, propertyPath, model) {
    return (dispatch, getState) =>
        projectModelChanges(
            [
                {
                    propertyPath,
                    value
                }
            ],
            model
        )(dispatch, getState);
}

export async function createRootModel(database) {
    return database.action(async action => {
        const modelCollection = database.collections.get('item');
        return modelCollection.create(async rootItem => {
            const firstChild = await action.subAction(async () =>
                modelCollection.create(firstItem => {
                    firstItem.title = '';
                    return firstItem;
                }));
            rootItem.title = '';
            rootItem.children.set([firstChild]);
        });
    });
    // return (dispatch) => {
    //     const defaultModel = {
    //         _id: cuid(), parentId: rootParentId, title: '', ui: { sequence: 0, collapsed: false }
    //     };
    //     return repository.insert(defaultModel).then(() => {
    //         dispatch({
    //             type: 'insert_project_model_success',
    //             payload: {
    //                 ...defaultModel
    //             }
    //         });
    //         dispatch({
    //             type: 'insert_project_modelChildren_success',
    //             payload: {
    //                 ...defaultModel
    //             }
    //         });
    //         return defaultModel;
    //     });
    // };
}

export function getNewSequenceAfterCurrentModel(currentModel, siblings) {
    // Do not mutate state.
    const orderedSiblings = [...siblings].sort((a, b) => get(a, 'ui.sequence', 0) - get(b, 'ui.sequence', 0));
    const currentIndex = orderedSiblings.findIndex(m => m._id === currentModel._id);
    const currentModelSequence = get(currentModel, 'ui.sequence', 0);
    // No nextSibling
    if (currentIndex + 1 >= orderedSiblings.length) {
        return currentModelSequence + 1;
    }

    const currentNextSibling = orderedSiblings[currentIndex + 1];
    const currentNextSiblingSequence = get(currentNextSibling, 'ui.sequence', currentModelSequence + 1);
    if (currentModelSequence === currentNextSiblingSequence) {
        throw new Error('The sequence for two siblings cannot be the same.');
    }
    return (currentNextSiblingSequence - currentModelSequence) / 2 + currentModelSequence;
}

export function createNextSiblingOfModel(modelId, nextSiblingModel) {
    return (dispatch, getState) => {
        const state = getState();
        return getCachedModel(modelId, state, dispatch).then(currentModel => {
            const siblings = state.treeNodesByParentId[currentModel.parentId];

            set(nextSiblingModel, 'ui.sequence', getNewSequenceAfterCurrentModel(currentModel, siblings));
            nextSiblingModel.parentId = currentModel.parentId;

            return repository.insert(nextSiblingModel).then(() => {
                dispatch({
                    type: 'insert_project_model_success',
                    payload: nextSiblingModel
                });
                dispatch({
                    type: 'insert_project_modelChildren_success',
                    payload: nextSiblingModel
                });
                return nextSiblingModel;
            });
        });
    };
}

export function removeNode(model) {
    return (dispatch) => {
        dispatch({
            type: 'remove_project_model_success',
            payload: {
                model
            }
        });
        dispatch({
            type: 'remove_project_modelChildren_success',
            payload: {
                model
            }
        });

        return repository
            .remove(model)
            .then(result => {
                dispatch({
                    type: 'update_project_model_confirm',
                    payload: {
                        model,
                        result
                    }
                });
                return result;
            })
            .catch(err => {
                dispatch({
                    type: 'update_project_model_rollback',
                    payload: {
                        model,
                        err
                    }
                });
            });
    };
}