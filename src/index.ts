import * as fs from 'fs';
import * as webdriver from 'selenium-webdriver';
import * as chrome from 'selenium-webdriver/chrome';

import { MochaState } from './types';
import { isDev, initNetworkEntries, listRandom } from './utils';
import { WINDOW_SIZES } from './constants';

interface WithDriver {
    driver: webdriver.ThenableWebDriver;
}

before(async function(this: any & WithDriver) {
    // initializing chrome driver
    const options = new chrome.Options();
    if (!isDev()) {
        options.addArguments('headless', 'disable-gpu');
    }

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
    }

    console.log('started chrome');
    await initNetworkEntries(this.driver);
});

afterEach(function() {
    if (!this.currentTest) {
        return;
    }
    const testCaseName: string = this.currentTest.title;
    const testCaseStatus: MochaState = this.currentTest.state;
    if (testCaseStatus === 'failed') {
        console.log(`Test: ${testCaseName}, Status: Failed!`);
        // capturing screenshot if test fails
        this.driver.takeScreenshot().then((data: any) => {
            const screenshotPath = `screenshots/${testCaseName}.png`;
            console.log(`Saving Screenshot as: ${screenshotPath}`);
            fs.writeFileSync(screenshotPath, data, 'base64');
        });
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
