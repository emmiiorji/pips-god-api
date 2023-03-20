const Joi = require('joi');
const { password } = require('../validations/custom.validation');

const superAdminUsers = {};

const checkSuperAdminUsers = () => {
  const allSuperAdminInfo = Object.keys(process.env).filter((key) => key.includes('SUPER_ADMIN'));

  allSuperAdminInfo.forEach((key1) => {
    const split = key1.split('_');
    const index = split.splice(-1)[0];

    if (!superAdminUsers[index]) {
      superAdminUsers[index] = {};
    }
    superAdminUsers[index][key1] = process.env[key1];
  });

  let envVarsSchema;
  let superAdminUsersEnvVars = {};

  Object.keys(superAdminUsers).forEach((index) => {
    envVarsSchema = Joi.object()
      .keys({
        [`SUPER_ADMIN_USERNAME_${index}`]: Joi.string().min(3).required(),
        [`SUPER_ADMIN_EMAIL_${index}`]: Joi.string().required().email(),
        [`SUPER_ADMIN_FNAME_${index}`]: Joi.string().required(),
        [`SUPER_ADMIN_LNAME_${index}`]: Joi.string().required(),
        [`SUPER_ADMIN_PASSWORD_${index}`]: Joi.string().required().custom(password),
      })
      .unknown();

    superAdminUsers[index] = {};
    superAdminUsers[index].username = process.env[`SUPER_ADMIN_USERNAME_${index}`];
    superAdminUsers[index].email = process.env[`SUPER_ADMIN_EMAIL_${index}`];
    superAdminUsers[index].firstName = process.env[`SUPER_ADMIN_FNAME_${index}`];
    superAdminUsers[index].lastName = process.env[`SUPER_ADMIN_LNAME_${index}`];
    superAdminUsers[index].password = process.env[`SUPER_ADMIN_PASSWORD_${index}`];

    const { value: envVars, error } = envVarsSchema.prefs({ errors: { label: 'key' } }).validate(process.env);
    superAdminUsersEnvVars = { ...superAdminUsersEnvVars, ...envVars };

    if (error) {
      throw new Error(`Config validation error: ${error.message}`);
    }
  });

  return superAdminUsers;
};

module.exports = { checkSuperAdminUsers };
