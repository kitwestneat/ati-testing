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
    return driver.executeScript(() => (top as any).PbhAdUnit.debug_buffer);
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
