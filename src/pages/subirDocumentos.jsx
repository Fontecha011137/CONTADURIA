import { useState } from "react";
import { subirDocumento } from "../services/documentos";

function SubirDocumento() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleUpload = async () => {
    if (!file) {
      alert("Selecciona un archivo");
      return;
    }

    try {
      setLoading(true);

      const id = await subirDocumento(file, {
        nombre: file.name,
        tipo: file.type,
        estado: "pendiente",
        periodo: "2026",
      });

      console.log("Documento subido con ID:", id);

      alert("✅ Documento subido correctamente");

      setFile(null);
    } catch (error) {
      console.error(error);
      alert("❌ Error subiendo documento");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>Subir Documento</h1>

      <input
        type="file"
        onChange={(e) => setFile(e.target.files[0])}
      />

      <br /><br />

      <button onClick={handleUpload} disabled={loading}>
        {loading ? "Subiendo..." : "Subir documento"}
      </button>
    </div>
  );
}

export default SubirDocumento;