const mongoose = require('mongoose');

const PortfolioSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  projects: [{
    title: String,
    description: String,
    images: [String], // URLs o rutas de las imágenes
  }],
}, { timestamps: true });

module.exports = mongoose.model('Portfolio', PortfolioSchema);

