import React, { useState } from 'react';

const SearchForm = ({ onSearch, isLoading }) => {
    const [from, setFrom] = useState('서울');
    const [to, setTo] = useState('목포');
    const [trainNo, setTrainNo] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        // Allow search if trainNo is provided OR (from and to are provided)
        if (trainNo || (from && to)) {
            onSearch(from, to, trainNo);
        }
    };

    return (
        <div className="card">
            <form onSubmit={handleSubmit}>
                <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                    <input
                        type="text"
                        className="input"
                        placeholder="출발역 (예: 서울)"
                        value={from}
                        onChange={(e) => setFrom(e.target.value)}
                    />
                    <input
                        type="text"
                        className="input"
                        placeholder="도착역 (예: 목포)"
                        value={to}
                        onChange={(e) => setTo(e.target.value)}
                    />
                </div>
                <div style={{ marginBottom: '10px' }}>
                    <input
                        type="text"
                        className="input"
                        placeholder="열차 번호 (선택, 예: 101)"
                        value={trainNo}
                        onChange={(e) => setTrainNo(e.target.value)}
                    />
                </div>
                <button type="submit" className="btn" disabled={isLoading}>
                    {isLoading ? '검색 중...' : '열차 조회'}
                </button>
            </form>
        </div>
    );
};

export default SearchForm;
