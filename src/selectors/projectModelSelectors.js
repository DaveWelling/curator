import createCachedSelector from 're-reselect';
import * as repository from '../repository/projectModelsRepository';
import {subscribe} from '../store/eventSink';
const parentIdSelector = (state, props)=>props.model.treeNode._id;

export function makeGetChildrenModels(){
    let selector = createCachedSelector(
        [parentIdSelector],repository.getChildren
    )((state, props)=>props.model.treeNode._id);
    subscribe('update_project_model_success', function(update){
        if (update.newModel.parentId !== update.oldModel.parentId){
            if (selector.cache.get(update.newModel.parentId)) {
                selector.cache.remove(update.newModel.parentId);
            }
            if (selector.cache.get(update.oldModel.parentId)) {
                selector.cache.remove(update.oldModel.parentId);
            }
        }
    });
    return selector;
}