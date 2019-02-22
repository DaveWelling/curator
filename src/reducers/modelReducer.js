export default function modelReducer(state=[], action) {
    switch (action.type) {
        case 'load_project_model_success':
            return {
                ...state,
                [action.load._id]: action.load
            };
        case 'update_project_model_success':
            return {
                ...state,
                [action.update.newModel._id]: action.update.newModel
            };
        case 'insert_project_model_success':
            return {
                ...state,
                [action.insert._id]: action.insert
            };
        case 'remove_project_model_success':
            return getStateWithoutModel(state, action.remove.model);
        default:
            return state;
    }
}

function getStateWithoutModel(state, model) {
    let newState = {
        ...state
    };
    delete newState[model._id];
    return newState;
}

// export default function getModelReducer(initialProjectModelState) {
//     return function ModelReducer(state={initialProjectModelState}, action){
//         switch (action.type) {
//             case 'update_project_model': {
//                 return {
//                     ...state,
//                     model: {
//                         ...state.model,
//                         ...action.update.changes
//                     }
//                 };
//             }
//             case 'change_project_name': {
//                 return {
//                     ...state,
//                     name: action.change.name
//                 };
//             }
//             case 'focus_project_model':
//                 return {
//                     ...state,
//                     model: {
//                         ...action.focus.model
//                     }
//                 };
//             case 'drag_project_model_start':
//                 return {...state, dragging: action.drag.model};
//             case 'drag_project_model_end':
//                 return {...state, dragging: undefined};
//         }
//         return state;
//     };
// }