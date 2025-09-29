const Router = require('express').Router;
const bcrypt = require('bcryptjs');
const db = require('../db');

const router = Router();

// Nota: ruta base será el prefijo que pongamos en app.js
router.post('/', async (req, res) => {
  const { email, newPassword, newEmail } = req.body;

  if (!email || !newPassword) {
    return res.status(400).json({ message: 'Email y nueva contraseña requeridos' });
  }

  try {
    const hashedPW = await bcrypt.hash(newPassword, 12);

    const updateFields = { password: hashedPW };
    if (newEmail && newEmail !== email) {
      updateFields.email = newEmail;
    }

    const result = await db.getDb().collection('users').updateOne(
      { email },       
      { $set: updateFields }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    res.status(200).json({ 
      message: 'Información de usuario actualizada correctamente',
      updatedEmail: updateFields.email || email
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error al actualizar información del usuario' });
  }
});

module.exports = router;
