var config = require('./../config.js'),
    httpClient = require('./../lib/HTTPClient.js');

var log = require('./../lib/logger').logger.getLogger("Root");

var Root = (function() {

	var appid = 0;
	var expid = 0;
	var sub = undefined;

	var headerExists = function (headers, name, res) {
    console.log('Check for header: ' + name);
		if(!headers[name]) {
			res.statusCode = 400;
			res.send('HTTP header ' + name.toLowerCase() + ' not provided!');
			return false;
		}
		return true;
	}

	var errorHandler = function(res) {
		return function(status, resp) {
		    log.error('HTTP error. Status: ', status, 'Response: ', resp);
		    res.statusCode = 500;
		    res.send('An internal server error happended!');
		}
	}

  // Check HTTP headers
  var call0 = function(req, res, options, body) {

		console.log('0) Check HTTP headers?');

		//#################################################################
		// Check, if some headers do exist
		//#################################################################

		if(!headerExists(options.headers, 'x-organicity-application', res)) {
			return;
		}

		if(!headerExists(options.headers, 'x-organicity-experiment', res)) {
			return;
		}

		if(!headerExists(options.headers, 'x-auth-subject', res)) {
			return;
		}

		if(!headerExists(options.headers, 'content-type', res)) {
			return;
		}

		//#################################################################
		// Get the data from the headers and check, if some of the headers are valid
		//#################################################################

		// This header is provided by the keycloak proxy
		sub = options.headers['x-auth-subject'];

    // These headers must be privided by the client
		appid = options.headers['x-organicity-application'];
		expid = options.headers['x-organicity-experiment'];

    // The only valid content type is JSON
		if(options.headers['content-type'] !== 'application/json') {
			res.statusCode = 406;
			res.send('Content type ' + options.headers['content-type'] + ' not acceptable. Please provide application/json');
			return;
		}

		console.log('### Data extracted from the header ###');
		console.log('appid:', appid);
		console.log('expid', expid);
		console.log('sub', sub);
		console.log('######################################');

    call1(req, res, options, body);
  };

    // Is experiment allowed to feed data
    var call1 = function(req, res, options, body) {

			console.log('1) Is experiment allowed to feed data?');

/*
      var optionsCall = {
          protocol: 'https',
          host: 'accounts.organicity.eu',
          port: '443',
          path: '/',
          method: 'GET'
      };

      httpClient.sendData(optionsCall, undefined, res, function(status, responseText, headers) {
        options.headers['X-organicity-call1'] = 'OKAY';
        call2(req, res, options, body);
      });
*/
      call2(req, res, options, body);
    };

    // This checks, if the sub is a participant/experimenter of the experiment
    var call2 = function(req, res, options, body) {

			console.log('2) Is sub a participant/experimenter of the experiment?');

      // Check whether an experimenter is the owner of one experiment
      // GET /emscheck/experimentowner/{experId}/{expId}
      var optionsCall = {
          protocol: 'http',
          host: '31.200.243.76',
          port: '8081',
          path: '/emscheck/experimentowner/' + sub + '/' + expid,
          method: 'GET'
      };

      httpClient.sendData(optionsCall, undefined, res, function(status, responseText, headers) {
		// This will be called, if the sub is the expermenter of the experiment
        call3(req, res, options, body);
      }, function() {
          // This will be called, if the sub is NOT the expermenter of the experiment

          // Check whether a participant takes part in the experiment
          // GET /emscheck/participant-experiment/{parId}/{expId}
        var optionsCall = {
            protocol: 'http',
            host: '31.200.243.76',
            port: '8081',
            path: '/emscheck/participant-experiment/' + sub + '/' + expid,
            method: 'GET'
        };

        httpClient.sendData(optionsCall, undefined, res, function(status, responseText, headers) {
        // This will be called, if the sub is a participant of the experiment
          call3(req, res, options, body);
        }, errorHandler(res));
      });
    };

    // Check whether an application belongs to one experiment
    var call3 = function(req, res, options, body) {

			console.log('3) Does an application belong to one experiment?');

      var optionsCall = {
          protocol: 'http',
          host: '31.200.243.76',
          port: '8081',
          path: '/emscheck/application-experiment/' + expid + '/' + appid,
          method: 'GET'
      };

      httpClient.sendData(optionsCall, undefined, res, function(status, responseText, headers) {
        call4(req, res, options, body);
      }, errorHandler(res));
    };

    // Does the experiment have quota
    var call4 = function(req, res, options, body) {

			console.log('4) Does the experiment have quota?');
			/*
      var optionsCall = {
          protocol: 'http',
          host: 'dev.server.organicity.eu',
          port: '8080',
          path: '/v1/experiments/' + expid,
          method: 'GET'
      };

      httpClient.sendData(optionsCall, undefined, res, function(status, responseText, headers) {
        options.headers['X-organicity-call4'] = 'OKAY';
        call5(req, res, options, body);
      }, errorHandler(res));
			*/
			call5(req, res, options, body);
    };

    // Check the validity of the asset
    var call5 = function(req, res, options, body) {

			console.log('5) Check the validity of the asset');

      if(!body) {
        res.statusCode = 400;
        res.send('No body provided!');
        return;
      }


      // Handle body
      if(req.method === 'POST') {
				var assets = JSON.parse(body);

				if(assets._id != undefined){

					var asset = assets._id;

					var item_id = asset.id;
					var item_type = asset.type;
					var item_servicePath = asset.servicePath;
					if(item_id != undefined){
						alert(item_id);
					} else {
						res.statusCode = 403;
						res.send('item_id wrong');
						return;
					}

					if(item_type != undefined) {
						alert(item_type);
					} else {
						res.statusCode = 403;
						res.send('item_type wrong');
						return;
					}

					if(item_servicePath != undefined){
						alert(item_servicePath);
					} else {
						res.statusCode = 403;
						res.send('item_servicePath wrong');
						return;
					}
				} else {
					res.statusCode = 403;
					res.send('assets_id wrong');
					return;
				}

      	call6(req, res, options, body);
    };

    // Finally, Call the configured server
    var call6 = function(req, res, options, body){

			console.log('6) Forward message to the configured server.');

      // Add x-forwarded-for header
      options.headers = httpClient.getClientIp(req, req.headers);
      httpClient.sendData(options, body, res);
    }

    var pep = function(req, res) {

      var options = {
          protocol: 'http',
          host: config.app_host,
          port: config.app_port,
          path: req.url,
          method: req.method,
          headers: req.headers
      };

      var body = req.body.toString('utf8');

      call0(req, res, options, body);
    };

    return {
        pep: pep
    }
})();

exports.Root = Root;
