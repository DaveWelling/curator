import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { projectModelChange } from '../../actions/projectModelActions';
import { keyDown } from '../../actions/treeTextActions';
import get from 'lodash.get';

import './treeText.css';

export class TreeText extends Component {
    constructor(props) {
        super(props);
        this.textInput = React.createRef();
    }

    componentDidUpdate(){
        if (this.props.shouldBeFocused && (document.activeElement.id !== 'treeTextTitle' + this.props._id)) {
            this.textInput.current.focus();
        }
    }

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
                ref={this.textInput}
                onKeyDown={onTitleKeystroke}
                onChange={onChange}
            />
        );
    }
}

function mapDispatchToProps(dispatch, ownProps) {
    return {
        onChange: e => dispatch(projectModelChange(e.currentTarget.value, 'title', ownProps.model)),
        onTitleKeystroke: e => {
            e.persist(); // avoid losing synthetic event in asynchronous call below
            dispatch(
                keyDown(
                    e.keyCode,
                    () => e.preventDefault() /* closure keeps event ref */,
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
    const shouldBeFocused = (get(state, 'focus.currentModel._id') === _id) && get(state, 'focus.onTreeNode', false);
    return {
        _id,
        title,
        shouldBeFocused
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
    shouldBeFocused: PropTypes.bool
};
