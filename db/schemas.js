const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const articleDbConn = require('./index.js').articleDbConn;
const sourceDbConn = require('./index.js').sourceDbConn;

const articleSchema = new Schema({
  url: {type: String, unique: true},
  title: String,
  author: Array, // news api always returns an array of strings here
  source: String,
  description: String,
  fullText: String,
  articleStance: Number,
  image: String,
  votes: {
    agree: {
      summedUserStance: Number,
      totalVotes: Number,
    },
    disagree: {
      summedUserStance: Number,
      totalVotes: Number,
    },
    fun: {
      summedUserStance: Number,
      totalVotes: Number,
    },
    bummer: {
      summedUserStance: Number,
      totalVotes: Number,
    },
  },
});

const Article = articleDbConn.model('Article', articleSchema);

const sourceSchema = new Schema({
  name: String,
  articles: [String],
  titles: [String],
  fullTexts: [String],
  titlesPersonality: String,
  fullTextsPersonality: String,
});

const Source = sourceDbConn.model('Source', sourceSchema);

module.exports = { Article, Source }