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
    componentWillMount(){
        this.props.dispatch(getChildrenByParentId(this.props.treeNode._id));
    }

    componentDidMount() {
        nodeDragging(this.props.treeNode, this.props.dispatch);
    }

    render() {
        let { onChange, nextSequence, childTreeNodes, treeNode, dispatch} = this.props;

        /* Instead of trying to pass a single set of children by wrapping them
           inside the Collapseable component, separately pass in those children
           that will always be visible, and those that will be collapseable.
           This makes it much easier to layout the render. */
        return (
            <WrapDraggable treeNode={treeNode}>
                <Collapseable
                    treeNode={treeNode}
                    hasCollapseableChildren = {childTreeNodes && !!childTreeNodes.length}
                    dispatch={dispatch}
                    alwaysVisibleChildren = {
                        <div className="tree-view-text">
                            <TreeText
                                model={treeNode}
                                nextSequence={nextSequence} /* Saves a nasty lookup later */
                            />
                            <div className="select-container">
                                <select name="type" value={treeNode.type} onChange={onChange}>
                                    {config.modelTypes.map(type=>{
                                        return <option key={type.title} value={type.title}>{type.prettyName}</option>;
                                    })}
                                </select>
                            </div>
                            {treeNode._id}
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
    childTreeNodes: PropType.array.isRequired,
    onChange: PropType.func.isRequired
};

const mapStateToProps = (state, ownprops) => {
    const childTreeNodes = get(state, `treeNodesByParentId.${ownprops.treeNode._id}`, []);
    return {
        childTreeNodes
    };
};

function mapDispatchToProps(dispatch, ownProps){
    return {
        onChange: (e)=>dispatch(
            projectModelChange(e.currentTarget.value, e.currentTarget.name, ownProps.treeNode)
        ),
        dispatch
    };
}

// Need this reference for recursion during render.
const TreeNodeConnected = connect(mapStateToProps, mapDispatchToProps)(TreeNode);
export default TreeNodeConnected;