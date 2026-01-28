import time
from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.common.by import By
from selenium.webdriver.support.wait import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

# Configuration for your local machine
CHROME_DRIVER_PATH = r"C:\WebDriver\chromedriver.exe"
BASE_URL = "http://localhost:3000"

# Initialize Driver
service = Service(executable_path=CHROME_DRIVER_PATH )
driver = webdriver.Chrome(service=service)
driver.maximize_window()
driver.implicitly_wait(10) # global variable # wait max time out if displays before identify and proceed

# Navigate to Login Page
print("Navigating to: " + BASE_URL + "/login")
driver.get(BASE_URL + "/login")
print(driver.current_url)

# Plug in User name, password, Login
print("Entering credentials...")
wait = WebDriverWait(driver, 10)

# Wait for and enter Email
email_input = wait.until(EC.presence_of_element_located((By.NAME, "email")))
email_input.send_keys("john.smith@email.com")
time.sleep(1)

# Enter Password
password_input = driver.find_element(By.NAME, "password")
password_input.send_keys("password123")
time.sleep(1)

# Click Sign In
driver.find_element(By.TAG_NAME, "button").click()
print("Login button clicked")

# Verify and Navigate to Messaging
print("Waiting for Dashboard...")
wait.until(EC.presence_of_element_located((By.XPATH, "//a[contains(text(), 'Messaging')]")))
VerifyLink = driver.find_element(By.XPATH, "//a[contains(text(), 'Messaging')]").text
print("Found Link: " + VerifyLink)

assert "Messaging" in VerifyLink
driver.find_element(By.XPATH, "//a[contains(text(), 'Messaging')]").click()
print("Navigated to Messaging page")

# Verify if landed on the message page
wait.until(EC.presence_of_element_located((By.XPATH, "//h2[contains(text(), 'Messages')]")))
LandPage = driver.find_element(By.XPATH, "//h2[contains(text(), 'Messages')]").text
print("Landed on: " + LandPage)

assert "Messages" in LandPage
time.sleep(2)

# Select a conversation and send a message
print("Selecting conversation...")
conversations = driver.find_elements(By.XPATH, "//div[contains(@style, 'cursor: pointer')]")
if conversations:
    conversations[0].click()
    time.sleep(2)
    
    print("Sending test message...")
    msg_input = driver.find_element(By.XPATH, "//input[@placeholder='Type a message...']")
    msg_input.send_keys("Hello! This is an automated test message.")
    time.sleep(1)
    msg_input.submit() 
    print("Message sent")

time.sleep(5)
driver.quit()
print("Test Completed")
