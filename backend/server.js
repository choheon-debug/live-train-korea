const express = require('express');
const cors = require('cors');
const app = express();
const port = 3000;

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

        trains.push({
            trainId: `TRN-${1000 + i}`,
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
    const stations = ['서울', '대전', '동대구', '부산'];
    const route = [];
    let currentTime = addMinutes(now, -30); // Started 30 mins ago

    stations.forEach((station, index) => {
        const travelTime = 40 + Math.floor(Math.random() * 10);
        const arrival = index === 0 ? null : toISO(currentTime);
        
        currentTime = addMinutes(currentTime, 5); // 5 min stop
        const departure = index === stations.length - 1 ? null : toISO(currentTime);
        
        currentTime = addMinutes(currentTime, travelTime);

        route.push({
            stationName: station,
            stationCode: `ST-${100 + index}`,
            arrivalTime: arrival,
            departureTime: departure,
            delay: 0,
            isStop: true
        });
    });

    return {
        trainId: trainId,
        trainName: 'KTX',
        trainNumber: '101',
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

app.listen(port, () => {
    console.log(`Mock Backend Server running at http://localhost:${port}`);
});
