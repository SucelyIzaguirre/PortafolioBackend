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

// // Crear un nuevo portafolio
// portfolioController.createPortafolio = async (req, res) => {
//   try {
//     const { title, description } = req.body;
//     const images = req.file ? [`/uploads/${req.file.filename}`] : []; // Solo una imagen en este caso

//     const newPortfolio = new Portfolio({
//       user: req.user.id, // Supuesto que el ID del usuario está disponible en `req.user.id`
//       title,
//       description,
//       projects: [{
//         title: 'Project Title', // Puedes ajustar esto según el formato que necesites
//         description: 'Project Description',
//         images,
//       }],
//     });

//     await newPortfolio.save();
//     res.status(201).json(newPortfolio);
//   } catch (err) {
//     res.status(500).json({ error: 'Error al crear el portafolio' });
//   }
// };

portfolioController.createPortafolio = async (req, res) => {
  try {
    const user = req.user; // Asegúrate de que req.user esté disponible

    const { title, description, projects } = req.body;

    // Construir el array de proyectos con sus imágenes
    const formattedProjects = JSON.parse(projects).map((project) => ({
        title: project.title,
        description: project.description,
        images: [] // Inicializar el array de imágenes vacío
    }));

    // Añadir imágenes a cada proyecto
    Object.keys(req.files).forEach((key) => {
        const [_, projectIndex, imageIndex] = key.split('_').map(Number);
        if (!isNaN(projectIndex) && !isNaN(imageIndex)) {
            formattedProjects[projectIndex].images[imageIndex] = `/uploads/${req.files[key][0].filename}`;
        }
    });

    const newPortfolio = new Portfolio({
        user: user._id,
        title,
        description,
        projects: formattedProjects
    });

    await newPortfolio.save();
    res.status(201).json(newPortfolio);
} catch (error) {
    console.error('Error al crear el portafolio', error);
    res.status(500).json({ message: 'Error al crear el portafolio.' });
}
}

// Actualizar un portafolio existente
portfolioController.updatePortafolio = async (req, res) => {
  try {
    const user = req.user; // Asegúrate de que req.user esté disponible

    const { id } = req.params;
    const { title, description, projects } = req.body;

    // Construir el array de proyectos con sus imágenes
    const formattedProjects = JSON.parse(projects).map((project) => ({
        title: project.title,
        description: project.description,
        images: [] // Inicializar el array de imágenes vacío
    }));

    // Añadir imágenes a cada proyecto
    Object.keys(req.files).forEach((key) => {
        const [_, projectIndex, imageIndex] = key.split('_').map(Number);
        if (!isNaN(projectIndex) && !isNaN(imageIndex)) {
            formattedProjects[projectIndex].images[imageIndex] = `/uploads/${req.files[key][0].filename}`;
        }
    });

    const updatedPortfolio = await Portfolio.findByIdAndUpdate(
        id,
        {
            title,
            description,
            projects: formattedProjects
        },
        { new: true }
    );

    if (!updatedPortfolio) {
        return res.status(404).json({ message: 'Portafolio no encontrado.' });
    }

    res.json(updatedPortfolio);
} catch (error) {
    console.error('Error al actualizar el portafolio', error);
    res.status(500).json({ message: 'Error al actualizar el portafolio.' });
}
};

// Controlador para eliminar un portafolio
portfolioController.deletePortfolio = async (req, res) => {
  try {
    console.log('Request received to delete portfolio with ID:', req.params.id); // Verifica el ID
    const { id } = req.params;
    const user = req.user;

    const portfolio = await Portfolio.findById(id);
    if (!portfolio) {
        return res.status(404).json({ message: 'Portafolio no encontrado.' });
    }

    if (portfolio.user.toString() !== user._id.toString()) {
        return res.status(403).json({ message: 'No tienes permiso para eliminar este portafolio.' });
    }

    await Portfolio.findByIdAndDelete(id);
    res.json({ message: 'Portafolio eliminado exitosamente.' });
} catch (error) {
    console.error('Error al eliminar el portafolio', error);
    res.status(500).json({ message: 'Error al eliminar el portafolio.' });
}
};

module.exports = portfolioController;
