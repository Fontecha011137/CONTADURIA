import { db, storage, auth } from "../firebaseConfig";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

export const subirDocumento = async (file, datos) => {
  const user = auth.currentUser;

  if (!user) {
    throw new Error("No hay usuario autenticado");
  }

  if (!file) {
    throw new Error("No se ha seleccionado ningún archivo");
  }

  try {
    // 1. Crear referencia en Storage
    const storageRef = ref(
      storage,
      `usuarios/${user.uid}/documentos/${Date.now()}_${file.name}`
    );

    // 2. Subir archivo
    await uploadBytes(storageRef, file);

    // 3. Obtener URL pública
    const url = await getDownloadURL(storageRef);

    // 4. Guardar en Firestore
    const docRef = await addDoc(
      collection(db, "usuarios", user.uid, "documentos"),
      {
        nombre: datos.nombre || file.name,
        tipo: datos.tipo || file.type,
        estado: datos.estado || "pendiente",
        periodo: datos.periodo || "",

        fileUrl: url, // 🔥 CLAVE
        createdAt: serverTimestamp(),
      }
    );

    return docRef.id;
  } catch (error) {
    console.error("Error subiendo documento:", error);
    throw error;
  }
};