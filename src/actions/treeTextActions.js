import {createNextSiblingOfModel, projectModelChange, getCachedModel} from './projectModelActions';
import cuid from 'cuid';
import {goToNext, goToPrevious, makeChildOfPreviousSibling, makeNextSiblingOfParent, ensureVisible, mergeWithPreviousSibling} from './treeNodeActions';
import {focusOnTreeNode} from './focusActions';

export function keyDown(keyCode, preventDefault, input, model, shiftKey) {
    return (dispatch, getState) => {
        switch (keyCode) {
            case 13: // Enter Key
                preventDefault();
                focusOnTreeNode(
                    createNewSibling()
                )(dispatch, getState);
                break;
            case 38: // Arrow up
                goToPrevious(model)(dispatch, getState);
                preventDefault();
                break;
            case 40: // Arrow down
                goToNext(model)(dispatch, getState);
                preventDefault();
                break;
            case 9: // Tab
                preventDefault();
                if (shiftKey) {
                    makeNextSiblingOfParent(model)(dispatch, getState);
                } else {
                    makeChildOfPreviousSibling(model)(dispatch, getState);
                }
                focusOnTreeNode(model)(dispatch, getState);
                break;
        case 8: // Backspace
            if (input.selectionStart === 0) {
                dispatch(mergeWithPreviousSibling(model));
                preventDefault();
            }
            break;
            default:
                break;
        }

        function createNewSibling() {
            const offset = input.selectionStart;
            const value = input.value;
            const newModelValue = value.substr(0, offset).trim();
            const newSiblingValue = value.substr(offset).trim();
            projectModelChange(newModelValue, 'title', model)(dispatch, getState);
            let newModel = {
                _id: cuid(),
                title: newSiblingValue
            };
            createNextSiblingOfModel(model._id, newModel)(dispatch, getState);
            return newModel;
        }
    };
}
