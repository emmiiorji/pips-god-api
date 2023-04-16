const sequelizePaginate = require('sequelize-paginate');
const validator = require('validator');

module.exports = (sequelize, dataType) => {
  const contactMessage = sequelize.define('contact_message', {
    fullName: {
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
    message: {
      type: dataType.TEXT,
    },
    status: {
      type: dataType.STRING,
      defaultValue: 'received',
    },
  });

  sequelizePaginate.paginate(contactMessage);
  return contactMessage;
};
