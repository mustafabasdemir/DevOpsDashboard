import { useEffect, useState } from "react";
import serverImg from "./assets/server.png";

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
  const [darkMode, setDarkMode] = useState(false);
  const projectId = "61673797";

  useEffect(() => {
    const fetchServers = async () => {
      try {
        const response = await fetch(
          `http://localhost:3001/servers?projectId=${projectId}`
        );
        const data = await response.json();

        const processedApiServers = data.map((server) => ({
          ...server,
          jobs:
            server.jobs && server.jobs.length > 0
              ? server.jobs
              : allJobs.common,
        }));

        const exampleServers = [
          {
            id: 999001,
            name: "Web Sunucusu Test",
            isOnline: true,
            active: true,
            os: "Windows Server 2019",
            architecture: "x64",
            cpu: "Xeon E5-2670",
            memory: "4 GB",
            projectId,
            host: "http://localhost:3001",
            jobs: allJobs.common,
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
            jobs: [...allJobs.databaseTest],
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
    className={`${
      darkMode ? "bg-gray-900 text-gray-100" : "bg-gray-100 text-gray-800"
    } w-full min-h-screen p-6 font-sans transition-colors duration-500`}
  >
      <div className="flex justify-between items-center mb-8 w-full mx-auto">
        <h2 className="text-3xl font-extrabold">🛠️ DevOps Dashboard</h2>
        <button
          onClick={() => setDarkMode(!darkMode)}
          className={`px-4 py-2 rounded-lg font-medium transition-colors duration-300 border
      ${
        darkMode
          ? "bg-yellow-400 text-gray-900 border-yellow-500 hover:bg-yellow-500"
          : "bg-white text-gray-900 border-gray-400 hover:bg-gray-100"
      }
    `}
        >
          {darkMode ? "🌞 Light Mode" : "🌙 Dark Mode"}
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full mx-auto">
        {servers.map((server) => {
          const isLoading = (jobName) => loading === `${server.id}-${jobName}`;

          return (
            <div
              key={server.id}
              className={`rounded-2xl p-6 shadow-lg flex flex-col justify-between min-h-[320px] max-w-full transition-colors duration-300 ${
                darkMode ? "bg-gray-800" : "bg-white"
              }`}
            >
              <div className="flex items-center gap-4 mb-4">
                <img
                  src={serverImg}
                  alt="Server"
                  className="w-16 h-16 object-contain"
                />
                <div className="flex flex-col flex-grow">
                  <div className="flex items-center gap-2 flex-wrap text-sm mb-1">
                    <span
                      title={
                        server.isOnline && server.active ? "Aktif" : "Pasif"
                      }
                      className={`w-3 h-3 rounded-full ${
                        server.isOnline && server.active
                          ? "bg-green-500"
                          : "bg-red-500"
                      }`}
                    />
                    <span>
                      {server.os?.toUpperCase() || "OS bilinmiyor"} |{" "}
                      {server.architecture || "Arch yok"}
                    </span>
                  </div>
                  <div className="text-sm opacity-80">
                    🧠 {server.cpu || "CPU yok"} | 💾{" "}
                    {server.memory || "RAM yok"}
                  </div>
                </div>
              </div>

              <h2 className="text-xl font-bold mb-4">{server.name}</h2>
              <div className="flex flex-wrap gap-3">
                {server.jobs?.map((job) => {
                  const loadingBtn = isLoading(job.name);
                  return (
                    <button
                      key={`${server.id}-${job.name}`}
                      disabled={loadingBtn}
                      onClick={() => triggerJob(server, job.name)}
                      className={`flex-1 min-w-[120px] py-2 px-3 rounded-xl font-semibold transition duration-300 border shadow-sm
                        ${
                          loadingBtn
                            ? "bg-gray-500 text-gray-200 cursor-not-allowed border-gray-400"
                            : "bg-gray-200 text-gray-800 border-gray-400 hover:bg-gray-300 hover:border-gray-500 hover:shadow-md"
                        }
                        ${
                          darkMode
                            ? "!bg-gray-700 !text-gray-100 !border-gray-500 hover:!bg-gray-600"
                            : ""
                        }
                      `}
                    >
                      {job.label}
                    </button>
                  );
                })}
              </div>

              <div
                className={`mt-6 p-4 rounded-lg min-h-[80px] whitespace-pre-wrap font-semibold shadow-inner select-text transition-colors duration-300
    ${
      logs[server.id]?.startsWith("✅")
        ? darkMode
          ? "bg-green-900 text-green-100"
          : "bg-green-100 text-green-800"
        : logs[server.id]?.startsWith("❌")
        ? darkMode
          ? "bg-red-900 text-red-100"
          : "bg-red-100 text-red-800"
        : darkMode
        ? "bg-gray-700 text-gray-100"
        : "bg-gray-200 text-gray-700"
    }
  `}
              >
                <strong>Durum:</strong>
                <div className="mt-2">
                  {logs[server.id] || "Henüz işlem yapılmadı."}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default App;
