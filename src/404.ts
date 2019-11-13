import * as webdriver from 'selenium-webdriver';
import { assert } from 'chai';
import {
    ERROR_404_PAGE,
    AMZN_URL,
    INLINE_UNIT_NAME,
    ADHESION_UNIT_NAME,
    SKYBOX_UNIT_NAME,
    ANALYTICS_URL,
} from './constants';
import { sleep, getNetworkEntries, scrollDown, pbh_config_get, isMobile } from './utils';

describe.only('404 page tests', function() {
    before(async function() {
        console.log('getting', ERROR_404_PAGE);
        await this.driver.get(ERROR_404_PAGE);
        console.log('got post!');
    });
    it('find footer', async function() {
        const driver: webdriver.ThenableWebDriver = this.driver;
        const footer = await driver.wait(
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
            assert(skybox_bid.length == 1, 'found skybox amazon bid requests');
        }
        assert(adhesion_bid.length == 1, 'found adhesion amazon bid requests');
    });
    it('test analytics loaded', async function() {
        const entries = await getNetworkEntries(this.driver);
        const analytics_calls = entries.filter(({ name }: { name: string }) =>
            name.startsWith(ANALYTICS_URL)
        );

        assert(analytics_calls.length > 0, 'analytics are collected');
    });
});
