import queryString from 'query-string';
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
import { sleep, getNetworkEntries, scrollDown, pbh_config_get } from './utils';

describe('single page tests', function () {
    before(async function () {
        console.log('getting', SINGLE_POST);
        await this.driver.get(SINGLE_POST);
        console.log('got post!');
        await sleep(4000);
    });
    it('find footer', async function () {
        const footer = await this.driver.findElements(webdriver.By.css('footer.main-footer'));
        assert(footer.length > 0, 'footer exists');
    });
    // this might not work on mobile (skybox supression option)
    it('check Amazon bids for Adhesion & Skybox', async function () {
        const entries = await getNetworkEntries(this.driver);
        const skybox_bid = entries.filter(
            ({ name }: { name: string }) =>
                name.startsWith(AMZN_URL) &&
                name.includes(SKYBOX_UNIT_NAME)
        );
        const adhesion_bid = entries.filter(
            ({ name }: { name: string }) =>
                name.startsWith(AMZN_URL) &&
                name.includes(ADHESION_UNIT_NAME)
        );
        assert(skybox_bid.length == 1, 'found skybox amazon bid requests');
        assert(adhesion_bid.length == 1, 'found adhesion amazon bid requests');
    });
    it('inlines are lazy loaded', async function () {
        const start_entries = await getNetworkEntries(this.driver);
        const start_inline_bids = start_entries.filter(
            ({ name }: { name: string }) =>
                name.startsWith(AMZN_URL) && name.includes(INLINE_UNIT_NAME)
        );

        const inline_load_count = await pbh_config_get(this.driver, 'inline_load_count');
        for (let i = 0; i < inline_load_count * 2; i++) {
            await scrollDown(this.driver);
        }
        await sleep(6000);

        const end_entries = await getNetworkEntries(this.driver);
        const end_inline_bids = end_entries.filter(
            ({ name }: { name: string }) =>
                name.startsWith(AMZN_URL) && name.includes(INLINE_UNIT_NAME)
        );

        assert(end_inline_bids.length > start_inline_bids.length, 'we lazy loaded some ads');
    });
    it('test analytics loaded', async function () {
        const entries = await getNetworkEntries(this.driver);
        const analytics_calls = entries.filter(
            ({ name }: { name: string }) =>
                name.startsWith(ANALYTICS_URL)
        );

        assert(analytics_calls.length > 0, 'analytics are collected');
    });
});
