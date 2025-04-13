Feature: Transaction Management
  In order to track my financial activities
  As a user
  I want to record both income and expense transactions

  Background:
    Given I am logged into the application
    And I navigate to the transactions page

  Scenario: Add a new income transaction
    When I create a new transaction with the following details:
      | TransactionType | Description    | Amount |
      | Income          | Salary payment | 2000   |
    Then the transaction should be saved successfully
    And the transaction should appear in my transaction list
    And my account balance should increase by 2000

  Scenario: Add a new expense transaction
    When I create a new transaction with the following details:
      | TransactionType | Description | Amount |
      | Expense         | Groceries   | 150    |
    Then the transaction should be saved successfully
    And the transaction should appear in my transaction list
    And my account balance should decrease by 150

  Scenario: Filter transactions by type
    Given I have the following transactions:
      | TransactionType | Description    | Amount | Date       |
      | Income          | Salary         | 2000   | 2023-05-01 |
      | Expense         | Rent           | 800    | 2023-05-02 |
      | Expense         | Groceries      | 100    | 2023-05-03 |
      | Income          | Freelance work | 500    | 2023-05-04 |
    When I filter transactions by type "Income"
    Then I should see only income transactions
    And the total should be 2500
    When I filter transactions by type "Expense"
    Then I should see only expense transactions
    And the total should be 900

  Scenario: Validate transaction type and amount
    When I try to create a transaction without specifying a transaction type
    Then I should see an error message indicating "Transaction type is required"
    When I try to create a transaction with an invalid transaction type
    Then I should see an error message indicating "Transaction type must be either Income or Expense"
    When I try to create a transaction with a negative amount
    Then I should see an error message indicating "Transaction amount must be positive"
