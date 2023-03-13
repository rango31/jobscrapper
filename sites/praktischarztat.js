const { getEmails, getPhoneNumbers , clean, getImages, getPositionTypes, exportToJson , bulkinsert} = require('../helper');

const scrap = async (site, browser) => {

  const keyWords = ['assistenzarzt','famulatur','praktisches-jahr']

  const page = await browser.newPage().catch((error) => {
    logger.log({ level: 'error', message: `${_misc.displaydate()} Failed to open page : ${error}` });
    return false;
  });

  const TIMEOUT = 120000;

  await page.setDefaultNavigationTimeout(TIMEOUT);

  for (const word of keyWords) {

    site = `https://www.praktischarzt.de/${word}/?job_category=0&job_location&radius=200/1/`

    await page.goto(site, { waitUntil: 'load', timeout: TIMEOUT });
    await page.waitForTimeout(5000);
    await page.click('button#CybotCookiebotDialogBodyLevelButtonLevelOptinAllowAll').catch(()=>{});
  
    const len  = await page.evaluate(() => document.querySelectorAll('a.page-numbers:not(.next)').length ).catch(() => null);
    const pageCount  = await page.evaluate((len) => { return document.querySelectorAll('a.page-numbers:not(.next)')[parseInt(len) - 1].innerText},`${len}`).catch(() => null);
  
    if(!pageCount){
      return;
    }
  
    for (let index = 1; index < pageCount - 1; index++) {
      await page.goto(`https://www.praktischarzt.at/${word}/?job_category=0&job_location&radius=200/${index}/`, { waitUntil: 'load', timeout: TIMEOUT });
      await page.waitForTimeout(2000);
  
     const links = await page.evaluate(() => Array.from(document.querySelectorAll(`div.box-job`))
     .map((link) => {
       return {
         url: link.querySelector('a.title.title-link:not(.mobile_show)') ? link.querySelector('a.title.title-link:not(.mobile_show)').href : null,
         id: link.id,
     };
     }));
  
      const result = [];
  
      for (const urlObj of links) {
        const { url , id} = urlObj;
        await page.goto(url, { waitUntil: 'load', timeout: TIMEOUT });
        await page.waitForTimeout(2000);
        const jobResult = await getPageData(page, id);
        await result.push(jobResult);
        await bulkinsert('jobs',result);
        await exportToJson();
      }
  
    }
    
  }

  return true;

};

const getPageData = async (page, id) => {
  let jobDetails = await page.$$('div#single-job');
  jobDetails = jobDetails[0];
  //await page.waitForTimeout(5000);

  const body = await jobDetails.evaluate(() => document.querySelector('div:nth-child(6)').innerText).catch(() => null);
  const bodyHtml = await jobDetails.evaluate(() => document.querySelector('div:nth-child(6)').innerHTML).catch(() => null);
  const address = await jobDetails.evaluate(() => (document.querySelector('input[name="jobFullLocation"]').value)).catch(() => null);
 
  const foundJob = {
    source:'praktischarzt.at',
    originUrl:await page.url(),
    title: await jobDetails.evaluate(() => document.querySelector('h1#job_title').innerText).catch(() => null),
    body:await clean(body),
    publishedBy:await page.evaluate(() => document.querySelector('div.company-name').innerText).catch(() => null),
    salary:'',
    position:'',
    positionType:await getPositionTypes(await jobDetails.evaluate(() => (document.querySelector('div.clock.desktop').innerText)).catch(() => null)),
    images:await getImages(page,'div#single-job'),
    jobId: await id.replace('job-',''),
    benefits:'',
    publishedDate:'',
    status:'',
    location:{
      city: '',
      address,
      country:'',
      zipcode:'',
      state:'',
      raw:await jobDetails.evaluate(() => (document.querySelector('input[name="jobFullLocation"]')).innerHTML).catch(() => null)
    },
    phoneNumber: getPhoneNumbers(body) ? getPhoneNumbers(body) : [],
    replyEmail: getEmails(body) ? getEmails(body) : [],
    responsibilities:'',
    companyName:await page.evaluate(() => document.querySelector('div.company-name').innerText).catch(() => null),
    companyWorkingHour:'',
    companyLogo:'',
    jobPostRawHtml:bodyHtml,
  }
  
  return foundJob

}

module.exports = { scrap };
