import * as fs from 'fs';
import * as webdriver from 'selenium-webdriver';
import * as chrome from 'selenium-webdriver/chrome';
import { assert } from 'chai';

import { MochaState } from './types';
import {
    isDev,
    isSfo,
    initNetworkEntries,
    listRandom,
    getNetworkEntries,
    getPbhDebug,
    getDom,
    setCircJson,
} from './utils';
import { DOMAIN, SFO_IP, WINDOW_SIZES } from './constants';
import { send_email } from './mail';

const logLocation = process.env['ATI_TEST_DIR'] || 'screenshots';
const hostAddress = isSfo() ? SFO_IP : process.env['ATI_TEST_HOST'];

before(async function() {
    // initializing chrome driver
    const options = new chrome.Options();
    if (!isDev()) {
        options.addArguments('headless', 'disable-gpu');
    }
    if (hostAddress) {
        console.log('mapping ATI [' + DOMAIN + '] to use ' + hostAddress);
        options.addArguments(
            `host-resolver-rules=MAP ${DOMAIN} ${hostAddress}, MAP ${DOMAIN} ${hostAddress}`,
            'ignore-certificate-errors'
        );
    }

    const prefs = new webdriver.logging.Preferences();
    prefs.setLevel(webdriver.logging.Type.BROWSER, webdriver.logging.Level.ALL);
    options.setLoggingPrefs(prefs);

    const windowSize = listRandom(WINDOW_SIZES);
    if (!windowSize) {
        console.error('could not select random window size');
    } else {
        console.log('testing size', windowSize);
        options.addArguments(`window-size=${windowSize.width},${windowSize.height}`);
        this.windowSize = windowSize;
    }

    const capa = webdriver.Capabilities.chrome();
    capa.set('pageLoadStrategy', 'eager');

    this.driver = new webdriver.Builder().withCapabilities(capa).setChromeOptions(options).build();

    // is this necessary?
    if (!windowSize) {
        console.error('could not select random window size');
    } else {
        this.driver.manage().window().setRect(windowSize);
    }

    console.log('started chrome');
    await initNetworkEntries(this.driver);
});

beforeEach(async function() {
    await setCircJson(this.driver);
    console.log('circ json set');
});

afterEach(async function() {
    if (!this.currentTest) {
        return;
    }
    const testCaseName: string = this.currentTest.title.replace(/ /g, '_') + '-' + Date.now();
    const testCaseStatus: MochaState = this.currentTest.state;
    if (testCaseStatus === 'failed') {
        handleFailure({ testCaseName, driver: this.driver });
    } else if (testCaseStatus === 'passed') {
        console.log(`Test: ${testCaseName}, Status: Passed!`);
    } else {
        console.log(`Test: ${testCaseName}, Status: Unknown!`);
    }
});

after(async function() {
    /*
    const res = await this.driver.manage().logs().get(webdriver.logging.Type.BROWSER);

    assert.notDeepInclude(res, 'timeout waiting for ad', 'Ad render timeout detected');
   */

    this.driver.quit();
});

interface HandleFailureOpts {
    testCaseName: string;
    driver: webdriver.ThenableWebDriver;
}
async function handleFailure({ testCaseName, driver }: HandleFailureOpts): Promise<void> {
    console.log(`Test: ${testCaseName}, Status: Failed!`);
    const filenames: string[] = [];
    const url = await driver.getCurrentUrl();
    const body = 'Please kindly find error logs attached.\nURL: ' + url;

    // capturing screenshot if test fails
    driver.takeScreenshot().then((data: any) => {
        const screenshotPath = `${logLocation}/${testCaseName}.png`;
        console.log(`Saving Screenshot as: ${screenshotPath}`);
        fs.writeFileSync(screenshotPath, data, 'base64');
        filenames.push(screenshotPath);
    });

    try {
        const entries = await getNetworkEntries(driver);
        const filename = `${logLocation}/${testCaseName}.har.log`;
        fs.writeFileSync(filename, JSON.stringify(entries, null, 4));
        filenames.push(filename);
    } catch (e) {
        console.error('error writing HAR');
    }

    try {
        const res = await driver.manage().logs().get(webdriver.logging.Type.BROWSER);
        const filename = `${logLocation}/${testCaseName}.console.log`;
        fs.writeFileSync(filename, JSON.stringify(res, null, 4));
        filenames.push(filename);
    } catch (e) {
        console.error('error writing log');
    }

    try {
        const res = await getPbhDebug(driver);
        const filename = `${logLocation}/${testCaseName}.debug.log`;
        fs.writeFileSync(filename, res);
        filenames.push(filename);
    } catch (e) {
        console.error('error writing PBH debug log', e);
    }

    try {
        const res = await getDom(driver);
        const filename = `${logLocation}/${testCaseName}.dom.log`;
        fs.writeFileSync(filename, res);
        filenames.push(filename);
    } catch (e) {
        console.error('error writing DOM', e);
    }

    try {
        if (!isDev()) {
            send_email({
                subject: 'ATI Test Error Files - ' + testCaseName,
                body,
                attachments: filenames.map((path) => ({ path })),
            });
        }
    } catch (e) {
        console.error('error sending mail', e);
    }
}
// vi: ts=4 sw=4 et
