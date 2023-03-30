const speakeasy = require('speakeasy');
const validator = require('validator');
const sequelizePaginate = require('sequelize-paginate');
const { nanoid } = require('nanoid');

module.exports = (sequelize, dataType) => {
  const user = sequelize.define('user', {
    id: {
      type: dataType.STRING,
      defaultValue: () => nanoid(),
      primaryKey: true,
    },
    firstName: {
      type: dataType.STRING,
      allowNull: false,
      trim: true,
    },
    lastName: {
      type: dataType.STRING,
      allowNull: false,
      trim: true,
    },
    middleName: {
      type: dataType.STRING,
      trim: true,
    },
    username: {
      type: dataType.STRING,
      trim: true,
      unique: true,
      validate(value) {
        if (value.length < 3) {
          throw new Error('Username must be at least 3 characters long');
        }
      },
    },
    phone: {
      type: dataType.STRING,
      trim: true,
      unique: true,
    },
    email: {
      type: dataType.STRING,
      allowNull: false,
      unique: true,
      trim: true,
      lowercase: true,
      validate(value) {
        if (!validator.isEmail(value)) {
          throw new Error('Invalid email');
        }
      },
    },
    password: {
      type: dataType.STRING,
      // allowNull: false,
      trim: true,
      minlength: 8,
      validate(value) {
        if (!value.match(/\d/) || !value.match(/[a-zA-Z]/)) {
          throw new Error('Password must contain at least one letter and one number');
        }
      },
    },
    isEmailVerified: {
      type: dataType.BOOLEAN,
      defaultValue: false,
    },
    otpSecret: {
      type: dataType.STRING,
      unique: true,
      defaultValue: () => speakeasy.generateSecret().base32,
    },
    telegramUsername: {
      type: dataType.STRING,
      unique: true,
      trim: true,
      lowercase: true,
    },
  });

  sequelizePaginate.paginate(user);
  return user;
};
