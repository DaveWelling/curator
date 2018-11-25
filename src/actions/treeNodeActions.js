import * as projectModelActions from './projectModelActions';

export function toggleCollapse(treeNode) {
    return dispatch =>
        projectModelActions.projectModelChange(!treeNode.ui.collapsed, 'ui.collapsed', treeNode._id)(dispatch);
}

export function tryDescendingExpansion(treeNode) {
    // if already expanded, try to expand a child, returning true if successfully expanded a child
    // else expand self and return true.
    // If nothing can be expanded return false.
    return (dispatch, getState) => {
        if (treeNode.ui.collapsed) {
            toggleCollapse(treeNode)(dispatch);
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
        toggleCollapse(treeNode)(dispatch);
        return true;
    };
}
