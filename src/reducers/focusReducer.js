export default function focusReducer(state={}, action) {
    switch (action.type) {
        case 'focus_project_model':
            return {
                ...state,
                currentModel: action.focus.model,
                onTreeNode: action.focus.onTreeNode,
                countOfTries: action.focus.countOfTries
            };
        case 'blur_project_model':
            if (state.onTreeNode && state.model && state.model._id === action.blur.model._id) {
                return {
                    ...state,
                    onTreeNode: false
                };
            }
            return state;
        default:
            return state;
    }
}