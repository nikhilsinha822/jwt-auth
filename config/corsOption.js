const whitelist = require('./allowedOrigin')


// check these whitelist sites by using there respective console
const corsOption = {
  origin: (origin, callback) => {
    //(!origin for undefined) after development remove some urls from white list and !origin
    if (whitelist.indexOf(origin) !== -1 || !origin) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by cors"));
    }
  },
  optionsSuccessStatus: 200,
};

module.exports = corsOption
