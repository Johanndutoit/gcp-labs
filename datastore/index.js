// dependencies
const express     = require('express');
const bodyParser  = require('body-parser');
const Datastore   = require('@google-cloud/datastore');

// create the datastore client we can use
const datastore = new Datastore({
  
  projectId: process.env.GOOGLE_CLOUD_PROJECT,

});
const DATASTORE_KIND = 'Entry';

// create a server instance
var app           = express();

// set the template engine
app.set('view engine', 'pug');
app.set('trust proxy', true);

// use the body parser
app.use(bodyParser.urlencoded({}));

// handle the homepage
app.get('/', function(req, res) {

  // get the entries from the database
  const query = datastore.createQuery(DATASTORE_KIND).order('created');

  // run the actual query
  datastore
  .runQuery(query)
  .then(results => {
    var entries = results[0] || [];
    for(var i = 0; i < entries.length; i++) {
      entries[i].id = entries[i][datastore.KEY].id;
    }
    res.render('home', {

      entries:  entries || []

    });
  })
  .catch(err => {
    console.error('ERROR:', err);
  });

});

// handle adding new entries
app.get('/add', function(req, res) {

  // add the entry
  res.render('add', {});
  
});

// handle adding new entries
app.post('/add', function(req, res) {

  // pull in the params
  var paramName = req.body.name;
  var paramtel  = req.body.tel;

  // Saves the entity
  datastore
  .save({

    key:    datastore.key([DATASTORE_KIND]),
    data:   {

      name:         paramName,
      tel:          paramtel,
      created:      new Date(),
      lastupdated:  new Date()

    }

  })
  .then(() => {
    res.redirect('/');
  })
  .catch(err => {
    res.redirect('/?error=something went wrong');
  });

});

// handle displaying the entity
app.get('/edit/:itemid', function(req, res) {

  // run the actual query
  datastore
    .get(datastore.key([DATASTORE_KIND, parseFloat(req.params.itemid)]))
    .then(results => {

      var item = results[0] || null;
      if(!item) return res.render('notfound', {});
      item.id = item[datastore.KEY].id;

      res.render('edit', {

        entry:  item

      });
    })
    .catch(err => {
      res.redirect('/?error=problem fetching');
    });

});

// handle updating entries
app.post('/edit/:itemid', function(req, res) {

  // get the entries from the database
  const query = datastore.createQuery(DATASTORE_KIND).order('created');

  // run the actual query
  datastore
    .get(datastore.key([DATASTORE_KIND, parseFloat(req.params.itemid)]))
    .then(results => {

      var item = results[0] || null;
      if(!item) return res.render('notfound', {});
      item.id = item[datastore.KEY].id;

      datastore
      .save({

        key:    datastore.key([DATASTORE_KIND, parseFloat(req.params.itemid)]),
        data:   {

          name:         req.body.name,
          tel:          req.body.tel,
          created:      new Date()

        }

      })
      .then(() => {
        res.redirect('/');
      })
      .catch(err => {
        res.redirect('/?error=something went wrong');
      });
    })
    .catch(err => {
      console.error('ERROR:', err);
    });

});

// handle deleting entries, this should not be GET and rather a DELETE 
// but for this demo I didn't want to include any Javascript ...
app.get('/delete/:itemid', function(req, res) {

  datastore
    .delete(datastore.key([DATASTORE_KIND, parseFloat(req.params.itemid)]))
    .then(() => {
      res.redirect('/');
    })
    .catch(err => {
      res.redirect('/?error=problem deleting');
    });

});

// start the server
app.listen(process.env.PORT || 8080, () => {

  console.log('running on port', process.env.PORT || 8080)

});