import React from 'react';
import ReactDOM from 'react-dom';
import propTypes from 'prop-types';
import escapeHTML from 'escape-html';
import get from 'lodash.get';
import './contentEditableShell.css';
let getSelection, setSelection;
// Implement editablecontent to return the necessary methods and properties
// for TreeText
export default class ContentEditableShell extends React.Component {
    constructor(props) {
        super(props);
        this.focus = this.focus.bind(this);
        this.setSelectionRange = this.setSelectionRange.bind(this);
        this.onInput = this.onInput.bind(this);
        this.onPaste = this.onPaste.bind(this);
        this.onKeyDown = this.onKeyDown.bind(this);
        this.onKeyUp = this.onKeyUp.bind(this);
        this.onMouseUp = this.onMouseUp.bind(this);
        this.onFocus = this.onFocus.bind(this);
        this.selection = {
            selectionStart: 0,
            selectionEnd: 0
        };
        this.value = '';
    }

    componentWillReceiveProps(nextProps) {
        if (this.contentIsEmpty(nextProps.value) && this.props.value !== nextProps.value) {
            this.value = '';
            this.props.onChange({
                target: {
                    value: ''
                }
            });
        }
    }

    shouldComponentUpdate(nextProps) {
        let el = ReactDOM.findDOMNode(this);
        if (nextProps.value !== el.innerHTML) {
            return true;
        }
        return false;
    }

    componentDidUpdate() {
        // dangerouslySetInnerHTML removes existing selections.
        // They must be restored in here
        if (this.domElementRef && this.selection) {
            setSelection(this.domElementRef, this.selection);
        }
    }

    contentIsEmpty(content) {
        if (!content) {
            return true;
        }

        if (content === '<br />') {
            return true;
        }

        if (!content.trim().length) {
            return true;
        }

        return false;
    }

    focus() {
        if (!this.domElementRef) return;
        this.domElementRef.focus();
    }

    setSelectionRange(selectionStart, selectionEnd) {
        if (!this.domElementRef) return;
        this.selection = {selectionStart, selectionEnd};
        setSelection(this.domElementRef, {selectionStart, selectionEnd});
    }

    onInput(e) {
        this._supportsInput = true;
        let text = e.target.textContent.trim();
        this.selection= getSelection(this.domElementRef);
        if (!text && text !== this.props.value) {
            this.value = '';
            this.props.onChange({
                target: {
                    value: ''
                }
            });
            return;
        }
        const newValue = escapeHTML(e.target.textContent);
        if (newValue !== this.props.value) {
            this.value = newValue;
            this.props.onChange({
                target: {
                    value: newValue
                }
            });
        }
    }

    onKeyDown(e){
        this.selection= getSelection(this.domElementRef);
        let {value, selection: {selectionStart, selectionEnd}} = this;
        debugger;
        e.persist(); // avoid losing synthetic event in asynchronous call below
        return this.props.onKeyDown({
            keyCode: e.keyCode,
            target: {
                value,
                selectionStart,
                selectionEnd
            },
            shiftKey: e.shiftKey,
            preventDefault: ()=>e.preventDefault() /* closure keeps event ref */
        });
    }

    onMouseUp(){
        this.selection= getSelection(this.domElementRef);
    }

    onKeyUp(e){
        // dangerouslySetInnerHTML removes existing selections.
        // They must be restored in componentDidUpdate
        this.selection= getSelection(this.domElementRef);
    }

    _replaceCurrentSelection(data) {
        let selection = window.getSelection();
        let range = selection.getRangeAt(0);
        range.deleteContents();
        let fragment = range.createContextualFragment('');
        fragment.textContent = data;
        let replacementEnd = fragment.lastChild;
        range.insertNode(fragment);
        // Set cursor at the end of the replaced content, just like browsers do.
        range.setStartAfter(replacementEnd);
        range.collapse(true);
        selection.removeAllRanges();
        selection.addRange(range);
    }

    onPaste(e) {
        // handle paste manually to ensure we unset our placeholder
        e.preventDefault();
        let data = e.clipboardData.getData('text/plain');
        this._replaceCurrentSelection(data);
        let target = ReactDOM.findDOMNode(this);
        const newValue = escapeHTML(target.textContent);
        if (newValue !== this.props.value) {
            this.value = newValue;
            this.props.onChange({
                target: { value: newValue}
            });
        }
    }

