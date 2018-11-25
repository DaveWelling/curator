import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { projectModelChange } from '../../actions/projectModelActions';
import { keyDown } from '../../actions/treeTextActions';

import './treeText.css';

export class TreeText extends Component {
    render() {
        const { _id, title, onChange, onTitleKeystroke } = this.props;
        if (_id === 'endingLookup') return null;
        return (
            <input
                autoFocus
                id={'treeTextTitle' + _id}
                className="treeTextTitle"
                placeholder="title"
                type="text"
                value={title}
                onKeyDown={onTitleKeystroke}
                onChange={onChange}
            />
        );
    }
}

function mapDispatchToProps(dispatch, ownProps) {
    return {
        onChange: e => dispatch(projectModelChange(e.currentTarget.value, 'title', ownProps._id)),
        onTitleKeystroke: e => {
            e.persist(); // avoid losing synthetic event in asynchronous call below
            dispatch(
                keyDown(e.keyCode, () => e.preventDefault() /* closure keeps event ref */, e.target, ownProps._id)
            );
        }
    };
}

export default connect(
    null,
    mapDispatchToProps
)(TreeText);

TreeText.propTypes = {
    _id: PropTypes.string,
    title: PropTypes.string,
    onChange: PropTypes.func,
    onTitleKeystroke: PropTypes.func
};
