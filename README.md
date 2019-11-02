# osc-audit by omnicommander

### Install dependencies for oc-audit
`cd oc-audit/src `

`npm install`

### First time only, install nodemon module
`npm i nodemon`

Then, just run dev app for localhost enviroment.

`npm run dev`

[http://localhost:8080](http://localhost:8080) to access front end with your browser.

### run auditRunnerservice

`cd auditRunnerService`

`npm run start --dev` for localhost

## Screenshots and explanation

![alt screenshot](screenshots/sc-login.1.png)
The new Customer login form, username and password fields with a link for `forgot my password`

![alt screenshot](screenshots/sc-login.2.png)
Enter email address and password of customer

![alt screenshot](screenshots/sc-login.3.png)
The Forgot Password form. User enters the email address of the account, and submits.

![alt screenshot](screenshots/sc-login.4.png)
The system doesn't find an email address in the Customers table, and displays the message.

![alt screenshot](screenshots/sc-login.5.png)
The notification screen, telling the visitor to check thier email for the password.

![alt screenshot](screenshots/sc-login.6.png)
The email the visitor recieves for the password 

