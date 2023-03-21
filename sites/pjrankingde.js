const { clean, exportReviews , saveReviews} = require('../helper');

const scrap = async (site, browser) => {

  const countries = [
    { name: "Switzerland", url: "https://www.pj-ranking.de/review/read/?fachrichtung=0&uni_city=0&country=CH&city=0&page=" },
    { name: "Germany", url: "https://www.pj-ranking.de/review/read/?fachrichtung=0&uni_city=0&country=DE&city=0&page=" },
    { name: "Austria", url: "https://pj-ranking.de/review/read/?fachrichtung=0&uni_city=0&country=AT&city=0&page=" },
  ]

  const page = await browser.newPage().catch((error) => {
    logger.log({ level: 'error', message: `${_misc.displaydate()} Failed to open page : ${error}` });
    return false;
  });

  const TIMEOUT = 120000;

  await page.setDefaultNavigationTimeout(TIMEOUT);

  for (const country of countries) {

    const { name, url }  = country;

    await page.goto(url, { waitUntil: 'load', timeout: TIMEOUT });
    await page.waitForTimeout(5000);
  
    const len  = await page.evaluate(() => document.querySelectorAll('ul.hidden-xs > li').length ).catch(() => null);
    const pageCount  = await page.evaluate((len) => { return document.querySelectorAll('ul.hidden-xs > li')[parseInt(len) - 1].innerText},`${len}`).catch(() => null);
  
    if(!pageCount){
      return;
    }
  
    for (let index = 1; index < pageCount - 1; index++) {
      await page.goto(`${url}${index}`, { waitUntil: 'load', timeout: TIMEOUT });
      await page.waitForTimeout(2000);
  
     const links = await page.evaluate(() => Array.from(document.querySelectorAll(`table#review_list > tbody > tr`))
      .map((link) => {
          return {
            url: link.querySelector('td.city > a')?.href ,
            city: link.querySelector('td.city > a')?.innerText,
            departmentName: link.querySelector('td.fachrichtung > a')?.innerText,
            hospital: link.querySelector('td.hospital > a')?.innerText,
            salary: '',
            reviewScore: link.querySelector('td.avg_good > a')?.innerText,
            timePeriod: link.querySelector('td.date > a')?.innerText,
        };
      }));
  
      const result = [];
  
      for (const urlObj of links) {
        const { url , id } = urlObj;
        await page.goto(url, { waitUntil: 'load', timeout: TIMEOUT });
        await page.waitForTimeout(2000);
        const reviewResult = await getPageData(page, urlObj, name);
        await result.push(reviewResult);
        await saveReviews('reviews',result)
        await exportReviews();
      }
  
    }
    
  }

  return true;

};

const getPageData = async (page, data, country) => {

  const { city, departmentName, hospital, reviewScore, timePeriod } = data;

  const foundReview = {
    country,
    city,
    departmentName,
    reviewId: await page.url().split('/')[5],
    hospital,
    salary: await getSalary(page),
    reviewScore,
    timePeriod,
    reviewText: clean( await page.evaluate(() => document.querySelector('div.well dd[itemprop="reviewBody"]').innerText ).catch(() => null))
  }
  
  return foundReview

}

const getSalary = async (page) => {
 
 const amount = await page.evaluate(()=> {
  const phrase = 'Gehalt in EUR';
  const headers =  document.querySelectorAll('div.well > dl.dl-horizontal > dt');

  let i = 0;
  let found = false;
  let salary;
  for (const h of headers) {
    if(h.innerText === phrase){
      salary =  document.querySelectorAll('div.well > dl.dl-horizontal > dd')[i].innerText;
      found = true;
      break;
    }else {
      i = i + 1;
    }
  }

  if(found){
    return salary;
  }else{
    return null;
  }

 })

 return amount;
}

module.exports = { scrap };
