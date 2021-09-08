import * as fs from 'fs';
import * as webdriver from 'selenium-webdriver';
import * as chrome from 'selenium-webdriver/chrome';
import { WINDOW_SIZES } from '../constants';
import { sleep } from '../utils';

const BASE_URL = 'https://mirror2.pbh-network.com/';
const TEST_URLS = [
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

async function saveScreenshot(driver: any, slug: string, size: string) {
    const filename = `/tmp/${slug}.${size}.png`;

    const data = await driver.takeScreenshot();
    fs.writeFileSync(filename, data, 'base64');
    console.log('write', filename);
}

async function main() {
    const driver = initChrome();

    for (const windowSize of WINDOW_SIZES) {
        driver.manage().window().setRect(windowSize);
        for (const url of TEST_URLS) {
            await driver.get(BASE_URL + url);
            await sleep(SLEEP_TIME);

            await saveScreenshot(driver, url, windowSize.width + 'x' + windowSize.height);
        }
        const fullSize = { width: windowSize.width, height: 2048 };
        driver.manage().window().setRect(fullSize);
        for (const url of TEST_URLS) {
            await driver.get(BASE_URL + url);
            await sleep(SLEEP_TIME);
            await saveScreenshot(driver, url, fullSize.width + 'x' + fullSize.height);
        }
    }
}
main();
