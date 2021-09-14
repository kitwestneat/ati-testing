import * as fs from 'fs';
import * as webdriver from 'selenium-webdriver';
import * as chrome from 'selenium-webdriver/chrome';
import { WINDOW_SIZES } from '../constants';
import { isDev, sleep } from '../utils';
import { send_email } from '../mail';

const env_slug = process.env['FWH_TEST_SLUG'];
const env_email = process.env['FWH_EMAIL'];

const BASE_URL = isDev() ? 'https://mirror2.pbh-network.com/' : 'https://allthatsinteresting.com/';
const TEST_SLUGS = env_slug ? [env_slug] : [
    'thylacine',
    'mary-church-terrell',
    'true-scary-stories',
    'haunted-hotels',
    'annette-kellerman',
    'dumbo-octopus',
    'barreleye-fish',
];
const SLEEP_TIME = 3000;

function initChrome(): webdriver.ThenableWebDriver {
    const options = new chrome.Options();
    options.addArguments('headless', 'disable-gpu');

    const prefs = new webdriver.logging.Preferences();
    prefs.setLevel(webdriver.logging.Type.BROWSER, webdriver.logging.Level.ALL);
    options.setLoggingPrefs(prefs);

    const capa = webdriver.Capabilities.chrome();
    capa.set('pageLoadStrategy', 'eager');

    return new webdriver.Builder().withCapabilities(capa).setChromeOptions(options).build();
}

function makeScreenshotFilename(url: string, size: string, idx?: number): string {
    const idx_str = typeof idx != 'undefined' ? idx + '.' : '';
    const slug = url.replace(/[/:?=]/g, '_');

    return `/tmp/${slug}.${size}.${idx_str}png`;
}

interface Rect {
    width: number;
    height: number;
}

async function getScreenshotList(driver: any, urlList: string[],
    size: Rect, scroll?: number): Promise<string[]> {
    const filenameList: string[] = [];

    driver.manage().window().setRect(size);
    for (const url of urlList) {
        console.log('getting', url);
        await driver.get(url);
        await sleep(SLEEP_TIME);

        const scrollCount = scroll ? Math.ceil(scroll / size.height) : 1;
        const sizeStr = size.width + 'x' + size.height;

        const urlFilenameList = [...Array(scrollCount)]
            .map((_v, i) => makeScreenshotFilename(url, sizeStr, i));
        let i = 0;
        for (const fn of urlFilenameList) {
            const data = await driver.takeScreenshot();
            fs.writeFileSync(fn, data, 'base64');
            filenameList.push(fn);
            i++;
            await driver.executeScript(
                `window.scrollTo(0, Math.floor(window.outerHeight*${i}*.8))`
            );
        }
    }

    return filenameList;
}

async function main() {
    const driver = initChrome();
    let filename_list: string[] = [];
    const urlList = TEST_SLUGS.map((slug) => BASE_URL + slug);

    console.log('urlList', urlList);

    for (const windowSize of WINDOW_SIZES) {
        const ss_list = await getScreenshotList(driver, urlList, windowSize, 2048);
        filename_list = filename_list.concat(ss_list);
    }

    send_email({
        subject: env_slug ? 'ATI Screenshot Test' : 'ATI Full Width Screenshots',
        body: env_slug ?
            'Screenshots of ' + env_slug :
            'Screenshots of full width headers attached',
        attachments: filename_list.map((path) => ({ path })),
        to: isDev() ? 'kit@pbh-network.com' : (env_email || 'admin@pbh-network.com'),
    });
}
main();
