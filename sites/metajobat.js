const { getEmails, getPhoneNumbers, exportToJson, bulkinsert, getPositionTypes, getImages , clean} = require('../helper');

const scrap = async (site, browser) => {

  const page = await browser.newPage().catch((error) => {
    logger.log({ level: 'error', message: `${_misc.displaydate()} Failed to open page : ${error}` });
    return false;
  });

  const TIMEOUT = 120000;

  await page.setDefaultNavigationTimeout(TIMEOUT);
  await page.goto(site, { waitUntil: 'load', timeout: TIMEOUT });
  await page.waitForTimeout(5000);
  await page.evaluate(() => document.querySelector('div.joblist > div.job > div.job-text-div > div.rCmdButtons > a:nth-child(1)').setAttribute("style","display:block"));

  let showmore = await page.$('div.joblist > div.job > div.job-text-div > div.rCmdButtons > a:nth-child(1)');
  await showmore.click();
  await page.waitForTimeout(3000);

 
  let lastpage = false;
    
  while(!lastpage){

    const result = [];
    const res = await getPageData(page);
    await result.push(res);
    await bulkinsert('jobs',result);
    await exportToJson();

    await page.hover('div.resultVP div.jdet-scr-r');
     const next = await page.$('div.resultVP div.jdet-scr-r');

    if(next){
      try{
      await next.click();
      }catch(ex){
        console.log(ex)
        page.waitForTimeout(60000)
        lastpage = true;
      }
    }else{
      lastpage = true;
    }
}
  

}

const getPageData = async (page) => {
  let jobDetails = await page.$('div.resultVP');
  await page.waitForTimeout(5000);

  const body = await jobDetails.evaluate(() => document.querySelector('div.resultVP div.gwt-HTML > div.mlfm').innerText).catch(() => null);
  const bodyHtml = await jobDetails.evaluate(() => document.querySelector('div.resultVP div.gwt-HTML > div.mlfm').innerHTML).catch(() => null);
  const address = await jobDetails.evaluate(() => (document.querySelector('div.job-loc').innerText)).catch(() => null);
 
  const foundJob = {
    source:'metajob.at',
    originUrl:await page.url(),
    title: await jobDetails.evaluate(() => document.querySelector('h2.jdet-title').innerText).catch(() => null),
    body: clean(body),
    publishedBy:'',
    salary:await jobDetails.evaluate(() => document.querySelector('div.job-salary').innerText).catch(() => null),
    position:'',
    positionType:await getPositionTypes(clean(body)),
    images:await getImages(page,'div.resultVP'),
    jobId:await page.evaluate(() => document.querySelector('h2 > a').id).catch(() => null),
    benefits:'',
    publishedDate:'',
    status:'',
    location:{
      city: address,
      address:'',
      country:'',
      zipcode:'',
      state:'',
      raw:await jobDetails.evaluate(() => (document.querySelector('div.job-loc')).innerHTML).catch(() => null)
    },
    phoneNumber: getPhoneNumbers(body) ? getPhoneNumbers(body) : [],
    replyEmail: getEmails(body) ? getEmails(body) : [],
    responsibilities:'',
    companyName:await page.evaluate(() => document.querySelector('span.resultDom').innerText).catch(() => null),
    companyWorkingHour:'',
    companyLogo:await jobDetails.evaluate(() => document.querySelector('img').src).catch(() => null),
    jobPostRawHtml:bodyHtml,
  }
  
  return foundJob

}

module.exports = { scrap };
