exports.handler = () => {
    
    var watson = require('./db/watson.js');
    
    return watson.updateSourcesDb()
    .then(sourcesRes => {
      return watson.updateAllPersonalities()
      .then(watsonRes => {
        return 'sources: ' + sourcesRes + 'watson: ' + watsonRes;
      })
      .catch(watsonErr => {
        return watsonErr;
      })    
    })
    .catch(sourcesErr => {
      return sourcesErr;
    })
};