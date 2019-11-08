import * as webdriver from 'selenium-webdriver';
import { assert } from 'chai';
import {
    FRONTPAGE,
    LOGO_ALT_TEXT_HEADER,
    AMZN_URL,
    SKYBOX_UNIT_NAME,
    ADHESION_UNIT_NAME,
    MREC_UNIT_NAME
} from './constants';
import { sleep, getNetworkEntries, scrollToBottom } from './utils';

describe('frontpage tests', function() {
    this.timeout(60000);
    before(async function() {
        console.log('getting', FRONTPAGE);
        await this.driver.get(FRONTPAGE);
        console.log('got', FRONTPAGE);
        await sleep(4000);
    });
    it('find logo', async function() {
        const logo = await this.driver.findElements(
            webdriver.By.css(`img[alt^="${LOGO_ALT_TEXT_HEADER}"`)
        );
        assert(logo.length > 0, 'logo exists');
    });
    it('check Amazon bids for Adhesion & Skybox', async function() {
        const entries = await getNetworkEntries(this.driver);

        const skybox_adhesion_bids = entries.filter(
            ({ name }: { name: string }) =>
                name.startsWith(AMZN_URL) &&
                (name.includes(SKYBOX_UNIT_NAME) || name.includes(ADHESION_UNIT_NAME))
        );

        assert(skybox_adhesion_bids.length == 2, 'found adhesion and skybox amazon bid requests');
    });
    it('mrecs are lazy loaded', async function() {
        const start_entries = await getNetworkEntries(this.driver);
        const start_mrec_bids = start_entries.filter(
            ({ name }: { name: string }) =>
                name.startsWith(AMZN_URL) && name.includes(MREC_UNIT_NAME)
        );

        await scrollToBottom(this.driver);

        const end_entries = await getNetworkEntries(this.driver);
        const end_mrec_bids = end_entries.filter(
            ({ name }: { name: string }) =>
                name.startsWith(AMZN_URL) && name.includes(MREC_UNIT_NAME)
        );

        assert(end_mrec_bids > start_mrec_bids, 'we lazy loaded some ads');
    });
});

// vi: ts=4 sw=4 et
