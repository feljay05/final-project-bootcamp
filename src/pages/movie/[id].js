import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import {
  doc,
  getDoc,
  collection,
  getDocs,
  addDoc,
  updateDoc,
  arrayUnion,
  query,
  where,
} from "firebase/firestore";
import { db, auth } from "@/lib/firebase";
import AddToCollectionModal from "@/components/AddToCollectionModal";

export default function MovieDetailPage() {
  const router = useRouter();
  const { id } = router.query;

  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const [collections, setCollections] = useState([]);

  const [newCollectionName, setNewCollectionName] = useState("");
  const [selectedCollectionId, setSelectedCollectionId] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);

  const fetchMovie = async (movieId) => {
    try {
      const docRef = doc(db, "movies", movieId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setMovie(docSnap.data());
      } else {
        console.error("Movie not found");
      }
    } catch (error) {
      console.error("Error fetching movie:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCollections = async () => {
    const user = auth.currentUser;
    if (!user) return;

    const q = query(collection(db, "collections"), where("userId", "==", user.uid));
    const querySnapshot = await getDocs(q);
    const list = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    setCollections(list);
  };

  useEffect(() => {
    if (id) {
      fetchMovie(id);
      fetchCollections();
    }
  }, [id]);

  const handleAddToCollection = async () => {
    const user = auth.currentUser;
    if (!user) return alert("Harap login.");

    let collectionId = selectedCollectionId;

    // Validasi nama baru (jika diisi)
    if (newCollectionName) {
      const name = newCollectionName.trim();
      if (!/^[a-zA-Z0-9\s]+$/.test(name)) {
        return alert("Nama koleksi tidak boleh mengandung karakter khusus.");
      }

      const nameExists = collections.some(
        (c) => c.name.toLowerCase() === name.toLowerCase()
      );
      if (nameExists) return alert("Nama koleksi sudah digunakan.");

      const newDoc = await addDoc(collection(db, "collections"), {
        name,
        userId: user.uid,
        createdAt: new Date(),
        movies: [],
      });
      collectionId = newDoc.id;
    }

    if (!collectionId) return alert("Pilih atau buat koleksi terlebih dahulu.");

    const colRef = doc(db, "collections", collectionId);
    await updateDoc(colRef, {
      movies: arrayUnion(id),
    });

    alert("Movie berhasil ditambahkan ke koleksi!");
    setNewCollectionName("");
    setSelectedCollectionId("");
    setShowAddModal(false);
    fetchCollections(); // Refresh koleksi
  };

  if (loading) return <p>Loading...</p>;
  if (!movie) return <p>Movie not found.</p>;

  return (
    <>
      <div style={{ padding: "2rem", maxWidth: "800px", margin: "auto" }}>
        <button
          onClick={() => router.back()}
          style={{
            marginBottom: "1rem",
            backgroundColor: "#777",
            color: "white",
            padding: "0.5rem 1rem",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          ← Back
        </button>

        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <img
            src={movie.coverUrl}
            alt={movie.title}
            style={{ width: "100%", borderRadius: "8px", objectFit: "cover" }}
          />

          <h1>{movie.title}</h1>
<p><strong>Director:</strong> {movie.director}</p>
<p><strong>Release Year:</strong> {movie.releaseYear}</p>
<p><strong>Genre:</strong> {movie.genre?.join(", ")}</p>
<p><strong>Duration:</strong> {movie.duration} minutes</p>
<p><strong>Rating:</strong> {movie.rating}</p>
<p><strong>Description:</strong></p>
<p>{movie.description}</p>

        </div>

        <div style={{ marginTop: "2rem" }}>
          <button
            onClick={() => setShowAddModal(true)}
            style={{
              backgroundColor: "#0070f3",
              color: "white",
              border: "none",
              padding: "0.5rem 1rem",
              borderRadius: "6px",
              cursor: "pointer",
            }}
          >
            Add to Collection
          </button>
        </div>
      </div>

      <AddToCollectionModal
        show={showAddModal}
        onClose={() => setShowAddModal(false)}
        onConfirm={handleAddToCollection}
        collections={collections}
        selectedCollectionId={selectedCollectionId}
        setSelectedCollectionId={setSelectedCollectionId}
        newCollectionName={newCollectionName}
        setNewCollectionName={setNewCollectionName}
      />
    </>
  );
}
