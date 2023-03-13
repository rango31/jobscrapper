const { getEmails, getPhoneNumbers, bulkinsert , getImages, clean , getList, getPositionTypes} = require('../helper');

const scrap = async (site, browser) => {

  const TIMEOUT = 120000;
  const page = await browser.newPage();
  await page.setDefaultNavigationTimeout(TIMEOUT);
  await page.goto(site, { waitUntil: 'load', timeout: TIMEOUT });
  await page.waitForTimeout(1000);
  await page.click('div#cookie-consent-overview div.modal-footer > button.cookie-accept-all.orange');

  let lastpage = false;
    
  while(!lastpage){
    const jobs = await page.$$('div.jobs-list > ul > li.job-list-item');
    const batch =[];

    for (const job of jobs) {
      
      await job.click('div.upper-line > a');
      let jobDetails = await page.$$('article.job-details');//await page.evaluate(() => document.querySelector('div.jobsearch-RightPane')).catch(() => null);
      jobDetails = jobDetails[0];
      await page.waitForTimeout(5000);

      const body = await jobDetails.evaluate(() => document.querySelector('article.job-details > div.job-details-bottom').innerText).catch(() => null);
      const bodyHtml = await jobDetails.evaluate(() => document.querySelector('article.job-details > div.job-details-bottom').innerHTML).catch(() => null);
      const address = await jobDetails.evaluate(() => (document.querySelector('div.job-details-bottom address > p').innerText)).catch(() => null);
      
      const foundJob = {
        source:'jobscout24.ch',
        originUrl:await page.url(),
        title: await jobDetails.evaluate(() => document.querySelector('div.company-info > h2.company-title').innerText).catch(() => null),
        body: clean(body),
        publishedBy:'',
        salary:'',
        position:'',
        positionType : await getPositionTypes(await jobDetails.evaluate(() => (document.querySelector('div.job-details-top div.property-tags > span:nth-child(2)').innerText)).catch(() => null)),
        images: await getImages(page,'article.job-details'),
        jobId:await job.evaluate(() => document.querySelector('section.main-right article.job-details').getAttribute('data-job-id')).catch(() => null),
        benefits:'',
        publishedDate:await jobDetails.evaluate(() => document.querySelector('div.job-details-top > div.job-details-action-bar > div > span:nth-child(1)').innerText).catch(() => null),
        status:'',
        location:{
          city: '',
          address,
          country:'',
          zipcode:'',
          state:'',
          raw:await jobDetails.evaluate(() => (document.querySelector('div.job-details-bottom address > p')).innerHTML).catch(() => null)
        },
        phoneNumber: getPhoneNumbers(body) ? getPhoneNumbers(body) : [],
        replyEmail: getEmails(body) ? getEmails(body) : [],
        responsibilities:[],
        companyName:await job.evaluate(() => document.querySelector('div.job-details-top > div.company-info > h2 > a').title).catch(() => null),
        companyWorkingHour:'',
        companyLogo:await jobDetails.evaluate(() => document.querySelector('div.job-details-bottom div.slim_picture > img').src).catch(() => null),
        jobPostRawHtml:bodyHtml,
      }
      console.log(foundJob);

      await batch.push(foundJob);
      await bulkinsert('jobs',batch);
    }

    await page.waitForTimeout(2000);
    let next = await page.$$('div.pages a');

    if(next){
      try{
        next = next[0];
        await next.click();
      }catch(ex){
        lastpage = true;
      }
    }else{
      lastpage = true;
    }
  }

  return true;
   
};

module.exports = { scrap };
