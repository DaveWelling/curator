const expect = require('expect');
const cuid = require('cuid');
const {sendInput} = require('../_utilities');

describe('save project name', () => {
    it('should put the project name in the database', () => {
        const projectName = cuid();
        browser.url('/');
        browser.waitForVisible('#projectName');
        $('#projectName').click();
        sendInput('#projectName', projectName);
        browser.refresh();
        browser.waitForVisible('#projectName');
        expect($('#projectName').getValue()).toEqual(projectName);
    });
});

