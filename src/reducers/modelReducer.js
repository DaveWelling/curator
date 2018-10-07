export default function modelReducer(state=[], action) {
    if (action.type === 'update_project_model_success') {
        return {
            ...state,
            [action.update._id]: action.update
        };
    }
    if (action.type === 'insert_project_model_success') {
        return {
            ...state,
            [action.insert._id]: action.insert
        };
    }
    return state;
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