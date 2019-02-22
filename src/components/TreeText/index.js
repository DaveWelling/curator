import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { projectModelChange } from '../../actions/projectModelActions';
import { keyDown } from '../../actions/treeTextActions';
import { focusOnTreeNode, blurTreeNode } from '../../actions/focusActions';
import ContentEditableShell from '../ContentEditableShell';
import './treeText.css';

export class TreeText extends Component {
    render() {
        const { _id, title, onChange, onTitleKeystroke, onFocus, onBlur } = this.props;
        if (_id === 'endingLookup') return null;
        return (
            <ContentEditableShell
                autoFocus
                id={'treeTextTitle' + _id}
                placeholder="title"
                type="text"
                value={title}
                onKeyDown={onTitleKeystroke}
                onChange={onChange}
                // onFocus={onFocus}
                // onBlur={onBlur}
            />
        );
    }
}

function mapDispatchToProps(dispatch, ownProps) {
    return {
        // onBlur: () => dispatch(blurTreeNode(ownProps.model)),
        // onFocus: () => dispatch(focusOnTreeNode(ownProps.model)),
        onChange: e => dispatch(projectModelChange(e.target.value, 'title', ownProps.model)),
        onTitleKeystroke: e => {
            dispatch(
                keyDown(
                    e.keyCode,
                    e.preventDefault,
                    e.target,
                    ownProps.model,
                    e.shiftKey
                )
            );
        }
    };
}

function mapStateToProps(state, ownProps) {
    const {_id, title} = ownProps.model;
    return {
        _id,
        title
    };
}

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(TreeText);

TreeText.propTypes = {
    model: PropTypes.object,
    _id: PropTypes.string,
    title: PropTypes.string,
    onChange: PropTypes.func,
    onTitleKeystroke: PropTypes.func,
    onFocus: PropTypes.func,
    onBlur: PropTypes.func
};
