const Temperature = require("../models/temperatures");
const express = require("express");

let router = express.Router();

router.post('/new', (req, res) => {
  //CREATE
    Temperature.create({
      sensor_id: req.body.sensor_id,
      sensor_room: req.body.sensor_room,
      temperature: req.body.temperature,
    }, (err, temperature) => {
      if (err) {
        console.log('CREATE Error: ' + err);
        res.status(500).send('Error');
      } else {
        res.status(200).json(temperature);
      }
    });
  });

  router.route('/:id')
  // DELETE
  .delete((req, res) => {
    Temperature.findById(req.params.id, (err, temperature) => {
      if (err) { 
        console.log('DELETE Error: ' + err);
        res.status(500).send('Error');
      } else if (temperature) {
        task.remove( () => {
          res.status(200).json(temperature);
        });
     } else {
        res.status(404).send('Not found');
      }
    });
  });

module.exports = router;