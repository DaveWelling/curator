
// React render cycle isn't fast enough -- you need to break it up.


const sendInput = function(selector, inputString, keyIndex = 0) {
    let input;
    if (typeof selector === 'string') {
        input = $(selector);
    } else {
        input = selector;
    }
    if (!input.hasFocus()) {
        input.click();
    }

    input.addValue(inputString.substr(keyIndex, 1));
    browser.waitUntil(() => {

        if (!input.hasFocus()) return true;

        let value;
        if (input.getAttribute('contenteditable')) {
            value = input.getText();
        } else {
            value = input.getValue();
        }
        return value === inputString.substr(0, keyIndex + 1);
    });
    if (keyIndex+1 < inputString.length) {
        return sendInput(input, inputString, keyIndex + 1);
    }
};

module.exports = {
    sendInput
};