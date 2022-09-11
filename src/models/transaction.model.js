const sequelizePaginate = require('sequelize-paginate');
const validator = require('validator');
const { nanoid } = require('nanoid');

module.exports = (sequelize, dataType) => {
  const transaction = sequelize.define('transaction', {
    id: {
      type: dataType.STRING,
      // eslint-disable-next-line global-require
      defaultValue: () => nanoid(),
      primaryKey: true,
    },
    status: {
      type: dataType.STRING,
      allowNull: false,
      trim: true,
    },
    email: {
      type: dataType.STRING,
      allowNull: false,
      trim: true,
      lowercase: true,
      validate(value) {
        if (!validator.isEmail(value)) {
          throw new Error('Invalid email');
        }
      },
    },
    authorizationUrl: {
      type: dataType.STRING,
      trim: true,
      lowercase: true,
    },
    reference: {
      type: dataType.STRING,
      trim: true,
      lowercase: true,
    },
    accessCode: {
      type: dataType.STRING,
      trim: true,
      lowercase: true,
    },
    currency: {
      type: dataType.STRING,
      defaultValue: 'USD',
    },
    amount: {
      type: dataType.INTEGER,
    },
  });

  sequelizePaginate.paginate(transaction);
  return transaction;
};
