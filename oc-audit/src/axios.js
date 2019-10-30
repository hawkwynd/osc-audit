
const axios = require('axios');
const keys = require('./config'); 
const parseXml = require('xml2js').parseString;

url = "www.dcfcu.org";

 // get sitemap from the website
 console.log(`getting ${url}/sitemap.xml`);

  // need a better catch err trap to keep this from crashing the whole thing.
  axios.get(`https://${url}/sitemap.xml`)
      .then(res => res.data)
      .then(xml => {
          parseXml(xml, (err, sitemapArray) => {
            
            // initialLoad(sitemapArray.urlset.url, newCustomer);
            
            spew( sitemapArray.urlset.url.map(siteUrl => siteUrl.loc + '?format=json') );
            
            
            
            
          });
      }).catch(thrown => {
        if (axios.isCancel(thrown)) {
           console.log(thrown.message);
        } else {
          // handle error
        }
      });

function spew(data){
    console.log(data[0])
    const url = data[0];

  axios.get(url)
  .then((response) => {
    
    console.log(response.data.collection);

  });


}