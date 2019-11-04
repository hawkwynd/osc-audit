/* jshint esversion: 6 */

const Customer = require('mongoose').model('Customer');
const Audit = require('mongoose').model('Audit');
const Messages = require('mongoose').model('Messages');
const axios = require('axios');
const initialLoad = require('../helpers/initalLoad');
const parseXml = require('xml2js').parseString;
const mailer = require('../helpers/mailService');
const moment = require('moment');

module.exports = {
    index: (req, res) => {
        if(req.session.user) {
            Customer.aggregate([{
                $lookup: 
                        {
                          from: "audits",
                          localField: "_id",
                          foreignField: "cu",
                          as: "audits"
                        }}
            ]).exec((err, results) => {
                if(results) res.render('home', {customers: results, user: req.session.user});
            });
        } else {
            res.redirect('/customer/login');
        }
    },

    welcome: (req, res) => {
            res.render('welcome', { customer: req.session.visitor });
    },

    renderLogin: (req, res) => {
        res.render('customerLogin', {error: req.session.error});
        req.session.error = null;
    },

    renderCustomerRegister: (req, res) => {
        if(req.session.user) {
            res.render('register', { success: req.session.success, errors: req.session.errors, user: req.session.user });
            req.session.errors = null;
        } else {
            res.redirect("/");
        }
    },
    RenderEditCustomerById: (req, res) => {
        if(req.session.user) {
            Customer.findById(req.params.id).then(result => {
                res.render('editCustomer', {success: req.session.success, errors: req.session.errors, user: req.session.user, customer: result});
                req.session.error = null;
            });
        } else {
            res.redirect("/");
        }
    },

    editCustomerById: (req, res) => {
        const {id, code, name, url, email } = req.body;

            req.checkBody('name', 'Name is required').notEmpty();
            req.checkBody('url', 'Url is required').notEmpty();
            req.checkBody('url', 'Url Should be www.url.com ').matches(/[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/g);
            req.checkBody('email', 'Email is required').notEmpty();

            var errors = req.validationErrors();

            if(errors) {
                req.session.errors = errors;
                req.session.success = false;
                res.redirect('/customer/edit/'+ id);
            } else {
                // No errors
                req.session.success = true;

                Customer.updateOne({_id: id}, { $set: {name: name, url: url, email: email} })
                    .then((affected, error , result) => {
                        // console.log(`updateOne complete`);

                        var log = new Messages({action:'admin', userID: email, messageText:'Customer Account edited'});
                        log.save(function(err) {if(err) console.log(err) });

                        if(error) console.log(error);
                        res.redirect('/');
                });
            }
        },

    registerCustomer: (req, res) => {
        
        const {name, url, email } = req.body;

            req.checkBody('name', 'Name is required').notEmpty();
            req.checkBody('url', 'Url is required').notEmpty();
            req.checkBody('url', 'Url Should be www.url.com ').matches(/[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/g);
            req.checkBody('email', 'Email is required').notEmpty();

            var errors = req.validationErrors();

            if(errors) {
                req.session.errors = errors;
                req.session.success = false;
                res.redirect('/newCustomer');
            } else {
                // No errors
                req.session.success = true;

                let newCustomer = {
                    name: name.toUpperCase(),
                    url: url.toLowerCase(),
                    email: email.toLowerCase()
                };

                console.log(`new customer: ` + newCustomer.name);

                // get sitemap from the website
                console.log(`getting https://${url}/sitemap.xml`);

                // need a better catch err trap to keep this from crashing the whole thing.
                axios.get(`https://${url}/sitemap.xml`)
                    .then(res => res.data)
                    .then(xml => {
                        parseXml(xml, (err, sitemapArray) => {
                            initialLoad(sitemapArray.urlset.url, newCustomer);
                        });

                    }).catch( 
                        function(error) {
                        const html = `
                            <h3 style="color: #662c90;">${newCustomer.name} could not be accessed </h3>
                            <p>make sure <span style="text-transform="Uppercase">${newCustomer.name}</span> is publicly accessible</p>
                            <p> <a href="omnicommando.com"> OC SCAN </a> </p>
                            <p>${error}</p>
                        `;

                        mailer(newCustomer.email, 'Customer Registered Failed', html);
                        res.redirect('/newCustomer');

                    });

                    var log = new Messages({action:'admin', userID: newCustomer.email, messageText:'Customer Account Added'});
                        log.save(function(err) {if(err) console.log(err) });
                    res.redirect('/');
                

        }
    },

    login: (req, res) => {

            // Customer login with email and code (password)
            const {customerId, email}  = req.body;
            
            if(customerId) {
                Customer.getCustomerByCode(customerId, email, (customer) => {

                if(customer){
                    let ts = moment().format('YYYY-MM-DD hh:mm:ss');
                    console.log(`login: ${customer.email} ${ts}` );
              
                    var log = new Messages({action:'login', userID: customer.email, messageText:''});
                    log.save(function(err) {
                        if(err) console.log(err);
                    });


                    // load up session info for pages to display shit

                    req.session.visitor     = customer._id;
                    req.session.vName       = customer.name;
                    req.session.vUrl        = customer.url;
                    req.session.vEmail      = customer.email;
                    req.session.vLastOn     = customer.updatedAt;
                   
                    res.redirect('/audits');

                } else {
                    // Bad username or password
                    Customer.getCustomerCodeByEmail(email, (customer) => {
                        if(!customer){
                            var log = new Messages({action:'loginFail', userID: email, messageText:`Account not found or bad password.`});
                            log.save(function(err) {if(err) console.log(err) });
                        }
                        // Bad login, return error and stuff
                        req.session.error = "Please enter a valid email address and password";
                        req.session.visitor = null;
                        res.redirect('/customer/login');
                    });                  
                }
                });
            }
    },
    deleteDevAuditById: (req, res) => {
        const id = req.params.id;
        Audit.deleteMany({cu: id}, function(err) {
            if(err) console.log(err);
        });
        Customer.findByIdAndDelete(id).then(results => {
            res.redirect('/');
        });
    },
    forgotpw: (req, res) => {

        const { email } = req.body;
        req.checkBody('email', 'Email is required').notEmpty();
        var errors = req.validationErrors();   
        res.render('forgotpw', {error: req.session.error});
        req.session.error = null;
    },
    pwsubmit: (req, res) => {
        
        const{email} = req.body;

        try{

            Customer.getCustomerCodeByEmail(email, (customer) => {
             if(customer){
                
                const html = `
                <div style="font-size:18px;">
                <h3 style="text-transform:uppercase; color: #662c90;">${customer.name} Password Request </h3>
                <p>This email is in response to a request we received for a password for OC SCAN login for ${customer.name}</p>
                <p>Username:  <span style="font-weight:700;">${customer.email}</span></p>
                <p>Password:  <span style="font-weight:700;">${customer.code}</span></p>
                <p>Important Tip: Please write your password down and store it in a secure, dry place.</p>
                <div style="margin:40px 0;font-size:22px;">
                OC-Audit by Omnicommander </div> </div>
                `;
               
                // Send the email with the password
                mailer(email, `OC Scan Password Request for ${customer.name}`, html);
                res.render('pwsubmit', {email: customer.email} );
                req.session.error = null;

                // Log it
                var log = new Messages({action:'request', userID: customer.email, messageText:'Password Request sent'});
                log.save(function(err) {if(err) console.log(err) });

             }else{
                // Log it
                var log = new Messages({action:'error', userID: email, messageText:'Password Request FAIL'});
                log.save(function(err) {if(err) console.log(err) });

                // bad email address in customer listing redirect with error
                req.session.error = `${email} is not a valid email address.`;
                res.redirect('/customer/forgotpw');
                req.session.error = null;
             }
            });
        }
    catch(error){
        console.error(error);
    }
    },
    logout: (req, res) => {
        let ts = moment().format('YYYY-MM-DD hh:mm:ss');
        console.log(`logout: ${req.session.vEmail} ${ts}`);

        // Activity logger
        var log = new Messages({action:'logout', userID: req.session.vEmail, messageText:''});
        log.save(function(err) {if(err) console.log(err) });

        // Kill Dem ALL
        req.session.visitor     = null;
        req.session.vName       = null;
        req.session.vUrl        = null;
        req.session.vEmail      = null;
        req.session.vLastOn     = null;
        req.logout();
        res.redirect('/customer/login');
    }
};