const { getEmails, getPhoneNumbers, bulkinsert, getPositionTypes, getImages, getList, clean, authenticateproxy, exportToJson, reverseTimeAgo } = require('../helper');

const scrap = async (site, browser) => {
  console.log(`Started scrapping Indeed`);
  const page = await browser.newPage().catch((error) => {
    logger.log({ level: 'error', message: `${_misc.displaydate()} Failed to open page : ${error}` });
    return false;
  });

  const TIMEOUT = 120000;
  await page.setDefaultNavigationTimeout(TIMEOUT);
  await authenticateproxy(page);
  await page.goto(site, { waitUntil: 'load', timeout: TIMEOUT });
  await page.waitForTimeout(5000);
  await page.click('button#onetrust-accept-btn-handler');

  let enabled = true;
  let links = [];

  console.log(`Getting indeed job links...`);
  while(enabled){

    const newlinks = await page.evaluate(() => Array.from(document.querySelectorAll(`ul.jobsearch-ResultsList > li div.job_seen_beacon`))
    .map((link) => {
      return {
        url:  link.querySelector('h2.jobTitle > a').href,
        id: link.querySelector('h2.jobTitle > a').id.replace('job_',''),
    };
    }));

    links = await links.concat(newlinks);

    await page.click('div > a[data-testid="pagination-page-next"]').catch((ex)=>{
      enabled = false;
    })

    await page.waitForTimeout(3000);
  }
  console.log(`Got all indeed job links..., getting job`);
 
  const result = [];
 
  for (const urlObj of links) {
    const { url , id } = urlObj;
    console.log(`Getting indeed jobdata from ${url}`);
    await page.goto(url, { waitUntil: 'load', timeout: TIMEOUT });
    await page.waitForTimeout(2000);
    const jobResult = await getPageData(page, urlObj);
    await result.push(jobResult);
    await bulkinsert('jobs',result);
  }

  console.log(`Completed scrapping Indeed, exporting data to JSON.`);

  await exportToJson();
  await page.close();

  return true;
   
};

const getPageData = async (page, data) => {

  const { url , id } = data;
  const jobDetails = await page.$('div.jobsearch-ViewJobLayout-content.jobsearch-ViewJobLayout-mainContent');
  const address = await page.evaluate(() => (document.querySelector('div.jobsearch-CompanyInfoWithoutHeaderImage.jobsearch-CompanyInfoEji > div > div > div:nth-child(2)').innerText)).catch(() => null);

  let body = await page.evaluate(() => document.querySelector('div.jobsearch-jobDescriptionText')?.innerText).catch(() => null);
  let bodyHtml = await page.evaluate(() => document.querySelector('div.jobsearch-jobDescriptionText')?.innerHTML).catch(() => null);

  const foundJob = {
    source:'indeed.ch',
    originUrl:url,
    title: await jobDetails.evaluate(() => document.querySelector('div.jobsearch-JobInfoHeader-title-container').innerText).catch(() => null),
    body:await clean(body),
    publishedBy: await page.evaluate(() => document.querySelector('div[data-company-name="true"]')?.innerText).catch(() => null),
    salary:'',
    position: await jobDetails.evaluate(() => document.querySelector('div.jobsearch-JobInfoHeader-title-container').innerText).catch(() => null),
    positionType: await JSON.stringify(await getPositionTypes(body +  await jobDetails.evaluate(() => document.querySelector('div.jobsearch-JobInfoHeader-title-container').innerText).catch(() => null))),
    images: await JSON.stringify(await getImages(page,'div.jobsearch-ViewJobLayout-content.jobsearch-ViewJobLayout-mainContent')),
    jobId: id,
    benefits:'',
    publishedDate: await reverseTimeAgo(await page.evaluate(() => document.querySelector('ul > li > span:nth-child(2)')?.innerText.replace('Posted ','')).catch(() => null)), 
    status:'',
    location: await JSON.stringify({
      city: '',
      address,
      country:'',
      zipcode:'',
      state:'',
      raw: await page.evaluate(() => (document.querySelector('div.jobsearch-CompanyInfoWithoutHeaderImage.jobsearch-CompanyInfoEji > div > div > div:nth-child(2)'))?.innerHTML).catch(() => null)
    }),
    phoneNumber: await JSON.stringify( await getPhoneNumbers(body) ? await getPhoneNumbers(body) : []),
    replyEmail: await JSON.stringify( await getEmails(body) ? getEmails(body) : '[]'),
    responsibilities:'[]',
    companyName:await page.evaluate(() => document.querySelector('div[data-company-name="true"]').innerText).catch(() => null),
    companyWorkingHour:'',
    companyLogo:await page.evaluate(() => document.querySelector('img.jobsearch-JobInfoHeader-logo')?.src).catch(() => null),
    jobPostRawHtml:bodyHtml,
  }
  
  return foundJob

}

module.exports = { scrap };
