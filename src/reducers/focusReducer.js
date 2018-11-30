export default function focusReducer(state={}, action) {
    switch (action.type) {
        case 'focus_project_model':
            return {
                ...state,
                currentModel: action.focus.model,
                onTreeNode: action.focus.onTreeNode
            };
        default:
            return state;
    }
}