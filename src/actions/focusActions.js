import get from 'lodash.get';
export function focusOnTreeNode(model, countOfTries) {
    return (dispatch, getState) => {
        let state = getState();
        // if a count is passed in, that wins.
        if (!countOfTries) {
            // If this is the same model, then bump the countOfTries so
            // that there will be a changed state to trigger FocusManager
            // render.
            if (model._id === get(state, 'focus.currentModel._id')) {
                countOfTries = state.focus.countOfTries + 1;
            } else {
                countOfTries = 0;
            }
        }
        // get latest model or use the one passed in if it isn't in state yet.
        let latestModel = state.modelsById[model._id] || model;
        dispatch({
            type: 'focus_project_model',
            focus: {
                model: latestModel,
                onTreeNode: true,
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

export function focusOnWorkspace(model){
    return dispatch => dispatch({
        type: 'focus_project_model',
        focus: {
            model,
            onTreeNode: true
        }
    });
}