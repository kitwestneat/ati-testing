import * as fs from 'fs';
import * as url from 'url';

interface Dictionary<T> {
    [key: string]: T;
}
interface HarObject {
    name: string;
    entryType: 'resource' | 'navigation' | 'mark' | 'measure' | 'paint';
    startTime: number;
    duration: number;
    initiatorType:
        | 'beacon'
        | 'css'
        | 'iframe'
        | 'img'
        | 'link'
        | 'navigation'
        | 'script'
        | 'xmlhttprequest';
    nextHopProtocol: string;
    workerStart: number;
    redirectStart: number;
    redirectEnd: number;
    fetchStart: number;
    domainLookupStart: number;
    domainLookupEnd: number;
    connectStart: number;
    connectEnd: number;
    secureConnectionStart: number;
    requestStart: number;
    responseStart: number;
    responseEnd: number;
    transferSize: number;
    encodedBodySize: number;
    decodedBodySize: number;
    serverTiming: any[];
}

function loadHarFile(filename: string): HarObject[] {
    const content: string = fs.readFileSync(filename).toString();

    return JSON.parse(content);
}

function main(): void {
    const FN = process.argv[2];
    if (!FN) {
        console.error('usage:', process.argv[1], '<har file>');
        process.exit(1);
    }

    const harList = loadHarFile(FN);

    // get longest duration files
    const maxDurationList = getMaxDurationList(harList);

    // get most called domain
    const mostCalledDomainList = getMostCalledDomainList(harList);

    // get longest duration domains
    const maxDurationDomainsList = getMaxDurationDomainsList(harList);

    console.log('maxDurationList', maxDurationList);
    console.log('mostCalledDomainList', mostCalledDomainList);
    console.log('maxDurationDomainsList', maxDurationDomainsList);
}

function getMaxDurationList(harList: HarObject[], count = 10): HarObject[] {
    return [...harList]
        .sort((a: HarObject, b: HarObject) => b.duration - a.duration)
        .slice(0, count);
}

function getDomain(href: string): string | undefined {
    return url.parse(href).hostname;
}

function domainReducer(
    harList: HarObject[],
    getDomainValue: (h: HarObject) => number
): [string, number][] {
    const reducedList = Object.entries(
        [...harList].reduce((domainMap: Dictionary<number>, harObj) => {
            const { name } = harObj;

            const domain = getDomain(name);
            if (!domain) {
                console.warn('unable to parse', name);

                return domainMap;
            }

            return {
                ...domainMap,
                [domain]: (domainMap[domain] || 0) + getDomainValue(harObj),
            };
        }, {})
    );

    return reducedList as [string, number][];
}

function getMostCalledDomainList(harList: HarObject[], count = 10): [string, number][] {
    const domainCountList = domainReducer(harList, () => 1);

    return domainCountList.sort((a, b) => b[1] - a[1]).slice(0, count);
}

function getMaxDurationDomainsList(harList: HarObject[], count = 10): [string, number][] {
    const domainDurationList = domainReducer(harList, ({ duration }) => duration);

    return domainDurationList.sort((a, b) => b[1] - a[1]).slice(0, count);
}


main();
