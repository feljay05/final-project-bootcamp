export default function EditModal({ show, value, onChange, onClose, onConfirm }) {
  if (!show) return null;

  return (
    <div style={{
      position: "fixed",
      top: 0, left: 0,
      width: "100vw", height: "100vh",
      backgroundColor: "rgba(0, 0, 0, 0.5)",
      display: "flex", justifyContent: "center", alignItems: "center",
      zIndex: 1000
    }}>
      <div style={{
        backgroundColor: "white",
        padding: "2rem",
        borderRadius: "8px",
        textAlign: "center",
        maxWidth: "400px",
        width: "90%",
      }}>
        <h3>Edit Collection Name</h3>
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          style={{
            width: "100%",
            padding: "0.5rem",
            marginTop: "1rem",
            borderRadius: "4px",
            border: "1px solid #ccc",
          }}
        />
        <div style={{
          marginTop: "1.5rem",
          display: "flex",
          justifyContent: "space-between",
          gap: "1rem"
        }}>
          <button
            onClick={onClose}
            style={{
              flex: 1,
              padding: "0.6rem",
              borderRadius: "4px",
              backgroundColor: "#ccc",
              border: "none",
              cursor: "pointer",
              fontWeight: "bold",
            }}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            style={{
              flex: 1,
              padding: "0.6rem",
              borderRadius: "4px",
              backgroundColor: "green",
              color: "white",
              border: "none",
              cursor: "pointer",
              fontWeight: "bold",
            }}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
