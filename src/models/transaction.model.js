const sequelizePaginate = require('sequelize-paginate');
const validator = require('validator');

module.exports = (sequelize, dataType) => {
  const transaction = sequelize.define('transaction', {
    id: {
      type: dataType.STRING,
      allowNull: false,
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
      unique: true,
    },
    accessCode: {
      type: dataType.STRING,
      trim: true,
      lowercase: true,
      unique: true,
    },
    currency: {
      type: dataType.STRING,
      defaultValue: 'NGN',
    },
    amount: {
      type: dataType.INTEGER,
    },
    amountUnit: {
      type: dataType.STRING,
      trim: true,
      allowNull: false,
    },
    isUsed: {
      type: dataType.BOOLEAN,
      defaultValue: false,
    },
  });

  sequelizePaginate.paginate(transaction);
  return transaction;
};
