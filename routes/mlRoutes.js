// === backend/routes/mlRoutes.js ===
const express = require('express');
const { spawn } = require('child_process');
const path = require('path');
const router = express.Router();

// POST /api/ml/predict-expense
router.post('/predict-expense', async (req, res) => {
  const { days, amounts } = req.body;
  console.log('📨 Sending to Python script:', { days, amounts });

  if (!days || !amounts || days.length !== amounts.length) {
    return res.status(400).json({ error: 'Invalid input data' });
  }

  try {
    const scriptPath = path.join(__dirname, '../models/ml_model/predictor.py');
    console.log('🧠 Running script:', scriptPath);

const py = spawn('python', [scriptPath]);






    let result = '';
    let error = '';

    py.stdout.on('data', (data) => {
      result += data.toString();
    });

    py.stderr.on('data', (data) => {
      error += data.toString();
      console.error('🐍 Python stderr:', data.toString());
    });

    py.on('close', (code) => {
      if (code !== 0) {
        console.error('❌ Python script error:', error);
        return res.status(500).json({ error: 'ML model failed' });
      }

      try {
        const output = JSON.parse(result);
        console.log('✅ ML output:', output);
        res.json(output);
      } catch (parseErr) {
        console.error('❌ JSON Parse Error:', parseErr);
        res.status(500).json({ error: 'Invalid response from model' });
      }
    });

    py.stdin.write(JSON.stringify({ days, amounts }));
    py.stdin.end();

  } catch (err) {
    console.error('❌ Node.js error calling Python:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
