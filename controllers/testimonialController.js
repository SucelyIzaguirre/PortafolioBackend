const TestimonioController = {};
// routes/testimonials.js
const Testimonial = require('../models/Testimonial.js');

// Crear un nuevo testimonio
TestimonioController.createTestimonio = async (req, res) => {
    try {
    const { clientName, message } = req.body;
    const newTestimonial = new Testimonial({
      user: req.user.id,
      clientName,
      message,
    });
    const testimonial = await newTestimonial.save();
    res.json(testimonial);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Error en el servidor');
  }
};

// Actualizar un testimonio existente
TestimonioController.updateTestimonio = async (req, res) => {
    try {
    const { clientName, message } = req.body;

    let testimonial = await Testimonial.findById(req.params.id);
    if (!testimonial) return res.status(404).json({ msg: 'Testimonio no encontrado' });

    // Verificar que el usuario es el dueño del testimonio
    if (testimonial.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'No autorizado' });
    }

    testimonial = await Testimonial.findByIdAndUpdate(
      req.params.id,
      { $set: { clientName, message } },
      { new: true }
    );

    res.json(testimonial);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Error en el servidor');
  }
};

// Eliminar un testimonio
TestimonioController.deleteTestimonio = async (req, res) => {
    try {
    let testimonial = await Testimonial.findById(req.params.id);
    if (!testimonial) return res.status(404).json({ msg: 'Testimonio no encontrado' });

    // Verificar que el usuario es el dueño del testimonio
    if (testimonial.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'No autorizado' });
    }

    await Testimonial.findByIdAndRemove(req.params.id);

    res.json({ msg: 'Testimonio eliminado' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Error en el servidor');
  }
};

module.exports = TestimonioController;
