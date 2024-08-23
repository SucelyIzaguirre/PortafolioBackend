const portfolioController = {};
// routes/portfolios.js
const express = require("express");
const Portfolio = require("../models/Portafolio.js");

// Obtener los portafolios de un usuario
portfolioController.getUserPortfolios = async (req, res) => {
  try {
    const portfolios = await Portfolio.find({ user: req.user.id });
    res.status(200).json(portfolios);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al obtener los portafolios" });
  }
};

// Crear un nuevo portafolio
portfolioController.createPortafolio = async (req, res) => {
  try {
    const { title, description } = req.body;
    const images = req.file ? [`/uploads/${req.file.filename}`] : []; // Solo una imagen en este caso

    const newPortfolio = new Portfolio({
      user: req.user.id, // Supuesto que el ID del usuario está disponible en `req.user.id`
      title,
      description,
      projects: [{
        title: 'Project Title', // Puedes ajustar esto según el formato que necesites
        description: 'Project Description',
        images,
      }],
    });

    await newPortfolio.save();
    res.status(201).json(newPortfolio);
  } catch (err) {
    res.status(500).json({ error: 'Error al crear el portafolio' });
  }
};

// Actualizar un portafolio existente
portfolioController.updatePortafolio = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, projects } = req.body;

    // Obtener el portafolio existente
    const existingPortfolio = await Portfolio.findById(id);

    if (!existingPortfolio) {
      return res.status(404).json({ error: 'Portafolio no encontrado' });
    }

    // Procesar las imágenes si se han subido
    const projectData = JSON.parse(projects).map((project, index) => {
      const images = req.files
        ? req.files.slice(index * project.images.length, (index + 1) * project.images.length)
          .map(file => `/uploads/${file.filename}`)
        : project.images;
      return { ...project, images };
    });

    // Actualizar el portafolio
    const updatedPortfolio = await Portfolio.findByIdAndUpdate(id, {
      title,
      description,
      projects: projectData,
    }, { new: true });

    res.status(200).json(updatedPortfolio);
  } catch (err) {
    res.status(500).json({ error: 'Error al actualizar el portafolio' });
  }
};

// Controlador para eliminar un portafolio
portfolioController.deletePortfolio = async (req, res) => {
  try {
    const { id } = req.params;

    // Verificar si el portafolio existe
    const portfolio = await Portfolio.findById(id);
    if (!portfolio) {
      return res.status(404).json({ error: 'Portafolio no encontrado' });
    }

    // Eliminar el portafolio
    await Portfolio.findByIdAndDelete(id);

    res.status(200).json({ message: 'Portafolio eliminado con éxito' });
  } catch (err) {
    res.status(500).json({ error: 'Error al eliminar el portafolio' });
  }
};

module.exports = portfolioController;
