import React, { useEffect, useState } from 'react';
import { fetchTrainDetail } from '../services/api';
import { format, parseISO } from 'date-fns';

const TrainDetail = ({ trainId, onClose }) => {
    const [detail, setDetail] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadDetail = async () => {
            try {
                const data = await fetchTrainDetail(trainId);
                setDetail(data);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        loadDetail();
    }, [trainId]);

    if (!trainId) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <button className="close-btn" onClick={onClose}>&times;</button>

                {loading ? (
                    <div className="loading-spinner"></div>
                ) : detail ? (
                    <>
                        <h2 style={{ marginTop: 0 }}>{detail.trainName} {detail.trainNumber} 상세 정보</h2>
                        <div className="timeline">
                            {detail.route.map((stop, index) => (
                                <div key={stop.stationCode} className={`timeline-item ${stop.isStop ? 'active' : ''}`}>
                                    <div className="timeline-dot"></div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <span style={{ fontWeight: 'bold' }}>{stop.stationName}</span>
                                        <span style={{ color: 'var(--text-muted)' }}>
                                            {stop.arrivalTime ? format(parseISO(stop.arrivalTime), 'HH:mm') : '출발'}
                                            {stop.departureTime ? ` - ${format(parseISO(stop.departureTime), 'HH:mm')}` : ' 도착'}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                ) : (
                    <div>정보를 불러올 수 없습니다.</div>
                )}
            </div>
        </div>
    );
};

export default TrainDetail;
