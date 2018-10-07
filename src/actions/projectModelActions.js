import * as repository from '../repository/projectModelsRepository';
import cuid from 'cuid';

/**
 * Gather children from the database and put them into state.
 * Once this is done, middleware will be responsible for updating them.
 * @param {string} parentId
 */
export function getChildrenByParentId(parentId) {
    return (dispatch)=>{
        return repository.getChildren(parentId).then(children=>{
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
    return (dispatch)=>{
        return repository.getById(_id).then(model=>{
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

export function projectModelChange(value, propertyPath, model) {
    return (dispatch)=>{
        let changes = [{
            propertyPath,
            value
        }];
        return repository.update(model._id, changes).then(result=>{
            dispatch({
                type: 'update_project_model_success',
                update: result
            });
            return result;
        });
    };
}

export function createDefaultModel(rootParentId) {
    return (dispatch)=>{
        let defaultModel = {_id: cuid(), parentId: rootParentId, title: '', ui: {sequence: 0, collapsed: true}};
        return repository.insert(defaultModel).then(()=>{
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

export function makeNextSiblingOfModel(movingModelId, targetModel){
    throw new Error('not implemented');
}