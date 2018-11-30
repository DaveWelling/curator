import * as projectModelActions from './projectModelActions';
import * as focusActions from './focusActions';
import get from 'lodash.get';

export function toggleCollapse(treeNode) {
    return (dispatch, getState) =>
        projectModelActions.projectModelChange(!treeNode.ui.collapsed, 'ui.collapsed', treeNode)(dispatch, getState);
}

export function tryDescendingExpansion(treeNode) {
    // if already expanded, try to expand a child, returning true if successfully expanded a child
    // else expand self and return true.
    // If nothing can be expanded return false.
    return (dispatch, getState) => {
        if (treeNode.ui.collapsed) {
            toggleCollapse(treeNode)(dispatch, getState);
            return true;
        }
        const state = getState();
        const children = state.treeNodesByParentId[treeNode._id];
        if (children && children.length) {
            for (let i = 0; i < children.length; i++) {
                const child = children[i];
                // Depth first using recursion
                if (tryDescendingExpansion(child)(dispatch, getState)) {
                    return true;
                }
            }
        }
        return false;
    };
}

export function tryAscendingCollapse(treeNode) {
    // if already collapsed, return false
    // else try to collapse a child (only bother collapsing visible children (those already in state)?), returning true if successful.
    // If child has an uncollapsed child, try to collapse that instead (and so on recursing down the tree).
    // If not successful, collapse self and return true

    return (dispatch, getState) => {
        if (treeNode.ui.collapsed) {
            return false;
        }
        const state = getState();
        const children = state.treeNodesByParentId[treeNode._id];
        if (children && children.length) {
            for (let i = children.length-1; i >= 0; i--) {
                const child = children[i];
                // Depth first using recursion
                if (tryAscendingCollapse(child)(dispatch, getState)) {
                    return true;
                }
            }

        }
        toggleCollapse(treeNode)(dispatch, getState);
        return true;
    };
}

export function goToNext(treeNode) {
    return (dispatch, getState)=>{
        let nextNode = getNextNodeInSequence(treeNode, getState());
        if (nextNode) {
            return focusActions.focusOnTreeNode(nextNode)(dispatch);
        }
    };
}


export function goToPrevious(treeNode) {
    return (dispatch, getState)=>{
        let previousNode = getPreviousNodeInSequence(treeNode, getState());
        if (previousNode) {
            return focusActions.focusOnTreeNode(previousNode)(dispatch);
        }
    };
}

function getOrderedSiblings(currentModel, state) {
    const siblings = state.treeNodesByParentId[currentModel.parentId];
    // Do not mutate state.
    return [...siblings].sort((a, b) => get(a, 'ui.sequence', 0) - get(b, 'ui.sequence', 0));
}

function getOrderedChildren(currentModel, state) {
    const children = state.treeNodesByParentId[currentModel._id];
    // Do not mutate state.
    return [...children].sort((a, b) => get(a, 'ui.sequence', 0) - get(b, 'ui.sequence', 0));
}

export function getNextNodeInSequence(currentModel, state) {
    if (currentModel.ui.collapsed === false) {
        let orderedChildren = getOrderedChildren(currentModel, state);
        return orderedChildren[0];
    }

    let orderedSiblings = getOrderedSiblings(currentModel, state);
    let currentIndex = orderedSiblings.findIndex(m => m._id === currentModel._id);

    // No next sibling
    if (currentIndex + 1 >= orderedSiblings.length) {
        return;
    }

    return orderedSiblings[currentIndex + 1];
}

export function getPreviousNodeInSequence(currentModel, state) {
    let orderedSiblings = getOrderedSiblings(currentModel, state);
    let currentIndex = orderedSiblings.findIndex(m => m._id === currentModel._id);

    // No previous sibling
    if (currentIndex - 1 < 0) {
        return;
    }
    let previousSibling = orderedSiblings[currentIndex - 1];
    if (previousSibling.ui.collapsed === false) {
        let orderedChildren = getOrderedChildren(previousSibling, state);
        if (orderedChildren && orderedChildren.length > 0) {
            return orderedChildren[orderedChildren.length - 1];
        }
    }
    return orderedSiblings[currentIndex - 1];
}

export function makeNextSiblingOfParent(model) {
    return (dispatch, getState)=>{
        let state = getState();
        return projectModelActions.getCachedModel(model.parentId, state, dispatch).then(parentModel=>{
            if (!parentModel) { //probably the root
                return;
            }

            return setAsNextSiblingOfModel(model._id, parentModel)(dispatch, getState);
        });
    };
}

export function makeChildOfPreviousSibling(model) {
    return (dispatch, getState)=>{
        throw new Error('not implemented');
    };
}



export function setAsNextSiblingOfModel(modelIdMoving, destinationSiblingModel) {
    return (dispatch, getState) => {
        let siblings = getState().treeNodesByParentId[destinationSiblingModel.parentId];
        // Let the standard change logic handle moving the node in state.
        return projectModelActions.projectModelChange([{
            value: destinationSiblingModel.parentId,
            propertyPath: 'parentId'
        }, {
            value: projectModelActions.getNewSequenceAfterCurrentModel(destinationSiblingModel, siblings),
            propertyPath: 'ui.sequence'
        }], {_id: modelIdMoving})(dispatch, getState);
    };
}