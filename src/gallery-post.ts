import * as webdriver from 'selenium-webdriver';
import { assert } from 'chai';
import { sleep, getNetworkEntries } from './utils';
import { GALLERY_POST, GALLERY_FLOORBOARD_UNIT_NAME, AMZN_URL } from './constants';

const GALLERY_BUTTON_TEXT = 'View Gallery';

describe('Gallery post tests', function() {
    this.timeout(60000);
    before(async function() {
        console.log('getting', GALLERY_POST);
        await this.driver.get(GALLERY_POST);
        await sleep(2000);
    });
    it.only('open gallery', async function() {
        const driver = this.driver as webdriver.ThenableWebDriver;
        const openButton = await driver.findElements(
            webdriver.By.xpath(`//div[text()='${GALLERY_BUTTON_TEXT}']`)
        );

        const galleryAdDiv = await driver.findElements(
            webdriver.By.css('.gallery-descriptions-wrap > .mrec-wrap > div')
        );
        assert(!await galleryAdDiv[0].isDisplayed(), 'Ad div is not visible before click');

        const entries = await getNetworkEntries(this.driver);
        const gallery_bids = entries.filter(({ name }: { name: string }) =>
            name.startsWith(AMZN_URL) && name.includes(GALLERY_FLOORBOARD_UNIT_NAME)
        );
        assert(gallery_bids.length === 0, 'No gallery floorboard Amazon bids before opening');

        await openButton[0].click();
        await sleep(1000);

        assert(await galleryAdDiv[0].isDisplayed(), 'Ad div is visible after click');

        const post_entries = await getNetworkEntries(this.driver);
        const post_gallery_bids = post_entries.filter(({ name }: { name: string }) =>
            name.startsWith(AMZN_URL) && name.includes(GALLERY_FLOORBOARD_UNIT_NAME)
        );
        assert(post_gallery_bids.length !== 0, 'Gallery floorboard Amazon bids after opening');
    });
});
