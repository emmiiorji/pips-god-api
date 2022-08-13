const { tokenTypes } = require('../config/tokens');

module.exports = (sequelize, dataType) => {
  const token = sequelize.define('token', {
    token: {
      type: dataType.STRING,
      allowNull: false,
      trim: true,
      index: true,
    },
    type: {
      type: dataType.ENUM(tokenTypes.REFRESH, tokenTypes.RESET_PASSWORD, tokenTypes.VERIFY_EMAIL),
      allowNull: false,
    },
    expires: {
      type: dataType.DATE,
      allowNull: false,
    },
    blacklisted: {
      type: dataType.BOOLEAN,
      default: false,
    },
  });

  return token;
};
