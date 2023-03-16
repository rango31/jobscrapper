const { getEmails, getPhoneNumbers , clean, getImages, getPositionTypes, exportToJson , bulkinsert, getFrame} = require('../helper');

const scrap = async (site, browser) => {

  const keyWords = ['assistenzarzt','famulatur','praktisches-jahr']

  const page = await browser.newPage().catch((error) => {
    logger.log({ level: 'error', message: `${_misc.displaydate()} Failed to open page : ${error}` });
    return false;
  });

  const TIMEOUT = 120000;

  await page.setDefaultNavigationTimeout(TIMEOUT);

  for (const word of keyWords) {

    site = `https://www.praktischarzt.at/${word}/?job_category=0&job_location&radius=200/1/`

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
         logo: link.querySelector('div.logostartseite > a > img') ? link.querySelector('div.logostartseite > a > img').src : null,
         date: link.querySelector('div.employer-address') ? link.querySelector('div.employer-address').innerText?.slice(0, 10) : null,
         responsibilities: link.querySelector('div.employer-job-cat') ? link.querySelector('div.employer-job-cat').innerText.split(',') : null,
         id: link.id,
     };
     }));
  
      const result = [];
  
      for (const urlObj of links) {
        const { url , id } = urlObj;
        await page.goto(url, { waitUntil: 'load', timeout: TIMEOUT });
        await page.waitForTimeout(2000);
        const jobResult = await getPageData(page, urlObj);
        await result.push(jobResult);
        await bulkinsert('jobs',result);
        await exportToJson();
      }
  
    }
    
  }

  return true;

};

const getPageData = async (page, data) => {

  const { url , id, logo, responsibilities, date } = data;
  const jobDetails = await page.$('div#single-job');
  const address = await jobDetails.evaluate(() => (document.querySelector('input[name="jobFullLocation"]').value)).catch(() => null);

  const frameHandle = await page.$("iframe[id='calcheight']");
  let frame;

  try{
    frame = await frameHandle.contentFrame();
  }catch(ex){
    frame = page;
  }

  let body = await frame.evaluate(() => document.querySelector('body').innerText).catch(() => null);
  let bodyHtml = await frame.evaluate(() => document.querySelector('body').innerHTML).catch(() => null);


  const foundJob = {
    source:'praktischarzt.at',
    originUrl:url,
    title: await jobDetails.evaluate(() => document.querySelector('h1#job_title').innerText).catch(() => null),
    body:await clean(body),
    publishedBy:await page.evaluate(() => document.querySelector('div.company-name').innerText).catch(() => null),
    salary:'',
    position:'',
    positionType:await getPositionTypes(body),
    images:await getImages(frame,'body'),
    jobId: await id.replace('job-',''),
    benefits:'',
    publishedDate: date, 
    status:'',
    location:{
      city: '',
      address,
      country:'',
      zipcode:'',
      state:'',
      raw:await jobDetails.evaluate(() => (document.querySelector('div.job-local'))?.innerHTML).catch(() => null)
    },
    phoneNumber: getPhoneNumbers(body) ? getPhoneNumbers(body) : [],
    replyEmail: getEmails(body) ? getEmails(body) : [],
    responsibilities,
    companyName:await page.evaluate(() => document.querySelector('div.company-name').innerText).catch(() => null),
    companyWorkingHour:'',
    companyLogo:logo,
    jobPostRawHtml:bodyHtml,
  }

  page.waitForTimeout(50000);
  
  return foundJob

}

module.exports = { scrap };
