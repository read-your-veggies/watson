const axios = require('axios');
const extractor = require('unfluff');
const Article = require('./schemas.js').Article;
require('dotenv').config();

var getUrlsFromNewsAPI = () => {

  return new Promise((resolve, reject) => {
    axios.get(`https://newsapi.org/v2/top-headlines?country=us&apiKey=${process.env.NEWS_API_KEY}`)
    .then(response => {
      // console.log('news data', response.data)
      let urlList = [];
      response.data.articles.forEach(article => {
        urlList.push(article.url);
      });
      // console.log('time to retrieve the articles');
      // retrieveArticles(urlList);
      return urlList;
    })
    .catch(err => {
      console.error(err);
    })
    .then(urlList => {
      resolve(urlList);
    })
  })
}

var getArticlesFromUrls = (urlList) => {

  return new Promise((resolve, reject) => {

    var promises = urlList.map(url => {
      return parseArticle(url);
    }); 

    Promise.all(promises)
    .catch(err => {
      console.error(err);
    })
    .then(articleList => {
      resolve(articleList);
    })
  });

}

var parseArticle = (currArticleUrl) => {

  return new Promise((resolve, reject) => {
    axios.get(currArticleUrl)
    .then(response => {
      var webpage = extractor(response.data);
      var article = {
        url: currArticleUrl,
        title: webpage.title,
        author: webpage.author,
        source: webpage.publisher,
        description: webpage.description,
        fullText: webpage.text,
      }
      resolve(article);
    })
    .catch(err => {
      reject(err);
    })
  });
}

var insertArticlesIntoDb = (articleList) => {
  return new Promise((resolve, reject) => {
    Article.insertMany(articleList, (err, result) => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  })   
}

var scrapeArticles = () => {
  getUrlsFromNewsAPI()
  .then(urlList => {
    return getArticlesFromUrls(urlList);
  })
  .then(articleList => {
    insertArticlesIntoDb(articleList);
  })
  .catch(err => {
    console.error(err);
  })
}

var deleteArticles = () => {
  Article.remove({}, err => {
    if (err) {
      console.error(err);
    } else {
      console.log('deleted articles');
    }
  });
}

module.exports = { scrapeArticles, deleteArticles }
