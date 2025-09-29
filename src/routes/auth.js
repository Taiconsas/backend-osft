const Router = require('express').Router;
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const db = require('../db');

const router = Router();

const SECRET_KEY = 'secret'; // clave para firmar los tokens

// Función para crear token
const createToken = (userId) => {
  return jwt.sign({ userId }, SECRET_KEY, { expiresIn: '1h' });
};

// ===================== LOGIN =====================
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const userDoc = await db.getDb().collection('users').findOne({ email });

    if (!userDoc) {
      return res.status(401).json({ message: 'Authentication failed, invalid username or password.' });
    }

    const isMatch = await bcrypt.compare(password, userDoc.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Authentication failed, invalid username or password.' });
    }

    const token = createToken(userDoc._id);
    res.status(200).json({ message: 'Authentication succeeded.', token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Login error.' });
  }
});

// ===================== SIGNUP =====================
router.post('/signup', async (req, res) => {
  try {
    const { email, password } = req.body;
    const hashedPW = await bcrypt.hash(password, 12);

    const result = await db.getDb().collection('users').insertOne({
      email,
      password: hashedPW
    });

    const token = createToken(result.insertedId);
    res.status(201).json({ token, user: { email } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Creating the user failed.' });
  }
});

// ===================== USUARIOS (solo DEV) =====================
router.get('/users-dev', async (req, res) => {
  try {
    const users = await db.getDb().collection('users').find().toArray();
    res.json({ users });
  } catch (err) {
    console.error('Error al obtener usuarios:', err);
    res.status(500).json({ message: 'Error al obtener usuarios' });
  }
});

// ===================== VALIDAR TOKEN =====================
router.get('/validate-token', (req, res) => {
  try {
    const authHeader = req.get('Authorization'); // 'Bearer <token>'
    if (!authHeader) return res.status(401).json({ message: 'No token provided' });

    const token = authHeader.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'Token missing' });

    const decodedToken = jwt.verify(token, SECRET_KEY);
    res.status(200).json({ message: 'Token válido', userId: decodedToken.userId });
  } catch (err) {
    console.error(err);
    res.status(401).json({ message: 'Token inválido o expirado' });
  }
});

module.exports = router;
