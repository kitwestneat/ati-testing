import * as webdriver from 'selenium-webdriver';

export const isDev = (): boolean =>
    !!process.env.NODE_ENV && process.env.NODE_ENV.toLowerCase().startsWith('dev');

export const isSfo = (): boolean => !!process.env.SFO_TEST;

export function sleep(n?: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, n));
}
export function initNetworkEntries(driver: webdriver.ThenableWebDriver): Promise<any> {
    return driver.executeScript(() => window.performance.setResourceTimingBufferSize(100000));
}

export function getNetworkEntries(driver: webdriver.ThenableWebDriver): Promise<any> {
    return driver
        .executeScript(() => JSON.stringify(window.performance.getEntries()))
        .then((entries: any) => JSON.parse(entries)) as any;
}

function clientScroll(amt?: number): void {
    debugger;
    function findScrollableChild(el: any, credits: number): any {
        if (!credits) {
            return;
        }

        if (el.scrollHeight > window.innerHeight) {
            return el;
        }

        const children_list: any = Object.values(el.children);
        for (let i = 0; i < children_list.length; i++) {
            const newEl = findScrollableChild(children_list[i], credits - 1);

            if (newEl) {
                return newEl;
            }
        }
    }

    // document.body can't be scrolled, has to be documentElement
    const el = findScrollableChild(document.documentElement, 10);

    if (!amt) {
        el.scrollTop = el.scrollHeight;
    } else {
        el.scrollTop += amt;
    }
}
export async function scrollDown(driver: webdriver.ThenableWebDriver): Promise<any> {
    await driver.executeScript(clientScroll, 1000);
}

export async function scrollToElement(
    driver: webdriver.ThenableWebDriver,
    element: webdriver.WebElement
): Promise<void> {
    await driver.executeScript('arguments[0].scrollIntoView(true);', element);
}

export async function scrollToBottom(driver: webdriver.ThenableWebDriver): Promise<any> {
    // do scroll to bottom multiple times because lazy load changes bottom
    await driver.executeScript(clientScroll);
    await sleep(2000);
    await driver.executeScript(clientScroll);
    await sleep(2000);
    await driver.executeScript(clientScroll);
    await sleep(2000);
    await driver.executeScript(clientScroll);
    await sleep(4000);
}

export function pbh_config_get(driver: webdriver.ThenableWebDriver, key: string): Promise<any> {
    return driver.executeScript((k: string) => (top as any).pbh_config_get(k), key);
}

export function getPbhDebug(driver: webdriver.ThenableWebDriver): Promise<any> {
    console.log('getting pbh debug');

    return driver.executeScript(() => {
        try {
            return (top as any).circJson((top as any).PbhAdUnit.debug_buffer);
        } catch (e) {
            console.error('pbh debug buffer: error calling circJson');
        }

        return [];
    });
}

export function setCircJson(driver: webdriver.ThenableWebDriver): Promise<void> {
    return driver.executeScript(
        () =>
            ((top as any).circJson = (obj: any): string => {
                const cache: any[] = [];
                const objJson = JSON.stringify(
                    obj,
                    (_k: any, value: any) => {
                        if (typeof value === 'object' && value !== null) {
                            if (cache.includes(value)) {
                                return;
                            }
                            cache.push(value);
                        }

                        return value;
                    },
                    4
                );

                return objJson;
            })
    );
}

export function listRandom<T>(list: T[]): T | undefined {
    if (list.length === 0) {
        return;
    }

    const i = Math.floor(list.length * Math.random());

    return list[i];
}

export function isMobile(width: number): boolean {
    return width < 728;
}

export function clickElement(
    driver: webdriver.ThenableWebDriver,
    element: webdriver.WebElement
): Promise<any> {
    return driver.executeScript((el: any) => {
        (top as any).$(el).click();
    }, element);
}

export function waitForDebugLog(
    driver: webdriver.ThenableWebDriver,
    logCb: (log: string[]) => boolean,
    timeout = 10000
): Promise<boolean> {
    const logChecker = async (): Promise<boolean> => {
        console.log('checking logs');
        const pbhDebug = await getPbhDebug(driver);
        let logs = [] as string[][];
        try {
            logs = JSON.parse(pbhDebug);
        } catch (e) {
            console.error('error parsing debug', pbhDebug);

            return false;
        }

        if (!logs || !logs.findIndex) {
            console.log('no debug logs found', logs);

            return false;
        }

        return logs.findIndex(logCb) != -1;
    };

    const startTime = Date.now();
    const timeChecker = async (resolve: () => void, reject: () => void): Promise<void> => {
        try {
            const result = await logChecker();
            if (result) {
                resolve();

                return;
            }
        } catch (e) {
            console.error('error checking logs:', e);
            // we'll try again if there is time
        }

        if (Date.now() > startTime + timeout) {
            console.log('timeout waiting for logs');
            reject();

            return;
        }
        setTimeout(() => timeChecker(resolve, reject), 1000);
    };

    return new Promise(timeChecker);
    // return driver.wait(logChecker, timeout);
}

export function waitForAdInit(
    driver: webdriver.ThenableWebDriver,
    timeout?: number
): Promise<boolean> {
    return waitForDebugLog(
        driver,
        (log) => typeof log[0] == 'string' && log[0] == 'PbhAdUnit.init',
        timeout
    );
}

export function stringHasPlacement(haystack: string, placements: Array<string | number>): boolean {
    return !!placements.find((placement) => haystack.includes('' + placement));
}

export function getDom(driver: webdriver.ThenableWebDriver): Promise<string> {
    return driver.executeScript('return document.documentElement.outerHTML');
}

export const sample = <T>(items: T[]): T => items[Math.floor(Math.random() * items.length)];
