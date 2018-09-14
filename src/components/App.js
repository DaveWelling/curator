import './App.css';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import Split from 'split.js';
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer } from 'react-toastify';
import throttle from 'lodash.throttle';
import { publish } from '../store/eventSink';
import TreeView from './TreeView';
import Spinner from 'react-spinkit';
import {connect} from 'react-redux';
import get from 'lodash.get';
import {loadProjectConfig} from '../actions/projectConfigActions';

const id = 'app';
class App extends Component {
    constructor(props) {
        super(props);
        this.throttledPublish = throttle(publish, 200);
    }
    componentDidMount() {
        this.props.dispatch(loadProjectConfig());
    }
    componentDidUpdate(previousProps) {
        if (previousProps.loading && !this.props.loading) {
            const { throttledPublish } = this;
            const leftSide = document.querySelector('#splitLeft-' + id);
            const rightSide = document.querySelector('#splitRight-' + id);
            const split = (this.split = Split(['#splitLeft-' + id, '#splitRight-' + id], {
                sizes: [40, 60],
                elementStyle: function(dimension, size, gutterSize) {
                    return {
                        'flex-basis': 'calc(' + size + '% - ' + gutterSize + 'px)'
                    };
                },
                gutterStyle: function(dimension, gutterSize) {
                    return {
                        'flex-basis': gutterSize + 'px'
                    };
                },
                gutter: function(index, direction) {
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
                onDragEnd: e =>
                    throttledPublish({
                        type: 'drag_split_end',
                        drag: {
                            sizes: split.getSizes(),
                            leftSize: leftSide.clientWidth,
                            rightSize: rightSide.clientWidth
                        }
                    })
            }));
        }
    }
    render() {
        const { loading } = this.props;
        let display;
        if (loading) {
            display = <div className="spinnerContainer"><Spinner className="spinner" name="ball-scale-ripple-multiple" /></div>;
        } else {
            display = (
                <div className="App">
                    <div id={'splitLeft-' + id} className="fullHeight leftSplit">
                        <div className="fullHeight innerLeftSplit">
                            <TreeView />
                        </div>
                    </div>
                    <div id={'splitRight-' + id} className="fullHeight">
                        Right Side
                        <ToastContainer />
                    </div>
                </div>
            );
        }
        return display;
    }
}

App.propTypes = {
    loading: PropTypes.bool,
    dispatch: PropTypes.func
};

function mapStateToProps(state) {
    let loading = get(state, 'project_config.loading', true);
    return {
        loading
    };
}
export default connect(mapStateToProps)(App);
