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
        this.onBlur = this.onBlur.bind(this);
        this.onFocus = this.onFocus.bind(this);
        this.setFocus = throttle(this.setFocus, 700, {leading: false, trailing:true });
        this.unsubscribes = [];
        this.unsubscribes(subscribe('focus_project_model', this.focusRequested));
    }

    // componentDidUpdate(prevProps) {
    //     // Do not bother messing with focus if none of the children have focus.
    //     //if (!this.state.isManagingFocus) return;
    //     const {
    //         focusModel,
    //         countOfTries,
    //         focusShouldBeOnTreeNode
    //     } = this.props;
    //     if (get(this.props, 'focusModel.title', '') !== '') {
    //         let diff = jsonDiff(prevProps, this.props, (path, key)=>{
    //             return  (typeof key === 'string' && key.includes('_'));
    //         });
    //         if (diff) {
    //             console.log('-begin--------------------------------------------------------------------');
    //             console.log(diff);
    //             console.log('-end--------------------------------------------------------------------');
    //         }
    //     }

    //     if (
    //         focusShouldBeOnTreeNode &&
    //         focusModel
    //     ) {
    //         if (countOfTries > 7) {
    //             console.error(
    //                 `Something is weird.  Tried to focus on model ${countOfTries} times.  Model: ${JSON.stringify(
    //                     focusModel
    //                 )}`
    //             );
    //             return;
    //         }
    //         this.setFocus();
    //     }
    // }

    componentWillUnmount(){
        this.unsubscribes.forEach(u=>u());
    }

    setFocus(){
        const {
            dispatch,
            focusModel,
            countOfTries,
            prefixForFocusableId,
            focusModel: { _id }
        } = this.props;
        const {setFocus} = this;
        let element = document.querySelector(`#${prefixForFocusableId}${_id}`);
        if (!element) {
            console.log('here1');
            dispatch(ensureVisible(focusModel));
            dispatch(focusOnTreeNode(focusModel, countOfTries + 1));
        } else {
            if (isHidden(element)) {
                console.log('here3');
                dispatch(ensureVisible(focusModel));
                dispatch(focusOnTreeNode(focusModel, countOfTries + 1));
            } else if (document.activeElement !== element) {
                console.log('here4');
                element.focus();
            }
            //console.log('here5');
        }
        //console.log('here6');
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

function mapStateToProps(state) {
    const focusModel = get(state, 'focus.currentModel');
    const focusShouldBeOnTreeNode = get(state, 'focus.onTreeNode', false);
    const countOfTries = get(state, 'focus.countOfTries', 0);
    return {
        focusModel,
        focusShouldBeOnTreeNode,
        countOfTries
    };
}

export default connect(mapStateToProps)(FocusManager);

function isHidden(element) {
    return element.offsetParent === null;
}
