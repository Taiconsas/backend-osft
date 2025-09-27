require('dotenv').config(); // carga variables de .env
const path = require('path');

const express = require('express');
// const serverless = require('serverless-http');
const cors = require('cors');
const bodyParser = require('body-parser');

const indicesRoutes = require('./routes/indices');
const indicesFilterRoutes = require('./routes/indicesfilter');
const areasFilterRoutes = require('./routes/areafilter');
const indicesAreaRoutes = require('./routes/indicesarea');

const authRoutes = require('./routes/auth');
const db = require('./db');

const PORT = process.env.PORT || 3200;
const app = express();

app.use(bodyParser.json());
app.use('/images', express.static(path.join('backend/images')));



const allowedOrigins = [
  "https://app-taicon-osft.netlify.app", 
  "http://jorges-macbook-pro.local:3000", 
  "http://localhost:3000",
  "https://site-osft.onrender.com",
  "https://osft-site.onrender.com",
   process.env.FRONTEND_URL,
];

app.use(cors({
  origin: function (origin, callback) {
    // Permite requests sin 'origin' (por ejemplo, Postman o curl)
    if (!origin) return callback(null, true);

    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = "CORS bloqueó el request desde: " + origin;
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  credentials: true
}));

// app.use('/.netlify/functions/indices', indicesRoutes);
app.use('/indices', indicesRoutes);
// app.use('/.netlify/functions/indicesFilter', indicesFilterRoutes);
app.use('/indicesFilter', indicesFilterRoutes);
// app.use('/.netlify/functions/', authRoutes);
app.use('/areasFilter', areasFilterRoutes);
app.use('/indicesArea', indicesAreaRoutes);
app.use('/', authRoutes);

db.initDb((err, db) => {
  if (err) {
    console.log(err);
  } else {
    app.listen(PORT, () => {
      console.log(`Servidor corriendo en puerto ${PORT}`);
    });
  }
});

// module.exports=app;

// module.exports.handler = serverless(app);