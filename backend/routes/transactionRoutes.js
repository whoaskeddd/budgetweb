const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { createTransaction, getTransactions, updateTransaction, deleteTransaction, getTransactionSummary } = require('../controllers/transactionController');

router.post('/', auth, createTransaction);
router.get('/', auth, getTransactions);
router.put('/:id', auth, updateTransaction);
router.delete('/:id', auth, deleteTransaction);
router.get('/summary', auth, getTransactionSummary);

module.exports = router;