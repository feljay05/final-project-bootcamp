import { useEffect, useState } from "react";

export default function AddToCollectionModal({
  show,
  onClose,
  onConfirm,
  collections,
  onCreateNew,
  selectedCollectionId,
  setSelectedCollectionId,
  newCollectionName,
  setNewCollectionName,
}) {
  if (!show) return null;

  return (
    <div style={{
      position: "fixed",
      top: 0, left: 0,
      width: "100vw", height: "100vh",
      backgroundColor: "rgba(0,0,0,0.5)",
      display: "flex", justifyContent: "center", alignItems: "center",
      zIndex: 1000
    }}>
      <div style={{
        backgroundColor: "white",
        padding: "2rem",
        borderRadius: "8px",
        maxWidth: "500px",
        width: "90%"
      }}>
        <h3>Tambahkan ke Koleksi</h3>

        <div style={{ marginBottom: "1rem" }}>
          <label>Pilih koleksi yang sudah ada:</label><br />
          <select
            value={selectedCollectionId}
            onChange={(e) => setSelectedCollectionId(e.target.value)}
            style={{ width: "100%", padding: "0.5rem", marginTop: "0.5rem" }}
          >
            <option value="">-- Pilih Koleksi --</option>
            {collections.map((col) => (
              <option key={col.id} value={col.id}>{col.name}</option>
            ))}
          </select>
        </div>

        <div style={{ marginBottom: "1rem" }}>
          <label>Atau buat koleksi baru:</label>
          <input
            type="text"
            value={newCollectionName}
            onChange={(e) => setNewCollectionName(e.target.value)}
            placeholder="Nama koleksi baru"
            style={{ width: "100%", padding: "0.5rem", marginTop: "0.5rem" }}
          />
        </div>

        <div style={{ display: "flex", justifyContent: "flex-end", gap: "1rem", marginTop: "1rem" }}>
          <button onClick={onClose}>Batal</button>
          <button
            onClick={onConfirm}
            style={{
              backgroundColor: "#0070f3",
              color: "white",
              padding: "0.5rem 1rem",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer"
            }}
          >
            Add
          </button>
        </div>
      </div>
    </div>
  );
}
