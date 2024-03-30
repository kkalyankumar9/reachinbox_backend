const express = require("express");
const passport = require('passport');
const { Strategy: OAuth2Strategy } = require('passport-google-oauth20');

require("dotenv").config()

const app = express();
const PORT = process.env.PORT || 8000;

app.use(passport.initialize());
app.use(passport.session());
app.use(express.json());

passport.use(new OAuth2Strategy({
  clientID: process.env.CLIENT_ID,
  clientSecret: process.env.CLIENT_SECRET,
  callbackURL: 'http://localhost:8000/auth/google/callback'
},
(accessToken, refreshToken, profile, done) => {
  // Handle user authentication and save necessary details
  return done(null, profile);
}));

app.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

app.get('/auth/google/callback', passport.authenticate('google', { failureRedirect: '/' }),
  (req, res) => {
    // Successful authentication, redirect or respond as needed
    res.redirect('/dashboard');
  });





app.listen(PORT,  () => {
  try {
   
 
    console.log(`Server is running on port ${PORT}`);
  } catch (error) {
    console.log(error);
  }
});
