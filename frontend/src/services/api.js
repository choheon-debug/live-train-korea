export const fetchTrains = async (from, to) => {
    try {
        const response = await fetch(`/api/trains?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`);
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
