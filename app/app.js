var express = require('express');
var app = express();

app.get('/', function (req, res) {
    res.send('Hello World!' +
        '<br/>RemoteAdd: ' + req.connection.remoteAddress +
        "<br/>Host: " + req.headers.host + 
        '<br/>X-Forwarded-for: '+req.headers['x-forwarded-for'] + ' | ' + req.connection.remoteAddress +
        '<br/>X-Real-ip '+ req.headers['x-real-ip'] + ' | ' + req.connection.remoteAddress);
    console.log(req)
});

app.listen(3000, function () {
    console.log('Example app listening on port 3000!');
});