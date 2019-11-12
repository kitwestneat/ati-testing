import * as fs from 'fs';
import * as webdriver from 'selenium-webdriver';
import * as chrome from 'selenium-webdriver/chrome';

import { MochaState } from './types';
import { isDev, isSfo, initNetworkEntries, listRandom, getNetworkEntries } from './utils';
import { WINDOW_SIZES } from './constants';

before(async function() {
    // initializing chrome driver
    const options = new chrome.Options();
    if (!isDev()) {
        options.addArguments('headless', 'disable-gpu');
    }
    if (isSfo()) {
        console.log('mapping ATI to use west coast servers');

        options.addArguments('host-resolver-rules=MAP allthatsinteresting.com 157.230.169.90,'
                            + ' MAP www.allthatsinteresting.com 157.230.169.90');
    }

    const prefs = new webdriver.logging.Preferences();
    prefs.setLevel(webdriver.logging.Type.BROWSER, webdriver.logging.Level.ALL);
    options.setLoggingPrefs(prefs);

    const capa = webdriver.Capabilities.chrome();
    capa.set('pageLoadStrategy', 'eager');

    this.driver = new webdriver.Builder()
        .withCapabilities(capa)
        .setChromeOptions(options)
        .build();

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

afterEach(async function() {
    if (!this.currentTest) {
        return;
    }
    const testCaseName: string = this.currentTest.title + '-' + Date.now();
    const testCaseStatus: MochaState = this.currentTest.state;
    if (testCaseStatus === 'failed') {
        console.log(`Test: ${testCaseName}, Status: Failed!`);
        // capturing screenshot if test fails
        this.driver.takeScreenshot().then((data: any) => {
            const screenshotPath = `screenshots/${testCaseName}.png`;
            console.log(`Saving Screenshot as: ${screenshotPath}`);
            fs.writeFileSync(screenshotPath, data, 'base64');
        });

        try {
            const entries = await getNetworkEntries(this.driver);
            fs.writeFileSync(`screenshots/${testCaseName}.har`, JSON.stringify(entries, null, 4));
        } catch (e) {
            console.error('error writing HAR');
        }

        try {
            const res = await this.driver.manage().logs().get(webdriver.logging.Type.BROWSER);
            fs.writeFileSync(`screenshots/${testCaseName}.log`, JSON.stringify(res, null, 4));
        } catch (e) {
            console.error('error writing HAR');
        }

    } else if (testCaseStatus === 'passed') {
        console.log(`Test: ${testCaseName}, Status: Passed!`);
    } else {
        console.log(`Test: ${testCaseName}, Status: Unknown!`);
    }
});

after(function() {
    this.driver.quit();
});

// vi: ts=4 sw=4 et
