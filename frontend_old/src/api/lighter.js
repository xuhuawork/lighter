// API 调用封装
const API_BASE_URL = process.env.REACT_APP_API_URL;

export const lighterAPI = {
    submit: async (data) => {
        const response = await fetch(`${API_BASE_URL}/lighters`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        return response.json();
    },

    getHistory: async (number) => {
        const response = await fetch(`${API_BASE_URL}/lighters/${number}/history`);
        return response.json();
    }
}; 