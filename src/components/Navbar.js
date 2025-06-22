import React, { useContext, useRef, useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { PedidoContext } from "../context/PedidoContext";
import { IdiomaContext } from "../context/IdiomaContext";
import traducciones from "./traducciones"; // <-- ajustado si está en components

const Navbar = ({ categoria, setCategoria }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { pedido } = useContext(PedidoContext);
  const { idioma, setIdioma } = useContext(IdiomaContext);
  const t = traducciones[idioma];
  const scrollRef = useRef(null);

  const [mostrarIdiomas, setMostrarIdiomas] = useState(false);
  const categorias = [
  "Entrantes",
  "Platos principales",
  "Wraps y Bocadillos",
  "Especialidades Internacionales",
  "Postres",
  "Bebidas"
];

  const idiomas = ["es", "en", "fr", "it"];

  const cambiarIdioma = (nuevo) => {
    setIdioma(nuevo);
    setMostrarIdiomas(false);
  };

  useEffect(() => {
    const activeBtn = document.querySelector(".categoria-btn.active");
    if (activeBtn && scrollRef.current) {
      const container = scrollRef.current;
      const offsetLeft = activeBtn.offsetLeft;
      const containerWidth = container.clientWidth;
      const buttonWidth = activeBtn.clientWidth;
      const scrollPosition = offsetLeft - containerWidth / 2 + buttonWidth / 2;
      container.scrollTo({ left: scrollPosition, behavior: "smooth" });
    }
  }, [categoria]);

  // 🛑 Si estamos en /pedido, no renderizar Navbar
  if (location.pathname === "/pedido") {
    return null;
  }

  return (
    <>
      {/* 🔷 Barra superior de categorías */}
      <div
  ref={scrollRef}
  className="categoria-scroll"
  style={{
    position: "absolute",
    top: "32px",
    left: "50%",
    transform: "translateX(-50%)",
    width: "100vw",
    maxWidth: "430px",
    padding: "0 12px",
    overflowX: "auto",
    overflowY: "hidden",
    whiteSpace: "nowrap",
    display: "flex",
    alignItems: "center",
    zIndex: 100,
    background: "transparent",
    WebkitOverflowScrolling: "touch",
    scrollbarWidth: "none", // Firefox
    msOverflowStyle: "none", // IE/Edge
  }}
>

        {categorias.map((cat) => (
          <button
            key={cat}
            onClick={() => setCategoria(cat)}
            className={`categoria-btn ${categoria === cat ? "active" : ""}`}
            style={{
              background: "transparent",
              color: "white",
              fontSize: "1rem",
              fontWeight: "500",
              border: "none",
              paddingBottom: "4px",
              borderBottom: categoria === cat ? "2px solid white" : "2px solid transparent",
              whiteSpace: "nowrap",
              cursor: "pointer",
              transition: "all 0.2s ease-in-out",
padding: "6px 8px",
            }}
          >
            {traducciones[idioma][cat] || cat}

          </button>
        ))}
      </div>

      {/* 🔽 Barra inferior fija */}
      <nav
        style={{
          position: "fixed",
          bottom: 0,
          left: "50%",
          transform: "translateX(-50%)",
          width: "100vw",
          maxWidth: "430px",
          backgroundColor: "#444",
          borderBottomLeftRadius: "0px",
          borderBottomRightRadius: "0px",
          display: "flex",
          justifyContent: "space-around",
          alignItems: "center",
          padding: "8px 0",
          zIndex: 50,
        }}
      >
        <button
          onClick={() => navigate("/")}
          style={{
            color: location.pathname === "/" ? "#00f2aa" : "white",
            fontSize: "0.75rem",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          🏠
          <span>{t.inicio}</span>
        </button>

        <button
          onClick={() => navigate("/pedido")}
          style={{
            color: location.pathname === "/pedido" ? "#00f2aa" : "white",
            fontSize: "0.75rem",
            position: "relative",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          🛒
          <span>{t.pedido}</span>
          {pedido.length > 0 && (
            <span
              style={{
                position: "absolute",
                top: 0,
                right: -4,
                backgroundColor: "red",
                color: "white",
                borderRadius: "50%",
                padding: "0 6px",
                fontSize: "0.75rem",
                lineHeight: "1rem",
              }}
            >
              {pedido.reduce((total, item) => total + (item.cantidad || 1), 0)}
            </span>
          )}
        </button>

        {/* 🌐 Selector de idioma */}
        <div style={{ position: "relative" }}>
          <button
            onClick={() => setMostrarIdiomas(!mostrarIdiomas)}
            style={{
              background: "none",
              border: "none",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              cursor: "pointer",
            }}
          >
            <img
              src={`/Banderas/${idioma}.png`}
              alt={idioma}
              style={{ width: "24px", height: "24px", borderRadius: "4px" }}
            />
            <span style={{ color: "white", fontSize: "0.75rem" }}>{t.idioma}</span>
          </button>

          {mostrarIdiomas && (
            <div
              style={{
                position: "absolute",
                bottom: "40px",
                right: "-8px",
                background: "#333",
                borderRadius: "8px",
                padding: "6px",
                display: "flex",
                flexDirection: "column",
                gap: "6px",
                zIndex: 60,
              }}
            >
              {idiomas.map((lang) => (
                <button
                  key={lang}
                  onClick={() => cambiarIdioma(lang)}
                  style={{
                    background: "none",
                    border: "none",
                    padding: "4px",
                    cursor: "pointer",
                  }}
                >
                  <img
                    src={`/Banderas/${lang}.png`}
                    alt={lang}
                    style={{ width: "24px", height: "24px", borderRadius: "4px" }}
                  />
                </button>
              ))}
            </div>
          )}
        </div>
      </nav>
    </>
  );
};

export default Navbar;























