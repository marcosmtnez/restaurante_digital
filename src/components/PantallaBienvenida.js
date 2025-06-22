import React, { useState } from "react";
import "../styles/PantallaBienvenida.css";

const PantallaBienvenida = ({ onSalir }) => {
  const [animando, setAnimando] = useState(false);

  const manejarSalida = () => {
    setAnimando(true);
    setTimeout(onSalir, 1000); // duración coincide con animación CSS
  };

  return (
    <div
      className={`pantalla-bienvenida ${animando ? "salir" : ""}`}
      onClick={manejarSalida}
    >
      <div className="contenido-bienvenida">
        <h1>Bienvenido a Mar Manolo</h1>
        <img
          src="/Images/Imagen_manolo.jpg"
          alt="Restaurante Manolo"
          className="imagen-manolo"
        />
      </div>
      <p className="firma-mm">Carta desarrollada por MM&DM COMPANY</p>
    </div>
  );
};

export default PantallaBienvenida;
