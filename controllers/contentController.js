const ContentController = {};
// controllers/contentController.js
const Content = require('../models/Content.js');

// Crear contenido
ContentController.createContent = async (req, res) => {
  try {
    const { type, title, body, images } = req.body;
    const newContent = new Content({
      user: req.user.id,
      type,
      title,
      body,
      images,
    });
    const content = await newContent.save();
    res.json(content);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Error en el servidor');
  }
};

ContentController.getUserContents = async (req, res) => {
    try {
      // Obtener el ID del usuario autenticado
      const userId = req.user.id;
  
      // Buscar todos los contenidos asociados al usuario
      const contents = await Content.find({ user: userId });
  
      // Devolver los contenidos en la respuesta
      res.json(contents);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Error en el servidor');
    }
};

// Actualizar contenido
ContentController.updateContent = async (req, res) => {
  try {
    const { type, title, body, images } = req.body;

    let content = await Content.findById(req.params.id);
    if (!content) return res.status(404).json({ msg: 'Contenido no encontrado' });

    // Verificar que el usuario es el dueño del contenido
    if (content.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'No autorizado' });
    }

    content = await Content.findByIdAndUpdate(
      req.params.id,
      { $set: { type, title, body, images } },
      { new: true }
    );

    res.json(content);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Error en el servidor');
  }
};

// Eliminar contenido
ContentController.deleteContent = async (req, res) => {
  try {
    let content = await Content.findById(req.params.id);
    if (!content) return res.status(404).json({ msg: 'Contenido no encontrado' });

    // Verificar que el usuario es el dueño del contenido
    if (content.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'No autorizado' });
    }

    await Content.findByIdAndDelete(req.params.id);

    res.json({ msg: 'Contenido eliminado' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Error en el servidor');
  }
};

module.exports = ContentController;

