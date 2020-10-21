import * as webdriver from 'selenium-webdriver';
import { assert } from 'chai';
import {
    FRONTPAGE,
    LOGO_ALT_TEXT_HEADER,
    AMZN_URL,
    MREC_UNIT_NAME,
    ANALYTICS_URL,
    AOL_URL,
    AOL_SKYBOX_PLACEMENTS,
    AOL_ADHESION_PLACEMENTS,
    AOL_MREC_PLACEMENTS,
} from './constants';
import { sleep, getNetworkEntries, scrollToBottom, waitForAdInit, waitForDebugLog, stringHasPlacement } from './utils';

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
    it('frontpage check AOL bids for Adhesion & Skybox', async function() {
        await waitForDebugLog(
            this.driver,
            (log) => log[0] == 'running provider' && log[1] == 'aol'
        );
        await sleep(1000);

        const entries = await getNetworkEntries(this.driver);

        const skybox_bid = entries.filter(
            ({ name }: { name: string }) =>
                name.startsWith(AOL_URL) &&
                stringHasPlacement(name, AOL_SKYBOX_PLACEMENTS)
        );
        const adhesion_bid = entries.filter(
            ({ name }: { name: string }) =>
                name.startsWith(AOL_URL) &&
                stringHasPlacement(name, AOL_ADHESION_PLACEMENTS)
        );
        assert(skybox_bid.length >= 1, 'found skybox amazon bid requests');
        assert(adhesion_bid.length >= 1, 'found adhesion amazon bid requests');
        if (skybox_bid.length > 1) {
            console.warn('found more than one skybox bid');
        }
        if (adhesion_bid.length > 1) {
            console.warn('found more than one adhesion bid');
        }
    });
    it('mrecs are lazy loaded', async function() {
        const mrec_filter = ({ name }: { name: string }): boolean =>
            name.startsWith(AOL_URL) &&
                stringHasPlacement(name, AOL_MREC_PLACEMENTS);

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
