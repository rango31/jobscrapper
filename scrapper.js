
const dotenv = require('dotenv');

const indeed = require('./sites/indeedch');
const jobscout24 = require('./sites/jobscout24ch');
const praktischarzt = require('./sites/praktischarztch');
const metajob = require('./sites/metajobat');

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
  //'https://www.indeed.ch/Assistenz%C3%A4rztin-Jobs',
  'https://www.jobscout24.ch/de/jobs/arzt/',
  //'https://www.metajob.at/Arzt/%C3%84rztin',
  //'https://www.praktischarzt.ch/assistenzarzt/?job_category=0&job_location&radius=200/1/s'
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
        case (await site.indexOf('www.praktischarzt.ch') !== -1 && await isEnabled('praktischarzt')):
          output = await praktischarzt.scrap(site, browser);
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
