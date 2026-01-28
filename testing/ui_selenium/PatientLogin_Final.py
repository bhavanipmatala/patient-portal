# Patient portal login for Web
# Prasanna Matala - 01/26/2026 - Final robust script with Popup Fix

###################################################
import time
from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

# --- Configuration ---
CHROME_DRIVER_PATH = r"C:\WebDriver\chromedriver.exe"
BASE_URL = "http://localhost:3000/login"
LOGIN_EMAIL = "john.smith@email.com"
LOGIN_PASSWORD = "password123"

# 1. Setup Chrome Options to disable the "Change your password" popup
print("1. Setting up Chrome Options...")
chrome_options = Options()
chrome_options.add_experimental_option("prefs", {
    "credentials_enable_service": False,      # Disables password saving
    "profile.password_manager_enabled": False # Disables password manager
})
# Optional: This hides the "Chrome is being controlled by automated software" bar
chrome_options.add_experimental_option("excludeSwitches", ["enable-automation"])
chrome_options.add_experimental_option("useAutomationExtension", False)

# 2. Setup the WebDriver with options
print("2. Setting up ChromeDriver service...")
service = Service(executable_path=CHROME_DRIVER_PATH)
driver = webdriver.Chrome(service=service, options=chrome_options)
wait = WebDriverWait(driver, 20) 

try:
    # 3. Navigate to Login Page
    print(f"3. Navigating to: {BASE_URL}")
    driver.get(BASE_URL)

    # 4. Enter Credentials
    print("4. Waiting for login form...")
    wait.until(EC.visibility_of_element_located((By.ID, "email")))
    
    print("   Entering credentials...")
    driver.find_element(By.ID, "email").send_keys(LOGIN_EMAIL)
    driver.find_element(By.ID, "password").send_keys(LOGIN_PASSWORD)

    # 5. Click Login
    print("5. Clicking 'Sign In' button...")
    driver.find_element(By.XPATH, '//button[@type="submit"]').click()

    # 6. Wait for Dashboard to load
    print("6. Waiting for Dashboard to load...")
    wait.until(EC.url_contains("dashboard"))
    print(f"   Successfully logged in. Current URL: {driver.current_url}")
    
    # Pause to allow React to finish rendering and bypass any browser popups
    time.sleep(8)

    # 7. Find and Click Messaging using CSS Selector
    print("7. Looking for 'Messaging' link using CSS Selector [href='/messages']...")
    messaging_link = wait.until(EC.element_to_be_clickable((By.CSS_SELECTOR, "a[href='/messages']")))
    print("   Found link. Clicking now.")
    messaging_link.click()

    # 8. Verify Messaging Page
    print("8. Verifying Messaging page load...")
    wait.until(EC.presence_of_element_located((By.XPATH, "//h2[contains(., 'Messages')]")))
    print("   SUCCESS: Messaging page loaded and verified.")

    # Visual confirmation
    print("9. Test complete. Closing in 8 seconds...")
    time.sleep(8)

except Exception as e:
    print(f"\n--- ERROR ENCOUNTERED ---")
    print(f"Type: {type(e).__name__}")
    print(f"Message: {str(e)}")

finally:
    # 9. Cleanup
    driver.quit()
    print("Process finished.")