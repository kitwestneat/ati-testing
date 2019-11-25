import * as webdriver from 'selenium-webdriver';
import { assert } from 'chai';
import {
    SINGLE_POST,
    AMZN_URL,
    INLINE_UNIT_NAME,
    ADHESION_UNIT_NAME,
    SKYBOX_UNIT_NAME,
    ANALYTICS_URL,
} from './constants';
import { sleep, getNetworkEntries, scrollDown, pbh_config_get, isMobile } from './utils';

describe('single page tests', function() {
    before(async function() {
        console.log('getting', SINGLE_POST);
        await this.driver.get(SINGLE_POST);
        console.log('got post!');
    });
    it('find footer', async function() {
        const footer = await this.driver.wait(
            webdriver.until.elementLocated(webdriver.By.css('footer.main-footer')),
            6000
        );
        assert(footer, 'footer exists');
    });
    it('check Amazon bids for Adhesion & Skybox', async function() {
        await sleep(4000);

        const entries = await getNetworkEntries(this.driver);
        const skybox_bid = entries.filter(
            ({ name }: { name: string }) =>
                name.startsWith(AMZN_URL) && name.includes(SKYBOX_UNIT_NAME)
        );
        const adhesion_bid = entries.filter(
            ({ name }: { name: string }) =>
                name.startsWith(AMZN_URL) && name.includes(ADHESION_UNIT_NAME)
        );
        const mobile_skybox_enabled = await pbh_config_get(this.driver, 'enable_mobile_skybox');
        if (this.windowSize && isMobile(this.windowSize.width) && !mobile_skybox_enabled) {
            assert(skybox_bid.length == 0, 'skybox supressed on mobile');
        } else {
            assert(skybox_bid.length > 0, 'found skybox amazon bid requests');
        }
        assert(adhesion_bid.length > 0, 'found adhesion amazon bid requests');
    });
    it('inlines are lazy loaded', async function() {
        const driver = this.driver as webdriver.ThenableWebDriver;
        const start_entries = await getNetworkEntries(driver);
        const start_inline_bids = start_entries.filter(
            ({ name }: { name: string }) =>
                name.startsWith(AMZN_URL) && name.includes(INLINE_UNIT_NAME)
        );

        const inline_load_count = await pbh_config_get(driver, 'inline_load_count');
        for (let i = 0; i < inline_load_count * 2 + 1; i++) {
            await scrollDown(driver);
        }
        const loadedInline = await driver.wait(
            webdriver.until.elementLocated(webdriver.By.css('div.pbh-lazy-inline.pbh_inline')),
            120000
        );
        assert(loadedInline, 'lazy loaded an inline unit');

        await sleep(2000);

        const end_entries = await getNetworkEntries(driver);
        const end_inline_bids = end_entries.filter(
            ({ name }: { name: string }) =>
                name.startsWith(AMZN_URL) && name.includes(INLINE_UNIT_NAME)
        );

        assert(end_inline_bids.length > start_inline_bids.length, 'Amazon bid on lazy loaded ads');
    });
    it('test analytics loaded', async function() {
        const entries = await getNetworkEntries(this.driver);
        const analytics_calls = entries.filter(({ name }: { name: string }) =>
            name.startsWith(ANALYTICS_URL)
        );

        assert(analytics_calls.length > 0, 'analytics are collected');
    });
});
