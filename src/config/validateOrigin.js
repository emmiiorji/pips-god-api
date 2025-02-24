const config = require('./config');

let allowedRegExpOrigins = [
  // add all acceptable origins to this file
  /https:\/\/(www\.)?pipsgod\.netlify\.app$/,
];

if (config.env === 'development' || process.env.ENVIRON === 'development') {
  allowedRegExpOrigins = [
    ...allowedRegExpOrigins,
    /http:\/\/localhost:[0-9]{4,5}$/, // this regex is a superset of regexp above
    /http:\/\/127.0.0.1:[0-9]{4,5}$/, // this regex is a superset of regexp above
  ];
}

const validateOrigin = (origin) => {
  const validationStatus = Array.from(allowedRegExpOrigins, (regExpPattern) => regExpPattern.test(origin)).some(Boolean);
  return validationStatus;
};

module.exports = validateOrigin;
