export const apiPost = async (path, body = {}) => {
    const token = localStorage.getItem('doctorToken');
    
    const headers = {
        'Content-Type': 'application/json',
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    try {
        const response = await fetch(path, {
            method: 'POST',
            headers,
            body: JSON.stringify(body),
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || `Request failed with status ${response.status}`);
        }

        return data;
    } catch (error) {
        console.error(`API POST Error (${path}):`, error);
        throw error;
    }
};
