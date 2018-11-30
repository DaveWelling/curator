
import thunk from 'redux-thunk';
import treeNodeReducer from '../reducers/treeNodeReducer';
import { createStore, combineReducers, applyMiddleware, compose } from 'redux';
import projectConfigReducer from '../reducers/projectConfigReducer';
import modelReducer from '../reducers/modelReducer';
import focus from '../reducers/focusReducer';
import eventSink from './eventSink';
import treeNodeMiddleware from './treeNodeMiddleware';

const appReducer = combineReducers({
    treeNodesByParentId: treeNodeReducer,
    modelsById: modelReducer,
    // eslint-disable-next-line camelcase
    project_config: projectConfigReducer,
    focus
});

const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;
const store = createStore(
    appReducer,
    composeEnhancers(applyMiddleware(thunk, treeNodeMiddleware, eventSink.eventSink))
);
export default store;