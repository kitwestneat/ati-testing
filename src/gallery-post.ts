import * as webdriver from 'selenium-webdriver';
import { assert } from 'chai';
import { sleep, getNetworkEntries, isMobile, pbh_config_get } from './utils';
import { GALLERY_POST, GALLERY_FLOORBOARD_UNIT_NAME, AMZN_URL, ADHESION_UNIT_NAME } from './constants';

const GALLERY_BUTTON_TEXT = 'View Gallery';

describe('Gallery post tests', function () {
    before(async function () {
        if (this.windowSize && isMobile(this.windowSize.width)) {
            this.skip();
        }

        console.log('getting', GALLERY_POST);
        await this.driver.get(GALLERY_POST);
        console.log('got post!');
        await sleep(2000);
    });

    it('ad div not visible before open', async function () {
        const driver = this.driver;
        const galleryAdDiv = await driver.findElements(
            webdriver.By.css('.gallery-descriptions-wrap > .mrec-wrap > div')
        );
        assert(!await galleryAdDiv[0].isDisplayed(), 'Ad div is not visible before click');
    });
    it('no gal floor bids before open', async function () {
        const entries = await getNetworkEntries(this.driver);
        const gallery_bids = entries.filter(({ name }: { name: string }) =>
            name.startsWith(AMZN_URL) && name.includes(GALLERY_FLOORBOARD_UNIT_NAME)
        );
        assert(gallery_bids.length === 0, 'No gallery floorboard Amazon bids before opening');
    });

    describe('open gallery', function () {
        before(async function () {
            const driver = this.driver;
            const openButton = await driver.findElements(
                webdriver.By.xpath(`//div[text()='${GALLERY_BUTTON_TEXT}']`)
            );

            await openButton[0].click();
            await sleep(1000);
        });
        it('check ad div visible', async function () {
            const driver = this.driver;

            const galleryAdDiv = await driver.findElements(
                webdriver.By.css('.gallery-descriptions-wrap > .mrec-wrap > div')
            );
            assert(await galleryAdDiv[0].isDisplayed(), 'Ad div is visible after click');
        });

        it('check gal floor bids', async function () {
            const post_entries = await getNetworkEntries(this.driver);
            const post_gallery_bids = post_entries.filter(({ name }: { name: string }) =>
                name.startsWith(AMZN_URL) && name.includes(GALLERY_FLOORBOARD_UNIT_NAME)
            );
            assert(post_gallery_bids.length !== 0, 'Gallery floorboard Amazon bids after opening');
        });

        it.only('click next and see if adhesion and gal floor refresh', async function () {
            const driver = this.driver as webdriver.ThenableWebDriver;

            const post_entries = await getNetworkEntries(driver);
            const post_gallery_bids = post_entries.filter(({ name }: { name: string }) =>
                name.startsWith(AMZN_URL) && name.includes(GALLERY_FLOORBOARD_UNIT_NAME)
            );
            const pre_adhesion_bids = post_entries.filter(({ name }: { name: string }) =>
                name.startsWith(AMZN_URL) && name.includes(ADHESION_UNIT_NAME)
            );

            const adhesion_refresh_clicks = await pbh_config_get(driver, 'adhesion_refresh_clicks');
            const refresh_clicks = await pbh_config_get(driver, 'refresh_clicks');

            const min_clicks = Math.min(adhesion_refresh_clicks, refresh_clicks);

            const next_arrow = await driver.findElements(webdriver.By.css('button.slick-next'));
            for (let i = 0; i < min_clicks; i++) {
                next_arrow[0].click();
            }
            await sleep(2000);

            const check_ad_refreshing = async (target: number) => {
                const entries = await getNetworkEntries(driver);
                if (adhesion_refresh_clicks === min_clicks) {
                    const adhesion_bids = entries.filter(({ name }: { name: string }) =>
                        name.startsWith(AMZN_URL) && name.includes(ADHESION_UNIT_NAME)
                    );

                    assert(adhesion_bids.length === pre_adhesion_bids.length + 1, 'More adhesion bids after clicking')
                }

                if (refresh_clicks === min_clicks) {
                    const gallery_bids = post_entries.filter(({ name }: { name: string }) =>
                        name.startsWith(AMZN_URL) && name.includes(GALLERY_FLOORBOARD_UNIT_NAME)
                    );

                    assert(gallery_bids.length === post_gallery_bids.length + 1, 'More adhesion bids after clicking')
                }
            }
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
        })
    });
});
