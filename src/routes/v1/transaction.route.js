const express = require('express');
const auth = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const transactionValidation = require('../../validations/transaction.validation');
const transactionController = require('../../controllers/transaction.controller');

const router = express.Router();

router
  .route('/')
  .post(validate(transactionValidation.initializeTransaction), transactionController.initializeTransaction)
  .get(validate(transactionValidation.getTransactions), transactionController.getTransactions);

router
  .route('/verify/:accessCode')
  .get(validate(transactionValidation.verifyTransaction), transactionController.verifyTransaction);

router
  .route('/:reference')
  .get(
    auth('manageTransactions'),
    validate(transactionValidation.getTransactionByReference),
    transactionController.getTransactionByReference
  );

module.exports = router;

/**
 * @swagger
 * tags:
 *   name: Transactions
 *   description: Transaction management and retrieval
 */

/**
 * @swagger
 * /transactions:
 *   post:
 *     summary: Initialize a transaction
 *     description: Any body can initialize a transaction.
 *     tags: [Transactions]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - subscriptionPlanName
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *               subscriptionPlanName:
 *                  type: string
 *                  description: The name of subscription plan e.g. training_and_mentoring, vip_signals
 *               currency:
 *                  type: string
 *                  description: Currency in which the transaction will be made e.g. NGN, USD
 *                  default: NGN
 *             example:
 *               email: fake@example.com
 *               subscriptionPlanName: vip_signals
 *     responses:
 *       "201":
 *         description: Created
 *         content:
 *           application/json:
 *             schema:
 *                $ref: '#/components/schemas/TransactionCreated'
 *       "404":
 *         $ref: '#/components/responses/SubscriprionPlanNameNotFound'
 *
 *   get:
 *     summary: Get transactions
 *     description: Only admins can query transactions.
 *     tags: [Transactions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         status: status
 *         schema:
 *          type: string
 *         description: Transaction status
 *       - in: query
 *         name: authorizationUrl
 *         schema:
 *           type: string
 *         description: URL that the user should be redirected to in order to complete the payment
 *       - in: query
 *         name: reference
 *         schema:
 *           type: string
 *         description: Identifies a transaction on Paystack side
 *       - in: query
 *         name: accessCode
 *         schema:
 *           type: string
 *         description: Identifies a transaction on Paystack side
 *       - in: query
 *         name: email
 *         schema:
 *           type: string
 *           format: email
 *         description: Email for initializing transaction
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *         description: sort by query in the form of field:desc/asc (ex. name:asc)
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *         default: 10
 *         description: Maximum number of users
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 results:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Transaction'
 *                 page:
 *                   type: integer
 *                   example: 1
 *                 limit:
 *                   type: integer
 *                   example: 10
 *                 totalPages:
 *                   type: integer
 *                   example: 1
 *                 totalResults:
 *                   type: integer
 *                   example: 1
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 */

/**
 * @swagger
 * /transactions/verify/{accessCode}:
 *   get:
 *     summary: Verify a transaction
 *     description: Any body can verify a transaction.
 *     tags: [Transactions]
 *     parameters:
 *       - in: path
 *         name: accessCode
 *         required: true
 *         schema:
 *           type: string
 *         description: Transaction access code
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *                $ref: '#/components/schemas/TransactionVerified'
 *       "404":
 *         $ref: '#/components/responses/NotFound'
 *
 */

/**
 * @swagger
 * /transactions/{reference}:
 *   get:
 *     summary: Get a transaction by reference
 *     description: Only admins can fetch any transaction.
 *     tags: [Transactions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User id
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *                $ref: '#/components/schemas/Transaction'
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 *       "404":
 *         $ref: '#/components/responses/NotFound'
 */
