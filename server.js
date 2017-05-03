/* global __dirname */
var express = require('express');
var path = require('path');
var bodyParser = require('body-parser');

var curd = require('./server-CRUD.js');
var fsapi = require('./server-file-system.js');


var app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());



app.use(express.static(__dirname + '/src'));
//app = requireFile('index.js')(app, db);

app.get('/', function (req, res) {

    console.log('I am here');
    res.sendFile('/index.html');

})

app.get('/node_modules/*', function (req, res) {

    console.log('I am here at node module');
    console.log(__dirname + req.url);
    res.sendFile(__dirname + req.url);

})



//app.use('/api', curd);
app.use('/api', fsapi);

app.get('/*', function (req, res) {

    console.log('I am here');
    res.sendFile('/index.html');

})

app.get('/**/*', function (req, res) {

    console.log('I am here');
    res.sendFile('/index.html');

})

// app.post('/api/:entity/:id', curd.post(req, res, next));
// app.put('/api/:entity/:id', curd.put(req, res, next));
// app.delete('/api/:entity/:id', curd.delete(req, res, next));


// appu,ik




app.listen('3000', function (req, res) {
    console.log(__dirname);
    console.log("Server is listening on port 3000")

})