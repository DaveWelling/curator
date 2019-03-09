export function focusOnTreeNode(modelId, countOfTries=0) {
    return (dispatch) => {
        countOfTries++;
        dispatch({
            type: 'focus_tree_text',
            payload: {
                modelId,
                countOfTries
            }
        });
    };
}

export function blurTreeNode(model) {
    return dispatch => dispatch({
        type: 'blur_project_model',
        payload: {
            model
        }
    });
}

// export function focusOnWorkspace(model){
//     return dispatch => dispatch({
//         type: 'focus_project_model',
//         payload: {
//             model,
//             onTreeNode: true
//         }
//     });
// }