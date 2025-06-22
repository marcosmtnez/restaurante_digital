import React, { useState, useEffect, useContext, useRef } from "react";
import { PedidoContext } from "../context/PedidoContext";
import { IdiomaContext } from "../context/IdiomaContext";
import { db } from "../firebase";
import ProgressBar from "./ProgressBar";
import traducciones from "./traducciones";

import {
  doc,
  collection,
  onSnapshot,
  getDoc,
  getDocs,
  setDoc,
  deleteDoc,
} from "firebase/firestore";



const Platos = ({ categoria }) => {
  const { agregarAlPedido } = useContext(PedidoContext);
  const { idioma } = useContext(IdiomaContext);
  const t = traducciones[idioma];
  const dragStartY = useRef(null);
  const isDraggingComentarios = useRef(false);
  const [platos, setPlatos] = useState([]);
  const [index, setIndex] = useState(0);
  const [likes, setLikes] = useState({});
  const [comentarios, setComentarios] = useState({});
  const [nuevoComentario, setNuevoComentario] = useState({});
  const [mostrarComentariosId, setMostrarComentariosId] = useState(null);
  const [notificacionVisible, setNotificacionVisible] = useState(false);
  const [expandedPlatoId, setExpandedPlatoId] = useState(null);
  const [cerrandoComentarios, setCerrandoComentarios] = useState(false);
  const [userLikes, setUserLikes] = useState({});
  const containerRef = useRef(null);
  const startYRef = useRef(null);
  const videoRefs = useRef({});
  const userId = useRef(null);
  const [videoPausado, setVideoPausado] = useState({});
  const [scrollBloqueado, setScrollBloqueado] = useState(false);



const bloquearScrollTemporal = () => {
  setScrollBloqueado(true);
  setTimeout(() => {
    setScrollBloqueado(false);
  }, 500); // Bloquea el scroll durante 500 ms
};


useEffect(() => {
  const storedId = localStorage.getItem("userId");
  if (storedId) {
    userId.current = storedId;
  } else {
    const newId = crypto.randomUUID();
    localStorage.setItem("userId", newId);
    userId.current = newId;
  }
}, []);



useEffect(() => {
  if (!userId.current || platos.length === 0) return;

  const cargarLikesYUserLikes = async () => {
    const nuevosLikes = {};
    const nuevosUserLikes = {};

    for (const plato of platos) {
      const likesRef = collection(
        db,
        "restaurantes",
        "restaurante_ejemplo",
        categoria,
        plato.id.toString(),
        "likes"
      );

      const likesSnap = await getDocs(likesRef);
      nuevosLikes[plato.id] = likesSnap.size;

      // Comprueba si el usuario actual ha dado like
      const likeDoc = await getDoc(doc(likesRef, userId.current));
      if (likeDoc.exists()) {
        nuevosUserLikes[`${userId.current}_${plato.id}`] = true;
      }
    }

    setLikes(nuevosLikes);
    setUserLikes(nuevosUserLikes);
  };

  cargarLikesYUserLikes();
}, [platos, categoria]);





useEffect(() => {
  Object.keys(videoRefs.current).forEach((key) => {
    const platoIndex = platos.findIndex((p) => p.id.toString() === key);
    if (Math.abs(index - platoIndex) > 1) {
      delete videoRefs.current[key];
    }
  });
}, [index, platos]);



useEffect(() => {
  const ref = collection(db, "restaurantes", "restaurante_ejemplo", categoria);

  const unsubscribe = onSnapshot(ref, (snapshot) => {
    const nuevosPlatos = [];
    const nuevosLikes = {};
    const nuevosComentarios = {};

    snapshot.forEach((doc) => {
      const data = doc.data();
      nuevosPlatos.push({ id: doc.id, ...data });
      nuevosLikes[doc.id] = data.likes || 0;
      nuevosComentarios[doc.id] = data.comentarios || [];
    });

    setPlatos(nuevosPlatos);
    setLikes(nuevosLikes);
    setComentarios(nuevosComentarios);
    setIndex(0); // 👈 Reiniciamos el scroll
    videoRefs.current = {}; // 👈 Vaciamos los vídeos anteriores
  });

  return () => unsubscribe();
}, [categoria]);

useEffect(() => {
  if (platos.length === 0) return;

  const id = platos[0]?.id;
  const intentarReproducir = () => {
    const video = videoRefs.current[id];
    if (video) {
      video.currentTime = 0;
      video.play().catch((e) => console.warn("🎥 Error al reproducir primer video:", e));
    } else {
      // Si aún no está montado, reintenta en el próximo frame
      requestAnimationFrame(intentarReproducir);
    }
  };

  requestAnimationFrame(intentarReproducir);
}, [platos]);


// 👉 Cuando cambia la categoría, vuelve al primer plato
useEffect(() => {
  setIndex(0);
}, [categoria]);





useEffect(() => {
  const cargarComentariosPorPlato = async () => {
    const nuevosComentarios = {};

    for (const plato of platos) {
      const snapshot = await getDocs(
        collection(
          db,
          "restaurantes",
          "restaurante_ejemplo",
          categoria,
          plato.id.toString(),
          "comentarios"
        )
      );

      nuevosComentarios[plato.id] = snapshot.docs.map((doc) => doc.data());
    }

    setComentarios(nuevosComentarios);
  };

  if (platos.length > 0) {
    cargarComentariosPorPlato();
  }
}, [platos, categoria]);

const handleLike = async (platoId) => {
  const likeDocId = userId.current;
  const userKey = `${userId.current}_${platoId}`;

  const likeRef = doc(
    db,
    "restaurantes",
    "restaurante_ejemplo",
    categoria,
    platoId.toString(),
    "likes",
    likeDocId
  );

  const likesRef = collection(
    db,
    "restaurantes",
    "restaurante_ejemplo",
    categoria,
    platoId.toString(),
    "likes"
  );

  try {
    const likeSnap = await getDoc(likeRef);

    if (likeSnap.exists()) {
      await deleteDoc(likeRef);
      setUserLikes((prev) => ({
        ...prev,
        [userKey]: false,
      }));
    } else {
      await setDoc(likeRef, {
        userId: likeDocId,
        timestamp: new Date().toISOString(),
      });
      setUserLikes((prev) => ({
        ...prev,
        [userKey]: true,
      }));
    }

    // Actualizar contador de likes
    const updatedLikesSnap = await getDocs(likesRef);
    setLikes((prev) => ({
      ...prev,
      [platoId]: updatedLikesSnap.size,
    }));
  } catch (error) {
    console.error("❌ Error gestionando el like:", error);
  }
};


  
  const handleTouchStart = (e) => {
    if (mostrarComentariosId !== null) return; // Ignora si comentarios abiertos
    startYRef.current = e.touches[0].clientY;
  };
  
// ✅ Coloca resetVideo ANTES de usarlo
const resetVideo = (i) => {
  const next = platos[i];
  if (!next || !videoRefs.current[next.id]) return;

  const video = videoRefs.current[next.id];

  // Verificamos que el video siga en el DOM
  if (!video || !video.play) return;

  try {
    video.currentTime = 0;
    video.play();
  } catch (e) {
    console.warn("🎥 Error al reproducir video:", e);
  }
};

useEffect(() => {
  if (!platos.length) return;

  const primerId = platos[0].id;
  const intentarPlay = () => {
    const video = videoRefs.current[primerId];
    if (video && video.readyState >= 2) {
      video.currentTime = 0;
      video.play().catch((e) => {
        console.warn("🎥 No se pudo reproducir video:", e.message);
      });
    } else {
      requestAnimationFrame(intentarPlay);
    }
  };

  requestAnimationFrame(intentarPlay);
}, [platos]);

const handleWheel = (e) => {
  if (scrollBloqueado || mostrarComentariosId !== null) return;

  if (e.deltaY > 50 && index < platos.length - 1) {
    const newIndex = index + 1;
    setIndex(newIndex);
    bloquearScrollTemporal();
    resetVideo(newIndex);  // 👈 Aquí se debe usar
  } else if (e.deltaY < -50 && index > 0) {
    const newIndex = index - 1;
    setIndex(newIndex);
    bloquearScrollTemporal();
    resetVideo(newIndex);
  }
};

const handleTouchEnd = (e) => {
  if (scrollBloqueado || mostrarComentariosId !== null) return;

  const deltaY = startYRef.current - e.changedTouches[0].clientY;

  if (deltaY > 50 && index < platos.length - 1) {
    const newIndex = index + 1;
    setIndex(newIndex);
    bloquearScrollTemporal();
    resetVideo(newIndex);  // 👈 También aquí
  } else if (deltaY < -50 && index > 0) {
    const newIndex = index - 1;
    setIndex(newIndex);
    bloquearScrollTemporal();
    resetVideo(newIndex);
  }
};



  const mostrarNotificacion = () => {
    setNotificacionVisible(true);
    setTimeout(() => setNotificacionVisible(false), 1500);
  };

  

  const handleComentariosStart = (e) => {
    const y = e.touches ? e.touches[0].clientY : e.clientY;
    dragStartY.current = y;
    isDraggingComentarios.current = true;
  };
  
  const handleComentariosMove = (e) => {
    if (!isDraggingComentarios.current) return;
  
    const y = e.touches ? e.touches[0].clientY : e.clientY;
    const deltaY = y - dragStartY.current;
  
    if (deltaY > 50) {
      setCerrandoComentarios(true); // animación primero
      setTimeout(() => {
        setMostrarComentariosId(null);
        setCerrandoComentarios(false); // reset para la próxima vez
      }, 300);
      isDraggingComentarios.current = false;
    }
  };
  
  const handleComentariosEnd = () => {
    isDraggingComentarios.current = false;
  };

const handleComentario = async (platoId, texto) => {
  if (!texto?.trim()) return;

  const comentario = {
    id: crypto.randomUUID(),
    texto: texto.trim(),
    userId: userId.current,
    fecha: new Date().toISOString(),
  };

  const comentariosRef = collection(
    db,
    "restaurantes",
    "restaurante_ejemplo",
    categoria,
    platoId.toString(),
    "comentarios"
  );

  try {
    await setDoc(doc(comentariosRef, comentario.id), comentario);

    // Recargar comentarios para reflejar el nuevo
    const snapshot = await getDocs(comentariosRef);
    setComentarios((prev) => ({
      ...prev,
      [platoId]: snapshot.docs.map(doc => doc.data())
    }));
  } catch (error) {
    console.error("❌ Error al añadir comentario:", error);
  }
};


const eliminarComentario = async (platoId, comentario) => {
  const comentarioRef = doc(
    db,
    "restaurantes",
    "restaurante_ejemplo",
    categoria,
    platoId.toString(),
    "comentarios",
    comentario.id
  );

  try {
    await deleteDoc(comentarioRef);

    // 🔧 Actualiza el estado local eliminando el comentario del array
    setComentarios((prev) => ({
      ...prev,
      [platoId]: prev[platoId].filter((c) => c.id !== comentario.id),
    }));
  } catch (error) {
    console.error("❌ Error al eliminar comentario:", error);
  }
};



return (
  <div
    className="scroll-container"
    ref={containerRef}
    onWheel={handleWheel}
    onTouchStart={handleTouchStart}
    onTouchEnd={handleTouchEnd}
    style={{
      height: "100%",
      width: "100%",
      overflow: "hidden",
      position: "relative",
      backgroundColor: "#908f8d",
    }}
  >
    <div
      style={{
        transform: `translateY(-${index * 100}dvh)`,
        transition: "transform 0.5s ease-in-out",
      }}
    >
      {platos.map((plato, i) => {
  if (Math.abs(i - index) > 6) return null;

 const userKey = userId.current ? `${userId.current}_${plato.id}` : null;
 const yaDadoLike = userKey && userLikes[userKey];

  // Mezcla los datos traducidos con los originales para evitar campos vacíos
  const traduccion = {
    ...plato,
    ...(plato.traducciones?.[idioma] || {}),
  };

  const isExpanded = expandedPlatoId === plato.id;


        return (
          <div key={plato.id} className="scroll-item" style={{ height: "100dvh" }}>
            <div className="plato-card" style={{ position: "relative", height: "100dvh" }}>
              <div
                className="imagen-container"
                onClick={() => {
                  const video = videoRefs.current[plato.id];
                  if (video) video.paused ? video.play() : video.pause();
                }}
                style={{
                  position: 'relative',
                  width: '100%',
                  height: '100%',
                  overflow: 'visible',
                  zIndex: 1,
                }}
              >
{Math.abs(index - i) <= 1 && (
  <>
    <video
      ref={(el) => (videoRefs.current[plato.id] = el)}
      src={`/Videos/${plato.video}`}
      autoPlay={index === i}
      loop
      muted
      controls={false}
      onPlay={() =>
        setVideoPausado((prev) => ({ ...prev, [plato.id]: false }))
      }
      onPause={() =>
        setVideoPausado((prev) => ({ ...prev, [plato.id]: true }))
      }
      style={{
        width: "100%",
        height: "100%",
        objectFit: "cover",
        display: "block",
        backgroundColor: "black",
      }}
    />

    {/* ▶️ Botón centrado cuando el video está pausado */}
    {videoPausado[plato.id] && (
      <div
        onClick={() => {
          const video = videoRefs.current[plato.id];
          if (video) video.play();
        }}
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: "90px",
          height: "90px",
          background: "rgba(0, 0, 0, 0.7)",
          borderRadius: "50%",
          border: "3px solid white",
          boxShadow: "0 0 20px rgba(0,0,0,0.5)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 10,
          cursor: "pointer",
        }}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="38"
          height="38"
          viewBox="0 0 24 24"
          fill="white"
        >
          <path d="M8 5v14l11-7z" />
        </svg>
      </div>
    )}
  </>
)}


{index === i && (
  <ProgressBar
    key={`progress-${plato.id}-${index}`}
    videoRef={{ current: videoRefs.current[plato.id] }}
    isActive={true}
  />
)}


</div>


              {/* Caja de notificación */}
              {notificacionVisible && index === i && (
                <div
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: "100%",
                    backgroundColor: "rgba(0,0,0,0.6)",
                    borderRadius: "20px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    zIndex: 50,
                  }}
                >
                  <span style={{ color: "white", fontSize: "1.2rem", textAlign: "center" }}>
                    {t.añadido} {plato.nombre} {t.al_pedido}
                  </span>
                </div>
              )}

              {/* Botones laterales */}
              <div
                className="botones-laterales"
                style={{
                  position: "absolute",
                  right: "16px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "20px",
                  zIndex: 30,
                }}
              >
                <div style={{ textAlign: "center" }}>
                <button
onClick={() => handleLike(plato.id)}
style={{
  background: "none",
  border: "none",
  cursor: "pointer",
  padding: 0,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
}}
>
<svg
  xmlns="http://www.w3.org/2000/svg"
  viewBox="0 0 24 24"
  width="32"
  height="32"
  style={{
    fill: yaDadoLike ? "red" : "none",
    stroke: "white",
    strokeWidth: "2",
    transition: "all 0.2s ease-in-out",
  }}
>

  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 
           2 5.42 4.42 3 7.5 3c1.74 0 3.41 0.81 4.5 2.09 
           C13.09 3.81 14.76 3 16.5 3 
           19.58 3 22 5.42 22 8.5 
           c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
</svg>
</button>

<div style={{ fontSize: "14px", color: "white" }}>{likes[plato.id] || 0}</div>
</div>

                <div style={{ textAlign: "center" }}>
                  <button
                    onClick={() => {
                      const video = videoRefs.current[plato.id];
                      if (video) video.pause(); // ⏸ pausa si hay video
                    
                      setMostrarComentariosId(mostrarComentariosId === plato.id ? null : plato.id);
                    }}
                    
                    style={{
                      background: "none",
                      border: "none",
                      fontSize: "24px",
                      color: "white",
                      cursor: "pointer",
                    }}
                  >
                    💬
                  </button>
                  <div style={{ fontSize: "14px", color: "white" }}>{comentarios[plato.id]?.length || 0}</div>
                </div>

                <div>
                <button
onClick={() => {
  agregarAlPedido(plato);
  mostrarNotificacion();
}}
style={{
  backgroundColor: "#eaeaea",
  border: "none",
  borderRadius: "50%",
  width: "42px",
  height: "42px",
  fontSize: "24px", // puedes ajustar esto según tu preferencia visual
  fontWeight: "bold",
  color: "#333",
  cursor: "pointer",
  display: "flex",
  alignItems: "center", // 🔁 centra verticalmente
  justifyContent: "center", // 🔁 centra horizontalmente
  lineHeight: "1", // 🛠️ asegura que no se desplace verticalmente
  boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
  padding: 0, // 🧼 evita espacio extra
}}
>
+
</button>

                </div>
              </div>

              {/* Comentarios */}
              {mostrarComentariosId === plato.id && (
<>
  <style>
    {`
      .comentarios-scroll::-webkit-scrollbar {
        display: none;
      }
    `}
  </style>

  <div
    className="comentarios-container"
    style={{
      position: "absolute",
      bottom: "110px",
      left: "12px",
      right: "12px",
      height: "calc(100dvh - 220px)",
      background: "rgba(229,229,229,0.95)",
      borderRadius: "16px",
      paddingTop: "8px",
      paddingBottom: "56px",
      zIndex: 999,
      backdropFilter: "blur(6px)",
      touchAction: "none",
      transition: "transform 0.3s ease",
      transform: cerrandoComentarios ? "translateY(120%)" : "translateY(0)",
      display: "flex",
      flexDirection: "column",
    }}
    onTouchStart={handleComentariosStart}
    onTouchMove={handleComentariosMove}
    onTouchEnd={handleComentariosEnd}
    onMouseDown={handleComentariosStart}
    onMouseMove={handleComentariosMove}
    onMouseUp={handleComentariosEnd}
  >
    {/* Zona de arrastre + título */}
    <div style={{ padding: "0 12px" }}>
      <div
        style={{
          height: "20px",
          width: "100%",
          cursor: "grab",
          textAlign: "center",
          marginBottom: "6px",
        }}
      >
        <div
          style={{
            height: "4px",
            width: "40px",
            margin: "auto",
            background: "#aaa",
            borderRadius: "2px",
          }}
        />
      </div>
      <h4 style={{ textAlign: "center", margin: "0 0 12px", fontWeight: "bold" }}>Comentarios</h4>
    </div>

    {/* Comentarios scrollables */}
    <div
      className="comentarios-scroll"
      style={{
        flex: 1,
        overflowY: "auto",
        padding: "0 12px",
        WebkitOverflowScrolling: "touch",
        scrollbarWidth: "none"
      }}
    >
      {(() => {
const usuariosMap = {};
let userIndex = 1;

// Ordenar por fecha
const ordenados = [...(comentarios[plato.id] || [])].sort(
  (a, b) => a.fecha?.toDate?.() - b.fecha?.toDate?.()
);

return ordenados.map((comentario, idx) => {
  const esYo = comentario.userId === userId.current;

  // Si no es "YO", asignar un número de cliente si aún no existe
  if (!esYo && !usuariosMap[comentario.userId]) {
    usuariosMap[comentario.userId] = userIndex++;
  }

  return (
    <div
      key={comentario.id || idx}
      style={{
        marginBottom: "8px",
        paddingBottom: "6px",
        borderBottom: "1px solid #ccc",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
      }}
    >
      <div>
        <strong>
          {esYo ? "YO" : `CLIENTE${usuariosMap[comentario.userId]}`}
        </strong>
        <p style={{ margin: 0 }}>{comentario.texto}</p>
      </div>

      {/* Botón eliminar si es tu comentario */}
      {esYo && (
        <button
          onClick={() => eliminarComentario(plato.id, comentario)}
          style={{
            background: "none",
            border: "none",
            fontSize: "18px",
            color: "#999",
            cursor: "pointer",
          }}
        >
          🗑
        </button>
      )}
    </div>
  );
});
})()}

    </div>

    {/* Caja de escribir fija */}
    <div
style={{
  position: "absolute",
  bottom: "10px",
  left: "12px",
  right: "12px",
  display: "flex",
  gap: "8px",
  background: "rgba(229,229,229,0.95)",
  padding: "6px 8px",
  borderTop: "1px solid #ccc",
  zIndex: 1000,
}}
>
<input
  type="text"
  placeholder="Escribe un comentario..."
  value={nuevoComentario[plato.id] || ""}
  onChange={(e) =>
    setNuevoComentario({ ...nuevoComentario, [plato.id]: e.target.value })
  }
  style={{
    flex: 1,
    padding: "6px 10px",
    borderRadius: "6px",
    border: "1px solid #ccc",
  }}
/>
<button
  onClick={() => {
    handleComentario(plato.id, nuevoComentario[plato.id]);
    setNuevoComentario({ ...nuevoComentario, [plato.id]: "" });
  }}
  style={{
    background: "#00f2aa",
    color: "white",
    padding: "6px 12px",
    border: "none",
    borderRadius: "6px",
    fontWeight: "bold",
    fontSize: "18px",
    cursor: "pointer",
  }}
>
  ➤
</button>
</div>

  </div>
</>
)}


              {/* Info del plato */}
              <div
                className="plato-info"
                style={{
                  position: "absolute",
                  bottom: "110px",
                  left: "12px",
                  right: "12px",
                  background: "rgba(0,0,0,0.6)",
                  padding: "8px 12px",
                  borderRadius: "12px",
                  color: "white",
                  zIndex: 40,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "4px",
                  }}
                >
                  <h4 style={{ margin: 0 }}>{traduccion.nombre} - {plato.precio}€</h4>
                  <button
                    onClick={() => setExpandedPlatoId(isExpanded ? null : plato.id)}
                    style={{
                      background: "none",
                      border: "none",
                      color: "#00f2aa",
                      fontSize: "0.9rem",
                      cursor: "pointer",
                    }}
                  >
                    {t[isExpanded ? "menos" : "mas"]}
                  </button>
                </div>
                {isExpanded && (
<>
  <p>{traduccion.descripcion} {traduccion.detalles}</p>

  {traduccion.alergenos && (
    <p>
      <strong>{t.alergenos}:</strong> {traduccion.alergenos}
    </p>
  )}

  {traduccion.calorias && (
    <p>
      <strong>{t.calorias}:</strong> {traduccion.calorias}
    </p>
  )}
</>
)}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  </div>
);
};

export default Platos;