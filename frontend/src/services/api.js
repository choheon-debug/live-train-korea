export const fetchTrains = async (from, to, trainNo = '') => {
    try {
        const queryParams = new URLSearchParams({
            from: from || '',
            to: to || '',
            trainNo: trainNo || ''
        }).toString();
        const response = await fetch(`/api/trains?${queryParams}`);
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return await response.json();
    } catch (error) {
        console.error("Failed to fetch trains:", error);
        throw error;
    }
};

export const fetchTrainDetail = async (trainId) => {
    try {
        const response = await fetch(`/api/trains/${trainId}`);
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return await response.json();
    } catch (error) {
        console.error("Failed to fetch train detail:", error);
        throw error;
    }
};
