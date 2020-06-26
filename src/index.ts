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
import { WINDOW_SIZES } from './constants';
import { send_email } from './mail';

const logLocation = process.env['ATI_TEST_DIR'] || 'screenshots';

before(async function() {
    // initializing chrome driver
    const options = new chrome.Options();
    if (!isDev()) {
        options.addArguments('headless', 'disable-gpu');
    }
    if (isSfo()) {
        console.log('mapping ATI to use west coast servers');

        options.addArguments(
            'host-resolver-rules=MAP allthatsinteresting.com 157.230.169.90,' +
                ' MAP www.allthatsinteresting.com 157.230.169.90',
            'ignore-certificate-errors'
        );
    }

    const prefs = new webdriver.logging.Preferences();
    prefs.setLevel(webdriver.logging.Type.BROWSER, webdriver.logging.Level.ALL);
    options.setLoggingPrefs(prefs);

    const capa = webdriver.Capabilities.chrome();
    capa.set('pageLoadStrategy', 'eager');

    this.driver = new webdriver.Builder().withCapabilities(capa).setChromeOptions(options).build();

    const windowSize = listRandom(WINDOW_SIZES);
    if (!windowSize) {
        console.error('could not select random window size');
    } else {
        console.log('testing size', windowSize);
        this.driver.manage().window().setRect(windowSize);
        this.windowSize = windowSize;
    }

    console.log('started chrome');
    await initNetworkEntries(this.driver);
});

beforeEach(async function() {
    await setCircJson(this.driver);
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
    const res = await this.driver.manage().logs().get(webdriver.logging.Type.BROWSER);

    assert.notDeepInclude(res, 'timeout waiting for ad', 'Ad render timeout detected');

    this.driver.quit();
});

interface HandleFailureOpts {
    testCaseName: string;
    driver: webdriver.ThenableWebDriver;
}
async function handleFailure({ testCaseName, driver }: HandleFailureOpts): Promise<void> {
    console.log(`Test: ${testCaseName}, Status: Failed!`);
    const filenames: string[] = [];
    const body = 'Please kindly find error logs attached.\n';

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
                subject: 'ATI Test Error Files',
                body,
                attachments: filenames.map((path) => ({ path })),
            });
        }
    } catch (e) {
        console.error('error sending mail', e);
    }
}
// vi: ts=4 sw=4 et
