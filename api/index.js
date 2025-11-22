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

// Mock Data Generators
const generateTrains = (from, to) => {
    const now = new Date();
    const trains = [];
    const trainTypes = ['KTX', 'ITX-새마을', '무궁화호', 'SRT'];

    // Generate 5-8 trains
    const count = 5 + Math.floor(Math.random() * 4);

    for (let i = 0; i < count; i++) {
        const departureTime = addMinutes(now, 10 + i * 30 + Math.floor(Math.random() * 10));
        const duration = 120 + Math.floor(Math.random() * 60); // 2-3 hours
        const arrivalTime = addMinutes(departureTime, duration);
        const delay = Math.random() > 0.7 ? Math.floor(Math.random() * 15) : 0; // 30% chance of delay

        // Encode route info in ID: from|to|id
        // Use Buffer for base64 encoding to be safe
        const encodedId = Buffer.from(`${from}|${to}|${1000 + i}`).toString('base64');

        trains.push({
            trainId: encodedId,
            trainName: trainTypes[Math.floor(Math.random() * trainTypes.length)],
            trainNumber: `${100 + i}`,
            departureTime: toISO(departureTime),
            arrivalTime: toISO(addMinutes(arrivalTime, delay)), // Add delay to arrival
            delay: delay,
            originStation: from,
            destinationStation: to
        });
    }
    return trains;
};

const generateTrainDetail = (trainId) => {
    const now = new Date();
    let from = '서울';
    let to = '부산';
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
    const stopCount = 2 + Math.floor(Math.random() * 3); // 2-4 intermediate stops

    // Start Station
    let currentTime = addMinutes(now, -30); // Started 30 mins ago
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
        currentTime = addMinutes(currentTime, 5); // 5 min stop
        const departure = toISO(currentTime);

        route.push({
            stationName: `${from}-${to}-경유역${i + 1}`, // Generic name
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
