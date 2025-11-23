const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

// Helper to add minutes to a date
const addMinutes = (date, minutes) => {
    return new Date(date.getTime() + minutes * 60000);
};
};

const generateTrainDetail = (trainId) => {
    const now = new Date();
    let from = '서울';
    let to = '목포'; // Default to Mokpo if decoding fails
    let id = '101';

    try {
        const decoded = Buffer.from(trainId, 'base64').toString('utf-8');
        const parts = decoded.split('|');
        if (parts.length === 3) {
            from = parts[0];
            to = parts[1];
            id = parts[2];
        }
    } catch (e) {
        console.error("Failed to decode trainId", e);
    }

    // Dynamic Route Generation
    const route = [];
    const stopCount = 2 + Math.floor(Math.random() * 3);

    // Start Station
    let currentTime = addMinutes(now, -30);
    route.push({
        stationName: from,
        stationCode: `ST-START`,
        arrivalTime: null,
        departureTime: toISO(currentTime),
        delay: 0,
        isStop: true
    });

    // Intermediate Stops
    for (let i = 0; i < stopCount; i++) {
        currentTime = addMinutes(currentTime, 20 + Math.floor(Math.random() * 20));
        const arrival = toISO(currentTime);
        currentTime = addMinutes(currentTime, 5);
        const departure = toISO(currentTime);

        route.push({
            stationName: `${from}-${to}-경유역${i + 1}`,
            stationCode: `ST-${i}`,
            arrivalTime: arrival,
            departureTime: departure,
            delay: 0,
            isStop: true
        });
    }

    // End Station
    currentTime = addMinutes(currentTime, 30);
    route.push({
        stationName: to,
        stationCode: `ST-END`,
        arrivalTime: toISO(currentTime),
        departureTime: null,
        delay: 0,
        isStop: true
    });

    return {
        trainId: trainId,
        trainName: 'KTX',
        trainNumber: id,
        route: route
    };
};

// Endpoints

// GET /api/trains
app.get('/api/trains', (req, res) => {
    const { from, to, trainNo } = req.query;

    // If trainNo is provided, we don't strictly need from/to
    if (!trainNo && (!from || !to)) {
        return res.status(400).json({
            error: {
                code: 'ERR_INVALID_PARAM',
                message: '출발역(from)과 도착역(to) 또는 열차번호(trainNo)를 입력해주세요.'
            }
        });
    }

    const trains = generateTrains(from, to, trainNo);

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
