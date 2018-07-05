exports.handler = async () => {
    // TODO implement
    var watson = require('./db/watson.js');
    // return watson.updateSourcesDb(() => {
    //   watson.updateAllPersonalities();
    // });
    var result = await watson.updateSourcesDb();
    return result;
};