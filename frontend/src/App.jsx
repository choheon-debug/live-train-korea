import React, { useState, useEffect, useCallback } from 'react';
import SearchForm from './components/SearchForm';
import TrainList from './components/TrainList';
import TrainDetail from './components/TrainDetail';
import { fetchTrains } from './services/api';
import { format, parseISO } from 'date-fns';

function App() {
    const [trains, setTrains] = useState([]);
    const [loading, setLoading] = useState(false);
    const [lastUpdate, setLastUpdate] = useState(null);
    const [selectedTrainId, setSelectedTrainId] = useState(null);
    const [searchParams, setSearchParams] = useState({ from: '서울', to: '부산' });
    const [error, setError] = useState(null);

    const loadTrains = useCallback(async (from, to) => {
        setLoading(true);
        setError(null);
        try {
            const data = await fetchTrains(from, to);
            setTrains(data.trains);
            setLastUpdate(data.lastUpdate);
        } catch (err) {
            setError('열차 정보를 불러오는 중 오류가 발생했습니다.');
        } finally {
            setLoading(false);
        }
    }, []);

    // Initial load
    useEffect(() => {
        loadTrains(searchParams.from, searchParams.to);
    }, []);

    // Polling
    useEffect(() => {
        const intervalId = setInterval(() => {
            // Silent update (don't set loading state)
            fetchTrains(searchParams.from, searchParams.to).then(data => {
                setTrains(data.trains);
                setLastUpdate(data.lastUpdate);
            }).catch(console.error);
        }, 30000); // 30 seconds

        return () => clearInterval(intervalId);
    }, [searchParams]);

    const handleSearch = (from, to) => {
        setSearchParams({ from, to });
        loadTrains(from, to);
    };

    return (
        <div className="container">
            <header className="header">
                <h1>Live Train Korea</h1>
                <p style={{ color: 'var(--text-muted)' }}>실시간 열차 운행 정보</p>
            </header>

            <SearchForm onSearch={handleSearch} isLoading={loading} />

            {error && <div className="card" style={{ color: 'var(--error-color)' }}>{error}</div>}

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px', padding: '0 4px' }}>
                <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                    검색 결과: {trains.length}건
                </span>
                {lastUpdate && (
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        업데이트: {format(parseISO(lastUpdate), 'HH:mm:ss')}
                    </span>
                )}
            </div>

            <TrainList trains={trains} onSelectTrain={setSelectedTrainId} />

            {selectedTrainId && (
                <TrainDetail
                    trainId={selectedTrainId}
                    onClose={() => setSelectedTrainId(null)}
                />
            )}
        </div>
    );
}

export default App;
