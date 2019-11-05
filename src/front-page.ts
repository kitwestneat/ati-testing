/* eslint-disable no-invalid-this */
import * as webdriver from 'selenium-webdriver';
import { assert } from 'chai';

const FRONTPAGE = 'https://allthatsinteresting.com';
const LOGO_ALT_TEXT_HEADER = 'All That\'s Interesting';
const GAM_URL = 'https://securepubads.g.doubleclick.net/gampad/ads?';
const AMZN_URL = 'https://c.amazon-adsystem.com/e/dtb/bid';
const SKYBOX_UNIT_NAME = 'ATISkybox';
const ADHESION_UNIT_NAME = 'ATIAdhesion';
const MREC_UNIT_NAME = 'AllThatsInterestingRectangle';

function sleep(n?: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, n));
}

function getNetworkEntries(driver: webdriver.ThenableWebDriver): Promise<any> {
    return driver
        .executeScript(() => JSON.stringify(window.performance.getEntries()))
        .then((entries: any) => JSON.parse(entries)) as any;
}

function clientScrollToBottom(): void {
    function findScrollableChild(el: any, credits: number): any {
        if (!credits) {
            return;
        }

        if (el.scrollHeight > window.innerHeight) {
            return el;
        }

        const children_list: any = Object.values(el.children);
        for (let i = 0; i < children_list.length; i++) {
            const newEl = findScrollableChild(children_list[i], credits - 1);

            if (newEl) {
                return newEl;
            }
        }
    }
    const el = findScrollableChild(document.body, 10);

    el.scrollTop = el.scrollHeight;
}

async function scrollToBottom(driver: webdriver.ThenableWebDriver): Promise<any> {
    // do scroll to bottom multiple times because lazy load changes bottom
    await driver.executeScript(clientScrollToBottom);
    await sleep(2000);
    await driver.executeScript(clientScrollToBottom);
    await sleep(2000);
    await driver.executeScript(clientScrollToBottom);
    await sleep(2000);
    await driver.executeScript(clientScrollToBottom);
    await sleep(4000);
}

describe('frontpage tests', function() {
    this.timeout(60000);
    before(async function() {
        await this.driver.get(FRONTPAGE);
        await sleep(2000);
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
        console.log(skybox_adhesion_bids);
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
