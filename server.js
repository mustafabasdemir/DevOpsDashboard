import express from 'express';
import axios from 'axios';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url'; // ES Module için __dirname alternatifi

const app = express();
app.use(cors());
app.use(express.json());

const GITLAB_TRIGGER_TOKEN = 'glptt-1d6ed2c2c7f13f1f34fc2698f9d8f783e98ed805';
const GITLAB_REF = 'main';
const PRIVATE_TOKEN = 'glpat-0GpshY0KN2Clv38MdWUVI286MQp1OmhsMWJiCw.01.120co75ly';

// ES Modules ortamında __dirname alternatifi
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Logs klasörü yoksa oluştur
const logsDir = path.join(__dirname, "public", "logs");
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir);
}

// 📄 LOG FONKSİYONU
function logJobToFile(projectId, jobName) {
  const now = new Date();
  const date = now.toISOString().split('T')[0]; // YYYY-MM-DD
  const time = now.toTimeString().split(' ')[0]; // HH:MM:SS

  const logLine = `${date} ${time} - Project ID: ${projectId} - Job: ${jobName}\n`;
  const logFilePath = path.join(logsDir, `${date}.log`);

  fs.appendFile(logFilePath, logLine, (err) => {
    if (err) console.error('Log dosyasına yazılamadı:', err);
  });
}

// 🔁 TRIGGER ENDPOINT
app.post('/trigger', async (req, res) => {
  const { job, projectId } = req.body;

  if (!job || !projectId) {
    return res.status(400).json({ error: 'job ve projectId zorunludur.' });
  }

  // ✅ Log yaz
  logJobToFile(projectId, job);

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

    const pipelineData = response.data;
    const pipelineId = pipelineData.id;

    const jobsResponse = await axios.get(
      `https://gitlab.com/api/v4/projects/${projectId}/pipelines/${pipelineId}/jobs`,
      {
        headers: { 'PRIVATE-TOKEN': PRIVATE_TOKEN },
      }
    );

    const jobs = jobsResponse.data;
    const firstJobId = jobs[0].id;

    const jobLogs = await WaitForJobLogs(projectId, firstJobId, PRIVATE_TOKEN);

    res.status(200).json({
      status: 'Triggered',
      pipeline: pipelineData,
      logs: jobLogs,
    });

  } catch (err) {
    res.status(500).json({ error: err.response?.data || err.message });
  }
});

// 🌐 SERVER LISTE
app.get('/servers', async (req, res) => {
  const { projectId } = req.query;

  try {
    const { data } = await axios.get(
      `https://gitlab.com/api/v4/projects/${projectId}/runners`,
      {
        headers: { 'PRIVATE-TOKEN': PRIVATE_TOKEN },
      }
    );

    const runners = await Promise.all(
      data.map(async (runner) => {
        const { data: details } = await axios.get(
          `https://gitlab.com/api/v4/runners/${runner.id}`,
          {
            headers: { 'PRIVATE-TOKEN': PRIVATE_TOKEN },
          }
        );

        const getOrDefault = (value, fallback) => {
          const val = value?.toLowerCase?.() || '';
          if (val === 'n/a' || val === 'bilinmiyor' || val === '') {
            return fallback;
          }
          return value;
        };

        return {
          id: runner.id,
          name: runner.description || `Runner ${runner.id}`,
          isOnline: runner.active && runner.status === 'online',
          active: runner.active,
          status: runner.status,
          projectId,
          host: 'http://localhost:3001',
          os: getOrDefault(details.platform, 'Windows Server 2022'),
          architecture: getOrDefault(details.architecture, 'x64'),
          cpu: getOrDefault(details.cpu, 'Xeon E5-2670'),
          memory: getOrDefault(details.memory, '8 GB'),
        };
      })
    );

    res.json(runners);
  } catch (error) {
    console.error('Runners alınamadı:', error.message);
    res.status(500).json({ error: 'Sunucular alınamadı.' });
  }
});

// ⏳ JOB LOGS BEKLEYEN FONKSİYON
async function WaitForJobLogs(projectId, jobId, token) {
  while (true) {
    const jobStatusResp = await axios.get(
      `https://gitlab.com/api/v4/projects/${projectId}/jobs/${jobId}`,
      { headers: { 'PRIVATE-TOKEN': token } }
    );

    const status = jobStatusResp.data.status;

    if (status === 'success' || status === 'failed') {
      const logsResp = await axios.get(
        `https://gitlab.com/api/v4/projects/${projectId}/jobs/${jobId}/trace`,
        { headers: { 'PRIVATE-TOKEN': token } }
      );
      return logsResp.data;
    }

    await new Promise((resolve) => setTimeout(resolve, 1000));
  }
}

// 🔊 SUNUCUYU BAŞLAT
app.listen(3001, () => {
  console.log('🚀 Backend listening on port 3001');
});
