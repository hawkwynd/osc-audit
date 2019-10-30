/*jshint esversion: 6 */
const mongoose = require('mongoose');
	  mongoose.set('useCreateIndex', true); // Deprecation Warning suppressor
	  mongoose.set('useFindAndModify', false);

const axios = require('axios');
const keys = require('./config');
const mailer = require('./mailService');
const isEqual = require('lodash').isEqual;
const moment = require('moment');
// Library for difference between 2 html
const htmldiff = require('./htmlDiff2');

// if we run start use --dev for localhost else it uses prod's url
const siteLink = process.env.npm_config_dev === 'true' ? keys.dev.siteLink : keys.db.siteLink;

//  console.log({ dev : process.env.npm_config_dev });
//  console.log(`using ${siteLink}`);

// Importing Mongoose models
require('./customer.model');
require('./audit.model');

const Customer 	= require('mongoose').model('Customer');
const Audit 	= require('mongoose').model('Audit');

// function to return asset Urls
const getAssets = (data) => {
	if(data.collection.typeName === "index") {
		return data.collection.collections.map(col => col.mainImage ? col.mainImage.assetUrl: null);
					
		} else if(data.collection.typeName === "page") {
			return data.collection.mainImage ? [data.collection.mainImage.assetUrl] : null;
		}
}

// Audit Run function
const run = async (customers) => {
	let changedUrls = [];

	console.log(`${customers.length} customers total.`);

	for(let customer of customers) {
		// check if customer model has a sitemap
		if(customer.sitemap) {				
			
				process.stdout.write(`\n${customer.url} has ${customer.sitemap.length} pages\n`);

					// Loop through sitemap and save changedUrls
					for(currentSitemap of customer.sitemap) {

					process.stdout.write(`\r...Checking ${currentSitemap.loc}                 `)
						
						const loadedData = await axios.get(`${currentSitemap.loc}?format=json`)
							.then(res => res.data)
							.catch( function(error){
								console.log(`${currentSitemap.loc} ` + error);
							});

						if(loadedData) {
							const d = new Date(loadedData.collection.updatedOn);					
							const assets = getAssets(loadedData);
							const tempSitemap = ((currentSitemap.lastChange.toString() !== loadedData.collection.updatedOn.toString()) || !isEqual(currentSitemap.assets, assets)) 
								? currentSitemap 
								: null;
							
							if(tempSitemap) {
								changedUrls.push({
									id: tempSitemap.id,
									url: tempSitemap.loc,
									customer: customer,
									content: tempSitemap.content,
									modified: loadedData.collection.updatedOn,
									compareDate: moment.unix(loadedData.collection.updatedOn.toString().slice(0, 10)).format("YYYY-MM-DD"),
									data: loadedData,
									oldAssets: currentSitemap.assets,
									newAssets: assets,
								});
							}		
						}
					}
					process.stdout.write(`\n\t${customer.url} scan completed.                                                                 `)
				}
	}

	console.log(`\nScan finshed.\n\n`);

	// For all changed detected, update DB and send email to contact
	for(let currentUrl of changedUrls) {
		// Content Return the site content from the API
		let content = "";
		if(currentUrl.data.collection.typeName === "index") {
			content =  currentUrl.data.collection.collections.map(col => col.mainContent).join("<br><br>");
		} else if(currentUrl.data.collection.typeName === "page"){
			content =  currentUrl.data.mainContent;
		}

		

		if(content) {
			// Create an Audit Object
				const audit = {
					url: currentUrl.url,
					oldData: currentUrl.content,
					newData: content,
					oldAssets: currentUrl.oldAssets,
					newAssets: currentUrl.newAssets,
					diffData: htmldiff(currentUrl.content, content),
					cu: currentUrl.customer.id,
					cuName: currentUrl.customer.name,
					rootUrl: currentUrl.customer.url,
					modified: currentUrl.modified,
					compareDate: currentUrl.compareDate
				};

					// Saves Audit
					new Audit(audit).save();

					// Creates New updated Sitemap and update Customer Model
					const nsm = [...currentUrl.customer.sitemap.filter(el => el.id !== currentUrl.id), {loc: currentUrl.url, lastChange: currentUrl.modified, content: content, assets: currentUrl.newAssets}];
					const updatedCustomer = currentUrl.customer;
					updatedCustomer.sitemap = nsm; 

					Customer.findByIdAndUpdate(updatedCustomer.id, updatedCustomer, {new: true}, function(error, model) {
						if(error) { 
							console.log(error);
						} else {
							const mail_html = `
							<h3 style="color:purple;">OC SCAN detected a change to your Wesbite</h3>
							<p>Click below to see a report of changes and when they were made. </p>
							<p>Visit OC SCAN Portal <a href="${siteLink}">Click here </a></p>
							<p>Link detect changes on your site: <a href="${audit.url}">${audit.url} </a></p>
							`;

							mailer(model.email, 'OC SCAN detected change', mail_html);
							console.log(`${model.url} update email sent to ${model.email}`);
							// send mail
						}
					});
			}
	}
}


// Process Runner Method, loops infinitely and runs every 4h (4*60*60*1000 ms)
const runner = () => {
	
	// find all customers and Run Audit
	console.log('\n*** OSC Audit Service v1.1 ***\n\n'  );
	
	//  Connecting mogo DB
	let mongodbUri = '';
	
	// Mail HTML 
	const mail_html = `<h2 style="color:purple;">Audit Service is running</h2><p>time: ${new Date()}</p>`;
	
	// if we run start use --dev for localhost else it uses prod's url for the email link to OSC tool
	if( process.env.npm_config_dev === 'true' ){
		mongodbUri = `mongodb://${keys.dev.host}:${keys.dev.port}/${keys.dev.dbname}`;
		// mailer(keys.dev.email, 'OSC Audit Service local is running', mail_html);
	}else{
		mongodbUri = `mongodb://${keys.db.username}:${keys.db.password}@${keys.db.host}:${keys.db.port}/${keys.db.dbname}`;
		 mailer(keys.db.email, 'OSC Audit Service is running', mail_html);
	}

// Connect to MongoDB

	mongoose.connect(mongodbUri, {
		useNewUrlParser: true, 
		useUnifiedTopology: true
	})
		.then(() => {
			console.log(`${mongodbUri} connected successfully.`);
		}).catch((err) => {
			console.log(" Mongoose connection error", err);
		});

	Customer.find()
		.then((customers) => {
        if(customers) {
						
			run(customers);
          }
      }).catch(err => console.log("Unable to reach database at the Moment"));

	// Loop To make process run 
	// 4*60*60*1000 -- 4hrs
	setTimeout(() => {				
			console.log('settimeout');
			runner();					
	},4*60*60*1000);
};

runner();