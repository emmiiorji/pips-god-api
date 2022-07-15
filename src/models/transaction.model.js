const sequelizePaginate = require('sequelize-paginate');
const validator = require('validator');

module.exports = (sequelize, dataType) => {
  const Transaction = sequelize.define('transaction', {
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
  });

  sequelizePaginate.paginate(Transaction);
  return Transaction;
};
