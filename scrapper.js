
const dotenv = require('dotenv');

const indeed = require('./sites/indeedch');
const jobscout24 = require('./sites/jobscout24ch');
const praktischarztch = require('./sites/praktischarztch');
const praktischarztat = require('./sites/praktischarztat');
const praktischarztde = require('./sites/praktischarztde');
const metajob = require('./sites/metajobat');
const pjrankingde = require('./sites/pjrankingde');

const { isEnabled , getRandomInt } = require('./helper');

dotenv.config();

const { proxyurl, proxyenabled, headlessmode } = process.env;

async function getJobs(puppeteer){

  const proxy = proxyenabled === '1' || proxyenabled === 1 ? `--proxy-server=${proxyurl}` : '';
  const slowMo = await getRandomInt(3, 100);
  const headless = headlessmode === '1' || headlessmode === 1 ? true : false;
  
  const browser = await puppeteer.launch(
    {
      headless,
      slowMo: slowMo,
      defaultViewport: null,
      executablePath: require('puppeteer').executablePath(),
      args: ['--disable-web-security', '--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu', '--window-size=1366,768', '--start-maximized', '--start-fullscreen', proxy],
    },
  ).catch((error) => {
      console.log(error)
  });

  const sites = [
  'https://www.indeed.ch/Assistenz%C3%A4rztin-Jobs?sort=date&',
  'https://www.jobscout24.ch/de/jobs/arzt/',
  'https://www.metajob.at/Arzt/%C3%84rztin',
  'https://www.praktischarzt.ch/',
  'https://www.praktischarzt.at/',
  'https://www.praktischarzt.de/',
  'https://www.pj-ranking.de/',

  ]

     const results = await Promise.allSettled(sites.map(async (site) => {
      let output = null;
      switch (true) {
        case (await site.indexOf('www.indeed.ch') !== -1 && await isEnabled('indeed')):
          output = await indeed.scrap(site, browser);
          break;
        case (await site.indexOf('www.jobscout24.ch') !== -1 && await isEnabled('jobscout24')):
          output = await jobscout24.scrap(site, browser);
          break;
        case (await site.indexOf('www.metajob.at') !== -1 && await isEnabled('metajob')):
          output = await metajob.scrap(site, browser);
          break;
        case (await site.indexOf('www.praktischarzt.ch') !== -1 && await isEnabled('praktischarztch')):
          output = await praktischarztch.scrap(site, browser);
          break;
        case (await site.indexOf('www.praktischarzt.at') !== -1 && await isEnabled('praktischarztat')):
          output = await praktischarztat.scrap(site, browser);
          break;
        case (await site.indexOf('www.praktischarzt.de') !== -1 && await isEnabled('praktischarztde')):
          output = await praktischarztde.scrap(site, browser);
          break;
        case (await site.indexOf('www.pj-ranking.de') !== -1 && await isEnabled('pj-rankingde')):
          output = await pjrankingde.scrap(site, browser);
          break;
        default:
          output = null;
      }
     }))

     console.log(`Jobs ran : ${results.length}`);
     console.log(`Job statuses:`)
     for (const result of results) {
      console.log(result.status, ':' , result.reason);
     }

     await browser.close();
    }

    module.exports = {
        getJobs
    }
