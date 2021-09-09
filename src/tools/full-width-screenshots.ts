import * as fs from 'fs';
import * as webdriver from 'selenium-webdriver';
import * as chrome from 'selenium-webdriver/chrome';
import { WINDOW_SIZES } from '../constants';
import { sleep } from '../utils';
import { send_email } from '../mail';

const BASE_URL = 'https://mirror2.pbh-network.com/';
const TEST_SLUGS = [
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

function makeScreenshotFilename(slug: string, size: string): string {
    return `/tmp/${slug}.${size}.png`;
}

interface Rect {
    width: number;
    height: number;
}

async function getScreenshotList(driver: any, urlList: string[], size: Rect): Promise<string[]> {
    const filenameList: string[] = [];

    driver.manage().window().setRect(size);
    for (const url of urlList) {
        await driver.get(url);
        await sleep(SLEEP_TIME);

        const filename = makeScreenshotFilename(url, size.width + 'x' + size.height);
        const data = await driver.takeScreenshot();
        fs.writeFileSync(filename, data, 'base64');
        filenameList.push(filename);
    }

    return filenameList;
}

async function main() {
    const driver = initChrome();
    let filename_list: string[] = [];
    const urlList = TEST_SLUGS.map((slug) => BASE_URL + slug);

    for (const windowSize of WINDOW_SIZES) {
        filename_list = filename_list.concat(await getScreenshotList(driver, urlList, windowSize));
        const fullSize = { width: windowSize.width, height: 2048 };
        filename_list = filename_list.concat(await getScreenshotList(driver, urlList, fullSize));
    }

    send_email({
        subject: 'ATI Full Width Screenshots',
        body: 'Screenshots of full width headers attached',
        attachments: filename_list.map((path) => ({ path })),
        to: 'kit@pbh-network.com',
    });
}
main();
