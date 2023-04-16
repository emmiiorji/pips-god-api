const express = require('express');
const auth = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const { contactMessageValidation } = require('../../validations');
const { contactMessageController } = require('../../controllers');

const router = express.Router();

router
  .route('/')
  .post(validate(contactMessageValidation.createContactMessage), contactMessageController.createContactMessage)
  .get(
    auth('contact_messages.manage'),
    validate(contactMessageValidation.getContactMessage),
    contactMessageController.getContactMessages
  );

router
  .route('/:contactMessageId')
  .get(
    auth('contact_messages.manage'),
    validate(contactMessageValidation.getContactMessage),
    contactMessageController.getContactMessage
  )
  .patch(
    auth('contact_messages.manage'),
    validate(contactMessageValidation.updateContactMessage),
    contactMessageController.updateContactMessage
  )
  .delete(
    auth('contact_messages.manage.manage'),
    validate(contactMessageValidation.deleteContactMessage),
    contactMessageController.deleteContactMessage
  );

module.exports = router;
