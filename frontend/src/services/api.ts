const API_BASE_URL = process.env.REACT_APP_API_URL;

interface UsageCountResponse {
  count: number;
}

export const lighterService = {
    submit: async (data: any) => {
        const response = await fetch(`${API_BASE_URL}/lighters`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        return response.json();
    },

    getHistory: async (number: number) => {
        const response = await fetch(`${API_BASE_URL}/lighters/${number}/history`);
        return response.json();
    },

    getUsageCount: async (number: number): Promise<UsageCountResponse> => {
        const response = await fetch(`${API_BASE_URL}/lighters/${number}/usage`);
        return response.json();
    }
}; 