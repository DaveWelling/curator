const {sendInput} = require('../_utilities');
const expect = require('expect');

describe('keystrokes', function(){
    describe('enter key', function(){
        describe('at end of input field', function(){
            it.only('creates a new input field at the same level and below the first', function(){
                browser.url('/');
                browser.waitForVisible('#projectName');
                sendInput('#rootNode', 'test');
                sendInput('#rootNode', '\uE006');
                let newElement = browser.elementActive();
                expect(newElement.tag_name).toEqual('input');
                expect(newElement.get_property('id')).toNotEqual('rootNode');
            });
        });
    });
});