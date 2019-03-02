import * as projectModelActions from '../actions/projectModelActions';
export default store => next => action => {
    // avoid crashing on Redux init actions
    if (!store || !next) {
        return null;
    }
    if (!action || !action.type || action.handled) return next(action);

    if (action.type === 'insert_project_model_success') {
        projectModelActions.getChildrenByParentId(action.insert.parentId)(store.dispatch);
    }
    if (action.type === 'update_project_model') {
        let {oldModel, newModel} = action.update;
        try {
            // Get new model by merging changes with the existing one.
            let state = store.getState();
            let currentModelsInCurrentParent = state.treeNodesByParentId[oldModel.parentId];
            // Do not mutate state
            let newModelsInCurrentParent = [...currentModelsInCurrentParent];
            let changingModelIndex = newModelsInCurrentParent.findIndex(m=>m._id === oldModel._id);

            // If the parent is changing
            if (newModel.parentId !== oldModel.parentId) {
                // Remove this model from the old parent
                newModelsInCurrentParent.splice(changingModelIndex, 1);
                store.dispatch({
                    type: 'load_project_modelChildren_success',
                    load: {
                        parentId: oldModel.parentId,
                        models: newModelsInCurrentParent
                    }
                });

                // Add this model to the new parent
                let currentModelsInDestinationParent = state.treeNodesByParentId[newModel.parentId];
                let newModelsInDestinationParent;
                if (currentModelsInDestinationParent) {
                    // Do not mutate state
                    newModelsInDestinationParent =  [...currentModelsInDestinationParent, newModel];
                } else {
                    newModelsInDestinationParent = [newModel];
                }
                store.dispatch({
                    type: 'load_project_modelChildren_success',
                    load: {
                        parentId: newModel.parentId,
                        models: newModelsInDestinationParent
                    }
                });
            } else {
                // If the parent is not changing,
                // switch out the old model for the new one
                newModelsInCurrentParent.splice(changingModelIndex, 1, newModel);
                // update model within existing parent
                store.dispatch({
                    type: 'load_project_modelChildren_success',
                    load: {
                        parentId: oldModel.parentId,
                        models: newModelsInCurrentParent
                    }
                });
            }
            store.dispatch({
                type: 'update_project_model_success',
                update: {
                    oldModel,
                    newModel
                }
            });
        }
        catch(error) {
            store.dispatch({
                type: 'update_project_model_failure',
                update: {
                    oldModel,
                    newModel,
                    error
                }
            });
        }

    }

    next(action);
};