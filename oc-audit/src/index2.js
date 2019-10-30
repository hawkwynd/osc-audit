const axios = require('axios');
const parseXml = require('xml2js').parseString;
const keys = require('./config'); 
const mykeys = keys[[process.env.NODE_ENV]];
const shortid = require('shortid');
const mongodbUri = `mongodb://${mykeys.username}:${mykeys.password}@${mykeys.host}:${mykeys.port}/${mykeys.dbname}`;
const mongoose = require('mongoose');
      mongoose.set('useFindAndModify', false);
      mongoose.set('useUnifiedTopology', true);
      mongoose.set('useCreateIndex', true);

const opts = {useNewUrlParser: true};

// connect to mongo
mongoose.connect(mongodbUri, opts)
  .then(() => {
    console.log("** mongoDB connected: " + process.env.NODE_ENV + "\n");
  }).catch((err) => {
    console.log("Mongoose connection error", err);
  });

// Customer model config
let Schema = mongoose.Schema;
let CustomerSchema = new Schema({
    name: {
        type: String
    },
    url: {
        type: String
    },
    code: {
        type: String,
        index: true,
        default: shortid.generate,
        unique: true
    },
    email: {
      type: String,
      required: true
    },
    sitemap: [
        {
            loc: String,
            lastChange: String,
            content: Schema.Types.Mixed,
            assets: [String]
        }
    ]
  },
  { timestamps: true}
);

//Create Collection and add Schema
const MyModel =  mongoose.model('Customer', CustomerSchema);

// Find all our customers and do something with the info
MyModel.find({}, function(err, customers){

      // load customer urls
    const customerUrlArray = customers.map(customer => customer.url);
    console.log(customerUrlArray);

    for(c of customers){

        var sUrl = `https://${c.url}/sitemap.xml`;
              
         siteMap(sUrl, function(res){
           console.log(`The ${c.url} file has ${res.length} urls in it`);
          //  console.log(res);
        });
        console.log(` ${c.url} has ${c.sitemap.length} urls in customers table`);

    
        }
    
});

// siteMap -- parse the sitemap for the url provided 
//            iterate each location [loc]

function siteMap( url, callback){
    axios.get(url)
    .then(res => res.data)
    .then(xml => {
        parseXml(xml, (err, sitemapArray) => {

          const package = sitemapArray.urlset.url;
          var packageUrls = package.map(siteUrl => siteUrl.loc)

          // console.log(packageUrls);
          // for(i of sitemapArray.urlset.url){
          //   console.log(i.loc)
          // }
          
          // callback(url, sitemapArray.urlset.url.length );
          callback(packageUrls);
        });
    });
};