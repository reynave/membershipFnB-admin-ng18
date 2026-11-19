import { APP_BUILD_TIME, APP_VERSION } from './version';

declare let  apiBaseUrl : any;
declare let  apiDoc : any;

export const environment = {
  production : false,
  apiBaseUrl: 'https://membership.mitralinksolusi.com/api',
  apiDoc : 'https://membership.mitralinksolusi.com/api-docs/',
  // Generated on every build by scripts/generate-version.js (YYMMDDHHmm)
  version : APP_VERSION,
  buildTime : APP_BUILD_TIME
};
