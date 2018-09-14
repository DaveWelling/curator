import './index.css';

import React from 'react';
import {render} from 'react-dom';
import { Provider } from 'react-redux';
import App from './components/App';
import store from './store';

render(
    (<Provider store={store}>
        <App/>
    </Provider>),
    document.querySelector('#app')
);
// https://wicg.github.io/ResizeObserver/
if (global.window) {
    window.ResizeObserver = window.ResizeObserver || require('resize-observer-polyfill');
}

if ('serviceWorker' in navigator) {
    // Use the window load event to keep the page load performant
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/service-worker.js');
    });
  }