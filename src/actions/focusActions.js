export function focusOnTreeNode(modelId, countOfTries=0) {
    return (dispatch) => {
        countOfTries++;
        dispatch({
            type: 'focus_tree_text',
            focus: {
                modelId,
                countOfTries
            }
        });
    };
}

export function blurTreeNode(model) {
    return dispatch => dispatch({
        type: 'blur_project_model',
        blur: {
            model
        }
    });
}

// export function focusOnWorkspace(model){
//     return dispatch => dispatch({
//         type: 'focus_project_model',
//         focus: {
//             model,
//             onTreeNode: true
//         }
//     });
// }