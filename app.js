const dotenv = require('dotenv');
const winston = require('winston');
const moment = require('moment');
const puppeteer = require('puppeteer-extra');
const AdblockerPlugin = require('puppeteer-extra-plugin-adblocker');
const _Blockresources = require('puppeteer-extra-plugin-block-resources');
const PluginStealth = require('puppeteer-extra-plugin-stealth');
const RecaptchaPlugin = require('puppeteer-extra-plugin-recaptcha');

const { DEFAULT_INTERCEPT_RESOLUTION_PRIORITY } = require('puppeteer');

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

(async () => {

    dotenv.config();
    const { NODE_ENV, SCHEDULE, MAX_RETRIES } = process.env;

    global.logger = winston.createLogger({
        level: 'info',
        format: winston.format.simple(),
        // defaultMeta: { System: 'LocalyserScrapper'},
        transports: [
          new winston.transports.File({ filename: './logs/warn.log', level: 'warn' }),
          new winston.transports.File({ filename: './logs/error.log', level: 'error' }),
          new winston.transports.File({ filename: './logs/info.log', level: 'info' }),
          new WinstonSlack({ level: 'error' }),
        ],
      });
    
      logger.add(new winston.transports.Console({ format: winston.format.simple() }));

      const browser = await puppeteer.launch(
        {
          headless: false,
          // userDataDir: './chromiumdata',
          slowMo: 3,
          defaultViewport: null,
          executablePath: require('puppeteer').executablePath(),
          args: ['--disable-web-security', '--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu', '--window-size=1366,768', '--start-maximized', '--start-fullscreen', proxy],
        },
      ).catch((error) => {
          console.log(error)
      });

      await Promise.allSettled(
        await restomontrealcom.scrap(job, browser)
       ).then(async (r) => {
       
      });

});

