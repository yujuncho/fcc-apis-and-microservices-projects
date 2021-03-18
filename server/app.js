const express = require("express");
const app = express();

// Root for API
app.get('/api', (req, res) => {
  res.json({ message: "Hello from server!" });
});

// Timestamep Microservice
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
    res.json({ message: "Incorrect date format :/ Please provide an epoch in milliseconds or use the format yyyy-mm-dd"} );
  }
});

app.get('/api/whoami', (req, res) => {
  const IP = req.ip;
  const LANGUAGE = req.headers['accept-language'];
  const SOFTWARE = req.headers['user-agent'];

  // console.log(req.headers);

  res.json({ ipaddress: IP, language: LANGUAGE, software: SOFTWARE });
});

module.exports = app;