const express = require('express');

const router = express.Router();
const NewsAPI = require('newsapi');
const apiKey = process.env.NEWS_API_KEY;
const newsapi = new NewsAPI(apiKey);
const path = require('path');
const bcrypt = require('bcryptjs');
const passport = require('passport');


const User = require('../models/user');
const News = require('../models/news');
const Connection = require('../models/connection');

var mongoose = require('mongoose');
mongoose.set('useFindAndModify', false);

exports.getIndex = (req, res) => {
    res.render('index');
}

exports.getFilter = (req, res) => {
    console.log(req.body, req.params, req.query);
    var keyword = req.query.keyword;
    var category = req.query.category;

    const validCategory = ['general', 'business', 'entertainment', 'health', 'science', 'sports', 'technology'];
    if (!validCategory.includes(category)) {
        category = '';
    }

    if ((keyword == undefined || keyword == '') && (category == undefined || category == '')) {
        newsapi.v2.topHeadlines({
                language: 'en',
                country: 'us'
            }).then(response => {
                console.log(response);
                res.render('filter', {
                    response: response
                });
            })
            .catch(err => {
                throw err;
            });
    } else if (keyword != undefined && (category == undefined || category == '')) {
        newsapi.v2.everything({
                q: keyword
            })
            .then(response => {
                res.render('filter', {
                    response: response
                });
            })
            .catch(err => {
                throw err;
            })
    } else if (keyword == undefined || keyword == '') {
        newsapi.v2.topHeadlines({
                language: 'en',
                category: category,
                country: 'us'
            }).then(response => {
                console.log(response);
                res.render('filter', {
                    response: response
                });
            })
            .catch(err => {
                throw err;
            });
    } else {
        newsapi.v2.topHeadlines({
                language: 'en',
                category: category,
                q: keyword,
                country: 'us'
            }).then(response => {
                console.log(response);
                res.render('filter', {
                    response: response
                });
            })
            .catch(err => {
                throw err;
            });
    }

}


exports.getSavedNews = (req, res) => {
    Connection.find({
        userId: req.user._id
    }, (err, conn) => {
        if (err) {
            throw err;
        }
        console.log(conn);
        if (conn.length > 0) {
            var newsList = [];
            for (var i = 0; i < conn.length; i++) {
                newsList.push(conn[i].newsId);
            }
            News.find({
                url: {
                    $in: newsList
                }
            }, (err, news) => {
                if (err) {
                    throw err;
                }
                console.log(news);
                res.render('savedNews', {
                    response: news
                });
            });
        } else {
            res.render('savedNews', {
                response: {
                    articles: []
                }
            });
        }
    })

}


exports.getLogout = (req, res) => {
    req.logOut();
    res.redirect('/');
}














exports.postSaveForLater = (req, res) => {
    const news = req.body;
    console.log(news);

    News.findOne({
        url: news.url
    }, (err, news1) => {
        if (err) {
            throw err;
        }
        if (news1) {
            Connection.findOne({
                newsId: news.url,
                userId: req.user._id
            }, (err, conn) => {
                if (err) {
                    throw err;
                }
                if (conn) {
                    res.send("Already exists");
                } else {
                    const newConn = new Connection({
                        newsId: news.url,
                        userId: req.user._id
                    });
                    newConn.save()
                        .then(conn => {
                            news1.count += 1;
                            news1.save()
                                .then(() => {
                                    res.send("SAVED");
                                })
                                .catch(err => {
                                    throw err;
                                });
                        })
                        .catch(err => {
                            throw err;
                        });
                }
            })
        } else {
            const url = news.url;
            const title = news.title;
            const author = news.author;
            const urlToImage = news.urlToImage;
            const description = news.description;
            const count = 1;
            const newNews = new News({
                url,
                title,
                author,
                urlToImage,
                description,
                count
            });
            newNews.save()
                .then(news2 => {
                    const newConn = new Connection({
                        newsId: url,
                        userId: req.user._id
                    });
                    newConn.save()
                        .then(conn => {
                            res.send("SAVED");
                        })
                        .catch(err => {
                            throw err;
                        });
                })
                .catch(err => {
                    throw err;
                })
        }
    });
}


exports.postLogin = (req, res) => {
    console.log(req.body, req.params, req.query);
    const username = req.body.username;
    const password = req.body.password;

    if (req.body.signin != undefined) {
        console.log('here1');
        console.log(username, password);
        passport.authenticate('local', {
            successRedirect: '/filter',
            failureRedirect: '/'
        })(req, res);
    } else {
        if (username != '' && password.length >= 6) {
            User.findOne({
                    username: username
                })
                .then(user => {
                    if (!user) {
                        const newUser = new User();
                        newUser.username = username;
                        bcrypt.genSalt(10, (err, salt) => {
                            bcrypt.hash(password, salt, (err, hash) => {
                                if (err) throw err;
                                newUser.password = hash;
                                newUser.save()
                                    .then(user => {
                                        passport.authenticate('local', {
                                            successRedirect: '/filter',
                                            failureRedirect: '/'
                                        })(req, res);
                                        console.log(user);
                                    })
                            })
                        })
                    } else {
                        res.redirect('/');
                    }
                })

        } else {
            res.redirect('/');
        }
    }

}



exports.postDeleteNews = (req, res) => {
    const url = req.body.url;
    const userId = req.user._id;

    Connection.findOneAndDelete({
        newsId: url,
        userId: userId
    }, (err, conn) => {
        if (err) {
            throw err;
        }
        if (conn) {
            News.findOneAndUpdate({
                url: url
            }, {
                $inc: {
                    count: -1
                }
            }, (err, result) => {
                if (err) {
                    throw err;
                }
                console.log(result);
                News.findOneAndDelete({
                    url: url,
                    count: 0
                }, (err, res1) => {
                    if (err) {
                        throw err;
                    }
                    res.redirect('/savedNews');
                })
            })
        }
    })
};