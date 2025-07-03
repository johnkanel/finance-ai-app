const express = require('express');
const router = express.Router();
const fetch = require('node-fetch');
const { GoogleAuth } = require('google-auth-library');
const path = require('path');
const { readFileSync } = require('fs');
const Expense = require('../models/Expense'); // βεβαιώσου ότι υπάρχει το σωστό path

// === Dialogflow Auth ===
const serviceAccountPath = path.resolve(__dirname, '../financialcoach-hphe-0a55c335a7df.json');
const rawJson = JSON.parse(readFileSync(serviceAccountPath, 'utf8'));
const projectId = rawJson.project_id;
const DIALOGFLOW_API_BASE = `https://dialogflow.googleapis.com/v2/projects/${projectId}/agent/sessions`;

async function getAccessToken() {
  const auth = new GoogleAuth({
    keyFile: serviceAccountPath,
    scopes: 'https://www.googleapis.com/auth/cloud-platform',
  });

  const client = await auth.getClient();
  const token = await client.getAccessToken();
  return token.token;
}

// === ROUTES ===

// Basic test route
router.get('/test', (req, res) => {
  res.send('✅ Dialogflow route is working!');
});

// Direct message sending (detectIntent)
router.post('/send-message', async (req, res) => {
  const { text, sessionId = '123456' } = req.body;
  if (!text) return res.status(400).json({ error: 'Text is required' });

  try {
    const token = await getAccessToken();
    const response = await fetch(`${DIALOGFLOW_API_BASE}/${sessionId}:detectIntent`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        queryInput: {
          text: { text, languageCode: 'el' },
        },
      }),
    });

    const json = await response.json();
    if (json.error) return res.status(500).json({ error: json.error });
    return res.json({ fulfillmentText: json.queryResult.fulfillmentText });
  } catch (err) {
    console.error('Error in /send-message:', err);
    return res.status(500).json({ error: err.message });
  }
});

// === Fulfillment Webhook Route ===
router.post('/fulfillment', async (req, res) => {
   console.log("📦 Full request body:\n", JSON.stringify(req.body, null, 2));
const fullDisplayName = req.body.queryResult.intent.displayName;
const intent = fullDisplayName.split('/').pop();
  const userId = req.body.originalDetectIntentRequest?.payload?.userId || 'user-id-placeholder';

  const now = new Date();
  const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const endOfLastMonth = startOfThisMonth;
  const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  try {
    console.log("🔍 Intent received:", intent);
    console.log("📦 Intent name:", req.body.queryResult.intent.name);
console.log("📦 Intent displayName:", fullDisplayName);

console.log("💬 Clean Intent:", intent);9

    if (intent === 'category_spending') {
      // Aggregate top category in last 30 days
      const results = await Expense.aggregate([
        { $match: { user: userId, date: { $gte: oneMonthAgo } } },
        { $group: { _id: '$category', total: { $sum: '$amount' } } },
        { $sort: { total: -1 } },
        { $limit: 1 }
      ]);
      console.log("📅 Looking for expenses since:", oneMonthAgo.toISOString());
      console.log("🧾 Aggregation Results:", results);
      if (!results.length) {
        return res.json({ fulfillmentText: 'Δεν βρήκα έξοδα τον τελευταίο μήνα για ανάλυση.' });
      }
      const { _id: topCategory, total } = results[0];
      return res.json({
        fulfillmentText: `💡 Ξοδεύεις τα περισσότερα σε κατηγορία '${topCategory}' (€${total.toFixed(2)}) τον τελευταίο μήνα.`
      });

    } else if (intent === 'next_month_forecast') {
      const expenses = await Expense.find({ user: userId, date: { $gte: oneMonthAgo } });
      if (!expenses.length) {
        return res.json({ fulfillmentText: 'Δεν υπάρχουν έξοδα τον τελευταίο μήνα για πρόβλεψη.' });
      }
      const total = expenses.reduce((sum, e) => sum + e.amount, 0);
      const forecast = (total / expenses.length) * 30;
      return res.json({
        fulfillmentText: `🔮 Αν συνεχίσεις με τον ίδιο ρυθμό, προβλέπουμε έξοδα περίπου €${forecast.toFixed(2)} τον επόμενο μήνα.`
      });

    } else if (intent === 'expense_trend') {
      const thisMonthExpenses = await Expense.find({ user: userId, date: { $gte: startOfThisMonth } });
      const lastMonthExpenses = await Expense.find({
        user: userId,
        date: { $gte: startOfLastMonth, $lt: endOfLastMonth }
      });
      const totalThis = thisMonthExpenses.reduce((sum, e) => sum + e.amount, 0);
      const totalLast = lastMonthExpenses.reduce((sum, e) => sum + e.amount, 0);
      if (totalLast === 0) {
        return res.json({ fulfillmentText: 'Δεν υπάρχουν δεδομένα για τον προηγούμενο μήνα.' });
      }
      const change = ((totalThis - totalLast) / totalLast) * 100;
      const trend = change > 0 ? 'αυξήθηκαν' : 'μειώθηκαν';
      const emoji = change > 0 ? '📈' : '📉';
      return res.json({
        fulfillmentText: `${emoji} Τα έξοδά σου ${trend} αυτόν τον μήνα κατά ${Math.abs(change.toFixed(1))}% σε σχέση με τον προηγούμενο.`
      });
    }
console.log("🔍 Intent received:", intent);

    // Default fallback
    return res.json({ fulfillmentText: 'Δεν καταλάβαμε την ερώτηση. Προσπάθησε ξανά!' });

  } catch (err) {
    console.error('Fulfillment error:', err);
    return res.status(500).json({ fulfillmentText: 'Προέκυψε σφάλμα στον server.' });
  }
});

module.exports = router;