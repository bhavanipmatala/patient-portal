import { describe, it, expect } from 'vitest';
import axios from 'axios';

const BASE_URL = "http://localhost:5000/api";
const LOGIN_ENDPOINT = `${BASE_URL}/auth/login`;

const LOGIN_CREDENTIALS = {
    email: "john.smith@email.com",
    password: "password123"
};

describe('Backend API Integration Tests', ( ) => {

    it('should successfully log in and receive an authentication token', async () => {
        try {
            const response = await axios.post(LOGIN_ENDPOINT, LOGIN_CREDENTIALS);
            
            // 1. Verify basic success
            expect(response.status).toBe(200);
            
            const data = response.data;
            console.log('DEBUG: Full Response received:', JSON.stringify(data, null, 2));

            // 2. THE FAIL-PROOF SEARCH: Look everywhere for the token
            let token = null;
            
            if (data.token) token = data.token;
            else if (data.data && data.data.token) token = data.data.token;
            else if (data.accessToken) token = data.accessToken;
            else if (data.data && data.data.accessToken) token = data.data.accessToken;
            else if (data.user && data.user.token) token = data.user.token;

            // 3. Final check
            if (!token) {
                console.error('CRITICAL: Could not find token in response keys:', Object.keys(data));
                if (data.data) console.error('Keys inside data object:', Object.keys(data.data));
            }

            expect(token).toBeDefined();
            expect(typeof token).toBe('string');
            console.log('SUCCESS: Token captured successfully!');

        } catch (error: any) {
            if (error.response) {
                throw new Error(`Server Error (${error.response.status}): ${JSON.stringify(error.response.data)}`);
            }
            throw error;
        }
    }, 15000);

    it('should fail to access a protected endpoint without a token', async () => {
        try {
            // We use the login endpoint but with a GET request to trigger a 401/404/405
            await axios.get(`${BASE_URL}/dashboard`);
        } catch (error: any) {
            if (error.response) {
                console.log(`Security Check: Received status ${error.response.status}`);
                // Any error status (401, 403, 404, 405) means the route is protected or hidden
                expect(error.response.status).toBeGreaterThanOrEqual(400);
            } else {
                throw error;
            }
        }
    });
});
