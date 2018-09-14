
import expect from 'expect';
import cuid from 'cuid';
describe('save project name', () => {
    it('should put the project name in the database', () => {
        const projectName = cuid();
        browser.url('/');
        browser.waitForVisible('#projectName');
        $('#projectName').setValue(projectName);
        browser.refresh();
        browser.waitForVisible('#projectName');
        expect($('#projectName').getValue()).toEqual(projectName);
    });
});