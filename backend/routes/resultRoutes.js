const express = require('express');
const router = express.Router();
const { addResult, getResults, updateResult, deleteResult } = require('../controllers/resultController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.route('/')
    .get(protect, getResults)
    .post(protect, authorize('admin', 'teacher'), addResult);

router.route('/:id')
    .put(protect, authorize('admin', 'teacher'), updateResult)
    .delete(protect, authorize('admin', 'teacher'), deleteResult);

module.exports = router;
