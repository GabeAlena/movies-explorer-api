const router = require('express').Router();
const { updateUserValidation } = require('../utils/validation');
const { getUser, updateUser } = require('../controllers/users');

router.get('/me', getUser);
router.patch('/me', updateUserValidation, updateUser);

module.exports = router;
