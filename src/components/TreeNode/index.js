import {connect} from 'react-redux';
import React from 'react';
import {getChildrenByParentId, projectModelChange} from '../../actions/projectModelActions';
import get from 'lodash.get';
import PropType from 'prop-types';
import nodeDragging, {WrapDraggable} from './nodeDragging';
import TreeText from '../TreeText';
import config from '../../config';
import {Collapseable} from './nodeCollapseable';
import './treeNode.css';

export class TreeNode extends React.Component {
    constructor(props) {
        super(props);
        this.onValueChange = this.onValueChange.bind(this);
        this.onTypeChange = this.onTypeChange.bind(this);
    }

    componentWillMount(){
        getChildrenByParentId(this.props.treeNode._id);
    }

    componentDidMount() {
        nodeDragging(this.props.treeNode, this.props.dispatch);
    }

    onTypeChange(newType) {
        const {
            dispatch,
            treeNode: { _id }
        } = this.props;
        dispatch({
            type: 'update_project_model',
            update: {
                _id,
                changes: {
                    type: newType.target.value
                }
            }
        });
        dispatch(focus({
            ...this.props.treeNode,
            type: newType.target.value
        }));

    }
    onValueChange(newValue) {
        const {
            dispatch,
            treeNode: { _id }
        } = this.props;
        dispatch({
            type: 'update_project_model',
            update: {
                _id,
                changes: {
                    title: newValue
                }
            }
        });
    }
    render() {
        const { onTypeChange } = this;
        let { nextSequence, childTreeNodes, treeNode} = this.props;

        /* Instead of trying to pass a single set of children by wrapping them
           inside the Collapseable component, separately pass in those children
           that will always be visible, and those that will be collapseable.
           This makes it much easier to layout the render. */
        return (
            <WrapDraggable treeNode={treeNode}>
                <Collapseable
                    treeNode={treeNode}
                    hasCollapseableChildren = {childTreeNodes && !!childTreeNodes.length}
                    alwaysVisibleChildren = {
                        <div className="tree-view-text">
                            <TreeText
                                _id={treeNode._id}
                                title={treeNode.title}
                                nextSequence={nextSequence} /* Saves a nasty lookup later */
                            />
                            <div className="select-container">
                                <select value={treeNode.type} onChange={onTypeChange}>
                                    {config.modelTypes.map(type=>{
                                        return <option key={type.title} value={type.title}>{type.prettyName}</option>;
                                    })}
                                </select>
                            </div>
                        </div>
                    }
                    collapsingChildren = {
                        <div>
                            {childTreeNodes && childTreeNodes.map((child, index) => {
                                // Saves a nasty lookup later
                                let nextSequence = childTreeNodes[index + 1] ? childTreeNodes[index + 1].sequence : undefined;
                                return (
                                    <TreeNodeConnected
                                        key={child._id || child}
                                        treeNode={child}
                                        nextSequence={nextSequence}
                                    />
                                );
                            })}
                        </div>
                    }
                />
            </WrapDraggable>
        );
    }
}
TreeNode.propTypes = {
    treeNode: PropType.object.isRequired,
    dispatch: PropType.func.isRequired,
    childTreeNodes: PropType.array.isRequired
};

const mapStateToProps = (state, ownprops) => {
    const childTreeNodes = get(state, `treeNodesByParentId.${ownprops.treeNode._id}`, []).sort((a, b) => a.ui.sequence - b.ui.sequence);
    return {
        childTreeNodes
    };
};

function mapDispatchToProps(dispatch, ownProps){
    return {
        onChange: (e)=>dispatch(
            projectModelChange(e.currentTarget.value, e.currentTarget.name, ownProps.treeNode._id)
        ),
        dispatch
    };
}

// Need this reference for recursion during render.
const TreeNodeConnected = connect(mapStateToProps, mapDispatchToProps)(TreeNode);
export default TreeNodeConnected;