
// React render cycle isn't fast enough -- you need to break it up.


const sendInput = function(selector, inputString, keyIndex = 0) {
    browser.addValue(selector, inputString.substr(keyIndex, 1));
    browser.waitUntil(() => {
        let value = browser.getValue(selector);
        return value === inputString.substr(0, keyIndex + 1);
    });
    if (keyIndex < inputString.length) {
        return sendInput(selector, inputString, keyIndex + 1);
    }
};

module.exports = {
    sendInput
};