import expect from 'expect';

describe.skip('webdriver.io page', function() {
    it('should have the right title - the fancy generator way', function () {
        browser.url('http://webdriver.io');
        const title = browser.getTitle();
        expect(title).toEqual('WebdriverIO - WebDriver bindings for Node.js');
    });
});