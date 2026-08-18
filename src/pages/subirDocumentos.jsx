import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { subirDocumento } from "../services/documentos";

function SubirDocumento() {

  const navigate = useNavigate();

  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);


  // =========================================
  // SUBIR DOCUMENTO
  // =========================================

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


  // =========================================
  // SELECCIONAR ARCHIVO
  // =========================================

  const handleFileChange = (e) => {

    const selectedFile = e.target.files?.[0];

    if (selectedFile) {
      setFile(selectedFile);
    }

  };


  // =========================================
  // INTERFAZ
  // =========================================

  return (

    <div
      style={{
        minHeight: "100vh",
        background: "#f5f5f5",
        padding: "30px",
        boxSizing: "border-box"
      }}
    >

      {/* =====================================
          ENCABEZADO
      ===================================== */}

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "30px",
          gap: "20px"
        }}
      >

        <h1
          style={{
            margin: 0,
            color: "#212529",
            fontSize: "28px"
          }}
        >
          Subir Documento
        </h1>


        {/* ===================================
            BOTÓN VOLVER
        =================================== */}

        <button
          onClick={() => navigate("/cliente")}
          style={{
            background: "#198754",
            color: "#ffffff",
            border: "none",
            padding: "12px 20px",
            borderRadius: "8px",
            fontSize: "15px",
            fontWeight: "bold",
            cursor: "pointer",
            boxShadow:
              "0 2px 6px rgba(0, 0, 0, 0.15)",
            whiteSpace: "nowrap"
          }}
        >
          ← Volver al panel
        </button>

      </div>


      {/* =====================================
          CONTENEDOR PRINCIPAL
      ===================================== */}

      <div
        style={{
          maxWidth: "700px",
          margin: "0 auto",
          background: "#ffffff",
          padding: "30px",
          borderRadius: "12px",
          boxShadow:
            "0 3px 12px rgba(0, 0, 0, 0.08)",
          boxSizing: "border-box"
        }}
      >

        <h2
          style={{
            marginTop: 0,
            marginBottom: "10px",
            color: "#198754"
          }}
        >
          Selecciona un documento
        </h2>


        <p
          style={{
            color: "#666",
            marginBottom: "25px"
          }}
        >
          Puedes tomar una fotografía o seleccionar un
          archivo desde tu dispositivo.
        </p>


        {/* ===================================
            OPCIONES DE ARCHIVO
        =================================== */}

        <div
          style={{
            display: "flex",
            gap: "15px",
            flexWrap: "wrap",
            marginBottom: "25px"
          }}
        >

          {/* 📷 TOMAR FOTO */}

          <label
            style={{
              flex: "1 1 220px",
              background: "#198754",
              color: "#ffffff",
              padding: "15px",
              borderRadius: "8px",
              textAlign: "center",
              fontWeight: "bold",
              cursor: "pointer",
              boxSizing: "border-box"
            }}
          >

            📷 Tomar foto

            <input
              type="file"
              accept="image/*"
              capture="environment"
              style={{
                display: "none"
              }}
              onChange={handleFileChange}
            />

          </label>


          {/* 📁 SELECCIONAR ARCHIVO */}

          <label
            style={{
              flex: "1 1 220px",
              background: "#e9ecef",
              color: "#212529",
              padding: "15px",
              borderRadius: "8px",
              textAlign: "center",
              fontWeight: "bold",
              cursor: "pointer",
              border: "1px solid #ced4da",
              boxSizing: "border-box"
            }}
          >

            📁 Seleccionar archivo

            <input
              type="file"
              accept=".pdf,.jpg,.jpeg,.png,.webp,image/*"
              style={{
                display: "none"
              }}
              onChange={handleFileChange}
            />

          </label>

        </div>


        {/* ===================================
            ARCHIVO SELECCIONADO
        =================================== */}

        {file && (

          <div
            style={{
              background: "#f8f9fa",
              border: "1px solid #dee2e6",
              borderRadius: "10px",
              padding: "20px",
              marginBottom: "25px"
            }}
          >

            <p
              style={{
                marginTop: 0,
                marginBottom: "15px"
              }}
            >
              <strong>Archivo seleccionado:</strong>
              <br />
              {file.name}
            </p>


            {/* PREVISUALIZACIÓN DE IMAGEN */}

            {file.type.startsWith("image/") ? (

              <img
                src={URL.createObjectURL(file)}
                alt="Vista previa"
                style={{
                  display: "block",
                  width: "100%",
                  maxWidth: "400px",
                  maxHeight: "400px",
                  objectFit: "contain",
                  margin: "0 auto",
                  borderRadius: "8px",
                  border: "1px solid #ddd"
                }}
              />

            ) : (

              <div
                style={{
                  padding: "20px",
                  background: "#ffffff",
                  borderRadius: "8px",
                  textAlign: "center",
                  color: "#555"
                }}
              >
                📄 {file.name}
              </div>

            )}

          </div>

        )}


        {/* ===================================
            BOTÓN SUBIR
        =================================== */}

        <button
          onClick={handleUpload}
          disabled={loading || !file}
          style={{
            width: "100%",
            background:
              loading || !file
                ? "#adb5bd"
                : "#198754",
            color: "#ffffff",
            border: "none",
            padding: "14px",
            borderRadius: "8px",
            fontSize: "16px",
            fontWeight: "bold",
            cursor:
              loading || !file
                ? "not-allowed"
                : "pointer",
            transition: "0.2s"
          }}
        >

          {loading
            ? "⏳ Subiendo..."
            : "📤 Subir documento"}

        </button>

      </div>

    </div>

  );

}


export default SubirDocumento;