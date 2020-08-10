const LocalStrategy = require('passport-local').Strategy;
const mongoose = require('mongoose');
const passport = require('passport');
const bcrypt = require('bcryptjs');

const User = require('../models/user');



module.exports = function (passport) {
    passport.use(
        new LocalStrategy({
            usernameField: 'username'
        }, (username, password, done) => {
            User.findOne({
                    username: username
                }, (err, user) => {
                    console.log('here');
                    if (!user) {
                        return done(null, false, {
                            message: 'not registered'
                        });
                    }
                    bcrypt.compare(password, user.password, (err, isMatch) => {
                        if (err) throw err;

                        if (isMatch) {
                            return done(null, user._id);
                        } else {
                            return done(null, false, {
                                message: 'password incorrect'
                            });
                        }
                    });
                });
        })

    )
};

passport.serializeUser((userId, done) => {
    done(null, userId);
});

passport.deserializeUser((id, done) => {
    User.findById(id, (err, user) => {
        done(err, user._id);
    });
});