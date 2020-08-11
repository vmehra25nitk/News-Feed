const express = require('express');

const router = express.Router();

const userController = require('../controller/user');

const {
    ensureAuthenticated 
} = require('../config/auth');


router.get('/', userController.getIndex);

router.get('/filter', ensureAuthenticated, userController.getFilter);

router.get('/savedNews', ensureAuthenticated, userController.getSavedNews);

router.get('/logout', userController.getLogout);

router.post('/saveForLater', ensureAuthenticated, userController.postSaveForLater);

router.post('/login', userController.postLogin);

router.post('/deleteNews', ensureAuthenticated, userController.postDeleteNews);

module.exports = router;