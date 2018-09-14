import {connect} from 'react-redux';
import React from 'react';
import {makeGetChildrenModels} from '../selectors/projectModelSelectors';

export class TreeNode extends React.Component {

}

// THIS WON'T WORK - it getChildrenModels returns a promise
// INSTEAd - Use the selector in the action and create a reducer for
// 'displayed_models' by parentId?
export const makeMapStateToProps = ()=>{
    const getChildrenModels = makeGetChildrenModels();
    const mapStateToProps = (state, props) => {
        return {
            childrenModels: getChildrenModels(state, props)
        };
    };
    return mapStateToProps;
};

export default connect(makeMapStateToProps)(TreeNode);