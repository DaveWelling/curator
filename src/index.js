import './index.css';

import React from 'react';
import { render } from 'react-dom';
import { Provider } from 'react-redux';
import { Database } from '@nozbe/watermelondb';
import LokiJSAdapter from '@nozbe/watermelondb/adapters/lokijs';
import DatabaseProvider from '@nozbe/watermelondb/DatabaseProvider';
import PreApp from './components/PreApp';
import store from './store';
import schema from './model/schema';
import { Item, ItemUi, Project } from './model/Item';

const adapter = new LokiJSAdapter({
    dbName: 'Curator',
    schema
});

// Then, make a Watermelon database from it!
const database = new Database({
    adapter,
    modelClasses: [Item, ItemUi, Project],
    actionsEnabled: true
});


render(
    <DatabaseProvider database={database}>
        <Provider store={store}>
            <PreApp database={database} />
        </Provider>
    </DatabaseProvider>,
    document.querySelector('#app')
);
// https://wicg.github.io/ResizeObserver/
if (global.window) {
    // lazy loading the require here.
    // eslint-disable-next-line
    window.ResizeObserver = window.ResizeObserver || require('resize-observer-polyfill');
}

if ('serviceWorker' in navigator) {
    // Use the window load event to keep the page load performant
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/service-worker.js');
    });
}
