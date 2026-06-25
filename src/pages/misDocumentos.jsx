import { useEffect, useState } from "react";
import { auth, db } from "../firebaseConfig";
import { collection, getDocs } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";

function MisDocumentos() {
  const [documentos, setDocumentos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      try {
        if (!user) return;

        const ref = collection(
          db,
          "usuarios",
          user.uid,
          "documentos"
        );

        const snapshot = await getDocs(ref);

        const docs = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setDocumentos(docs);
      } catch (error) {
        console.error("Error cargando documentos:", error);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  if (loading) return <p>Cargando documentos...</p>;

  return (
    <div>
      <h1>Mis Documentos</h1>

      <table border="1" cellPadding="10">
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Tipo</th>
            <th>Estado</th>
            <th>Periodo</th>
            <th>Archivo</th>
          </tr>
        </thead>

        <tbody>
          {documentos.map((doc) => (
            <tr key={doc.id}>
              <td>{doc.nombre}</td>
              <td>{doc.tipo}</td>
              <td>{doc.estado}</td>
              <td>{doc.periodo}</td>
<td>
  {doc.fileUrl ? (
    <a
      href={doc.fileUrl}
      target="_blank"
      rel="noopener noreferrer"
      style={{
        color: "#198754",
        fontWeight: "bold",
        textDecoration: "none"
      }}
    >
      📄 Ver documento
    </a>
  ) : (
    <span style={{ color: "#dc3545" }}>
      Pendiente de carga
    </span>
  )}
</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default MisDocumentos;