
export default function projectConfigReducer(state={loading:true}, action){
    if (action.type === 'load_project_config_success') {
        return {...action.load};
    }
    if (action.type === 'update_project_config_success') {
        return {
            ...action.update.newConfig,
            loading: false
        };
    }
    return state;
}