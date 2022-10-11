const Router = require('express').Router;
//const mongodb = require('mongodb');

const db = require('../db');

const router = Router();

router.get('/', async (req, res, next) => {
  db.getDb()
    .db()
    .collection("cuoc_area_cualificacion08")
    .find({}, { projection: {_id:1, sigla_area_cualificacion:1,nombre_area_cualificacion:1}})
    .toArray((err, results) => {
      if (err){
        console.log(err);
        res.status(500).json({ message: 'An error occurred geting filter.' });      
      }
      res.status(200).json(results);
    })
});

module.exports = router;