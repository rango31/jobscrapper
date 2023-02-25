const puppeteer = require('puppeteer-extra');
const AdblockerPlugin = require('puppeteer-extra-plugin-adblocker');
const PluginStealth = require('puppeteer-extra-plugin-stealth');
const RecaptchaPlugin = require('puppeteer-extra-plugin-recaptcha');

const { DEFAULT_INTERCEPT_RESOLUTION_PRIORITY } = require('puppeteer');

const { getJobs } = require('./scrapper');
const { exportToJson } = require('./helper');

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

const knexConfig = require('./knexfile');
const knex = require('knex')(knexConfig['production'])
global.knex = knex;

knex.migrate.latest()
.then(async () => {
    console.log("Migrations applied. Running scripts .....");
    await getJobs(puppeteer);
    await exportToJson();
}).catch((e)=>{
    console.log(e);
    process.exit();
});




