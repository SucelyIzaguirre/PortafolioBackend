const portfolioController = {}; 
  // routes/portfolios.js
  const express = require('express');
  const Portfolio = require('../models/Portafolio.js');

// Subir imágenes a AWS S3
portfolioController.uploadImages = async (req, res) => {
    try {
      const fileLocations = req.files.map(file => file.location);
      res.json({ fileLocations });
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Error en el servidor');
    }
  };

// Crear un nuevo portafolio
portfolioController.createPortafolio = async (req, res) => {
    try {
    const { title, description, projects } = req.body;
    const newPortfolio = new Portfolio({
      user: req.user.id,
      title,
      description,
      projects
    });
    const portfolio = await newPortfolio.save();
    res.json(portfolio);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Error en el servidor');
  }
};

// Actualizar un portafolio existente
portfolioController.updatePortafolio = async (req, res) => {
    try {
    const { title, description, projects } = req.body;

    let portfolio = await Portfolio.findById(req.params.id);
    if (!portfolio) return res.status(404).json({ msg: 'Portafolio no encontrado' });

    // Verificar que el usuario es el dueño del portafolio
    if (portfolio.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'No autorizado' });
    }

    portfolio = await Portfolio.findByIdAndUpdate(
      req.params.id,
      { $set: { title, description, projects } },
      { new: true }
    );

    res.json(portfolio);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Error en el servidor');
  }
};

module.exports = portfolioController;
  