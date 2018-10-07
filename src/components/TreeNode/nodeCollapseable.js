import React from 'react';
import PropType from 'prop-types';

export class Collapseable extends React.Component {
    constructor(props) {
        super(props);

        this.handleArrowClick = this.handleArrowClick.bind(this);
        this.handleWheel = this.handleWheel.bind(this);
        this.tryChildCollapse = this.tryChildCollapse.bind(this);
        this.tryCollapse = this.tryCollapse.bind(this);
        this.tryExpand = this.tryExpand.bind(this);
        this.tryChildExpand = this.tryChildExpand.bind(this);
        this.childrenTryCollapses = [];
        this.childrenTryExpands = [];
    }

    toggleCollapse() {
        this.props.dispatch({
            type: 'toggleCollapse_project_model',
            toggleCollapse: {
                _id: this.props.treeNode._id
            }
        });
    }

    handleArrowClick() {
        this.toggleCollapse();
    }

    // React Synth event: https://developer.mozilla.org/en-US/docs/Web/Events/wheel
    handleWheel(e) {
        e.preventDefault();
        if (e.deltaY < 0) {
            this.tryCollapse();
        } else if (e.deltaY > 0) {
            this.tryExpand();
        }
    }

    tryExpand() {
        // To expand, must be collapsed and have something (other than _meta) inside
        if (this.props.treeNode.ui.collapsed && this.props.hasCollapseableChildren) {
            this.props.dispatch({
                type: 'expand_project_model',
                expand: {
                    _id: this.props.treeNode._id
                }
            });
            return true;
        } else {
            return !!this.tryChildExpand();
        }
    }
    tryCollapse() {
        if (this.props.treeNode.ui.collapsed) {
            return false;
        } else {
            if (!this.tryChildCollapse()) {
                this.props.dispatch({
                    type: 'collapse_project_model',
                    collapse: {
                        _id: this.props.treeNode._id
                    }
                });
            }
            return true;
        }
    }

    tryChildExpand() {
        for (let i = 0; i < this.childrenTryExpands.length; i++) {
            if (this.childrenTryExpands[i] && this.childrenTryExpands[i]()) {
                return true;
            }
        }
        return false;
    }
    tryChildCollapse() {
        for (let i = this.childrenTryCollapses.length - 1; i >= 0; i--) {
            if (this.childrenTryCollapses[i] && this.childrenTryCollapses[i]()) {
                return true;
            }
        }
        return false;
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
                {hasCollapseableChildren && collapsed && ArrowRight}
                {hasCollapseableChildren && !collapsed && ArrowDown}
                {!hasCollapseableChildren && <span className="tree-view_spacer" />}

                {alwaysVisibleChildren}

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
