
import thunk from 'redux-thunk';
import treeNodeReducer from '../reducers/treeNodeReducer';
import mainBodyReducer from '../reducers/mainBodyReducer';
import { createStore, combineReducers, applyMiddleware, compose } from 'redux';
import projectConfigReducer from '../reducers/projectConfigReducer';

import eventSink from './eventSink';

const appReducer = combineReducers({
    // eslint-disable-next-line camelcase
    project_model: combineReducers({
        treeNode: treeNodeReducer,
        // drawing: drawingReducer,
        // summary: summaryReducer,
        // event: eventReducer,
        mainBody: mainBodyReducer
    }),
    // eslint-disable-next-line camelcase
    project_config: projectConfigReducer
});

const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;
const store = createStore(
    appReducer,
    composeEnhancers(applyMiddleware(thunk, eventSink.eventSink))
);
export default store;