const Router = require('express').Router;
const bcrypt = require('bcryptjs');
const db = require('../db');

const router = Router();

router.post('/reset-password', async (req, res) => {
  const { email, newPassword } = req.body;

  if (!email || !newPassword) {
    return res.status(400).json({ message: 'Email y nueva contraseña requeridos' });
  }

  try {
    const hashedPW = await bcrypt.hash(newPassword, 12);
    const result = await db.getDb().collection('users').updateOne(
      { email },
      { $set: { password: hashedPW } }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    res.status(200).json({ message: 'Contraseña reseteada correctamente' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error al resetear contraseña' });
  }
});

module.exports = router;
