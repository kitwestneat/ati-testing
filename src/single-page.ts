import * as webdriver from 'selenium-webdriver';
import { assert } from 'chai';
import { getSinglePostUrl, ANALYTICS_URL } from './constants';
import { sleep, getNetworkEntries, waitForAdInit } from './utils';
import { test_skybox_and_adhesion, test_inlines } from './single-page-lib';

describe('single page tests', function() {
    before(async function() {
        const single_post = getSinglePostUrl();
        console.log('getting', single_post);
        await this.driver.get(single_post);
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
        await sleep(5000);
        try {
            await waitForAdInit(driver);
        } catch (e) {
            console.error('caught an error', e);
        }
    });
    it('check OpenX bids for Adhesion & Skybox', test_skybox_and_adhesion);
    it('inlines are lazy loaded', test_inlines);
    it('test analytics loaded', async function() {
        const entries = await getNetworkEntries(this.driver);
        const analytics_calls = entries.filter(({ name }: { name: string }) =>
            name.startsWith(ANALYTICS_URL)
        );

        assert(analytics_calls.length > 0, 'analytics are collected');
    });
    it('find footer', async function() {
        const footer = await this.driver.wait(
            webdriver.until.elementLocated(webdriver.By.css('footer.main-footer')),
            6000
        );
        assert(footer, 'footer exists');
    });
});
