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
    <div style={{ padding: 20 }}>
      <h1>Subir Documento</h1>

      <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>

        {/* Tomar foto */}
        <label>
          <button type="button">📷 Tomar foto</button>
          <input
            type="file"
            accept="image/*"
            capture="environment"
            hidden
            onChange={(e) => setFile(e.target.files[0])}
          />
        </label>

        {/* Seleccionar archivo */}
        <label>
          <button type="button">📁 Seleccionar archivo</button>
          <input
            type="file"
            accept=".pdf,.jpg,.jpeg,.png,.webp,image/*"
            hidden
            onChange={(e) => setFile(e.target.files[0])}
          />
        </label>

      </div>

      {file && (
        <>
          <p>
            <strong>Archivo:</strong> {file.name}
          </p>

          <p>
            <strong>Tamaño:</strong>{" "}
            {(file.size / 1024).toFixed(1)} KB
          </p>

          {file.type.startsWith("image/") ? (
            <img
              src={URL.createObjectURL(file)}
              alt="Vista previa"
              style={{
                width: 300,
                border: "1px solid #ccc",
                borderRadius: 8,
                marginBottom: 20,
              }}
            />
          ) : (
            <div
              style={{
                width: 300,
                padding: 20,
                border: "1px solid #ccc",
                borderRadius: 8,
                marginBottom: 20,
                background: "#f8f8f8",
                textAlign: "center",
              }}
            >
              📄 {file.name}
            </div>
          )}
        </>
      )}

      <button
        onClick={handleUpload}
        disabled={loading || !file}
      >
        {loading ? "Subiendo..." : "Subir documento"}
      </button>
    </div>
  );
}

export default SubirDocumento;