import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
  deleteDoc,
  updateDoc,
  addDoc,
} from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import Navbar from "@/components/Navbar";
import ConfirmModal from "@/components/ConfirmModal";
import EditModal from "@/components/EditModal";

export default function CollectionsPage() {
  const router = useRouter();
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showConfirm, setShowConfirm] = useState(false);
  const [selectedCollection, setSelectedCollection] = useState(null);

  const [showEdit, setShowEdit] = useState(false);
  const [editName, setEditName] = useState("");

  const [showAddModal, setShowAddModal] = useState(false);
  const [newCollectionName, setNewCollectionName] = useState("");

  const fetchCollections = async () => {
    const user = auth.currentUser;
    if (!user) return;

    const q = query(collection(db, "collections"), where("userId", "==", user.uid));
    const snapshot = await getDocs(q);

    const result = await Promise.all(
      snapshot.docs.map(async (docSnap) => {
        const data = docSnap.data();
        let firstMovie = null;

        if (data.movies.length > 0) {
          const firstMovieSnap = await getDoc(doc(db, "movies", data.movies[0]));
          if (firstMovieSnap.exists()) {
            firstMovie = firstMovieSnap.data();
          }
        }

        return {
          id: docSnap.id,
          ...data,
          firstMovie,
        };
      })
    );

    setCollections(result);
    setLoading(false);
  };

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        fetchCollections();
      } else {
        router.push("/login");
      }
    });

    return () => unsubscribe();
  }, []);

  const handleClick = (id) => {
    router.push(`/collections/${id}`);
  };

  const confirmRemove = (collection) => {
    setSelectedCollection(collection);
    setShowConfirm(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedCollection) return;

    await deleteDoc(doc(db, "collections", selectedCollection.id));
    setCollections((prev) => prev.filter((col) => col.id !== selectedCollection.id));
    setShowConfirm(false);
    setSelectedCollection(null);
  };

  const openEditModal = (collection) => {
    setSelectedCollection(collection);
    setEditName(collection.name);
    setShowEdit(true);
  };

  const handleConfirmEdit = async () => {
    const trimmed = editName.trim();
    if (!trimmed) return alert("Name cannot be empty");
    if (/[^a-zA-Z0-9\s]/.test(trimmed)) return alert("No special characters allowed");

    const isDuplicate = collections.some(
      (col) => col.name.toLowerCase() === trimmed.toLowerCase() && col.id !== selectedCollection.id
    );
    if (isDuplicate) return alert("Collection name must be unique");

    const ref = doc(db, "collections", selectedCollection.id);
    await updateDoc(ref, { name: trimmed });

    setCollections((prev) =>
      prev.map((col) =>
        col.id === selectedCollection.id ? { ...col, name: trimmed } : col
      )
    );
    setShowEdit(false);
    setSelectedCollection(null);
  };

  const handleAddCollection = async () => {
    const trimmed = newCollectionName.trim();
    if (!trimmed) return alert("Name cannot be empty");
    if (/[^a-zA-Z0-9\s]/.test(trimmed)) return alert("No special characters allowed");

    const isDuplicate = collections.some(
      (col) => col.name.toLowerCase() === trimmed.toLowerCase()
    );
    if (isDuplicate) return alert("Collection name must be unique");

    const newDoc = await addDoc(collection(db, "collections"), {
      name: trimmed,
      userId: auth.currentUser.uid,
      createdAt: new Date(),
      movies: [],
    });

    setCollections((prev) => [
      ...prev,
      { id: newDoc.id, name: trimmed, movies: [], firstMovie: null },
    ]);
    setNewCollectionName("");
    setShowAddModal(false);
  };

  if (loading) return <p>Loading...</p>;

  return (
    <>
      <div style={{ padding: "2rem" }}>
        <h1>Your Collections</h1>
        <button
  onClick={() => router.push("/dashboard")}
  style={{
    marginBottom: "1rem",
    backgroundColor: "#777",
    color: "white",
    padding: "0.6rem 1rem",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    marginRight: "1rem",
  }}
>
  ← Back to Dashboard
</button>

        <button
          onClick={() => setShowAddModal(true)}
          style={{
            marginBottom: "1rem",
            backgroundColor: "#0070f3",
            color: "white",
            padding: "0.6rem 1rem",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          + Add a Collection
        </button>

        {collections.length === 0 ? (
          <p>No collections yet.</p>
        ) : (
          <div style={{ display: "grid", gap: "1rem", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))" }}>
            {collections.map((col) => (
              <div
                key={col.id}
                style={{
                  border: "1px solid #ccc",
                  borderRadius: "8px",
                  overflow: "hidden",
                }}
              >
                <img
                  src={col.firstMovie?.coverUrl || "/default-banner.jpg"}
                  alt={col.name}
                  style={{
                    width: "100%",
                    height: "160px",
                    objectFit: "cover",
                    cursor: "pointer",
                  }}
                  onClick={() => handleClick(col.id)}
                />
                <div style={{ padding: "1rem" }}>
                  <h3>{col.name}</h3>
                  <button
                    onClick={() => confirmRemove(col)}
                    style={{
                      marginRight: "0.5rem",
                      backgroundColor: "red",
                      color: "white",
                      border: "none",
                      padding: "0.4rem 0.8rem",
                      borderRadius: "4px",
                      cursor: "pointer",
                    }}
                  >
                    Remove
                  </button>
                  <button
                    onClick={() => openEditModal(col)}
                    style={{
                      backgroundColor: "gray",
                      color: "white",
                      border: "none",
                      padding: "0.4rem 0.8rem",
                      borderRadius: "4px",
                      cursor: "pointer",
                    }}
                  >
                    Edit
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal Hapus */}
      <ConfirmModal
        show={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={handleConfirmDelete}
        collectionName={selectedCollection?.name}
      />

      {/* Modal Edit */}
      <EditModal
        show={showEdit}
        value={editName}
        onChange={setEditName}
        onClose={() => setShowEdit(false)}
        onConfirm={handleConfirmEdit}
      />

      {/* Modal Tambah */}
      {showAddModal && (
        <div style={{
          position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh",
          backgroundColor: "rgba(0,0,0,0.5)", display: "flex",
          justifyContent: "center", alignItems: "center", zIndex: 1000
        }}>
          <div style={{
            backgroundColor: "white", padding: "2rem", borderRadius: "8px",
            width: "90%", maxWidth: "400px", textAlign: "center"
          }}>
            <h3>Add New Collection</h3>
            <input
              value={newCollectionName}
              onChange={(e) => setNewCollectionName(e.target.value)}
              placeholder="Collection name"
              style={{
                width: "100%", padding: "0.5rem", marginTop: "1rem",
                marginBottom: "1.5rem", borderRadius: "4px", border: "1px solid #ccc"
              }}
            />
            <div style={{ display: "flex", justifyContent: "flex-end", gap: "1rem" }}>
              <button onClick={() => setShowAddModal(false)}>Cancel</button>
              <button
                onClick={handleAddCollection}
                style={{
                  backgroundColor: "#0070f3", color: "white",
                  border: "none", padding: "0.5rem 1rem", borderRadius: "4px",
                }}
              >
                Add
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
