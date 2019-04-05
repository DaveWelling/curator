import React from 'react';
import PropTypes from 'prop-types';
import { Q } from '@nozbe/watermelondb';
import withObservables from '@nozbe/with-observables';
import TreeNode from './TreeNode';
import './treeView.css';
import FocusManager from './FocusManager';
import { of as of$, Observable } from 'rxjs';
import { first, switchMap, map } from 'rxjs/operators';

export class TreeView extends React.Component {
    constructor(props) {
        super(props);
        this.onChange = this.onChange.bind(this);
    }

    async onChange(e) {
        const value = e.currentTarget.value;
        await this.props.database.action(async () => {
            await this.props.rootItem.update(item => {
                item.title = value;
            });
        });
    }

    render() {
        const { onChange } = this;
        const { rootItem, children } = this.props;
        const sortedChildren = children.sort((a, b) => a.ui.sequence - b.ui.sequence);
        const title = rootItem ? rootItem.title : '';
        return (
            <FocusManager className="TreeView" prefixForFocusableId="treeTextTitle">
                <input
                    id="projectName"
                    className="projectName"
                    placeholder="Put a project name here"
                    type="text"
                    value={title}
                    onChange={onChange}
                />
                {/* {treeNodes.map((treeNode, index) => {
                    // Saves a nasty lookup later
                    const nextSequence = treeNodes[index + 1]
                        ? treeNodes[index + 1].sequence
                        : undefined;
                    return (
                        <TreeNode
                            key={treeNode._id}
                            treeNode={treeNode}
                            nextSequence={nextSequence}
                        />
                    );
                })} */}
            </FocusManager>
        );
    }
}

const observeProject = withObservables(['project'], ({ project }) => {
    // let rootItem = of$({ title: '', children: [] });
    if (!project.observe) {
        return {
            project: of$(project),
            rootItem: of$({}),
            children: of$([])
        };
    }
    const rootItem = project.observe().pipe(
        switchMap(p => (p && p.rootItem ? of$(p.rootItem) : of$({})))
    );
    const children = rootItem.pipe(
        switchMap(item => (item && item.children ? of$(item.children) : of$([])))
    );
    return {
        project,
        rootItem,
        children
    };
});

export default observeProject(TreeView);

TreeView.propTypes = {
    rootItem: PropTypes.object.isRequired,
    children: PropTypes.array.isRequired,
    database: PropTypes.object.isRequired
};
