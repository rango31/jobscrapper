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
    console.log(`Started scrapping new Metajob page`);
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
        lastpage = true;
      }
    }else{
      lastpage = true;
    }
}

console.log(`Completed scrapping Metajob`);
return true;
  

}

const getId = (url) => {
  const id = url.replace('https://www.metajob.at/dres/jc?p=','');
  return id
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
    positionType:await JSON.stringify(await getPositionTypes(clean(body) + await jobDetails.evaluate(() => document.querySelector('h2.jdet-title').innerText).catch(() => null))),
    images:'[]',
    jobId:await getId(await jobDetails.evaluate(() => document.querySelector('h2.jdet-title > a').href).catch(() => null)),
    benefits:'',
    publishedDate:await page.evaluate(() => document.querySelector('div.jdet-source tbody > tr:nth-child(3) > td:nth-child(2)').innerText).catch(() => null),
    status:'',
    location:await JSON.stringify({
      city: address,
      address:'',
      country:'',
      zipcode:'',
      state:'',
      raw:await jobDetails.evaluate(() => (document.querySelector('div.job-loc')).innerHTML).catch(() => null)
    }),
    phoneNumber: await JSON.stringify( await getPhoneNumbers(body) ? await getPhoneNumbers(body) : []),
    replyEmail: await JSON.stringify( await getEmails(body) ? await getEmails(body) : []),
    responsibilities:'',
    companyName:await page.evaluate(() => document.querySelector('span.resultDom').innerText).catch(() => null),
    companyWorkingHour:'',
    companyLogo: clean(await page.evaluate(el => window.getComputedStyle(el).backgroundImage, await page.$('div.resultVP div.jdet-jobhead0 > div.jdet-logo'))).match(/url\("(.*)"/)[1],
    jobPostRawHtml:bodyHtml,
  }
  
  return foundJob

}

module.exports = { scrap };
