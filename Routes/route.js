const express = require('express');
const { getUser, sendMail, getDrafts, readMail, getMails, sendMailViaQueue, sendMultipleEmails } = require('./autoMsg');
const allRouter = express.Router();

allRouter.use(express.json());
allRouter.use(express.urlencoded({ extended: true }));

// MessageRoutes googleapis
allRouter.get('/user/:email', getUser);
allRouter.get('/send', sendMail);
allRouter.get('/drafts/:email', getDrafts);
allRouter.get('/read/:email/message/:message', readMail);
allRouter.get('/list/:email', getMails);

// AutomatedRoutes
allRouter.post('/readdata/:id', sendMailViaQueue);
allRouter.post('/sendmulti/:id', sendMultipleEmails);

// MessageRoutes outlook.

module.exports = allRouter;