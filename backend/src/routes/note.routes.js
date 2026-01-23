const express = require('express');
const router = express.Router();
const authenticateToken = require('../middleware/auth');
const { getNotes, createNote, updateNote, getNote, deleteNote } = require('../controllers/note.controller');

router.use(authenticateToken);

router.get('/', getNotes);
router.post('/', createNote);
router.put('/:id', updateNote); // Add PUT route
router.get('/:id', getNote);
router.delete('/:id', deleteNote);

module.exports = router;
