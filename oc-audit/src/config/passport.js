const LocalStrategy = require('passport-local').Strategy;
const User = require('mongoose').model('User');

module.exports = (passport) => {
  
  passport.use(new LocalStrategy({
      usernameField: 'email',
      passwordField: 'password',
      session: true
    },
    function(email, password, done) {
      User.findOne({ email: email }, function (err, user) {

        if (err) { return done(err); }
        if (!user) { return done(null, false); }
        User.comparePassword(password, user.password, function(err, isMatch){
          if(err) throw err;

          if(isMatch){ 
            User.findByIdAndUpdate(user._id, { $set : { 'last_login_date' : Date.now() }}, function(err, model) {
            });
              return done(null, user);             
            }
          return done(null, false, {message: 'Invalid password'});
      });
      });
    }
  ));

  passport.serializeUser(function(user, done) {
    done(null, user.id);
  });

  passport.deserializeUser(function(id, done) {
    User.getUserById(id, function(err, user) {
      done(err, user);
    });
  });
};
