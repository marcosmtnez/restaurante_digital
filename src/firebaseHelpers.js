// firebaseHelpers.js
import {
  doc,
  getDoc,
  updateDoc,
  arrayUnion,
  arrayRemove,
  increment,
} from "firebase/firestore";
import { db } from "./firebase";

// 🔹 Obtener referencia a un plato único por restaurante y platoID
export const getPlatoRef = (restauranteId, platoId) =>
  doc(db, "restaurantes", restauranteId, "platos", platoId.toString());

/**
 * 🔹 Like/Unlike: alterna el like (toggle) según si ya lo ha dado
 */
export const toggleLike = async (restauranteId, platoId) => {
  const likedKey = `liked-${restauranteId}-${platoId}`;
  const hasLiked = localStorage.getItem(likedKey);
  const platoRef = getPlatoRef(restauranteId, platoId);

  if (hasLiked) {
    await updateDoc(platoRef, {
      likes: increment(-1),
    });
    localStorage.removeItem(likedKey);
    return false;
  } else {
    await updateDoc(platoRef, {
      likes: increment(1),
    });
    localStorage.setItem(likedKey, "true");
    return true;
  }
};

/**
 * 🔹 Saber si este usuario ya ha dado like
 */
export const haDadoLike = (restauranteId, platoId) => {
  const likedKey = `liked-${restauranteId}-${platoId}`;
  return !!localStorage.getItem(likedKey);
};

/**
 * 🔹 Obtener la cantidad de likes actuales
 */
export const obtenerLikes = async (restauranteId, platoId) => {
  const platoRef = getPlatoRef(restauranteId, platoId);
  const snap = await getDoc(platoRef);
  return snap.exists() ? snap.data().likes || 0 : 0;
};

/**
 * 🔹 Añadir un comentario (con ID único de usuario)
 */
export const añadirComentario = async (restauranteId, platoId, texto, userId) => {
  const comentario = {
    id: crypto.randomUUID(),
    texto,
    userId,
    timestamp: new Date().toISOString(),
  };

  const platoRef = getPlatoRef(restauranteId, platoId);
  await updateDoc(platoRef, {
    comentarios: arrayUnion(comentario),
  });

  return comentario;
};

/**
 * 🔹 Obtener comentarios actuales
 */
export const obtenerComentarios = async (restauranteId, platoId) => {
  const platoRef = getPlatoRef(restauranteId, platoId);
  const snap = await getDoc(platoRef);
  return snap.exists() ? snap.data().comentarios || [] : [];
};

/**
 * 🔹 Eliminar un comentario exacto (sólo si coincide con el ID generado)
 */
export const eliminarComentario = async (restauranteId, platoId, comentario) => {
  const platoRef = getPlatoRef(restauranteId, platoId);
  await updateDoc(platoRef, {
    comentarios: arrayRemove(comentario),
  });
};
