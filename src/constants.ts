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
export const GALLERY_POST = SITE_BASE + '/toraja-death-ritual';
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


export const AOL_SKYBOX_PLACEMENTS = [4009753, 3682988];
export const AOL_ADHESION_PLACEMENTS = [3682983, 3682987];
export const AOL_MREC_PLACEMENTS = [3682989];
