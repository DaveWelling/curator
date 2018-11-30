import {createNextSiblingOfModel, projectModelChange} from './projectModelActions';
import cuid from 'cuid';
import {goToNext, goToPrevious, makeChildOfPreviousSibling, makeNextSiblingOfParent} from './treeNodeActions';

export function keyDown(keyCode, preventDefault, input, model, shiftKey) {
    return (dispatch, getState) => {
        switch (keyCode) {
            case 13: // Enter Key
                createNewSibling();
                preventDefault();
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
                if (shiftKey) {
                    makeNextSiblingOfParent(model)(dispatch, getState);
                } else {
                    makeChildOfPreviousSibling(model)(dispatch, getState);
                }
                preventDefault();
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
            createNextSiblingOfModel(model._id, {
                _id: cuid(),
                title: newSiblingValue
            })(dispatch, getState);
        }
    };
}
