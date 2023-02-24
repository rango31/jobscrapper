/* eslint-disable max-len */
/* eslint-disable import/extensions */
const UserAgent = require('user-agents');
const crypto = require('crypto');
const moment = require('moment');
const dotenv = require('dotenv');

dotenv.config();

const {
  MAXTABS,
  proxyurl,
  proxyusername,
  proxypassword,
  proxyenabled,
  enabledsites,
  NODE_ENV,
} = process.env;

const clean = (phrase) => phrase = phrase.replace(/\n/g, '');

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

getEmails = (text) => {
  try{
  var emailReg = /([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/;
  let emails = text.match(emailReg)?.map(function(s){
    return s.trim();
  });
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

const randomstring = (length) => {
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

module.exports = {
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
    randomstring,
    getEmails,
    getPhoneNumbers,
    isEnabled
};