import * as webdriver from 'selenium-webdriver';
import { assert } from 'chai';
import { SECOND_PAGE, ANALYTICS_URL } from './constants';
import { getNetworkEntries, waitForAdInit } from './utils';
import { test_inlines, test_skybox_and_adhesion } from './single-page-lib';

describe('page two tests', function() {
    before(async function() {
        console.log('getting', SECOND_PAGE);
        await this.driver.get(SECOND_PAGE);
        console.log('got post!');
    });
    it('find footer', async function() {
        const footer = await this.driver.wait(
            webdriver.until.elementLocated(webdriver.By.css('footer.main-footer')),
            6000
        );
        assert(footer, 'footer exists');
    });
    it('PbhAdUnit.init called', async function() {
        const driver: webdriver.ThenableWebDriver = this.driver;
        await waitForAdInit(driver);
    });
    it('check AOL bids for Adhesion & Skybox', test_skybox_and_adhesion);
    it('inlines are lazy loaded', test_inlines);
    it('test analytics loaded', async function() {
        const entries = await getNetworkEntries(this.driver);
        const analytics_calls = entries.filter(({ name }: { name: string }) =>
            name.startsWith(ANALYTICS_URL)
        );

        assert(analytics_calls.length > 0, 'analytics are collected');
    });
});
