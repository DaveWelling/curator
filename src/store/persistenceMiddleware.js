import * as modelRepository from '../repository/projectModelsRepository';
import * as configRepository from '../repository/projectConfigRepository';

const persistenceMiddleware = store => next => action => {
    // avoid crashing on Redux init actions
    if (!store || !next) {
        return null;
    }

    if (!action || !action.type || action.handled) return next(action);

    const [verb, actionSubType, modelType, resultType] = action.type.split('_');

    if (verb !== 'persist') return next(action);

    let repo = (modelType === 'model') ? modelRepository : configRepository;
    let {_id, changes, oldModel, newModel} = action.payload;

    switch (actionSubType) {
        case 'update':
            repo.update(_id, changes).then(result=>{
                store.dispatch({
                    type: 'update_project_model_confirm',
                    payload: result
                });
                return result;
            }).catch(err=>{
                store.dispatch({
                    type: 'persist_project_model_rollback',
                    payload: {
                        oldModel,
                        newModel,
                        err
                    }
                });
            });
    }

};

export default persistenceMiddleware;