const Router = require('express').Router;
const mongodb = require('mongodb');

const db = require('../db');

const Decimal128 = mongodb.Decimal128;
const ObjectId = mongodb.ObjectId;

const router = Router();

// Get single indice
router.get('/:id', async (req, res, next) => {
    const pipeline = [
        { $match: { _id: new ObjectId(req.params.id) } },
        {
            $lookup: {
                from: 'cuoc_ocupacion_area_cualificacion13',
                localField: '_id',
                foreignField: "id_area_conocimiento",
                as: "ocupacion_area_cualificacion13"
            },
        },
        {
            $lookup: {
                from: 'cuoc_ocupacion02',
                localField: 'ocupacion_area_cualificacion13.ocupacion',
                foreignField: 'cod_indice',
                as: 'ocupaciones',
            }
        },
        {
            $lookup: {
                from: 'cuoc_indice01',
                localField: 'ocupaciones.cod_indice',
                foreignField: 'cod_indice',
                as: 'indices',
            }
        },
        {
            $project: {
                "indices.nombre_cuoc_indice": 1,
                "ocupaciones.descripcion_ocupacion": 1,
                "ocupaciones.nivel_competencia": 1,
                "indices._id": 1,
                "indices.nombre_cuoc_indice": 1,
            }
        }
    ];

    const indiceArr = [];
    // let cont = 0;
    const aggCursor = db.getDb()
        .db()
        .collection("cuoc_area_cualificacion08")
        .aggregate(pipeline);

    await aggCursor.forEach(indiceData => {
        // cont += 1;
        console.log("Detail..");
        // console.log("indiceData", indiceData);
        indiceArr.push(indiceData);
    })
        .then(result => {
            res.status(200).json(indiceArr);
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({ message: 'An error occurred.' });
        });
});

// Add new indice
// Requires logged in user
router.post('', (req, res, next) => {
    const newIndice = {
        name: req.body.name,
        description: req.body.description,
        price: Decimal128.fromString(req.body.price.toString()), // store this as 128bit decimal in MongoDB
        image: req.body.image
    };
    db.getDb()
        .db()
        .collection('cuoc_indice01')
        .insertOne(newIndice)
        .then(result => {
            res
                .status(201)
                .json({ message: 'Indice added', indiceId: result.insertedId });
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({ message: 'An error occurred.' });
        });
});
// Edit existing indice
// Requires logged in user
router.patch('/:id', (req, res, next) => {
    const updatedIndice = {
        name: req.body.name,
        description: req.body.description,
        price: Decimal128.fromString(req.body.price.toString()), // store this as 128bit decimal in MongoDB
        image: req.body.image
    };
    db.getDb()
        .db()
        .collection('cuoc_indice01')
        .updateOne(
            { _id: new ObjectId(req.params.id) },
            { $set: updatedIndice })
        .then(result => {
            res.status(200).json({ message: 'Indice updated', indiceId: req.params.id });
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({ message: 'An error occurred.' });
        })
});

// Delete a indice
// Requires logged in user
router.delete('/:id', (req, res, next) => {
    db.getDb()
        .db()
        .collection('cuoc_indice01')
        .deleteOne({ _id: new ObjectId(req.params.id) })
        .then(result => {
            res.status(200).json({ message: 'Indice deleted' });
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({ message: 'An error occurred.' });
        });
});

module.exports = router;