    onFocus(){
        //this.props.onFocus();
        this.selection = getSelection(this.domElementRef);
        //this.focus();
        // TODO:  Need to save focus selection in redux state?
        // this.props.onFocus({
        //     target: {
        //         value: this.props.model,
        //         selectionStart: this.selection.selectionStart,
        //         selectionEnd: this.selection.selectionEnd
        //     }
        // });
    }

    get selectionStart(){
        return get(this, 'selection.selectionStart', 0);
    }

    render() {
        const { onInput, onPaste, onKeyDown, onKeyUp, onMouseUp, onFocus } = this;
        const { value, className, id } = this.props;
        const winningClassName = className || 'editable-text';

        return (
            <div
                id={id}
                className={winningClassName}
                ref={e => {
                    // Avoid (irrelevant) react warnings for contenteditable
                    // by setting the contentEditable property here.
                    if (e != null) {
                        e.contentEditable = true;
                        this.domElementRef = e;
                    }
                }}
                onInput={onInput}
                onKeyDown={onKeyDown}
                onKeyUp={onKeyUp}
                onPaste={onPaste}
                onClick={onFocus}
                onMouseUp={onMouseUp}
                dangerouslySetInnerHTML={{
                    __html: value
                }}
            />
        );
    }
}

ContentEditableShell.propTypes = {
    onKeyDown: propTypes.func,
    onChange: propTypes.func,
    onFocus: propTypes.func,
    value: propTypes.string,
    className: propTypes.string,
    id: propTypes.string
};


if (window.getSelection && document.createRange) {
    getSelection = function(containerEl) {
        let winSelection = window.getSelection();
        if (winSelection.length){
            let range = window.getSelection().getRangeAt(0);
            let preSelectionRange = range.cloneRange();
            preSelectionRange.selectNodeContents(containerEl);
            preSelectionRange.setEnd(range.startContainer, range.startOffset);
            let start = preSelectionRange.toString().length;

            return {
                selectionStart: start,
                selectionEnd: start + range.toString().length
            };
        } if  (winSelection.type && winSelection.type === 'Caret') {
            return {
                selectionStart: winSelection.anchorOffset,
                selectionEnd: winSelection.focusOffset
            };
        } else {
            return {
                selectionStart: 0, selectionEnd: 0
            };
        }
    };

    setSelection = function(containerEl, savedSel) {
        let charIndex = 0, range = document.createRange();
        range.setStart(containerEl, 0);
        range.collapse(true);
        let nodeStack = [containerEl], node, foundStart = false, stop = false;

        while (!stop && (node = nodeStack.pop())) {
            if (node.nodeType == 3) {
                let nextCharIndex = charIndex + node.length;
                if (!foundStart && savedSel.selectionStart >= charIndex && savedSel.selectionStart <= nextCharIndex) {
                    range.setStart(node, savedSel.selectionStart - charIndex);
                    foundStart = true;
                }
                if (foundStart && savedSel.selectionEnd >= charIndex && savedSel.selectionEnd <= nextCharIndex) {
                    range.setEnd(node, savedSel.selectionEnd - charIndex);
                    stop = true;
                }
                charIndex = nextCharIndex;
            } else {
                let i = node.childNodes.length;
                while (i--) {
                    nodeStack.push(node.childNodes[i]);
                }
            }
        }

        let sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(range);
    };
} else if (document.selection && document.body.createTextRange) {
    getSelection = function(containerEl) {
        let selectedTextRange = document.selection.createRange();
        let preSelectionTextRange = document.body.createTextRange();
        preSelectionTextRange.moveToElementText(containerEl);
        preSelectionTextRange.setEndPoint('EndToStart', selectedTextRange);
        let start = preSelectionTextRange.text.length;

        return {
            selectionStart: start,
            selectionEnd: start + selectedTextRange.text.length
        };
    };

    setSelection = function(containerEl, savedSel) {
        let textRange = document.body.createTextRange();
        textRange.moveToElementText(containerEl);
        textRange.collapse(true);
        textRange.moveEnd('character', savedSel.selectionEnd);
        textRange.moveStart('character', savedSel.selectionStart);
        textRange.select();
    };
} else {
    // For testing without DOM window.getSelection (as in jsdom)
    let selection;
    getSelection = ()=>selection;
    setSelection = (el, newSelection)=>{selection = newSelection;};
}
