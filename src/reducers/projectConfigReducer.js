
export default function projectConfigReducer(state={loading:true}, action){
    if (action.type === 'load_project_config_success') {
        return {
            ...action.load,
            loading: false
        };
    }
    if (action.type === 'update_project_config_success') {
        return {
            ...action.update.newConfig,
            loading: false
        };
    }
    if (action.type === 'insert_project_config_success'){
        return {
            ...action.insert,
            loading: false
        };
    }
    return state;
}