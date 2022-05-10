const http = require('http');
var express = require('express');
const https = require("https");
const dotenv = require('dotenv');
const port = process.env.PORT || 3000

const server = http.createServer((req, res) => {
  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/html');
  res.end('<h1>Hello World</h1> ');
  console.log('Consumer Key' + process.env.CONSUMER_KEY)
});

server.listen(port,() => {
  console.log(`Server running at port `+port);
});