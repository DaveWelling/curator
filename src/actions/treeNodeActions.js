import * as projectModelActions from './projectModelActions';
import * as focusActions from './focusActions';
import get from 'lodash.get';

/**
 * Runs up hierarchy to top, then expands them all from
 * top to bottom.  If a parent is already expanded (anywhere in that tree)
 * it will still attempt expand its children.
 * @param {object} model
 */
export function ensureVisible(modelOrId) {
    return (dispatch, getState) => {
        // If passing in just the ID, then look up the model first.
        if (typeof modelOrId === 'string') {
            return projectModelActions.getCachedModel(modelOrId, getState(), dispatch).then(model=>{
                return ensureVisible(model)(dispatch, getState);
            });
        } else { // Otherwise we can start looking up the tree for collapsed nodes.
            return projectModelActions.getCachedModel(modelOrId.parentId, getState(), dispatch).then(parent=>{
                if (!parent) return;

                // cycle to top before expanding
                return ensureVisible(parent)(dispatch, getState).then(()=>{
                    if (get(parent, 'ui.collapsed', true)===true){
                        return toggleCollapse(parent)(dispatch, getState);
                    }
                });
            });
        }
    };
}

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
        let nextNode = getNextUncollapsedNodeInTree(treeNode, getState());
        if (nextNode) {
            return focusActions.focusOnTreeNode(nextNode._id)(dispatch, getState);
        }
    };
}


export function goToPrevious(treeNode) {
    return (dispatch, getState)=>
        getPreviousUncollapsedNodeInTree(treeNode, getState(), dispatch).then(previousNode=>{
            if (previousNode) {
                return focusActions.focusOnTreeNode(previousNode._id)(dispatch, getState);
            }
        });
}

function getOrderedSiblings(currentModel, state) {
    const siblings = state.treeNodesByParentId[currentModel.parentId];
    // Do not mutate state.
    return [...siblings].sort((a, b) => get(a, 'ui.sequence', 0) - get(b, 'ui.sequence', 0));
}

function getOrderedChildren(currentModel, state) {
    const children = state.treeNodesByParentId[currentModel._id];
    // Do not mutate state.
    if (!children) return [];
    return [...children].sort((a, b) => get(a, 'ui.sequence', 0) - get(b, 'ui.sequence', 0));
}

export function getNextUncollapsedNodeInTree(currentModel, state) {
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

export function getPreviousUncollapsedNodeInTree(currentModel, state, dispatch) {
    if (!dispatch) {
        throw new Error('Missing parameter dispatch.');
    }
    let orderedSiblings = getOrderedSiblings(currentModel, state);
    let currentIndex = orderedSiblings.findIndex(m => m._id === currentModel._id);

    // No previous sibling
    if (currentIndex - 1 < 0) {
        // Go to parent if exists
        return projectModelActions.getCachedModel(currentModel.parentId, state, dispatch);
    } else {
        return Promise.resolve(getLastUncollapsedNodeInModel(orderedSiblings[currentIndex - 1], state));
    }
}

function getLastUncollapsedNodeInModel(model, state){
    if (model.ui.collapsed === false) {
        let orderedChildren = getOrderedChildren(model, state);
        if (orderedChildren && orderedChildren.length > 0) {
            return getLastUncollapsedNodeInModel(orderedChildren[orderedChildren.length - 1], state);
        }
    }
    return model;
}

export function getPreviousSibling(model, state) {
    let orderedSiblings = getOrderedSiblings(model, state);
    let currentIndex = orderedSiblings.findIndex(m => m._id === model._id);

    // No previous sibling
    if (currentIndex - 1 < 0) {
        return;
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
        let state = getState();
        let previousSibling  = getPreviousSibling(model, state);
        if (!previousSibling) return;

        let newSiblings = getOrderedChildren(previousSibling, state);
        let newSequence = 0;
        if (newSiblings.length > 0) {
            newSequence = get(newSiblings[newSiblings.length - 1], 'ui.sequence', 0) + 1;
        }
        return projectModelActions.projectModelChanges([{
            value: previousSibling._id,
            propertyPath: 'parentId'
        },{
            value: newSequence,
            propertyPath: 'ui.sequence'
        }], model)(dispatch, getState);
    };
}



export function setAsNextSiblingOfModel(modelIdMoving, destinationSiblingModel) {
    return (dispatch, getState) => {
        let siblings = getState().treeNodesByParentId[destinationSiblingModel.parentId];
        // Let the standard change logic handle moving the node in state.
        return projectModelActions.projectModelChanges([{
            value: destinationSiblingModel.parentId,
            propertyPath: 'parentId'
        }, {
            value: projectModelActions.getNewSequenceAfterCurrentModel(destinationSiblingModel, siblings),
            propertyPath: 'ui.sequence'
        }], {_id: modelIdMoving})(dispatch, getState);
    };
}

export function mergeWithPreviousSibling(model) {
    return (dispatch, getState)=>{
        let state = getState();
        let previousSibling  = getPreviousSibling(model, state);
        if (!previousSibling) return;
        let previousSiblingChildren = getOrderedChildren(previousSibling, state);
        if (previousSiblingChildren && previousSiblingChildren.length > 0) return;
        let newTitle = previousSibling.title + model.title;
        projectModelActions.projectModelChange(newTitle, 'title', previousSibling)(dispatch, getState);
        projectModelActions.removeNode(model)(dispatch, getState);
        let modelChildren = getOrderedChildren(model, state);
        modelChildren.forEach(child=>
            projectModelActions.projectModelChange(previousSibling._id, 'parentId', child)(dispatch, getState)
        );
    };
}