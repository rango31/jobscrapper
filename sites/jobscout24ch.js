const { getEmails, getPhoneNumbers } = require('../helper');

const scrap = async (site, browser) => {

  const page = await browser.newPage().catch((error) => {
    logger.log({ level: 'error', message: `${_misc.displaydate()} Failed to open page : ${error}` });
    return false;
  });

  /*
  job types 
  100%
  Part-time
  Fixed term
  */

  const TIMEOUT = 120000;

    await page.setDefaultNavigationTimeout(TIMEOUT);

    await page.goto(site, { waitUntil: 'load', timeout: TIMEOUT });
    await page.waitForTimeout(2000);

    await page.click('div#cookie-consent-overview div.modal-footer > button.cookie-accept-all.orange');

    //paginate

   let lastpage = false;
    
   while(!lastpage){
      const jobs = await page.$$('div.jobs-list > ul > li.job-list-item');
      const batch =[];

      for (const job of jobs) {
        
        await job.click('div.upper-line > a');
        let jobDetails = await page.$$('article.job-details');//await page.evaluate(() => document.querySelector('div.jobsearch-RightPane')).catch(() => null);
        jobDetails = jobDetails[0];
        await page.waitForTimeout(5000);

        const body = await jobDetails.evaluate(() => document.querySelector('div#jobDescriptionText').innerText).catch(() => null);
        const bodyHtml = await jobDetails.evaluate(() => document.querySelector('div#jobDescriptionText').innerHTML).catch(() => null);
        const address = await jobDetails.evaluate(() => (document.querySelector('div.jobsearch-CompanyInfoContainer').innerText)).catch(() => null);
       
        const foundJob = {
          source:'jobscout24.ch',
          originUrl:await page.url(),
          title: await jobDetails.evaluate(() => document.querySelector('div.company-info > h2.company-title').innerText).catch(() => null),
          body,
          publishedBy:'',
          salary:'',
          position:'',
          positionType:'',
          images:'',
          jobId:await job.evaluate(() => document.querySelector('h2 > a').id).catch(() => null),
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
          companyName:await job.evaluate(() => document.querySelector('span.companyName').innerText).catch(() => null),
          companyWorkingHour:'',
          companyLogo:await jobDetails.evaluate(() => document.querySelector('img').src).catch(() => null),
          jobPostRawHtml:bodyHtml,
        }
        console.log(foundJob);

        await batch.push(foundJob);
      }

      //savetodb

      await page.waitForTimeout(2000);
      let next = await page.$$('div.pages a');

      if(next){
        try{
        next = next[0];
        await next.click();
        // await page.click('button.icl-CloseButton.icl-Modal-closeh').catch(()=>{});
        }catch(ex){
          lastpage = true;
        }
      }else{
        lastpage = true;
      }
  }




    console.log(foundjobs);
   
};

module.exports = { scrap };