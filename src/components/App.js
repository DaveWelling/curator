import PropTypes from 'prop-types';
import React, { Component } from 'react';
import Split from 'split.js';
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer } from 'react-toastify';
import throttle from 'lodash.throttle';
import withObservables from '@nozbe/with-observables';
import { switchMap } from 'rxjs/operators';
import { of } from 'rxjs';
import { Q } from '@nozbe/watermelondb';

import { publish } from '../store/eventSink';
import TreeView from './TreeView';

const id = 'app';
class App extends Component {
    constructor(props) {
        super(props);
        this.throttledPublish = throttle(publish, 200);
    }

    componentDidMount() {
        const { throttledPublish } = this;
        const leftSide = document.querySelector('#splitLeft-' + id);
        const rightSide = document.querySelector('#splitRight-' + id);
        const split = Split(['#splitLeft-' + id, '#splitRight-' + id], {
            sizes: [40, 60],
            elementStyle: (dimension, size, gutterSize) => ({
                'flex-basis': 'calc(' + size + '% - ' + gutterSize + 'px)'
            }),
            gutterStyle: (dimension, gutterSize) => ({
                'flex-basis': gutterSize + 'px'
            }),
            gutter: (index, direction) => {
                // Prevent duplicate gutters by finding if one has
                // already been created for this Layout
                const gutterId = 'gutter-' + id;
                let gutter = document.querySelector(`#${gutterId}`);
                if (!gutter) {
                    gutter = document.createElement('div');
                    gutter.id = gutterId;
                    gutter.className = `gutter gutter-${direction}`;
                }
                return gutter;
            },
            onDragEnd: () =>
                throttledPublish({
                    type: 'drag_split_end',
                    payload: {
                        sizes: split.getSizes(),
                        leftSize: leftSide.clientWidth,
                        rightSize: rightSide.clientWidth
                    }
                })
        });
    }

    render() {
        const { project, database } = this.props;
        // const p = project && Array.isArray(project) && project.length > 0 ? project[0] : {};
        return (
            <div className="App">
                <div id={'splitLeft-' + id} className="fullHeight leftSplit">
                    <div className="fullHeight innerLeftSplit">
                        <TreeView project={project} database={database} />
                    </div>
                </div>
                <div id={'splitRight-' + id} className="fullHeight">
                    <span>Right Side</span>
                    <ToastContainer />
                </div>
            </div>
        );
    }
}

App.propTypes = {
    project: PropTypes.object.isRequired,
    database: PropTypes.object.isRequired
};

const addProject = withObservables([], ({ database }) => ({
    project: database.collections.get('project').query(Q.where('current', true)).observe()
        .pipe(
            switchMap(result => {
                if (result && Array.isArray(result) && result.length > 0) {
                    return of(result[0]);
                }
                return of({});
            })
        )
}));

export default addProject(App);
