const express = require("express");
const { nanoid } = require("nanoid");
const dns = require("dns");
const app = express();

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
    dns.lookup(url.hostname, err => {
      if (err) {
        //console.log(err);
        next(err);
      } else {
        //console.log("success");
        // TODO: Connect to a database
        res.status(201);
        res.json({ original_url: req.body.url, short_url: nanoid(4) });
      }
    });
  } catch (e) {
    //console.log("caught error ", e);
    if (e instanceof TypeError) {
      res.status(400);
      res.json({ error: "The url is invalid" });
    } else {
      next(e);
    }
  }
});

// TODO: Create a GET for /api/shorturl/:url

module.exports = app;