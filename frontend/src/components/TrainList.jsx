import React from 'react';
import { format, parseISO } from 'date-fns';

const TrainList = ({ trains, onSelectTrain }) => {
    if (!trains || trains.length === 0) {
        return <div className="card" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>운행 중인 열차가 없습니다.</div>;
    }

    return (
        <div className="card">
            {trains.map((train) => (
                <div key={train.trainId} className="train-item" onClick={() => onSelectTrain(train.trainId)}>
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                            <span className={`badge ${train.trainName === 'SRT' ? 'badge-srt' : 'badge-ktx'}`}>
                                {train.trainName}
                            </span>
                            <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>{train.trainNumber}</span>
                        </div>
                        <div style={{ fontSize: '1.1rem' }}>
                            {train.originStation} → {train.destinationStation}
                        </div>
                    </div>
                    <div className="time-display">
                        <div className="time-big">
                            {format(parseISO(train.arrivalTime), 'HH:mm')} 도착
                        </div>
                        <div className={train.delay > 0 ? 'delay-info' : 'on-time'}>
                            {train.delay > 0 ? `${train.delay}분 지연` : '정시 운행'}
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default TrainList;
