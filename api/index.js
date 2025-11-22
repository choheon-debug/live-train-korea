const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

// Helper to add minutes to a date
const addMinutes = (date, minutes) => {
    return new Date(date.getTime() + minutes * 60000);
};

// Helper to format date to ISO 8601
const toISO = (date) => date.toISOString();
// GET /api/trains
app.get('/api/trains', (req, res) => {
    const { from, to } = req.query;

    if (!from || !to) {
        return res.status(400).json({
            error: {
                code: 'ERR_INVALID_PARAM',
                message: '출발역(from)과 도착역(to)을 입력해주세요.'
            }
        });
    }

    const trains = generateTrains(from, to);

    // Cache-Control: 60 seconds
    res.set('Cache-Control', 'max-age=60');

    res.json({
        lastUpdate: toISO(new Date()),
        trains: trains
    });
});

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
