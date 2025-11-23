const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

// Helper to add minutes to a date
const addMinutes = (date, minutes) => {
    return new Date(date.getTime() + minutes * 60000);
};

// Mock Data Generators
const generateTrains = (from, to, trainNo) => {
    // 1. Handle Timezone (KST)
    const nowUtc = new Date();
    const kstOffset = 9 * 60 * 60 * 1000; // UTC+9
    const nowKst = new Date(nowUtc.getTime() + kstOffset);

    const trains = [];

    // 2. Define Train Types based on Route
    let availableTypes = ['KTX', 'ITX-새마을', '무궁화호'];
    if (from === '수서' || to === '수서') {
        availableTypes = ['SRT'];
    } else if (from === '서울' || from === '용산') {
        availableTypes = ['KTX', 'ITX-새마을', '무궁화호'];
    }

    // Realistic durations (in minutes)
    const DURATIONS = {
        '서울-부산': 160,
        '부산-서울': 160,
        '서울-대전': 60,
        '대전-서울': 60,
        '서울-동대구': 110,
        '동대구-서울': 110,
        '수서-부산': 150,
        '부산-수서': 150,
        '서울-목포': 150,
        '목포-서울': 150,
        '용산-목포': 140,
        '목포-용산': 140
    };

    const key = `${from}-${to}`;
    const baseDuration = DURATIONS[key] || 120 + Math.floor(Math.random() * 60);

    // 3. Operating Hours Logic (KST)
    let startTime = new Date(nowKst);
    const currentHour = nowKst.getUTCHours();

    if (currentHour >= 0 && currentHour < 5) {
        startTime.setUTCHours(5, 0, 0, 0);
    } else {
        startTime = addMinutes(startTime, 10);
    }

    // If searching by train number, we mock that specific train
    if (trainNo) {
        const departureTime = startTime;
        const duration = baseDuration;
        const arrivalTime = addMinutes(departureTime, duration);
        const delay = Math.random() > 0.5 ? Math.floor(Math.random() * 20) : 0;

        const origin = from || '서울';
        const dest = to || '목포';

        let type = availableTypes[0];
        if (origin === '수서') type = 'SRT';

        const encodedId = Buffer.from(`${origin}|${dest}|${trainNo}`).toString('base64');

        trains.push({
            trainId: encodedId,
            trainName: type,
            trainNumber: trainNo,
            departureTime: toISO(departureTime),
            arrivalTime: toISO(addMinutes(arrivalTime, delay)),
            delay: delay,
            originStation: origin,
            destinationStation: dest
        });
        return trains;
    }

    // Normal Search
    const count = 5 + Math.floor(Math.random() * 4);

    for (let i = 0; i < count; i++) {
        const departureTime = addMinutes(startTime, i * (30 + Math.floor(Math.random() * 30)));
        const duration = baseDuration + Math.floor(Math.random() * 10) - 5;
        const arrivalTime = addMinutes(departureTime, duration);
        const delay = Math.random() > 0.8 ? Math.floor(Math.random() * 10) : 0;

        const tNum = `${100 + i}`;
        const type = availableTypes[Math.floor(Math.random() * availableTypes.length)];
        const encodedId = Buffer.from(`${from}|${to}|${tNum}`).toString('base64');

        trains.push({
            trainId: encodedId,
            trainName: type,
            trainNumber: tNum,
            departureTime: toISO(departureTime),
            arrivalTime: toISO(addMinutes(arrivalTime, delay)),
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
