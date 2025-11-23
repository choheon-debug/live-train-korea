import React, { useState, useEffect, useCallback } from 'react';
import SearchForm from './components/SearchForm';
            </header >

    <SearchForm onSearch={handleSearch} isLoading={loading} />

{ error && <div className="card" style={{ color: 'var(--error-color)' }}>{error}</div> }

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

{
    selectedTrainId && (
        <TrainDetail
            trainId={selectedTrainId}
            onClose={() => setSelectedTrainId(null)}
        />
    )
}
        </div >
    );
}

export default App;
