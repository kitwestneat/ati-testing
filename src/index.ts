import * as fs from 'fs';
import * as webdriver from 'selenium-webdriver';
import * as chrome from 'selenium-webdriver/chrome';

import { MochaState } from './types';
import { isDev, initNetworkEntries } from './utils';

before(async function() {
    // initializing chrome driver
    const options = new chrome.Options();
    if (!isDev()) {
        options.addArguments('headless', 'disable-gpu');
    }

    this.driver = new webdriver.Builder()
        .withCapabilities(webdriver.Capabilities.chrome())
        .setChromeOptions(options)
        .build();
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
