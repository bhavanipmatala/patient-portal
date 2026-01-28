Feature: Patient Portal Messaging Functionality

  @Login
  Scenario: Successful login to the patient portal
    Given the patient is on the login page
    When the patient enters valid email "john.smith@email.com" and password "password123"
    And clicks the login button
    Then the patient should be redirected to the dashboard
    And see their name "John Smith" displayed

  @Messaging
  Scenario: Viewing messages from a healthcare provider
    Given the patient is logged into the portal
    When the patient navigates to the "Messages" page
    Then the patient should see a list of conversations
    And be able to select a conversation to view messages

  @Messaging
  Scenario: Sending a message to a healthcare provider
    Given the patient has an active conversation selected
    When the patient types "Hello Doctor" in the message box
    And clicks the send button
    Then the message "Hello Doctor" should appear in the conversation history
