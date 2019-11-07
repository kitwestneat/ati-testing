import * as webdriver from 'selenium-webdriver';
import { assert } from 'chai';
import { sleep, clickElement } from './utils';
import { GALLERY_POST } from './constants';

const GALLERY_BUTTON_TEXT = 'View Gallery';

describe('Gallery post tests', function() {
    this.timeout(60000);
    before(async function() {
        console.log('getting', GALLERY_POST);
        await this.driver.get(GALLERY_POST);
        await sleep(2000);
    });
    it.only('open gallery', async function() {
        const openButton = await this.driver.findElements(
            webdriver.By.xpath(`//div[text()='${GALLERY_BUTTON_TEXT}']`)
        );

        clickElement(this.driver, openButton);
        await sleep(10000);
    });
});
