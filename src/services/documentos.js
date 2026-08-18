import { db, storage, auth } from "../firebaseConfig";

import {
  collection,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";

import {
  ref,
  uploadBytes,
  getDownloadURL,
} from "firebase/storage";


// =====================================================
// SUBIR DOCUMENTO DEL CLIENTE
// =====================================================

export const subirDocumento = async (file, datos) => {

  const user = auth.currentUser;

  if (!user) {
    throw new Error("No hay usuario autenticado");
  }

  if (!file) {
    throw new Error("No se ha seleccionado ningún archivo");
  }

  try {

    // =========================================
    // REFERENCIA STORAGE
    // =========================================

    const storageRef = ref(
      storage,
      `usuarios/${user.uid}/documentos/${Date.now()}_${file.name}`
    );


    // =========================================
    // SUBIR ARCHIVO
    // =========================================

    await uploadBytes(storageRef, file);


    // =========================================
    // OBTENER URL
    // =========================================

    const url = await getDownloadURL(storageRef);


    // =========================================
    // GUARDAR FIRESTORE
    // =========================================

    const docRef = await addDoc(
      collection(
        db,
        "usuarios",
        user.uid,
        "documentos"
      ),
      {
        nombre:
          datos.nombre ||
          file.name,

        tipo:
          datos.tipo ||
          file.type,

        estado:
          datos.estado ||
          "pendiente",

        periodo:
          datos.periodo ||
          "",

        fileUrl: url,

        enviadoPor:
          datos.enviadoPor ||
          "cliente",

        createdAt:
          serverTimestamp(),
      }
    );


    return docRef.id;

  } catch (error) {

    console.error(
      "Error subiendo documento:",
      error
    );

    throw error;
  }
};



// =====================================================
// CONTADOR ENVÍA DOCUMENTO A CLIENTE
// =====================================================

export const subirDocumentoParaCliente = async (
  file,
  uidCliente,
  datos = {}
) => {

  const user = auth.currentUser;

  // =========================================
  // VERIFICAR USUARIO
  // =========================================

  if (!user) {
    throw new Error(
      "No hay usuario autenticado"
    );
  }


  // =========================================
  // VERIFICAR ARCHIVO
  // =========================================

  if (!file) {
    throw new Error(
      "No se ha seleccionado ningún archivo"
    );
  }


  // =========================================
  // VERIFICAR CLIENTE
  // =========================================

  if (!uidCliente) {
    throw new Error(
      "No se ha seleccionado ningún cliente"
    );
  }


  try {

    // =========================================
    // NOMBRE ARCHIVO
    // =========================================

    const nombreArchivo =
      `${Date.now()}_${file.name}`;


    // =========================================
    // STORAGE DEL CLIENTE
    // =========================================

    const storageRef = ref(
      storage,
      `usuarios/${uidCliente}/documentos/${nombreArchivo}`
    );


    // =========================================
    // SUBIR ARCHIVO
    // =========================================

    await uploadBytes(
      storageRef,
      file
    );


    // =========================================
    // OBTENER URL
    // =========================================

    const url =
      await getDownloadURL(
        storageRef
      );


    // =========================================
    // GUARDAR FIRESTORE
    // =========================================

    const docRef = await addDoc(
      collection(
        db,
        "usuarios",
        uidCliente,
        "documentos"
      ),
      {

        nombre:
          datos.nombre ||
          file.name,

        tipo:
          datos.tipo ||
          file.type,

        estado:
          "enviado",

        periodo:
          datos.periodo ||
          "",

        fileUrl:
          url,

        // =================================
        // INFORMACIÓN DEL CONTADOR
        // =================================

        enviadoPor:
          "contador",

        contadorUid:
          user.uid,

        fechaEnvio:
          serverTimestamp(),

        createdAt:
          serverTimestamp(),

      }
    );


    return docRef.id;

  } catch (error) {

    console.error(
      "Error enviando documento al cliente:",
      error
    );

    throw error;
  }
};