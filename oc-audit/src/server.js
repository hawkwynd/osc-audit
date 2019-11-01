/* jshint esversion:6 */

const express = require('express');
const expressValidator = require('express-validator');
const session = require('express-session');
const http = require('http');
const reload = require('reload');
const exphbs = require('express-handlebars');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');

// eliviate deprecation warnings on mongoose
const mongoose = require('mongoose');
      mongoose.set('useFindAndModify', false);
      mongoose.set('useUnifiedTopology', true);
      mongoose.set('useCreateIndex', true);

const keys = require('./config'); 
const passport = require('passport');
const moment = require('moment');
const paginate = require('express-paginate');
const config = require('./config/index');

// Load models
require('./models/customer');
require('./models/audit');
require('./models/user');

// import controllers
const customerController = require('./controllers/customer.controller');
const adminController = require('./controllers/admin.controller');
const auditController = require('./controllers/audit.controller');

// Create an instance of express app
const app = express();

//Passport config
require('./config/passport')(passport);

// keys based on env config
const mykeys = keys[[process.env.NODE_ENV]];

// Connecting mogo DB based on environment run
const mongodbUri = `mongodb://${mykeys.username}:${mykeys.password}@${mykeys.host}:${mykeys.port}/${mykeys.dbname}`;
const opts = {useNewUrlParser: true};

// connect to mongo
mongoose.connect(mongodbUri, opts)
  .then(() => {
    console.log("** mongoDB connected: " + process.env.NODE_ENV + "\n");
  }).catch((err) => {
    console.log("Mongoose connection error", err);
  });

// Set Public folder
app.use(express.static('public'));

// Setting View Engine (Handlebars)
app.engine('handlebars', exphbs({
	defaultLayout: 'main',
  helpers: {
        formatDate: function (date, format) {
            return moment.unix(date.slice(0, 10)).format(format);
        },
        json: function (content) {
          return JSON.stringify(content);
        },
        active: function (current, number) {
          return current == number ? 'active': '';
        },
        relativeUrl: function (url) {
          var index = url.lastIndexOf('/');
          return  index !== 7 ? url.substring(index) : '/';
        }
    }
}));

// Express middlewares
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(expressValidator());
app.use(cookieParser());
app.use(session({secret: keys.session.secret, saveUninitialized: false, resave: false}));

// passport middleware
app.use(passport.initialize());
app.use(passport.session());


app.set('view engine', 'handlebars');

// express paginate midleware
app.use(paginate.middleware(10, 20));

// Customer routes
app.get('/', customerController.index);
app.get('/welcome', customerController.welcome);
app.get('/customer/login', customerController.renderLogin);
app.get('/newCustomer', customerController.renderCustomerRegister);
app.post('/register-customer', customerController.registerCustomer);
app.post('/customer/login', customerController.login);
app.get('/customer/delete/:id', customerController.deleteDevAuditById);
app.get('/customer/edit/:id', customerController.RenderEditCustomerById);
app.post('/customer/edit', customerController.editCustomerById);

// forgot password
app.get('/customer/forgotpw', customerController.forgotpw); // form
app.post('/customer/pwsubmit', customerController.pwsubmit); // function 

// Audits routes
app.get('/audits', auditController.getAudits);
app.get('/audits/:id', auditController.getAuditById);
app.get('/audits/dev/:id', auditController.getDevAuditById);
app.post('/audits/edit', auditController.editAudit);
app.get('/audits/delete/:id', auditController.deleteAuditById);

// Reports routes
app.get('/reports', auditController.getReports);
app.get('/report/', auditController.getReport);

// Admin Routes
app.get('/admin/register', adminController.renderRegister);
app.get('/admin/login', adminController.renderLogin);
app.post('/admin/register', adminController.register);
app.post('/admin/login', passport.authenticate('local', { failureRedirect: '/admin/login' }), adminController.login);

// Logout Route
app.get('/admin/logout', adminController.logout);

// Sitemap.xml and Robots .txt routes for SEO
app.get('/sitemap.xml', (req, res) => res.send('sitemap.xml'));
app.get('/robots.txt', (req, res) => res.send('robots.txt'));

// Wrong urls Redirect
app.get('*', (req, res) => res.redirect('/'));

server = http.createServer(app);
server.listen(config.port, () => {
		console.log(`Server running on port ${config.port}`);
});

reload(app);