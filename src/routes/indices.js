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
        from: 'cuoc_ocupacion02',
        localField: 'cod_indice',
        foreignField: "cod_indice",
        as: "ocupacion02"
      }
    },
    {
      $lookup: {
        from: 'cuoc_competencias11',
        localField: 'ocupacion02.nivel_competencia',
        foreignField: "nivel_competencia_cuoc",
        as: "competencia11"
      }
    },
    {
      $lookup: {
        from: 'cuoc_conocimiento05',
        localField: 'cod_indice',
        foreignField: "ocupacion",
        as: "conocimiento05"
      }
    },
    {
      $lookup: {
        from: 'cuoc_denominaciones03',
        localField: 'cod_indice',
        foreignField: "ocupacion",
        as: "denominaciones03"
      }
    },
    {
      $lookup: {
        from: 'cuoc_ocupacion_destreza12',
        localField: 'cod_indice',
        foreignField: "ocupacion",
        as: "ocupacionDestreza12"
      }
    },
    {
      $lookup: {
        from: 'cuoc_destreza06',
        localField: 'ocupacionDestreza12.id_destreza',
        foreignField: "id_destreza",
        as: "destreza06"
      }
    },
    {
      $lookup: {
        from: 'cuoc_funciones04',
        localField: 'cod_indice',
        foreignField: "ocupacion",
        as: "funciones04"
      }
    },
    {
      $lookup: {
        from: 'cuoc_ocupacion_afin07',
        localField: 'cod_indice',
        foreignField: "ocupacion",
        as: "ocupacion_afin07"
      }
    },
    {
      $lookup: {
        from: 'cuoc_equivalencia10',
        localField: 'cod_indice',
        foreignField: "ocupacion",
        as: "equivalencia10"
      }
    },
    {
      $lookup: {
        from: 'cuoc_ocupacion_area_cualificacion13',
        localField: 'cod_indice',
        foreignField: "ocupacion",
        as: "ocupacion_area_cualificacion13"
      },
    },
    {
      $lookup: {
        from: 'cuoc_area_cualificacion08',
        localField: 'ocupacion_area_cualificacion13.id_area_conocimiento',
        foreignField: '_id',
        as: 'areas',
      }
    },
    {
      $project: {
        "cod_indice": 1,
        "longitud_indice": 1,
        "indice_gran_grupo": 1,
        "indice_subgrupo_ppal": 1,
        "indice_subgrupo": 1,
        "indice_grupo_primario": 1,
        "indice_perfil_ocupacional": 1,
        "indice_denominacion_ocupacion": 1,
        "nombre_cuoc_indice": 1,
        "ocupacion02.cod_indice": 1,
        "ocupacion02.descripcion_ocupacion": 1,
        "competencia11.nivel_competencia_cuoc": 1,
        "competencia11.descriptor_nivel_competencia_cuoc": 1,
        "conocimiento05.id_conocimiento": 1,
        "conocimiento05.nombre_conocimiento": 1,
        "denominaciones03.denominacion": 1,
        "denominaciones03.nombre_denominacion": 1,
        "denominaciones03.fuente_denominacion": 1,
        "denominaciones03.codigo_ciuo": 1,
        "destreza06.id_destreza": 1,
        "destreza06.nombre_destreza": 1,
        "destreza06.descripcion_destreza": 1,
        "funciones04.consecutivo_funcion": 1,
        "funciones04.redaccion_funcion": 1,
        "funciones04.fuente_ciuo": 1,
        "funciones04.fuente_cno": 1,
        "ocupacion_afin07.ocupacion_afin": 1,
        "ocupacion_afin07.nombre_ocupacion_afin": 1,
        "equivalencia10.codigo_ciuo": 1,
        "equivalencia10.observacion_ciuo": 1,
        "equivalencia10.codigo_cno": 1,
        "equivalencia10.observacion_cno": 1,
        "equivalencia10.validacion": 1,
        "areas._id": 1,
        "areas.sigla_area_cualificacion": 1,
        "areas.nombre_area_cualificacion": 1,
        "areas.id_area_cualificacion": 1,
        "areas.descripcion_area_cualificacion": 1,
      }
    }
  ];

  const indiceArr = [];
  // let cont = 0;
  const aggCursor = db.getDb()
    .db()
    .collection("cuoc_indice01")
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
    .deleteOne({ _id: new ObjectId(req.params.id)})
    .then(result => {
      res.status(200).json({ message: 'Indice deleted' });
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({ message: 'An error occurred.' });
    });
});

module.exports = router;