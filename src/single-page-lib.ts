import * as webdriver from 'selenium-webdriver';
import {
    AMZN_URL,
    INLINE_UNIT_NAME,
    OPENX_URL,
    OPENX_SKYBOX_PLACEMENT,
    OPENX_ADHESION_PLACEMENT,
    GAM_URL,
} from './constants';
import {
    getNetworkEntries,
    pbh_config_get,
    scrollToElement,
    sleep,
    waitForDebugLog,
    isMobile,
} from './utils';
import { assert } from 'chai';

export async function test_inlines(this: Mocha.Context): Promise<void> {
    const entry_filter = ({ name }: { name: string }): boolean =>
        name.startsWith(GAM_URL) && name.includes(INLINE_UNIT_NAME);
    const driver = this.driver as webdriver.ThenableWebDriver;
    const start_entries = await getNetworkEntries(driver);
    const start_inline_bids = start_entries.filter(entry_filter);

    // inlines after the initial inline
    const inlines = await driver.findElements(webdriver.By.css('div.pbh-lazy-inline'));
    // includes initial inline
    const inline_load_count = await pbh_config_get(driver, 'inline_load_count');
    if (inlines.length < inline_load_count) {
        this.skip();
    }
    const first_lazy_inline = inlines[inline_load_count - 1];
    await scrollToElement(driver, first_lazy_inline);
    const loadedInline = await driver.wait(
        webdriver.until.elementLocated(webdriver.By.css('div.pbh-lazy-inline.pbh_inline')),
        120000
    );
    assert(loadedInline, 'lazy loaded an inline unit');

    await sleep(2000);

    const end_entries = await getNetworkEntries(driver);
    const end_inline_bids = end_entries.filter(entry_filter);

    assert(end_inline_bids.length > start_inline_bids.length, 'GAM req on lazy loaded ads');
}

export async function test_skybox_and_adhesion(this: Mocha.Context): Promise<void> {
    await waitForDebugLog(this.driver, (log) => log[0] == 'running provider' && log[1] == 'prebidjs');
    await sleep(1000);

    const entries = await getNetworkEntries(this.driver);
    const skybox_bid = entries.filter(
        ({ name }: { name: string }) =>
            name.startsWith(OPENX_URL) &&
            OPENX_SKYBOX_PLACEMENT.find((placement) => name.includes('' + placement))
    );
    const adhesion_bid = entries.filter(
        ({ name }: { name: string }) =>
            name.startsWith(OPENX_URL) &&
            OPENX_ADHESION_PLACEMENT.find((placement) => name.includes('' + placement))
    );
    const mobile_skybox_enabled = await pbh_config_get(this.driver, 'enable_mobile_skybox');

    if (this.windowSize && isMobile(this.windowSize.width) && !mobile_skybox_enabled) {
        assert(skybox_bid.length == 0, 'skybox supressed on mobile');
    } else {
        assert(skybox_bid.length > 0, 'found skybox aol bid requests');
    }

    assert(adhesion_bid.length > 0, 'found adhesion aol bid requests');
}
