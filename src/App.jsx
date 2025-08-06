import { useState } from "react";
import serverImg from "./assets/server.png";

const jobs = [
  { name: "publish", label: "🚀 Yayınla" },
  { name: "iis_reset", label: "🔄 IIS Reset" },
  { name: "iis_site_start", label: "▶️ IIS Başlat" },
  { name: "iis_site_stop", label: "⏸️ IIS Durdur" },
  { name: "restart", label: "🔁 Sunucu Yeniden Başlat" },
  { name: "shutdown", label: "🛑 Sunucu Kapat" },
];

const servers = [
  {
    id: 1,
    name: "Eğitim Sunucusu",
    projectId: "61673797",
    host: "http://localhost:3001",
  },
  {
    id: 2,
    name: "Video Sunucusu",
    projectId: "12345678",
    host: "http://localhost:3001",
  },
  {
    id: 3,
    name: "Veritabanı Sunucusu",
    projectId: "87654321",
    host: "http://localhost:3001",
  },
];

function App() {
  const [loading, setLoading] = useState(null);
  const [logs, setLogs] = useState({});

  const triggerJob = async (server, jobName) => {
    const key = `${server.id}-${jobName}`;
    setLoading(key);
    setLogs((prev) => ({
      ...prev,
      [server.id]: `⏳ ${jobName} tetikleniyor...`,
    }));

    try {
      const res = await fetch(`${server.host}/trigger`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ job: jobName, projectId: server.projectId }),
      });

      const data = await res.json();
      if (res.ok) {
        setLogs((prev) => ({
          ...prev,
          [server.id]: `✅ ${jobName} tetiklendi. Pipeline ID: ${
            data.pipeline?.id || "Yok"
          }`,
        }));
      } else {
        setLogs((prev) => ({
          ...prev,
          [server.id]: `❌ Hata: ${data.error?.message || "Bilinmeyen hata"}`,
        }));
      }
    } catch (err) {
      setLogs((prev) => ({
        ...prev,
        [server.id]: `❌ İstek başarısız: ${err.message}`,
      }));
    }

    setLoading(null);
  };

  return (
    <div
      style={{
        padding: "1rem",
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
        background: "#f4f6f8",
        minWidth: "98.5vw",
        minHeight: "100vh",
        boxSizing: "border-box",
      }}
    >
      <h1
        style={{
          textAlign: "center",
          marginBottom: "1.5rem",
          color: "#2c3e50",
          fontWeight: "700",
          fontSize: "2rem",
        }}
      >
        🛠️ DevOps Dashboard
      </h1>

      <div
        style={{
          display: "grid",
          gap: "2rem",
          gridTemplateColumns: "repeat(3, 1fr)", // Her satırda 3 kart
          maxWidth: "1200px",
          margin: "0 auto",
        }}
      >
        {servers.map((server) => (
          <div
            key={server.id}
            style={{
              background: "#fff",
              borderRadius: "16px",
              padding: "1.5rem 1.8rem 2rem 1.8rem",
              boxShadow: "0 8px 24px rgba(0,0,0,0.1)",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              minHeight: "320px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
              <img
                src={serverImg}
                alt="Server"
                style={{ width: 60, height: 60, objectFit: "contain" }}
              />
              <h2
                style={{
                  margin: 0,
                  fontWeight: "700",
                  fontSize: "1.5rem",
                  color: "#34495e",
                }}
              >
                {server.name}
              </h2>
            </div>

            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "12px",
                marginTop: "1.5rem",
              }}
            >
              {jobs.map((job) => {
                const jobKey = `${server.id}-${job.name}`;
                const isLoading = loading === jobKey;
                return (
                  <button
                    key={jobKey}
                    onClick={() => triggerJob(server, job.name)}
                    disabled={isLoading}
                    style={{
                      flex: "1 1 45%",
                      padding: "14px 0",
                      fontSize: "16px",
                      background: isLoading ? "#95a5a6" : "#2980b9",
                      color: "#fff",
                      border: "none",
                      borderRadius: "12px",
                      cursor: isLoading ? "not-allowed" : "pointer",
                      boxShadow: isLoading
                        ? "none"
                        : "0 6px 12px rgba(41, 128, 185, 0.5)",
                      transition: "background-color 0.3s ease, box-shadow 0.3s ease",
                      userSelect: "none",
                      fontWeight: "600",
                      textAlign: "center",
                    }}
                    onMouseEnter={(e) => {
                      if (!isLoading) e.currentTarget.style.background = "#1f618d";
                    }}
                    onMouseLeave={(e) => {
                      if (!isLoading) e.currentTarget.style.background = "#2980b9";
                    }}
                  >
                    {job.label}
                  </button>
                );
              })}
            </div>

            <div
              style={{
                marginTop: "2rem",
                background: "#ecf0f1",
                padding: "14px 18px",
                borderRadius: "12px",
                minHeight: "80px",
                whiteSpace: "pre-wrap",
                fontSize: "14px",
                color: logs[server.id]?.startsWith("✅")
                  ? "#27ae60"
                  : logs[server.id]?.startsWith("❌")
                  ? "#c0392b"
                  : "#34495e",
                fontWeight: "600",
                boxShadow: "inset 0 0 8px rgba(0,0,0,0.05)",
                userSelect: "text",
              }}
            >
              <strong>Durum:</strong>
              <div style={{ marginTop: "8px" }}>
                {logs[server.id] || "Henüz işlem yapılmadı."}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
