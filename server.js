var _ = require('lodash');
var express = require('express');
var app = express();
var Datastore = require('nedb');
var db = new Datastore();
var bodyParser = require('body-parser');
var heredoc = require('heredoc');
var colors = require('colors');
var cors = require('cors');

var logo = heredoc(function() {/*

  ___(_)_ __ ___  _ __ | | ___        __ _ _ __ (_)      ___  ___ _ ____   _____ _ __
 / __| | '_ ` _ \| '_ \| |/ _ \_____ / _` | '_ \| |_____/ __|/ _ \ '__\ \ / / _ \ '__|
 \__ \ | | | | | | |_) | |  __/_____| (_| | |_) | |_____\__ \  __/ |   \ V /  __/ |
 |___/_|_| |_| |_| .__/|_|\___|      \__,_| .__/|_|     |___/\___|_|    \_/ \___|_|
                 |_|                      |_|
*/});

var books = [
  {
    title: "Como programar en C++",
    author: "Deitel & Deitel",
    available: true,
    price: 58.00
  },
  {
    title: "Harry Potter",
    author: "J.K. Rowling",
    available: false,
    price: 32.00
  },
  {
    title: "El Señor de los Anillos",
    author: "J.R.R. Tolkien",
    available: true,
    price: 60.00
  }
];

_.forEach( books, function(book) {
  db.insert(book);
});

function validateBook(book, errors) {
  if ( _.isEmpty(book.title) ) { errors.title = ['blank']; }
  if ( _.isEmpty(book.author) ) { errors.author = ['blank']; }
  if ( ! _.isBoolean(book.available) ) { errors.available = ['blank']; }
  if ( ! _.isNumber(book.price) ) { errors.price = ['blank']; }

  return _.isEmpty( errors );
}

app.use( bodyParser.json() );
app.use( cors() );

app.get('/books', function (req, res) {
  db.find({}, function(err, books) {
    if ( err ) {
      res.sendStatus(500);
    } else {
      res.json(books);
    }
  });
});

app.get('/books/:id', function(req, res) {
  db.find({ _id: req.params.id }, function(err, books) {
    if ( _.isEmpty( books ) ) {
      res.sendStatus(404);
    } else {
      res.json( _.first(books) );
    }
  });
});

app.put('/books/:id', function(req, res) {
  var errors = {};

  if ( validateBook( req.body, errors ) ) {
    db.update({ _id: req.params.id }, req.body, {}, function(err, replaced) {
      if ( err ) {
        res.sendStatus(500);
      } else {
        res.sendStatus(204);
      }
    });
  } else {
    res.status(422);
    res.json({ errors: errors });
  }
});

app.delete('/books/:id', function(req, res) {
  db.remove({ _id: req.params.id }, {}, function(err, removed) {
    if ( err ) {
      res.sendStatus(500);
    } else if ( removed == 1 ) {
      res.sendStatus(204);
    } else {
      res.sendStatus(404);
    }
  });
});

app.post('/books', function(req, res) {
  var errors = {};

  if ( validateBook( req.body, errors ) ) {
    db.insert(req.body, function(err, book) {
      if ( err ) {
        res.sendStatus(500);
      } else {
        res.status(201);
        res.json( book );
      }
    });
  } else {
    res.status(422);
    res.json({ errors: errors });
  }
});

var server = app.listen(3000, function () {
  var host = server.address().address;
  var port = server.address().port;

  console.log(logo.yellow);
  console.log('listening at http://%s:%s', host, port)
})
