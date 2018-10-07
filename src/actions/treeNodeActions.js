
export function toggleCollapse(treeNode) {
    throw new Error('not implemented');
}

export function tryDescendingExpansion(treeNode) {
    throw new Error('not implemented');
    // if already expanded, try to expand a child, returning true if successfully expanded a child
    // else expand self and return true
}

export function tryAscendingCollapse(treeNode) {
    throw new Error('not implemented');
    // if already collapsed, return false
    // else try to collapsed a child (only bother collapsing visible children (those already in state)?), returning true if successful
    // if not successful, collapse self and return true
}