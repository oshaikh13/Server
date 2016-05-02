var mongoose = require('mongoose'),
    bcrypt   = require('bcrypt-nodejs'),
    Q        = require('q'),
    SALT_WORK_FACTOR  = 10;

var UserSchema = new mongoose.Schema({

  hashCode: {
    type: String,
    unique: true
  },

  hashVerified: {
    type: Boolean,
    default: false
  },

  username: {
    type: String,
    unique: true
  },

  password: {
    type: String
  },

  firstName: {
    type: String,
    required: true
  },

  lastName: {
    type: String,
    required: true    
  },

  school: {
    type: String,
    required: true
  },
  
  userLevel: {
    type: String,
    required: true
  },

  committee: {
    type: String,
    required: true
  }

});

UserSchema.methods.compareCodes = function (candidateCode) {
  var savedPassword = this.hashCode;
  return this.hashCode === candidateCode;
};

UserSchema.methods.comparePasswords = function (candidatePassword) {
  var defer = Q.defer();
  var savedPassword = this.password;
  bcrypt.compare(candidatePassword, savedPassword, function (err, isMatch) {
    if (err) {
      defer.reject(err);
    } else {
      defer.resolve(isMatch);
    }
  });
  return defer.promise;
};

UserSchema.pre('save', function (next) {
  var user = this;

  // only hash the password if it has been modified (or is new)
  if (!user.isModified('password')) {
    return next();
  }

  // generate a salt
  bcrypt.genSalt(SALT_WORK_FACTOR, function(err, salt) {
    if (err) {
      return next(err);
    }

    // hash the password along with our new salt
    bcrypt.hash(user.password, salt, null, function(err, hash) {
      if (err) {
        return next(err);
      }

      // Generate a unique URL.

      user.password = hash;
      user.salt = salt;
      next();
    });
  });
});

module.exports = mongoose.model('users', UserSchema);
