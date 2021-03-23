const express = require("express");
const { nanoid } = require("nanoid");
const dns = require("dns");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const app = express();

// Initialize .env
dotenv.config();

// Connect to database
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true }, error => {
  if (error) console.log(error);
  console.log(mongoose.connection.readyState);
});

// Body parsing middleware
app.use(express.json());

// Root for API
app.get('/api', (req, res) => {
  res.json({ message: "Hello from server!" });
});

// Timestamep
app.get('/api/timestamp/:date?', (req, res) => {
  const date = req.params.date;
  const unixRegex = /^\d{13}$/;
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  let dateObj;

  if (unixRegex.test(date)) {
    dateObj = new Date(parseInt(date));
  } else if (dateRegex.test(date)) {
    dateObj = new Date(date);
  }

  // console.log(`date: ${date}\ndateObj: ${dateObj}`);

  if (dateObj) {
    res.json({ unix: dateObj.getTime(), utc: dateObj.toUTCString() });
  } else {
    res.status(400);
    res.json({ error: "Incorrect date format :/ Please provide an epoch in milliseconds or use the format yyyy-mm-dd"} );
  }
});

// Header Parser
app.get('/api/whoami', (req, res) => {
  const IP = req.ip;
  const LANGUAGE = req.headers['accept-language'];
  const SOFTWARE = req.headers['user-agent'];

  // console.log(req.ip);
  // console.log(req.headers);

  res.json({ ipaddress: IP, language: LANGUAGE, software: SOFTWARE });
});

// URL Shortener
app.post('/api/shorturl/new', (req, res, next) => {
  //console.log("req body ", req.body.url);
  try {
    const url = new URL(req.body.url);
    dns.lookup(url.hostname, error => {
      if (error) {
        error.statusCode = 400;
        //console.log(error);
        next(error);
      } else {
        //console.log("success");
        // TODO: Connect to a database and return 201 or 200 depending on if the item exists
        res.status(201);
        res.json({ original_url: req.body.url, short_url: nanoid(4) });
      }
    });
  } catch (error) {
    if (error.code === "ERR_INVALID_URL") {
      error.statusCode = 400;
      //console.log("400: ", error);
      next(error);
    } else {
      //console.log("500: ", error);
      next(error);
    }
  }
})

// TODO: Finish implementing this GET for /api/shorturl/:shortUrl?
app.get('/api/shorturl/:shortUrl?', (req, res) => {
  res.send("This isn't implemented yet");
  // TODO: throw a 400 if shortUrl is empty

  // TODO: attempt to retrieve a shorturl from the database

  // TODO: redirect to the saved longurl or throw a 404 if there is no saved longurl

});

module.exports = app;