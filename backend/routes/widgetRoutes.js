const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const widgetController = require('../controllers/widgetController');

// Widget configuration routes
router.post('/', protect, widgetController.createWidgetConfiguration);
router.get('/:id', protect, widgetController.getWidgetConfigurationById);
router.put('/:id', protect, widgetController.updateWidgetConfiguration);
router.delete('/:id', protect, widgetController.deleteWidgetConfiguration);
router.get('/organization/:orgId', protect, widgetController.getWidgetConfigurationsByOrganization);

module.exports = router;
