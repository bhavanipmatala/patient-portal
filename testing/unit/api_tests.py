import requests
import json

# --- Configuration ---
BASE_URL = "http://localhost:5000/api"
LOGIN_ENDPOINT = f"{BASE_URL}/auth/login"

LOGIN_CREDENTIALS = {
    "email": "john.smith@email.com",
    "password": "password123"
}

def test_login( ):
    print(f"--- Testing Login Endpoint: {LOGIN_ENDPOINT} ---")
    try:
        response = requests.post(LOGIN_ENDPOINT, json=LOGIN_CREDENTIALS)
        print(f"Status Code: {response.status_code}")
        
        data = response.json()
        # --- DEBUG: Print the full response to see the structure ---
        print(f"Full Response: {json.dumps(data, indent=2)}")
        
        if response.status_code == 200:
            # Check for common token field names
            token = None
            if 'token' in data:
                token = data['token']
            elif 'accessToken' in data:
                token = data['accessToken']
            elif 'user' in data and 'token' in data['user']:
                token = data['user']['token']
            
            if token:
                print("SUCCESS: Token received successfully.")
                return token
            else:
                print("FAILURE: Login successful, but could not find token in response.")
                return None
        else:
            print(f"FAILURE: Login failed. Response: {response.text}")
            return None
            
    except Exception as e:
        print(f"An error occurred: {e}")
        return None

if __name__ == "__main__":
    jwt_token = test_login()
    if jwt_token:
        print("\nReady for protected route tests!")
