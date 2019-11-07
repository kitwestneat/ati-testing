import queryString from 'query-string';
import * as webdriver from 'selenium-webdriver';
import { assert } from 'chai';
import { SINGLE_POST, AMZN_URL, INLINE_UNIT_NAME, ADHESION_UNIT_NAME, SKYBOX_UNIT_NAME } from './constants';
import { sleep, getNetworkEntries, scrollDown, initNetworkEntries, pbh_config_get } from './utils';

describe('single page tests', function() {
    this.timeout(60000);
    before(async function() {
        console.log('getting', SINGLE_POST);
        await this.driver.get(SINGLE_POST);
        await sleep(2000);
        await initNetworkEntries(this.driver);
    });
    it('find footer', async function() {
        const footer = await this.driver.findElements(webdriver.By.css('footer.main-footer'));
        assert(footer.length > 0, 'footer exists');
    });
    // this might not work on mobile (skybox supression option)
    it('check Amazon bids for Adhesion & Skybox', async function() {
        const entries = await getNetworkEntries(this.driver);

        const amazon_bids = entries.filter(({ name }: { name: string }) =>
            name.startsWith(AMZN_URL)
        );

        const bid_info: any = queryString.parseUrl(amazon_bids[0].name);
        const slots = bid_info.query.slots;
        assert(slots.includes(ADHESION_UNIT_NAME) && slots.includes(SKYBOX_UNIT_NAME), 'Adhesion and Skybox bids exist');
    });
    it('inlines are lazy loaded', async function() {
        const start_entries = await getNetworkEntries(this.driver);
        const start_inline_bids = start_entries.filter(
            ({ name }: { name: string }) =>
                name.startsWith(AMZN_URL) && name.includes(INLINE_UNIT_NAME)
        );

        const inline_load_count = await pbh_config_get(this.driver, 'inline_load_count');
        for (let i = 0; i < inline_load_count * 2; i++) {
            await scrollDown(this.driver);
        }
        await sleep(4000);

        const end_entries = await getNetworkEntries(this.driver);
        const end_inline_bids = end_entries.filter(
            ({ name }: { name: string }) =>
                name.startsWith(AMZN_URL) && name.includes(INLINE_UNIT_NAME)
        );

        assert(end_inline_bids.length > start_inline_bids.length, 'we lazy loaded some ads');
    });
});
