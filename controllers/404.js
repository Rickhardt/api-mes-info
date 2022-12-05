exports.get404 = (req, res) => {
  res.status(404).json({
    MENSAJE:
      "La ruta utilizada no existe o ha habido un error de escritura. Revise la ruta e intente de nuevo.",
  });
};
