const API_URL = 'http://localhost:5000'; // Adjust the API URL as needed

export const login = async (email, password) => {
    try {
        const response = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password }),
        });

        if (!response.ok) {
            throw new Error('Login failed');
        }

        const data = await response.json();
        localStorage.setItem('token', data.token); // Store the token for authentication
        return true;
    } catch (error) {
        console.error(error);
        return false;
    }
};

export const logout = () => {
    localStorage.removeItem('token'); // Remove the token on logout
};

export const isAuthenticated = () => {
    return localStorage.getItem('token') !== null; // Check if the user is authenticated
};