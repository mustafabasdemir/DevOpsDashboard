import express from 'express';
import axios from 'axios';
import cors from 'cors';

const app = express();
app.use(cors());
app.use(express.json());

const GITLAB_TRIGGER_TOKEN = 'glptt-1d6ed2c2c7f13f1f34fc2698f9d8f783e98ed805';
const GITLAB_REF = 'main';

app.post('/trigger', async (req, res) => {
  const { job, projectId } = req.body;

  if (!job || !projectId) {
    return res.status(400).json({ error: 'job ve projectId zorunludur.' });
  }

  try {
    const response = await axios.post(
      `https://gitlab.com/api/v4/projects/${projectId}/trigger/pipeline`,
      null,
      {
        params: {
          token: GITLAB_TRIGGER_TOKEN,
          ref: GITLAB_REF,
          [`variables[${job}]`]: 'true',
        },
      }
    );

    res.status(200).json({ status: 'Triggered', pipeline: response.data });
  } catch (err) {
    res.status(500).json({ error: err.response?.data || err.message });
  }
});



//runner listele

app.get('/servers', async (req, res) => {
  const { projectId } = req.query;

  try {
    const { data } = await axios.get(
      `https://gitlab.com/api/v4/projects/${projectId}/runners`,
      {
        headers: { "PRIVATE-TOKEN": 'glpat-0GpshY0KN2Clv38MdWUVI286MQp1OmhsMWJiCw.01.120co75ly' },
      }
    );

    const runners = await Promise.all(
      data.map(async (runner) => {
        const { data: details } = await axios.get(
          `https://gitlab.com/api/v4/runners/${runner.id}`,
          {
            headers: { "PRIVATE-TOKEN": 'glpat-0GpshY0KN2Clv38MdWUVI286MQp1OmhsMWJiCw.01.120co75ly' },
          }
        );

        // Varsayılan değerleri ata
        const getOrDefault = (value, fallback) => {
          const val = value?.toLowerCase?.() || "";
          if (val === "n/a" || val === "bilinmiyor" || val === "") {
            return fallback;
          }
          return value;
        };

        return {
          id: runner.id,
          name: runner.description || `Runner ${runner.id}`,
          isOnline: runner.active && runner.status === "online",
          active: runner.active,
          status: runner.status,
          projectId,
          host: "http://localhost:3001",

          // 🔽 Varsayılanlar
          os: getOrDefault(details.platform, "Windows Server 2022"),
          architecture: getOrDefault(details.architecture, "x64"),
          cpu: getOrDefault(details.cpu, "Xeon E5-2670"),
          memory: getOrDefault(details.memory, "8 GB"),
        };
      })
    );

    res.json(runners);
  } catch (error) {
    console.error("Runners alınamadı:", error.message);
    res.status(500).json({ error: "Sunucular alınamadı." });
  }
});


app.listen(3001, () => {
  console.log('🚀 Backend listening on port 3001');
});
