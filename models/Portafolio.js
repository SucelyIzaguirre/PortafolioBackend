const mongoose = require("mongoose");

const PortfolioSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Referencia al modelo User
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
    projects: [
      {
        title: {
          type: String,
          required: true,
        },
        description: {
          type: String,
          required: true,
        },
        images: [
          {
            type: String, // URLs o rutas de las imágenes
            required: true,
          },
        ],
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Portfolio", PortfolioSchema);
