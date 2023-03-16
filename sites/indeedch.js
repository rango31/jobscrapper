const { getEmails, getPhoneNumbers, bulkinsert, getPositionTypes, getImages, getList, clean, authenticateproxy } = require('../helper');

const scrap = async (site, browser) => {
  const page = await browser.newPage().catch((error) => {
    logger.log({ level: 'error', message: `${_misc.displaydate()} Failed to open page : ${error}` });
    return false;
  });

  const TIMEOUT = 120000;
  await page.setDefaultNavigationTimeout(TIMEOUT);
  await authenticateproxy(page);
  await page.goto(site, { waitUntil: 'load', timeout: TIMEOUT });
  await page.waitForTimeout(500000);
  await page.click('button#onetrust-accept-btn-handler');

   let lastpage = false;
    
   while(!lastpage){
      const jobs = await page.$$('ul.jobsearch-ResultsList > li div.job_seen_beacon');
      const batch =[];

      for (const job of jobs) {
        try{
          await job.click('h2.jobTitle').catch(()=> {
            console.log('---');
          });
          let jobDetails = await page.$$('div.jobsearch-RightPane');//await page.evaluate(() => document.querySelector('div.jobsearch-RightPane')).catch(() => null);
          jobDetails = jobDetails[0];
          await page.waitForTimeout(5000);

          const body = await jobDetails.evaluate(() => document.querySelector('div#jobDescriptionText').innerText).catch(() => null);
          const bodyHtml = await jobDetails.evaluate(() => document.querySelector('div#jobDescriptionText').innerHTML).catch(() => null);
          const address = await jobDetails.evaluate(() => (document.querySelector('div.jobsearch-CompanyInfoContainer').innerText).split('\n')[2]).catch(() => null);
        
          const foundJob = {
            source:'indeed.ch',
            originUrl:await page.url(),
            title: await job.evaluate(() => document.querySelector('h2.jobTitle').innerText).catch(() => null),
            body: clean(body),
            publishedBy:'',
            salary:'',
            position:'',
            positionType:await getPositionTypes(await jobDetails.evaluate(() => (document.querySelector('div#salaryInfoAndJobType').innerText)).catch(() => null)),
            images:await getImages(page,'div.jobsearch-RightPane'),
            jobId:await job.evaluate(() => document.querySelector('h2 > a').id).catch(() => null),
            benefits:'',
            publishedDate:'',
            status:'',
            location:{
              city: address?.split(',')[0],
              address:'',
              country:'',
              zipcode:'',
              state:address?.split(',')[1],
              raw:await jobDetails.evaluate(() => (document.querySelector('div.jobsearch-CompanyInfoContainer').innerHTML)).catch(() => null)
            },
            phoneNumber: getPhoneNumbers(body) ? getPhoneNumbers(body) : [],
            replyEmail: getEmails(body) ? getEmails(body) : [],
            responsibilities:'',
            companyName:await job.evaluate(() => document.querySelector('span.companyName').innerText).catch(() => null),
            companyWorkingHour:'',
            companyLogo:await jobDetails.evaluate(() => document.querySelector('img').src).catch(() => null),
            jobPostRawHtml:bodyHtml,
          }
          console.log(foundJob.jobId);

          await batch.push(foundJob);
          await bulkinsert('jobs',batch);
      }catch(ex){
         console.log(ex)
      }
      }

      //savetodb

      await page.waitForTimeout(2000);
      let next = await page.$$('div > a[data-testid="pagination-page-next"]');

      if(next){
        try{
        next = next[0];
        await next.click();
        await page.click('button.icl-CloseButton.icl-Modal-closeh').catch(()=>{});
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
