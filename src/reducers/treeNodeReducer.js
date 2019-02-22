export default function treeNodeReducer(state={}, action){
    if (action.type === 'load_project_modelChildren_success') {
        return {
            ...state,
            [action.load.parentId]: action.load.models
        };
    }
    if (action.type === 'remove_project_modelChildren_success'){
        let {model} = action.remove;
        let newChildren = state[model.parentId].reduce((result, child)=>{
            if (child._id !== model._id) {
                result.push(child);
            }
            return result;
        }, []);
        return {
            ...state,
            [model.parentId]: newChildren
        };
    }
    return state;
}