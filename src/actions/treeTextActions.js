import {createNextSiblingOfModel, projectModelChange} from './projectModelActions';
import cuid from 'cuid';

export function keyDown(keyCode, preventDefault, input, _id) {
    return (dispatch, getState) => {
        switch (keyCode) {
            case 13:
                createNewSibling(input, _id);
                preventDefault();
                break;
            default:
                break;
        }

        function createNewSibling(input, _id) {
            const offset = input.selectionStart;
            const value = input.value;
            const newModelValue = value.substr(0, offset).trim();
            const newSiblingValue = value.substr(offset).trim();
            projectModelChange(newModelValue, 'title', _id)(dispatch, getState);
            createNextSiblingOfModel(_id, {
                _id: cuid(),
                title: newSiblingValue
            })(dispatch, getState);
        }
    };
}
