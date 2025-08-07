import { useEffect, useState } from "react";
import serverImg from "./assets/server.png";

// Tüm kullanılabilecek joblar burada tanımlı:
const allJobs = {
  common: [
    { name: "publish", label: "🚀 Publish" },
    { name: "iis_reset", label: "🔄 IIS Reset" },
    { name: "iis_site_start", label: "▶️ Start IIS Site" },
    { name: "iis_site_stop", label: "⏸️ Stop IIS Site" },
    { name: "restart", label: "🔁 Restart Server" },
    { name: "shutdown", label: "🛑 Shutdown Server" },
    { name: "server_status", label: "ℹ️ Show Details" },
  ],
  databaseTest: [
    { name: "db_test", label: "🧪 Database Test Transfer" },
    { name: "db_backup", label: "🧪 Backup Database" },
    { name: "restart", label: "🔁 Restart Server" },
    { name: "shutdown", label: "🛑 Shutdown Server" },
    { name: "server_status", label: "ℹ️ Show Details" },
  ],
};


function App() {
  const [servers, setServers] = useState([]);
  const [loading, setLoading] = useState(null);
  const [logs, setLogs] = useState({});
  const projectId = "61673797";

  useEffect(() => {
    const fetchServers = async () => {
      try {
        const response = await fetch(
          `http://localhost:3001/servers?projectId=${projectId}`
        );
        const data = await response.json();

        // API'den gelen sunuculara jobs yoksa common joblar atanıyor
        const processedApiServers = data.map(server => ({
          ...server,
          jobs: server.jobs && server.jobs.length > 0 ? server.jobs : allJobs.common,
        }));

        // Örnek sunucular, farklı jobs atanmış
        const exampleServers = [
          {
            id: 999001,
            name: "Web Sunucusu  Test",
            isOnline: true,
            active: true,
            os: "Windows Server 2019",
            architecture: "x64",
            cpu: "Xeon E5-2670",
            memory: "4 GB",
            projectId,
            host: "http://localhost:3001",
            jobs: allJobs.common, // Sadece ortak joblar
          },
          {
            id: 999002,
            name: "Veritabanı Sunucu",
            isOnline: false,
            active: false,
            os: "Windows Server 2022",
            architecture: "arm64",
            cpu: "Intel Core i5-9700K",
            memory: "4 GB",
            projectId,
            host: "http://localhost:3001",
            jobs: [ ...allJobs.databaseTest], // Ek olarak db_test job'u
          },
        ];

        setServers([...processedApiServers, ...exampleServers]);
      } catch (err) {
        console.error("Sunucular alınamadı:", err);
      }
    };

    fetchServers();
  }, [projectId]);

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
          gap: "1rem",
          gridTemplateColumns: "repeat(3, 1fr)",
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
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  marginTop: "0.5rem",
                  gap: "0.75rem",
                  flexWrap: "wrap",
                }}
              >
                <div
                  style={{
                    width: 12,
                    height: 12,
                    borderRadius: "50%",
                    backgroundColor:
                      server.isOnline && server.active ? "green" : "red",
                  }}
                  title={server.isOnline && server.active ? "Aktif" : "Pasif"}
                />
                <span style={{ fontSize: "0.85rem", color: "#555" }}>
                  {server.os?.toUpperCase() || "OS bilinmiyor"} |{" "}
                  {server.architecture || "Arch yok"}
                </span>
                <span style={{ fontSize: "0.85rem", color: "#555" }}>
                  🧠 {server.cpu || "CPU yok"} | 💾 {server.memory || "RAM yok"}
                </span>
              </div>
              <h2
                style={{
                  margin: 0,
                  fontWeight: "700",
                  fontSize: "1.4rem",
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
              {/* Sunucuya özel joblar */}
              {server.jobs?.map((job) => {
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
                      transition:
                        "background-color 0.3s ease, box-shadow 0.3s ease",
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
