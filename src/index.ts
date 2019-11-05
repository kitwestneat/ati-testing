/* eslint-disable no-invalid-this */
import * as fs from 'fs';
import * as webdriver from 'selenium-webdriver';
import { MochaState } from './types';

before(function() {
    // initializing chrome driver
    this.driver = new webdriver.Builder().withCapabilities(webdriver.Capabilities.chrome()).build();
    // maximizing chrome browser
    this.driver
        .manage()
        .window()
        .maximize();
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
