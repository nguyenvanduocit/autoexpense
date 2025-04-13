Feature: Add Transaction
  In order to track my vehicle expenses
  As a logged in user
  I want to add new transactions to my account

  Background:
    Given I am logged into the application
    And I navigate to the add transaction page

  Scenario: Successfully add a new transaction
    When I enter a valid amount
    And I select a vehicle
    And I select a date
    And I select a category
    And I optionally add a description
    And I click "Save transaction"
    Then the transaction should be saved to my account
    And I should be redirected to the home page

  Scenario: Attempt to submit without required fields
    When I do not enter an amount
    And I click "Save transaction"
    Then I should see an error message "Please enter the amount"

    When I enter a valid amount
    And I do not select a vehicle
    And I click "Save transaction"
    Then I should see an error message "Please select a vehicle"

    When I enter a valid amount
    And I select a vehicle
    And I do not select a date
    And I click "Save transaction"
    Then I should see an error message "Please select a date"

  Scenario: No vehicles available
    Given I have no vehicles added to my account
    Then I should see a prompt to add a vehicle
    And I should see a link to "Add new vehicle"
    When I click on "Add new vehicle"
    Then I should be redirected to the vehicle addition page

  Scenario: Submit transaction while not logged in
    Given I am not logged in
    When I attempt to access the add transaction page
    Then I should be redirected to the login page

  Scenario: System error while saving transaction
    When I fill in all required transaction details
    And there is a system error when saving
    And I click "Save transaction"
    Then I should see an error message about saving failure

  Scenario: Navigate back without saving
    When I click the back button
    Then I should return to the previous page without saving the transaction
