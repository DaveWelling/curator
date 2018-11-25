import React from 'react';
import PropType from 'prop-types';
import * as treeNodeActions from '../../actions/treeNodeActions';

/* Instead of trying to pass a single set of children by wrapping them
    inside the Collapseable component, separately pass in those children
    that will always be visible, and those that will be collapseable.
    This makes it much easier to layout the render. */
export class Collapseable extends React.Component {
    constructor(props) {
        super(props);

        this.handleArrowClick = this.handleArrowClick.bind(this);
        this.handleWheel = this.handleWheel.bind(this);
    }

    handleArrowClick() {
        let {dispatch, treeNode} = this.props;
        dispatch(treeNodeActions.toggleCollapse(treeNode));
    }

    // React Synth event: https://developer.mozilla.org/en-US/docs/Web/Events/wheel
    handleWheel(e) {
        e.preventDefault();
        let {dispatch, treeNode} = this.props;
        if (e.deltaY < 0) {
            dispatch(treeNodeActions.tryAscendingCollapse(treeNode));
        } else if (e.deltaY > 0) {
            dispatch(treeNodeActions.tryDescendingExpansion(treeNode));
        }
    }

    render() {
        const {
            alwaysVisibleChildren,
            collapsingChildren,
            hasCollapseableChildren,
            treeNode: {
                _id,
                ui: { collapsed }
            }
        } = this.props;
        let containerClassName = 'tree-view_children';
        if (collapsed) {
            containerClassName += ' tree-view_children-collapsed';
        }

        const ArrowRight = (
            <div onClick={this.handleArrowClick}>
                <i className="material-icons tree-view_arrow">arrow_right</i>
            </div>
        );
        const ArrowDown = (
            <div onClick={this.handleArrowClick}>
                <i className="material-icons tree-view_arrow">arrow_drop_down</i>
            </div>
        );

        return (
            <div
                id={'tvi' + _id}
                className="tree-view-item"
                onClick={e => e.stopPropagation}
                onWheel={this.handleWheel}
            >
                <div className="tree-view-item-top">
                    {hasCollapseableChildren && collapsed && ArrowRight}
                    {hasCollapseableChildren && !collapsed && ArrowDown}
                    {!hasCollapseableChildren && <span className="tree-view_spacer" />}

                    {alwaysVisibleChildren}
                </div>
                <div className={containerClassName}>{!collapsed && collapsingChildren}</div>
            </div>
        );
    }
}

Collapseable.propTypes = {
    dispatch: PropType.func,
    treeNode: PropType.object,
    childTreeNodes: PropType.array,
    hasCollapseableChildren: PropType.bool,
    alwaysVisibleChildren: PropType.object,
    collapsingChildren: PropType.object
};
