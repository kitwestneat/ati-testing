import { isDev } from './utils';

export const WINDOW_SIZES = [
    { width: 375, height: 812 }, // iPhoneX
    { width: 768, height: 1024 }, // iPad
    { width: 1440, height: 633 }, // laptop
];

export const SITE_BASE = isDev() ?
    'https://mirror2.pbh-network.com' :
    'https://allthatsinteresting.com';
export const FRONTPAGE = SITE_BASE;
export const SINGLE_POST = SITE_BASE + '/emma-lazarus';
export const SECOND_PAGE = SITE_BASE + '/women-in-world-war-2/2';
export const ERROR_404_PAGE = SITE_BASE + '/this-page-should-404';

export const LOGO_ALT_TEXT_HEADER = 'All That\'s Interesting';

export const GAM_URL = 'https://securepubads.g.doubleclick.net/gampad/ads?';
export const AMZN_URL = 'https://c.amazon-adsystem.com/e/dtb/bid';
export const AOL_URL = 'https://c2shb.ssp.yahoo.com/bidRequest';
export const ANALYTICS_URL = 'https://www.google-analytics.com/collect?';

export const SKYBOX_UNIT_NAME = 'ATISkybox';
export const ADHESION_UNIT_NAME = 'ATIAdhesion';
export const MREC_UNIT_NAME = 'AllThatsInterestingRectangle';
export const INLINE_UNIT_NAME = 'ATIInline';
export const GALLERY_FLOORBOARD_UNIT_NAME = 'ATIGalleryFloorboard';

// Skybox doesn't use 320x50 on mobile until refresh, so needs to include 300x250
export const AOL_SKYBOX_PLACEMENTS = ['ati_skybox'];
export const AOL_ADHESION_PLACEMENTS = ['ati_adhesion'];
export const AOL_MREC_PLACEMENTS = ['ati_mrec'];

const GALLERY_POSTS = [
    'maps-that-explain-america',
    'colorized-photos',
    'bajau-people',
    'jacob-riis-photographs-how-the-other-half-lives',
    'ed-gein-house',
    'toraja-death-ritual',
];

const sample = <T>(items: T[]): T => items[Math.floor(Math.random() * items.length)];

export function getGalleryPostUrl(): string {
    const slug = sample(GALLERY_POSTS);

    return SITE_BASE + '/' + slug;
}
