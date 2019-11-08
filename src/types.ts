import * as webdriver from 'selenium-webdriver';
import { Context } from 'mocha';

export type MochaState = 'failed' | 'passed' | undefined;

/*
export interface TestingState {
    driver: webdriver.ThenableWebDriver;
    windowSize: { width: number; height: number }
}
export type TestFunctionThis = Context & Partial<TestingState>;
*/
