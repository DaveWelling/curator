export function focusOnTreeNode(model) {
    return dispatch => dispatch({
        type: 'focus_project_model',
        focus: {
            model,
            onTreeNode: true
        }
    });
}

export function focusOnWorkspace(model){
    return dispatch => dispatch({
        type: 'focus_project_model',
        focus: {
            model,
            onTreeNode: true
        }
    });
}