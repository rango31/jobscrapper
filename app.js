const puppeteer = require('puppeteer-extra');
const AdblockerPlugin = require('puppeteer-extra-plugin-adblocker');
const PluginStealth = require('puppeteer-extra-plugin-stealth');
const RecaptchaPlugin = require('puppeteer-extra-plugin-recaptcha');

const { DEFAULT_INTERCEPT_RESOLUTION_PRIORITY } = require('puppeteer');

const { getJobs } = require('./scrapper');

const pluginStealth = PluginStealth();
pluginStealth.enabledEvasions.delete('accept-language');

puppeteer.use(pluginStealth);
puppeteer.use(require('puppeteer-extra-plugin-session').default());
puppeteer.use(AdblockerPlugin({interceptResolutionPriority: DEFAULT_INTERCEPT_RESOLUTION_PRIORITY,}),);
puppeteer.use(require('puppeteer-extra-plugin-anonymize-ua')());

puppeteer.use(
  RecaptchaPlugin({
    provider: {
      id: '2captcha',
      token: '',
    },
    visualFeedback: true,
  }),
);
console.log('running');

getJobs(puppeteer)


