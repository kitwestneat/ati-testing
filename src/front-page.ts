import * as webdriver from 'selenium-webdriver';
import { assert } from 'chai';
import {
    FRONTPAGE,
    LOGO_ALT_TEXT_HEADER,
    ANALYTICS_URL,
    OPENX_SKYBOX_PLACEMENT,
    OPENX_URL,
    OPENX_ADHESION_PLACEMENT,
    OPENX_MREC_PLACEMENT,
} from './constants';
import { sleep, getNetworkEntries, scrollToBottom, waitForAdInit,
    waitForPrebid, stringHasPlacement } from './utils';

describe('frontpage tests', function() {
    this.timeout(60000);
    before(async function() {
        console.log('getting', FRONTPAGE);
        await this.driver.get(FRONTPAGE);
        console.log('got', FRONTPAGE);
        await sleep(6000);
    });
    it('find logo', async function() {
        const logo = await this.driver.findElements(
            webdriver.By.css(`img[alt^="${LOGO_ALT_TEXT_HEADER}"`)
        );
        assert(logo.length > 0, 'logo exists');
    });
    it('PbhAdUnit.init called', async function() {
        const driver: webdriver.ThenableWebDriver = this.driver;
        await waitForAdInit(driver);
    });
    it('frontpage check OpenX bids for Adhesion & Skybox', async function() {
        await waitForPrebid(this.driver);
        await sleep(1000);

        const entries = await getNetworkEntries(this.driver);

        const skybox_bid = entries.filter(
            ({ name }: { name: string }) =>
                name.startsWith(OPENX_URL) &&
                stringHasPlacement(name, OPENX_SKYBOX_PLACEMENT)
        );
        const adhesion_bid = entries.filter(
            ({ name }: { name: string }) =>
                name.startsWith(OPENX_URL) &&
                stringHasPlacement(name, OPENX_ADHESION_PLACEMENT)
        );
        assert(skybox_bid.length >= 1, 'found skybox bid requests');
        assert(adhesion_bid.length >= 1, 'found adhesion bid requests');
        if (skybox_bid.length > 1) {
            console.warn('found more than one skybox bid');
        }
        if (adhesion_bid.length > 1) {
            console.warn('found more than one adhesion bid');
        }
    });
    it('OpenX mrecs are lazy loaded', async function() {
        const mrec_filter = ({ name }: { name: string }): boolean =>
            name.startsWith(OPENX_URL) &&
                stringHasPlacement(name, OPENX_MREC_PLACEMENT);

        const start_entries = await getNetworkEntries(this.driver);
        const start_mrec_bids = start_entries.filter(mrec_filter);

        await scrollToBottom(this.driver);

        const end_entries = await getNetworkEntries(this.driver);
        const end_mrec_bids = end_entries.filter(mrec_filter);

        assert(end_mrec_bids > start_mrec_bids, 'we lazy loaded some ads');
    });
    it('test analytics loaded', async function() {
        const entries = await getNetworkEntries(this.driver);
        const analytics_calls = entries.filter(({ name }: { name: string }) =>
            name.startsWith(ANALYTICS_URL)
        );

        assert(analytics_calls.length > 0, 'analytics are collected');
    });
});

// vi: ts=4 sw=4 et
