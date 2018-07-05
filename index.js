exports.handler = () => {
    // TODO implement
    var watson = require('./db/watson.js');
    watson.updateSourcesDb(() => {
      watson.updateAllPersonalities();
    });
};