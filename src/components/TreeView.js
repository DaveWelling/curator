import React from 'react';
import PropTypes from 'prop-types';
//import TreeNode from './TreeNode';
import { connect } from 'react-redux';
import './treeView.css';
import get from 'lodash.get';
import {projectConfigChange} from '../actions/projectConfigActions';

export class TreeView extends React.Component {
    render() {
        //let {childrenData} = this.props;
        let {projectConfig, onChange} = this.props;
        return (<div className="TreeView">
            <input id="projectName" type="text" value={projectConfig.title} onChange={onChange} />
            {/* {childrenData.map((d, index) => {
                // Saves a nasty lookup later
                let nextSequence = childrenData[index + 1] ? childrenData[index + 1].sequence : undefined;
                return (<TreeNode
                    key={d._id}
                    name={d.title}
                    label={d.title}
                    value={d.title}
                    data={d}
                    nextSequence={nextSequence}
                />);
            })} */}
        </div>);
    }
}

function mapStateToProps(state, ownProps) {
    let projectConfig = get(state, 'project_config');
    return {
        projectConfig
    };
}

function mapDispatchToProps(dispatch, ownProps){
    return {
        onChange: (e)=>dispatch(
            projectConfigChange(e.currentTarget.value, ownProps)
        )
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(TreeView);

TreeView.propTypes = {
    projectConfig: PropTypes.object,
    onChange: PropTypes.func
};