var mongoose = require('mongoose');

//connect to article db
const articleDbConn = mongoose.createConnection(process.env.ARTICLES_DATABASE_PATH);
articleDbConn.on('error', function(err){
  if(err) throw err;
});
articleDbConn.once('open', function callback () {
  console.info('connected to articles db');
});

//connect to sourcedb
const sourceDbConn = mongoose.createConnection(process.env.SOURCES_DATABASE_PATH);
sourceDbConn.on('error', function(err){
  if(err) throw err;
});
sourceDbConn.once('open', function callback () {
  console.info('connected to sources db');
});

module.exports = { articleDbConn, sourceDbConn  };