module.exports = (sequelize, dataType) => {
  const messageTemplate = sequelize.define('message_template', {
    title: {
      type: dataType.STRING,
      allowNull: false,
      trim: true,
    },
    description: {
      type: dataType.STRING,
      allowNull: false,
      trim: true,
    },
    smsSubject: {
      type: dataType.STRING,
      allowNull: false,
      trim: true,
    },
    emailSubject: {
      type: dataType.STRING,
      allowNull: false,
      trim: true,
    },
    smsBody: {
      type: dataType.STRING,
      allowNull: false,
      trim: true,
    },
    emailBody: {
      type: dataType.STRING,
      allowNull: false,
      trim: true,
    },
  });

  return messageTemplate;
};
