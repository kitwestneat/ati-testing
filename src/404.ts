import * as webdriver from 'selenium-webdriver';
import { assert } from 'chai';
import {
    ERROR_404_PAGE,
    ANALYTICS_URL,
    OPENX_SKYBOX_PLACEMENT,
    OPENX_URL,
    OPENX_ADHESION_PLACEMENT,
} from './constants';
import {
    sleep,
    getNetworkEntries,
    pbh_config_get,
    isMobile,
    waitForAdInit,
    waitForPrebid,
    stringHasPlacement,
} from './utils';

describe('404 page tests', function() {
    before(async function() {
        console.log('getting', ERROR_404_PAGE);
        const resp = await this.driver.get(ERROR_404_PAGE);
        console.log('got post! resp:', resp);
    });
    it('find footer', async function() {
        const driver: webdriver.ThenableWebDriver = this.driver;
        const footer = await driver.wait(
            webdriver.until.elementLocated(webdriver.By.css('footer.main-footer')),
            6000
        );
        assert(footer, 'footer exists');
    });
    it('PbhAdUnit.init called', async function() {
        const driver: webdriver.ThenableWebDriver = this.driver;
        const resp = await waitForAdInit(driver);
        console.log('resp', resp);
    });
    it('check OpenX bids for Adhesion & Skybox', async function() {
        await waitForPrebid(this.driver);
        await sleep(2000);

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
