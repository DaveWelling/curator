import React from 'react';
import PropTypes from 'prop-types';
import TreeNode from './TreeNode';
import { connect } from 'react-redux';
import './treeView.css';
import get from 'lodash.get';
import {projectConfigChange} from '../actions/projectConfigActions';
import {getChildrenByParentId} from '../actions/projectModelActions';

export class TreeView extends React.Component {
    componentWillMount(){
        this.props.loadModels(this.props.projectConfig._id);
    }
    render() {
        let {projectConfig, onChange, treeNodes} = this.props;
        return (<div className="TreeView">
            <input id="projectName" type="text" value={projectConfig.title} onChange={onChange} />
            {treeNodes.map((treeNode, index) => {
                // Saves a nasty lookup later
                let nextSequence = treeNodes[index + 1] ? treeNodes[index + 1].sequence : undefined;
                return (<TreeNode
                    key={treeNode._id}
                    treeNode={treeNode}
                    nextSequence={nextSequence}
                />);
            })}
        </div>);
    }
}

function mapStateToProps(state) {
    const projectConfig = get(state, 'project_config');
    const treeNodes = get(state, `treeNodesByParentId.${projectConfig._id}`, []).sort((a, b) => a.ui.sequence - b.ui.sequence);
    return {
        projectConfig,
        treeNodes
    };
}

function mapDispatchToProps(dispatch, ownProps){
    return {
        onChange: (e)=>dispatch(
            projectConfigChange(e.currentTarget.value, ownProps)
        ),
        loadModels: (parentId)=>dispatch(
            getChildrenByParentId(parentId)
        )
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(TreeView);

TreeView.propTypes = {
    projectConfig: PropTypes.object,
    onChange: PropTypes.func,
    treeNodes: PropTypes.array,
    modelChange: PropTypes.func,
    loadModels: PropTypes.func
};