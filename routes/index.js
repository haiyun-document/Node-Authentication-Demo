var mongoose = require('mongoose')
  , bcrypt = require('bcrypt')
  , Schema = mongoose.Schema
  , UserSchema = new Schema({
        username: { type: String, index: { unique: true } }
      , password: { type: String }
	  })
  , UserModel = mongoose.model('user', UserSchema);

mongoose.connect('mongodb://localhost/authentication');

exports.index = function(req, res){
  var errors = [];
	var notices = [];
  if (req.session.authenticated === true) {
	  res.render('home', { title: 'Home'
                       , username: req.session.username });
	} else {
    if (req.query['e'] === 'incorrectLogin') { errors.push('Incorrect username and/or password.') };
    if (req.query['n'] === 'loggedOut') { notices.push('You have been logged out.') };
    if (req.query['n'] === 'registered') { notices.push('Your account has been created. You may now log in.') };
    res.render('log-in', {   title: 'Log In'
                           , errors: errors
                           , notices: notices });
  }
};

exports.logIn = function(req, res){
  UserModel.findOne({ 'username': req.body.username}, function (err, user) {
    bcrypt.compare(req.body.password, user.password, function(err, result) {
      if (result) {
       req.session.authenticated = true;
			 req.session.username = user.username;
       res.redirect('/');
			} else {
       res.redirect('/?e=incorrectLogin');
			}
		});
	});
};

exports.logOut = function(req, res){
  req.session.authenticated = false;
  res.redirect('/?n=loggedOut');
};

exports.register = function(req, res){
  var errors = [];
  res.render('register', { title: 'Register'
                         , errors: errors });
};

exports.doRegister = function(req, res){
  var errors = [];
  var notices = [];
  if (req.body.password === req.body.confirmPassword) {
    UserModel.findOne({ 'username': req.body.username}, function (err, user) {
      if (user) {
        errors.push('That username is already taken.');
        res.render('register', { title: 'Register'
                               , errors: errors });
	  	} else {
        bcrypt.genSalt(10, function(err, salt) {
          bcrypt.hash(req.body.password, salt, function(err, hash) {
            var newUser = new UserModel();
            newUser.username = req.body.username;
            newUser.password = hash;
            newUser.save();
            res.redirect('/?n=registered');
					});
				});
		  }
	  });
	} else {
    errors.push('The passwords you entered did not match. Please try again.');
    res.render('register', { title: 'Register'
                           , errors: errors });
	}
};