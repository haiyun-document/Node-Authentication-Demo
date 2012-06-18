
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , sessionMongoose = require('session-mongoose');;

var mongooseSessionStore = new sessionMongoose({ url: 'mongodb://localhost/session' });

var app = module.exports = express.createServer();

// Configuration

app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.bodyParser());
	app.use(express.cookieParser());
	app.use(express.session({ secret: '4e9114d0-b6f1-11e1-afa6-0800200c9a66'
                          , store: mongooseSessionStore }));
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
});

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

app.configure('production', function(){
  app.use(express.errorHandler());
});

// Routes

app.get('/', routes.index);
app.post('/log-in', routes.logIn);
app.get('/log-out', routes.logOut);
app.get('/register', routes.register);
app.post('/register', routes.doRegister);

app.listen(3000, function(){
  console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
});
