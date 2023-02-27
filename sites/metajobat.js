const { getEmails, getPhoneNumbers } = require('../helper');

const scrap = async (site, browser) => {

  const page = await browser.newPage().catch((error) => {
    logger.log({ level: 'error', message: `${_misc.displaydate()} Failed to open page : ${error}` });
    return false;
  });

  const TIMEOUT = 120000;

  await page.setDefaultNavigationTimeout(TIMEOUT);
  await page.goto(site, { waitUntil: 'load', timeout: TIMEOUT });
  await page.waitForTimeout(5000);

  let showmore = await page.$$('div.joblist > div.job > div.job-text-div > div.rCmdButtons > a');//await page.evaluate(() => document.querySelector('div.jobsearch-RightPane')).catch(() => null);
  showmore = showmore[0];

  console.log(showmore);
  await showmore.setAttribute("style","display:block");

  await showmore.click();

}

const getPageData = async (page) => {
  let jobDetails = await page.$$('article.job-details');//await page.evaluate(() => document.querySelector('div.jobsearch-RightPane')).catch(() => null);
  jobDetails = jobDetails[0];
  await page.waitForTimeout(5000);

  const body = await jobDetails.evaluate(() => document.querySelector('div#jobDescriptionText').innerText).catch(() => null);
  const bodyHtml = await jobDetails.evaluate(() => document.querySelector('div#jobDescriptionText').innerHTML).catch(() => null);
  const address = await jobDetails.evaluate(() => (document.querySelector('div.jobsearch-CompanyInfoContainer').innerText)).catch(() => null);
 
  const foundJob = {
    source:'metajob.at',
    originUrl:await page.url(),
    title: await jobDetails.evaluate(() => document.querySelector('div.company-info > h2.company-title').innerText).catch(() => null),
    body,
    publishedBy:'',
    salary:'',
    position:'',
    positionType:'',
    images:'',
    jobId:await page.evaluate(() => document.querySelector('h2 > a').id).catch(() => null),
    benefits:'',
    publishedDate:'',
    status:'',
    location:{
      city: address,
      address:'',
      country:'',
      zipcode:'',
      state:address,
      raw:await jobDetails.evaluate(() => (document.querySelector('div.jobsearch-CompanyInfoContainer')).innerHTML).catch(() => null)
    },
    phoneNumber: getPhoneNumbers(body) ? getPhoneNumbers(body) : [],
    replyEmail: getEmails(body) ? getEmails(body) : [],
    responsibilities:'',
    companyName:await page.evaluate(() => document.querySelector('span.companyName').innerText).catch(() => null),
    companyWorkingHour:'',
    companyLogo:await jobDetails.evaluate(() => document.querySelector('img').src).catch(() => null),
    jobPostRawHtml:bodyHtml,
  }
  
  return foundJob

}

module.exports = { scrap };
