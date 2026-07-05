import { useState } from "react";
import { subirDocumento } from "../services/documentos";

function SubirDocumento() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleUpload = async () => {
    if (!file) {
      alert("Selecciona un documento");
      return;
    }

    try {
      setLoading(true);

      await subirDocumento(file, {
        nombre: file.name,
        tipo: file.type,
        estado: "pendiente",
        periodo: "2026",
      });

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
    <div style={{ padding: 20 }}>
      <h1>Subir Documento</h1>

      <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>

        {/* 📷 FOTO */}
        <label style={{ cursor: "pointer" }}>
          📷 Tomar foto
          <input
            type="file"
            accept="image/*"
            capture="environment"
            style={{ display: "none" }}
            onChange={(e) => setFile(e.target.files[0])}
          />
        </label>

        {/* 📁 ARCHIVO */}
        <label style={{ cursor: "pointer" }}>
          📁 Seleccionar archivo
          <input
            type="file"
            accept=".pdf,.jpg,.jpeg,.png,.webp,image/*"
            style={{ display: "none" }}
            onChange={(e) => setFile(e.target.files[0])}
          />
        </label>

      </div>

      {file && (
        <div>
          <p><strong>Archivo:</strong> {file.name}</p>

          {file.type.startsWith("image/") ? (
            <img
              src={URL.createObjectURL(file)}
              alt="preview"
              style={{ width: 300, borderRadius: 8 }}
            />
          ) : (
            <div>📄 {file.name}</div>
          )}
        </div>
      )}

      <button onClick={handleUpload} disabled={loading || !file}>
        {loading ? "Subiendo..." : "Subir documento"}
      </button>
    </div>
  );
}

export default SubirDocumento;