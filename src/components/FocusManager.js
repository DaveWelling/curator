import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import get from 'lodash.get';
import { ensureVisible } from '../actions/treeNodeActions';
import { focusOnTreeNode } from '../actions/focusActions';
import {inspect} from 'util';
import throttle from 'lodash.throttle';
import {subscribe} from '../store/eventSink';

let jsonDiff = require('deep-diff');

/**
 * Focus Manager is a way to consolidate UI focus logic in one place
 * in an attempt to remove duplicate code while having focus be (mostly) empirically
 * determined by state.
 * Note that the countOfTries property allows the FocusManager to receive updates
 * even when the focusModel has not changed.  This is important if the element
 * receiving the focus is not visible yet (e.g. it needs to have parent nodes
 * expanded).
 */
class FocusManager extends Component {
    constructor() {
        super();
        this.state = {
            isManagingFocus: false
        };
        this.setFocus = this.setFocus.bind(this);
        this.focusRequested = this.focusRequested.bind(this);
        this.onBlur = this.onBlur.bind(this);
        this.onFocus = this.onFocus.bind(this);
        this.setFocus = throttle(this.setFocus, 100, {leading: false, trailing:true });
        this.unsubscribes = [];
        this.unsubscribes.push(subscribe('focus_tree_text', this.focusRequested));
    }

    componentWillUnmount(){
        this.unsubscribes.forEach(u=>u());
    }

    focusRequested(actionPayload) {
        const {modelId, countOfTries} = actionPayload;
        const elementId = this.props.prefixForFocusableId + modelId;
        this.setFocus(elementId, countOfTries);
    }

    setFocus(elementId, countOfTries = 0){
        const {
            dispatch
        } = this.props;
        let element = document.querySelector(`#${elementId}`);
        if (!element || isHidden(element)) {
            console.log('here1');
            let modelId = elementId.substr(this.props.prefixForFocusableId.length);
            dispatch(ensureVisible(modelId)).then(()=>{
                // Use dispatch so that it will be run AFTER any
                // dispatches caused by ensureVisible.
                dispatch(focusOnTreeNode(modelId, countOfTries + 1));
            });
        } else if (document.activeElement !== element) {
            console.log('here4');
            element.focus();
        }
    }

    onBlur() {
        console.log('blur');
        this._timeoutID = setTimeout(() => {
            if (this.state.isManagingFocus) {
                this.setState({
                    isManagingFocus: false
                });
            }
        }, 0);
    }

    onFocus(e) {
        if (this._timeoutID) clearTimeout(this._timeoutID);
        if (!this.state.isManagingFocus) {
            this.setState({
                isManagingFocus: true,
                focusId: e.target.Id
            });
        }
    }

    render() {
        return (
            <div className={this.props.className} onBlur={this.onBlur} onFocus={this.onFocus}>
                {this.props.children}
            </div>
        );
    }
}

FocusManager.propTypes = {
    focusModel: PropTypes.object,
    focusShouldBeOnTreeNode: PropTypes.bool,
    dispatch: PropTypes.func,
    countOfTries: PropTypes.number,
    children: PropTypes.array,
    prefixForFocusableId: PropTypes.string.isRequired,
    className: PropTypes.string
};

export default connect()(FocusManager);

function isHidden(element) {
    return element.offsetParent === null;
}
