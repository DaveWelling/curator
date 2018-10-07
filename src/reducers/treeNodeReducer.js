export default function treeNodeReducer(state={}, action){
    if (action.type === 'load_project_modelChildren_success') {
        return {
            ...state,
            [action.load.parentId]: action.load.models
        };
    }
    return state;
}