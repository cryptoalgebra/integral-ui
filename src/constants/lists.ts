import AlgebraConfig from "../algebra.config";

const IS_ON_APP_URL =
  window && window.location.hostname === AlgebraConfig.MISC.appURL;

const BA_LIST =
  "https://raw.githubusercontent.com/The-Blockchain-Association/sec-notice-list/master/ba-sec-list.json";
const HONEYSWAP_LIST = "https://tokens.honeyswap.org/";
// only load blocked list if on app url
const UNSUPPORTED_LIST_URLS: string[] = IS_ON_APP_URL ? [BA_LIST] : [];

// lower index == higher priority for token import
export const DEFAULT_LIST_OF_LISTS: string[] = [
  HONEYSWAP_LIST,
  ...UNSUPPORTED_LIST_URLS, // need to load unsupported tokens as well
];

// default lists to be 'active' aka searched across
export const DEFAULT_ACTIVE_LIST_URLS: string[] = [HONEYSWAP_LIST];
