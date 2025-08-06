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

app.listen(3001, () => {
  console.log('🚀 Backend listening on port 3001');
});
