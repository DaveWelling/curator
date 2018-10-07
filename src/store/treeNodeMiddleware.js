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
    if (action.type === 'update_project_model_success') {
        projectModelActions.getChildrenByParentId(action.update.newModel.parentId)(store.dispatch);
        projectModelActions.getChildrenByParentId(action.update.oldModel.parentId)(store.dispatch);
    }
    next(action);
};