var PersonalityInsightsV3 = require('watson-developer-cloud/personality-insights/v3');
const Article = require('./schemas.js').Article;
const Source = require('./schemas.js').Source;

var personalityInsights = new PersonalityInsightsV3({
    version: '2017-10-13',
    username: process.env.WATSON_USERNAME,
    password: process.env.WATSON_PASSWORD,
    url: 'https://gateway.watsonplatform.net/personality-insights/api/',
});

var getWatsonProfile = (data, callback) => {
  var profileParams = {
    content: data,
    content_type: 'application/json',
    consumption_preferences: true,
    raw_scores: true
  };
  return new Promise((resolve, reject) => {
    personalityInsights.profile(profileParams, (error, profile) => {
      if (error) {
        reject(error);
      } else {
        resolve(profile);
      }
    });
  })
}

var buildArticlesBySource = (sources) => {
  var articlesBySource = {};
  sources.forEach(dbSource => {
    articlesBySource[dbSource.name] = {
      articles: JSON.parse(dbSource.articles),
      titles: JSON.parse(dbSource.titles),
      fullTexts: JSON.parse(dbSource.fullTexts),
    }
  });
  return articlesBySource;
}

var buildExistingArticles = (sources) => {
  var existingArticles = {};
  sources.forEach(source => {
    source.articles.forEach(article => {
      existingArticles[article.url] = true;
    });
  });
  return existingArticles;
}

var addNewArticles = (articlesBySource, existingArticles, articlesArray) => {
  articlesArray.forEach(article => {
    if (articlesBySource[article.source] === undefined) {
      articlesBySource[article.source] = {
        articles: [],
        titles: [],
        fullTexts: [],
        titlesPersonality: "",
        fullTextsPersonality: "",
      };
    }

    if (existingArticles[article.url] === undefined) {
      articlesBySource[article.source].articles.push(article);
      articlesBySource[article.source].titles.push({
        content: article.title,
        contenttype: "text/plain",
        language: "en",
      });
      articlesBySource[article.source].fullTexts.push({
        content: article.fullText,
        contenttype: "text/plain",
        language: "en",
      });
    }
  });

  return articlesBySource;
}

var buildNewSourceData = (articlesBySource) => {
  var newSourceData = [];
  for (var source in articlesBySource) {
    newSourceData.push({
      name: source,
      articles: JSON.stringify(articlesBySource[source].articles),
      titles: JSON.stringify(articlesBySource[source].titles),
      fullTexts: JSON.stringify(articlesBySource[source].fullTexts),
      titlesPersonality: articlesBySource[source].titlesPersonality,
      fullTextsPersonality: articlesBySource[source].fullTextsPersonality,
    });
  }
  return newSourceData;
}

var updateSourcesDb = (callback) => {
  return Article.find({})
  .then(articles => {
    return Source.find({})
    .then(sources => {
      var existingArticles = buildExistingArticles(sources);
      var articlesBySource = buildArticlesBySource(sources);
      var newArticlesObj = addNewArticles(articlesBySource, existingArticles, articles); 
      var newSourceData = buildNewSourceData(newArticlesObj);
      return newSourceData;
    })
    .then(newSourceData => {
      return Source.remove({})
      .then(res => {
        return Source.insertMany(newSourceData) 
        .then(res => {
          return 'updated sources db';
        })
        .catch(err => {
          return 'error inserting sources into db', err;
        })    
      })
      .catch(err => {
        return 'error inserting new source data in updateSourcesDb', err;
      })
    })
    .catch(err => {
      return 'error finding sources in updateSourcesDb', err;
    })
  })
  .catch(err => {
    return 'error finding articles in updateSourcesDb', err;
  })
}

var updateSinglePersonality = (sourceName, type) => {
  if (!sourceName || !type) {
    return 'source and type required for getWatsonPersonality';
  } else {
    return Source.find({name: sourceName})
    .then(source => {
      var data = {
        "contentItems": JSON.parse(source[0][type][0]),
      };
      return getWatsonProfile(data)
      .then(res => {
        var queryString = `${type}Personality`;
        return Source.updateOne({name: sourceName}, {[queryString]: personality})
        .then(res => {
          return `updated personality for ${sourceName}, ${type}`;
        })
        .catch(err => {
          return 'error updating source', err;
        })
      })
      .catch(err => {
        return 'error accessing Watson', err;
      })
    })
    .catch(err => {
      return 'error finding source in updateSinglePersonality', err;
    });
  }
}

var updateAllPersonalities = () => {
  return Source.find({}, 'name')
  .then(sourceNames => {
    var promises = sourceNames.map(source => {
      return updateSinglePersonality(source.name, 'fullTexts');
    });
    return Promise.all(promises)
    .then(res => {
      return 'updated all personalities';
    })
    .catch(err => {
      return 'error updating all personalities', err;
    })
  })
  .catch(err => {
    return 'error pulling sources for personalties', err;
  })
}

module.exports = { updateSourcesDb, updateAllPersonalities }

