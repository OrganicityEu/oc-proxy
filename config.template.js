var config = {};

config.port = 8000;

// Set this var to undefined if you don't want the server to listen on HTTPS
config.https = {
    enabled: false,
    cert_file: 'cert/cert.crt',
    key_file: 'cert/key.key',
    port: 443
};

config.chain = ""; // One of: central, experimenter
config.client_id = "";
config.client_secret = "";
config.bad_asset_attributes = ['urn:oc:attributeType:reputation'];

config.application_endpoint = {
  protocol: 'http',
	host: 'HOST',
	port: 'PORT'
};

config.accounts_token_endpoint = {
	protocol: 'https',
	host: 'accounts.organicity.eu',
	port: '443',
	path: '/realms/organicity/protocol/openid-connect/token',
};

config.platform_management_api = {
	protocol: 'http',
	host: 'dev.server.organicity.eu',
	port: '8080'
};

config.experiment_management_api = {
	protocol: 'http',
	host: 'pro.server.organicity.eu',
	port: '8081',
}

// Needed for central only
//config.nofification_proxy = {
//	protocol: 'http',
//	host: 'localhost',
//	port: 9998
//};

// list of paths that will not check authentication/authorization
// example: ['/public/*', '/static/css/']
config.public_paths = [];

/*
config.opbeat = {
  appId: '<app id>',
  organizationId: '<org id>',
  secretToken: '<token>',
  active: true,
  instrument : true,
};
*/

module.exports = config;
