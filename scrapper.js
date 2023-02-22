

async function getJobs(puppeteer){
    let proxy='';

     const browser = await puppeteer.launch(
       {
         headless: false,
         // userDataDir: './chromiumdata',
         slowMo: 3,
         defaultViewport: null,
         executablePath: require('puppeteer').executablePath(),
         args: ['--disable-web-security', '--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu', '--window-size=1366,768', '--start-maximized', '--start-fullscreen', proxy],
       },
     ).catch((error) => {
         console.log(error)
     });

     const p1 = Promise.resolve(50);
     const p2 = new Promise((resolve, reject) =>
                   setTimeout(reject, 100, 'geek'));

     const scrappers = [p1, p2];

     await Promise.allSettled(scrappers).then( (results) => {
       results.forEach((result) =>
       console.log(result.status,result.value)
       )
     });
    }

    module.exports = {
        getJobs
    }
