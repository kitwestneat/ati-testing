import * as webdriver from 'selenium-webdriver';
import { assert } from 'chai';
import { sleep, getNetworkEntries, isMobile, pbh_config_get, clickElement } from './utils';
import {
    GALLERY_POST,
    GALLERY_FLOORBOARD_UNIT_NAME,
    AMZN_URL,
    AOL_URL,
    AOL_ADHESION_PLACEMENTS,
} from './constants';

const GALLERY_BUTTON_TEXT = 'View Gallery';

describe('Gallery post tests', function() {
    before(async function() {
        if (this.windowSize && isMobile(this.windowSize.width)) {
            this.skip();
        }

        console.log('getting', GALLERY_POST);
        await this.driver.get(GALLERY_POST);
        console.log('got post!');
        await sleep(5000);
    });

    it('ad div not visible before open', async function() {
        const driver = this.driver;
        const galleryAdDiv = await driver.findElements(
            webdriver.By.css('.gallery-descriptions-wrap > .mrec-wrap > div')
        );
        assert(!(await galleryAdDiv[0].isDisplayed()), 'Ad div is not visible before click');
    });
    it('no gal floor bids before open', async function() {
        const entries = await getNetworkEntries(this.driver);
        let found_amzn_bid = false;
        for (const entry of entries) {
            const { name, transferSize } = entry;

            if (name.startsWith(AMZN_URL) && name.includes(GALLERY_FLOORBOARD_UNIT_NAME)) {
                found_amzn_bid = true;
                break;
            }
            if (name == 'https://c.amazon-adsystem.com/aax2/apstag.js' && transferSize == 0) {
                this.skip();
                return;
            }
        }

        assert(!found_amzn_bid, 'No gallery floorboard Amazon bids before opening');
    });

    describe('open gallery', function() {
        before(async function() {
            const driver: webdriver.ThenableWebDriver = this.driver;
            const openButton = await driver.findElements(
                webdriver.By.xpath(`//div[text()='${GALLERY_BUTTON_TEXT}']`)
            );

            // can't use element.click because it might be covered by adhesion
            await clickElement(driver, openButton[0]);
            await sleep(2000);
        });
        it('check ad div visible', async function() {
            const driver = this.driver;

            const galleryAdDiv = await driver.findElements(
                webdriver.By.css('.gallery-descriptions-wrap > .mrec-wrap > div')
            );
            const tripleliftAdDiv = await driver.findElements(
                webdriver.By.css('.gallery-descriptions-wrap .iframebust-workaround')
            );

            const isGamAdDisplayed = galleryAdDiv && galleryAdDiv[0] && await galleryAdDiv[0].isDisplayed();
            const is3liftAdDisplayed = tripleliftAdDiv && tripleliftAdDiv[0] && await tripleliftAdDiv[0].isDisplayed();

            const isDisplayed = isGamAdDisplayed || is3liftAdDisplayed;

            assert(isDisplayed, 'Ad div is visible after click, gam ' + isGamAdDisplayed + ' 3lift ' + is3liftAdDisplayed);
        });

        it('check gal floor bids', async function() {
            const post_entries = await getNetworkEntries(this.driver);
            let found_amzn_bid = false;
            for (const entry of post_entries) {
                const { name, transferSize } = entry;

                if (name.startsWith(AMZN_URL) && name.includes(GALLERY_FLOORBOARD_UNIT_NAME)) {
                    found_amzn_bid = true;
                    break;
                }
                if (name == 'https://c.amazon-adsystem.com/aax2/apstag.js' && transferSize == 0) {
                    this.skip();
                    return;
                }
            }
            assert(found_amzn_bid, 'Gallery floorboard Amazon bids after opening');
        });

        it('click next and see if adhesion and gal floor refresh', async function() {
            const driver = this.driver as webdriver.ThenableWebDriver;

            const post_entries = await getNetworkEntries(driver);
            const post_gallery_bids = post_entries.filter(
                ({ name }: { name: string }) =>
                    name.startsWith(AMZN_URL) && name.includes(GALLERY_FLOORBOARD_UNIT_NAME)
            );
            const pre_adhesion_bids = post_entries.filter(
                ({ name }: { name: string }) =>
                    name.startsWith(AOL_URL) &&
                    AOL_ADHESION_PLACEMENTS.find((placement) => name.includes('' + placement))
            );

            const adhesion_refresh_clicks = await pbh_config_get(driver, 'adhesion_refresh_clicks');
            const refresh_clicks = await pbh_config_get(driver, 'refresh_clicks');

            const min_clicks = Math.min(adhesion_refresh_clicks, refresh_clicks);

            const next_arrow = await driver.findElements(webdriver.By.css('button.slick-next'));
            for (let i = 0; i < min_clicks; i++) {
                next_arrow[0].click();
            }
            await sleep(2000);

            const check_ad_refreshing = async (target: number): Promise<void> => {
                const entries = await getNetworkEntries(driver);
                if (adhesion_refresh_clicks === target) {
                    const adhesion_bids = entries.filter(
                        ({ name }: { name: string }) =>
                            name.startsWith(AOL_URL) &&
                            AOL_ADHESION_PLACEMENTS.find((placement) =>
                                name.includes('' + placement)
                            )
                    );

                    assert(
                        adhesion_bids.length === pre_adhesion_bids.length + 1,
                        'More adhesion bids after clicking'
                    );
                }

                if (refresh_clicks === target) {
                    const gallery_bids = post_entries.filter(
                        ({ name }: { name: string }) =>
                            name.startsWith(AMZN_URL) && name.includes(GALLERY_FLOORBOARD_UNIT_NAME)
                    );

                    assert(
                        gallery_bids.length === post_gallery_bids.length + 1,
                        'More adhesion bids after clicking'
                    );
                }
            };
            await check_ad_refreshing(min_clicks);

            const max_clicks = Math.max(adhesion_refresh_clicks, refresh_clicks);
            if (max_clicks === min_clicks) {
                return;
            }

            const clicks_left = max_clicks - min_clicks;
            for (let i = 0; i < clicks_left; i++) {
                next_arrow[0].click();
            }
            await sleep(2000);

            await check_ad_refreshing(max_clicks);
        });
    });
});
