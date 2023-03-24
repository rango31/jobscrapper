
# Job scrapper

This is a scrpper that scraps sites for jobs and reviews.

Sites scrapped for jobs inlcude :
- metajob.at
- jobscout24.ch
- indeed.ch
- praktischarzt.at / ch / de

sites scrapped for reviews inlucde:
- pj-ranking.de 


## Installation and run

    To deploy and install dependencies to this project run

  npm install --save

    To run it, 

  npm start
   -- this will run all scrappers in parallel, getting all jobs and reviews s required.


## Features

- Parallel Processing
- Supoorts proxies / You can use rotating proxies from brightdata or other providers
- Saves data to data.sql for backup
- Reviews stored in reviews.json
- Jobs data stored in jobs.json
- support captcha saving using 2captcha.com
- Works in stealth mode to avoid detection
- Include an inbuit adblocker
- Uses Migrations incase of data loss, system initialization will create the database for you. And run as normal.


## Environment Variables

To run this project, you will need to add the following environment variables to your .env file

TIMEOUT=120000
proxyurl=
proxyusername=
proxypassword=
proxyenabled=0
enabledsites=['indeed','jobscout24','metajob','praktischarztde','praktischarztat','praktischarztch','pj-rankingde']
headlessmode=1

TIMEOUT -- NUMBER IN SECONDS FOR THE BROWSER TO TIMEOUT LOADING A PAGE
PROXYURL -- IF YOU WANT TO USE A PROXY, PUT PROXY PROVIDER URL HERE
PROXYUSERNAME -- YOUR PROXY ACCOUNT USERNAME
PROXYPASSWORD -- YOUR PROXY ACCOUNT proxypassword
PROXYENABLED -- Set to '1' to enble scrapper to use proxyurl, or '0' for proxy not to use proxy
enabledsites -- This is the list of sites to bescrapped. If you dont want a certain site to be scrapped, remove it from this array and it will be skipped.
headlessmode -- 0 = Run the browser with userinterface , 1 = run the browser in headless mode. NO UI
