/* eslint-disable max-len */
/* eslint-disable import/extensions */
const UserAgent = require('user-agents');
const crypto = require('crypto');
const moment = require('moment');

const clean = (phrase) => phrase = phrase.replace(/\n/g, '');

const hash = (data) => crypto.createHash('sha256').update(data).digest('base64');

const formatDate = (date, title) => {
  const formats = {

  };

  const format = formats[title] ? formats[title] : 'DD/MM/YYYY';

  return moment(date, format).format('YYYY-MM-DD');
};

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

module.exports = {
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
    randomstring
};