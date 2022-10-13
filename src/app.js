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

const PORT = 3200;
const app = express();

app.use(bodyParser.json());
app.use('/images', express.static(path.join('backend/images')));


const allowedOrigins = ["https://app-taicon-osft.netlify.app", "http://jorges-macbook-pro.local:3000", "http://localhost:3000"]

app.use(cors({
  origin: allowedOrigins
}));

app.use((req, res, next) => {
  // Set CORS headers so that the React SPA is able to communicate with this server
  res.setHeader('Access-Control-Allow-Origin', "*");
  res.setHeader(
    'Access-Control-Allow-Methods',
    'GET,POST,PUT,PATCH,DELETE,OPTIONS'
  );
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  // res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  next();
});

// app.use('/.netlify/functions/indices', indicesRoutes);
app.use('/indices', indicesRoutes);
// app.use('/.netlify/functions/indicesFilter', indicesFilterRoutes);
// app.use('/indicesFilter', indicesFilterRoutes);
// app.use('/.netlify/functions/', authRoutes);
app.use('/areasFilter', areasFilterRoutes);
app.use('/indicesArea', indicesAreaRoutes);
//app.use('/', authRoutes);

db.initDb((err, db) => {
  if (err) {
    console.log(err);
  } else {
    app.listen(PORT);
  }
});

// module.exports=app;

// module.exports.handler = serverless(app);