import { useRouter } from "next/router";

export default function MovieCard({ movie }) {
  const router = useRouter();

  const handleViewDetail = () => {
    router.push(`/movie/${movie.id}`);
  };

  return (
    <div
      style={{
        border: "1px solid #ccc",
        borderRadius: "8px",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        cursor: "pointer",
        height: "100%",
        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
        padding: "0", // padding diganti ke dalam div konten supaya pas dengan AdminPage style
      }}
      onClick={handleViewDetail}
    >
      <img
        src={movie.coverUrl}
        alt={movie.title}
        style={{
          width: "100%",
          height: "160px",
          objectFit: "cover",
          cursor: "pointer",
          flexShrink: 0,
        }}
      />
      <div style={{ padding: "1rem", flex: 1, display: "flex", flexDirection: "column" }}>
        <h3 style={{ margin: "0 0 0.5rem 0" }}>{movie.title}</h3>
        <p style={{ margin: "0.3rem 0" }}>
          <strong>Genre:</strong> {movie.genre?.join(", ")}
        </p>
        <p style={{ margin: "0.3rem 0" }}>
          <strong>Duration:</strong> {movie.duration} min
        </p>
        <p style={{ margin: "0 0 1rem 0" }}>
          <strong>Rating:</strong> {movie.rating}
        </p>
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleViewDetail();
          }}
          style={{
            marginTop: "auto",
            padding: "0.5rem 1rem",
            borderRadius: "4px",
            border: "none",
            backgroundColor: "#0070f3",
            color: "white",
            cursor: "pointer",
          }}
        >
          View Detail
        </button>
      </div>
    </div>
  );
}
