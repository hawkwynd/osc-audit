require('dotenv').config({ path: './.env' });

module.exports = {
	env: process.env.NODE_ENV || 'development',
	port: 8002,
	db: {
		username: 'omnicommander',
		password: 'omnicommando1',
		host: 'ds161074.mlab.com',
		port: '61074',
		dbname: 'audit-dev',
		siteLink: 'https://commanderco.com:8080',
		email: 'scott@omnicommander.com'
	},
	dev:{
		host: 'localhost',
		port: '27017',
		dbname: 'newaudit',
		siteLink: 'http://localhost:8080',
		email: 'scott@omnicommander.com'
	},
	gmail: {
		client_user: 'contact@omnicommander.com',
		client_id: '181250820444-dodbve0ilm6m69gjl1oo1lr78hq9rj5u.apps.googleusercontent.com',
		client_secret: '5rYLSk0UDYw5SsQb8uh3_PUY',
		refresh_token: '1/HUDxNme2vBy344MV7Drja5Sv9hu73XtkelSVobR3rtM',
		expires: 1484314697598
	}
	
};

