/* jshint esversion: 6*/
const User =  require('mongoose').model('User');
const moment = require('moment');
const Messages = require('mongoose').model('Messages');

module.exports = {
    renderLogin: (req, res) => {
        
        if(req.session.user) {
            res.redirect('/');    
        } else {
            res.render('admin/login', { success: req.session.success, errors: req.session.errors, user: req.session.user });
            
            req.session.errors = null;
        }
        
    },

    renderRegister: (req, res) => {
        res.render('admin/register', { success: req.session.success, errors: req.session.errors, user: req.session.user });
        req.session.errors = null;
    },
    
    register: (req, res) => {
        const {name, email, password } = req.body;
            console.log(password);
            req.checkBody('name', 'Name is required').notEmpty();
            req.checkBody('email', 'Email is required').notEmpty();
            req.checkBody('password', 'Password is required').notEmpty();
            req.assert('password-confirm', 'Confirm Must be equal to password').equals(password);

            var errors = req.validationErrors();

            if(errors) {
                req.session.errors = errors;
                console.log(errors);
                req.session.success = false;
                res.redirect('register');
            } else {
                // No errors
                // User Model

                const newUser = new User({
                  name: name,
                  email: email,
                  password: password
                });

                User.createUser(newUser, function(err, user) {
                  if(err) throw err;

                     // Logger
                     var log = new Messages({action:'admin', userID: newUser.name, messageText:`New Admin account created ${newUser.email}`});
                     log.save(function(err) {if(err) console.log(err) });


                  req.session.success = true;
                  res.redirect('/admin/login');
                });
            }
    },

    login: (req, res) => {
         const {email, password } = req.body;

            if(!req.user) {
                console.log('bad Password');
                req.session.user = null;
                req.session.success = false;
                res.redirect('/admin/login');
                
                

            } else {
                // No errors
             
                const user = Object.assign({}, req.user._doc);
                user.login_date = moment(req.last_login_date).format("MM/YYYY/DD");
                user.login_longdate = moment(req.last_login_date).format("YYYY/MM/DD hh:mm:ss")
                // Logger
                console.log(email + ' ' + user.login_longdate);

                var log = new Messages({action:'adminLogin', userID: email, messageText:`login at ${user.login_longdate}`});
                log.save(function(err) {if(err) console.log(err) });

                req.session.user = user;
                req.session.visitor = null;
                
                res.redirect('/');

                
            }
    },

    logout: (req, res) => {
        req.session.user = null;
        req.logout();
        res.redirect('/admin/login');
    }
};