import React, { useState } from 'react';

const SearchForm = ({ onSearch, isLoading }) => {
    const [from, setFrom] = useState('서울');
    const [to, setTo] = useState('부산');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (from && to) {
            onSearch(from, to);
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
                        required
                    />
                    <input
                        type="text"
                        className="input"
                        placeholder="도착역 (예: 부산)"
                        value={to}
                        onChange={(e) => setTo(e.target.value)}
                        required
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
