import { isDev, sample } from './utils';

export const WINDOW_SIZES = [
    { width: 375, height: 812 }, // iPhoneX
    { width: 768, height: 1024 }, // iPad
    { width: 1440, height: 633 }, // laptop
];

export const SITE_BASE = isDev() ?
    'https://mirror2.pbh-network.com' :
    'https://allthatsinteresting.com';
export const FRONTPAGE = SITE_BASE;
export const ERROR_404_PAGE = SITE_BASE + '/this-page-should-404';

export const LOGO_ALT_TEXT_HEADER = 'All That\'s Interesting';

export const GAM_URL = 'https://securepubads.g.doubleclick.net/gampad/ads?';
export const AMZN_URL = 'https://c.amazon-adsystem.com/e/dtb/bid';
export const AOL_URL = 'https://adserver-us.adtech.advertising.com/pubapi/3.0/10160.1/';
export const ANALYTICS_URL = 'https://www.google-analytics.com/collect?';

export const SKYBOX_UNIT_NAME = 'ATISkybox';
export const ADHESION_UNIT_NAME = 'ATIAdhesion';
export const MREC_UNIT_NAME = 'AllThatsInterestingRectangle';
export const INLINE_UNIT_NAME = 'ATIInline';
export const GALLERY_FLOORBOARD_UNIT_NAME = 'ATIGalleryFloorboard';

// Skybox doesn't use 320x50 on mobile until refresh, so needs to include 300x250
function getPostUrl(slug_list: string[]): string {
    const slug = sample(slug_list);

    return SITE_BASE + '/' + slug;
}

export const getGalleryPostUrl = (): string => getPostUrl([
    'maps-that-explain-america',
    'colorized-photos',
    'bajau-people',
    'jacob-riis-photographs-how-the-other-half-lives',
    'ed-gein-house',
    'toraja-death-ritual',
]);

export const getPaginatedPostUrl = (): string => getPostUrl([
    'women-in-world-war-2',
    'black-billionaires',
    'awful-jobs',
    'women-warriors',
    'horror-stories',
    'black-inventors',
]);

export const getSinglePostUrl = (): string => getPostUrl([
    'emma-lazarus',
    'vivian-liberto',
    'frances-farmer-lobotomy',
    'giacomo-casanova',
    'king-tutankhamun-coffin',
    'nutty-putty-cave',
]);

export const AOL_SKYBOX_PLACEMENTS = [4009753, 3682988, 3682984];
export const AOL_ADHESION_PLACEMENTS = [3682983, 3682987];
export const AOL_MREC_PLACEMENTS = [3682989];
