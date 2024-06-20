const path = require('path');
const router = require('express').Router();
const { endpoint } = require('../controllers/endpoint_api');

router.get('/fetch', (req, res) => {
    res.sendFile(path.join(__dirname,'../app/views/fetch.html'));
});
  
router.get('/submit', (req, res) => {
      res.sendFile(path.join(__dirname,'../app/views/form.html'));
});
  
router.get('/webcam', (req, res) => {
      res.sendFile(path.join(__dirname,'../app/views/webcam_crop.html'));
});

/* POST slot*/
router.post('/parking_slot/add', endpoint.addSlot);

/* GET slot*/
router.get('/parking_slot/get', endpoint.getParkSlot);

/* POST Update slot*/
router.post('/parking_slot/update', endpoint.updateSlot);

/* GET layout data */
router.get('/layout', endpoint.getLayout);

/* GET semua data */
router.get('/parking_slots', endpoint.getAll);

/* GET data status park */
router.get('/status', endpoint.parkStatus);

router.get('/', (req, res) => {
      res.send('Hello from Backend');
});


module.exports = router;
