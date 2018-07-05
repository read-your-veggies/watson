exports.handler = () => {
    // TODO implement
    var watson = require('./db/watson.js');
    // return watson.updateSourcesDb(() => {
    //   watson.updateAllPersonalities();
    // });
    return watson.updateSourcesDb();
};

