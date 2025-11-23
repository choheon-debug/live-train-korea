const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

// Helper to add minutes to a date
const addMinutes = (date, minutes) => {
    return new Date(date.getTime() + minutes * 60000);
    // GET /api/trains/:trainId
    app.get('/api/trains/:trainId', (req, res) => {
        const { trainId } = req.params;
        const detail = generateTrainDetail(trainId);

        // Cache-Control: 600 seconds
        res.set('Cache-Control', 'max-age=600');

        res.json(detail);
    });

    // Export the app for Vercel
    module.exports = app;
