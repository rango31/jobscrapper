/* eslint-disable max-len */
/* eslint-disable import/extensions */
const fs = require('fs');
const UserAgent = require('user-agents');
const crypto = require('crypto');
const moment = require('moment');
const dotenv = require('dotenv');
const tr = require('timeago-reverse');

dotenv.config();

const {
  enabledsites,
} = process.env;

const clean = (phrase) => phrase = phrase?.replace(/\n/g, '');

const hash = (data) => crypto.createHash('sha256').update(data).digest('base64');

const formatDate = (date, title) => {
  const formats = {

  };

  const format = formats[title] ? formats[title] : 'DD/MM/YYYY';

  return moment(date, format).format('YYYY-MM-DD');
};

const isEnabled = async (site) => {

  if (enabledsites.indexOf(site) !== -1) {
    return true;
  }
  
  return false;
};

function getFrame(page, name) {
  let frame = page.mainFrame();
  for (let child of frame.childFrames()) {
    let ret = strncmp(name, child.id(), name.length);
    if(ret === true) {
      return child;
    }
  }
}

const reverseTimeAgo = (text) => {
  const myDate = tr.parse(text);
  const d =  moment(myDate).format('DD/MM/YYYY');
  return d;
}

getEmails = (text) => {
  try{
  var emailReg = /([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/;
  let emails = text.match(emailReg)?.map(function(s){
    return s.trim();
  });

  emails = [...new Set(emails)];

  return emails;
}catch(ex){
  return [];
}
}

getPhoneNumbers = (text) => {
  try{
  var phoneReg = /(?:[-+() ]*\d){10,13}/gm; 
  const res = text.match(phoneReg)?.map(function(s){
    return s.trim();
  });

  res = [...new Set(res)];

  return res;
}catch(ex){
   return [];
}
}

getMoney = (text) => {
  try{
  var moneyReg = /\d+(?:\.\d{2})?(?:€|[$])/gm
  const res = text.match(moneyReg)?.map(function(s){
    return s.trim();
  });

  res = [...new Set(res)];

  return res;
}catch(ex){
   return [];
}
}

const setRandomUserAgent = (page) => {
    const userAgent = new UserAgent();
    page.setUserAgent(userAgent.data.userAgent);
  };

const now = () => (new Date()).getTime();

const getValidJobs = async (jobs, site) => {
    const validjobs = await jobs.filter((item) => item.name !== 'no' && item.date !== 'no' && item.rating !== 'no');
    validjobs.length > 0 ? null : logger.log({ level: 'error', message: `${displaydate()} Found 0 jobs from this link, ${site}. Please check it` });
  
    return validreviews;
  };
  
const authenticateproxy = async (page) => {
    await page.authenticate({
      username: ``,
      password: ``,
    });
  };

const displaydate = () => moment().format('DD/MM/YYYY-HH:mm:ss');

const findAndSolveCaptcha = async (page) => {
    try {
      const result = await page.solveRecaptchas();
      let isSolved = false;
  
      try {
        isSolved = result.solved[0].isSolved;
      } catch (ex) {
        // console.log(ex);
        isSolved = false;
      }
  
      return isSolved;
    } catch (ex) {
      console.log(ex);
    }
  
    return null;
  };

async function scrollDown(page, ele) {
    await page.$eval(ele, (e) => {
      e.scrollIntoView({ behavior: 'smooth', block: 'end', inline: 'end' });
    }).catch((ex) => {});
  }

const randomString = (length) => {
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random()
  * charactersLength));
    }
    return result;
  };

const getRandomInt = (min, max) => {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

const bulkinsert = async (table, data) => {
  try{
  await knex(table)
  .insert(data)
  .onConflict([
    'jobId'
  ])
  .merge();
}catch(ex){
console.log(ex);
}
}

const exportToJson = async () => {

  const jobs = await knex('jobs').catch((ex) => {});

    fs.writeFile('jobs.json', JSON.stringify(jobs, null, 4), function(err) {
      if(err) {
        console.log(err);
      } 
  }); 
}

const exportReviews  = async () => {
  const reviews = await knex('reviews').catch((ex) => {});

  fs.writeFile('reviews.json', JSON.stringify(reviews, null, 4), function(err) {
    if(err) {
      console.log(err);
    } 
}); 
}

const saveReviews  = async (table, data) => {
  try{
      await knex(table)
      .insert(data)
      .onConflict([
        'reviewId'
      ])
      .merge();
  }catch(ex){
     console.log(ex);
  }
}

const getList = async (page, container, elements, type) => {

  const elementsE = await page.evaluate((container, elements, type) => Array.from(document.querySelectorAll(container))
    .map((review) => ({
      ele: review.querySelector(elements) ? review.querySelector(elements)[type] : null,
    })), container, elements, type);

    console.log(elementsE);
}

const getImages = async (page, smallPage) => {
  try{
    const final = [];
    const images = await page.evaluate((smallPage) => Array.from(document.querySelectorAll(smallPage))
    .map((review) => ({
      img: review.querySelector('img') ? review.querySelector('img').src : null,
    })), smallPage);

    await images.forEach(img => {
      final.push(img.img);
    });

    return final
  }catch(ex){
    console.log(ex);
    return [];
  }

}

const getPositionTypes = async (text) => {
  
    let types = [];

    try{
        var percentReg = /\b\d+\s?(?:%|percent\b)/g;
        let percentages = await text.match(percentReg)?.map(function(s){
          return s.trim();
        });

        for (const p of percentages) {
          let pNumber = p.replace('%','');
          pNumber = p.replace('percent','');
          pNumber = await parseFloat(pNumber)

          if(pNumber < 100){
            types.push('Part-Time')
          }else if(pNumber === 100){
            types.push('Full-Time')
          }

        }
    }catch(ex){
      types = [];
    }

    try{
      var percentReg2 = /\d\s?\d.*-.*10\s?\d\s?%/gm;
      let percentages2 = await text.match(percentReg2)?.map(function(s){
        return s.trim();
      });

      if(percentages2){
        if(percentages2[0].includes('100%')){
          types.push('Full-Time')
          types.push('Part-Time')
        }else{
          types.push('Part-Time')
        }
      }

  }catch(ex){
    types = [];
  }

    text = await text.toLowerCase();

      if(text.includes('parttime') || text.includes('part-time' || text.includes('part time'))){
        types.push('Part-Time')
      }else if(text.includes('fulltime') || text.includes('full-time' || text.includes('full time'))){
        types.push('Full-Time')
      }else if(text.includes('fixedterm') || text.includes('fixed-term' || text.includes('fixed term'))){
        types.push('Fixed-Term')
      }

      types = [...new Set(types)];

      return types;
}

const shuffle = async (array) => {
  let currentIndex = array.length;
  let randomIndex;

  // While there remain elements to shuffle...
  while (currentIndex !== 0) {
    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    // And swap it with the current element.
    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex], array[currentIndex]];
  }

  return array;
};

module.exports = {
    bulkinsert,
    getRandomInt,
    clean,
    hash,
    formatDate,
    setRandomUserAgent,
    now,
    getValidJobs,
    authenticateproxy,
    displaydate,
    findAndSolveCaptcha,
    scrollDown,
    randomString,
    getEmails,
    getPhoneNumbers,
    isEnabled,
    exportToJson,
    getImages,
    getPositionTypes,
    getList,
    getFrame,
    exportReviews,
    saveReviews,
    getMoney,
    shuffle,
    reverseTimeAgo
};