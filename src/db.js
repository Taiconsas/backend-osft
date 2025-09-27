const { MongoClient } = require('mongodb');

let _db;

const initDb = async (callback) => {
  if (_db) {
    console.log('Database already initialized');
    return callback(null, _db);
  }

  const mongoUri = process.env.MONGO_URI;
  if (!mongoUri) {
    return callback(new Error('MONGO_URI no está definida'));
  }

  try {
    const client = await MongoClient.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    _db = client.db(); // obtiene la DB por defecto de la URI
    console.log('DB connected successfully');
    callback(null, _db);
  } catch (err) {
    callback(err);
  }
};

const getDb = () => {
  if (!_db) throw new Error('Database not initialized');
  return _db;
};

module.exports = { initDb, getDb };
