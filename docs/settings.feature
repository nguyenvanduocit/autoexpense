Feature: User Settings Management
  In order to manage my account and application data
  As a logged-in user
  I want to view my account information and maintain my data

  Background:
    Given I am logged in to the application
    And I navigate to the settings page

  Scenario: View account information
    Then I should see my account information including:
      | Field            | Value                 |
      | Email            | My email address      |
      | Username         | My display name       |
      | User ID          | My user ID            |
      | Account creation | Account creation date |
      | Last login       | Last login date       |
      | Email status     | Verification status   |

  Scenario: Log out from the application
    When I click the "Logout" button
    Then I should be logged out of the application
    And I should be redirected to the login page

  Scenario: Clean up orphaned transaction data
    Given I have transactions associated with deleted vehicles
    When I click the "Delete invalid transactions" button
    Then the system should remove all transactions without valid vehicle references
    And I should see a success message "Orphaned transactions successfully deleted"

  Scenario: Attempt to clean data with no orphaned transactions
    Given I have no transactions associated with deleted vehicles
    When I click the "Delete invalid transactions" button
    Then no transactions should be deleted
    And I should see a success message "Orphaned transactions successfully deleted"

  Scenario: Handle errors during data cleanup
    Given there is a system error during transaction processing
    When I click the "Delete invalid transactions" button
    Then I should see an error message "An error occurred while deleting transactions"

  Scenario: Setup OpenAI API key
    When I enter my OpenAI API key in the API key field
    And I click the "Save API Key" button
    Then my API key should be securely stored
    And I should see a success message "API key saved successfully"

  Scenario: Update existing OpenAI API key
    Given I already have an OpenAI API key saved
    When I enter a new OpenAI API key in the API key field
    And I click the "Save API Key" button
    Then my API key should be updated
    And I should see a success message "API key updated successfully"

  Scenario: Remove OpenAI API key
    Given I already have an OpenAI API key saved
    When I click the "Remove API Key" button
    Then my API key should be removed from storage
    And I should see a success message "API key removed successfully"
