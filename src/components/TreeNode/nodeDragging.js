import interact from 'interactjs';
import { makeNextSiblingOfModel } from '../../actions/projectModelActions';
import React from 'react';
import PropType from 'prop-types';

export default function add(treeNode, dispatch) {
    // target elements with the "draggable" class
    interact('#drag_' + treeNode._id)
        .draggable({
            dragDataId: treeNode._id,
            manualStart: true,
            allowFrom: '.drag-handle',
            // enable inertial throwing
            inertia: true,
            // keep the element within the area of it's parent
            restrict: {
                restriction: document.querySelector('.TreeView'),
                endOnly: true,
                elementRect: { top: 0, left: 0, bottom: 1, right: 1 }
            },
            // enable autoScroll
            autoScroll: true,

            // call this function on every dragmove event
            onmove: dragMoveListener,
            // call this function on every dragend event
            onend: function() {
                dispatch({
                    type: 'drag_project_model_end',
                    drag: {
                        model: treeNode
                    }
                });
            },
            onstart: function() {
                dispatch({
                    type: 'drag_project_model_start',
                    drag: {
                        model: treeNode
                    }
                });
            }
        })
        .on('move', function(e) {
            const interaction = e.interaction;

            // if the pointer was moved while being held down
            // and an interaction hasn't started yet
            if (interaction.pointerIsDown && !interaction.interacting()) {
                if (!e.srcElement.classList.contains('tree-node-grab')) return;
                // create a clone of the currentTarget element
                let clone = e.currentTarget.cloneNode(true);
                clone.id = 'imAClone';
                clone.classList.add('treeNodeClone');
                // insert the clone to the page
                document.body.appendChild(clone);
                clone.style.position = 'fixed';
                clone.style.left = e.x - e.offsetX + 'px';
                clone.style.top = e.y - e.offsetY + 'px';
                //console.log('start position: ', clone.id, ' x: ', clone.style.left, ' y: ', clone.style.top);

                // start a drag interaction targeting the clone
                interaction.start({ name: 'drag' }, e.interactable, clone);
                e.interactable.on('dragend', () => clone.remove());
            }
        });

    interact('#dropZone_' + treeNode._id).dropzone({
        // only accept elements matching this CSS selector
        accept: '.draggable',
        // Require a 75% element overlap for a drop to be possible
        overlap: 0.005,

        // listen for drop related events:

        // ondropactivate: function (event) {
        //   // add active dropzone feedback
        //   event.target.classList.add('drop-active');
        // },
        ondragenter: function(e) {
            // feedback the possibility of a drop
            const dropzoneElement = e.target;
            dropzoneElement.classList.add('can-drop');
        },
        ondragleave: function(e) {
            // remove the drop feedback style
            const dropzoneElement = e.target;
            dropzoneElement.classList.remove('can-drop');
        },
        ondrop: function(e) {
            const dropzoneElement = e.target;
            dropzoneElement.classList.remove('can-drop');
            let draggedModelId = e.draggable.target.split('_')[1];
            dispatch(makeNextSiblingOfModel(draggedModelId, treeNode));
        }
    });
}

export function WrapDraggable(props) {
    const {
        treeNode: {
            _id,
            ui: { dragging }
        }
    } = props;
    const dropZoneClass = dragging && dragging._id !== _id ? 'drop-zone-dragging' : 'drop-zone';
    return (
        <div>
            <div id={'drag_' + _id} className="tree-view-item-top draggable">
                <div className="drag-handle">
                    <i className="material-icons tree-node-grab">drag_indicator</i>
                </div>
                {props.children}
            </div>

            <div id={'dropZone_' + _id} className={dropZoneClass} />
        </div>
    );
}
WrapDraggable.propTypes = {
    treeNode: PropType.object.isRequired,
    children: PropType.object.isRequired
};

function dragMoveListener(e) {
    const target = e.target,
        // keep the dragged position in the data-x/data-y attributes
        x = (parseFloat(target.getAttribute('data-x')) || 0) + e.dx,
        y = (parseFloat(target.getAttribute('data-y')) || 0) + e.dy;
    // translate the element
    //console.log('id: ', e.target.id, ' x: ', x, ' y: ', y);
    target.style.webkitTransform = target.style.transform = 'translate(' + x + 'px, ' + y + 'px)';
    // update the posiion attributes
    target.setAttribute('data-x', x);
    target.setAttribute('data-y', y);
}
