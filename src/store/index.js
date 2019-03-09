import thunk from 'redux-thunk';
import treeNodeReducer from '../reducers/treeNodeReducer';
import { createStore, combineReducers, applyMiddleware, compose } from 'redux';
import projectConfigReducer from '../reducers/projectConfigReducer';
import modelReducer from '../reducers/modelReducer';
import eventSink from './eventSink';
import treeNodeMiddleware from './treeNodeMiddleware';
import persistenceMiddleware from './persistenceMiddleware';

const appReducer = combineReducers({
    treeNodesByParentId: treeNodeReducer,
    modelsById: modelReducer,
    // eslint-disable-next-line camelcase
    project_config: projectConfigReducer
});

const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;
export function createFreshStore() {
    return createStore(
        appReducer,
        composeEnhancers(applyMiddleware(thunk, treeNodeMiddleware, persistenceMiddleware, eventSink.eventSink))
    );
}
export default createFreshStore();
