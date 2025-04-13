Feature: AI-Assisted Bulk Transaction Entry
  In order to efficiently add multiple transactions at once
  As a user
  I want to enter transactions in natural language and have AI parse them

  Background:
    Given the user is logged in
    And the user navigates to the "Bulk Add Transactions" page

  Scenario: Successfully parsing transaction text
    Given the user is on the bulk transaction entry page
    When the user enters the following text in the input box:
      """
      Lunch at Subway $12.50 yesterday
      Coffee from Starbucks $4.25 this morning
      Grocery shopping at Whole Foods $78.35 on Monday
      """
    And the user clicks the "Parse" button
    Then the system should call the "ParseTransactions" function with the entered text
    And the page should display a table with the following parsed transactions:
      | Description                     | Amount | Date      | Category  |
      | Lunch at Subway                 | $12.50 | Yesterday | Food      |
      | Coffee from Starbucks           | $4.25  | Today     | Drinks    |
      | Grocery shopping at Whole Foods | $78.35 | Monday    | Groceries |

  Scenario: Adding parsed transactions to the database
    Given the user has successfully parsed transaction text
    And the parsed transactions are displayed in the table
    When the user clicks the "Add Transactions" button
    Then the transactions should be saved to the database
    And the user should see a success message "Transactions successfully added"
    And the user should be redirected to the home page

  Scenario: Editing and re-parsing transaction text
    Given the user has successfully parsed transaction text
    When the user edits the text in the input box to:
      """
      Dinner at Pizza Hut $25.00 today
      Movie tickets $30.00 yesterday
      """
    And the user clicks the "Parse" button
    Then the previous parsed transactions should be cleared from the table
    And the table should be updated with the newly parsed transactions:
      | Description         | Amount | Date      | Category      |
      | Dinner at Pizza Hut | $25.00 | Today     | Food          |
      | Movie tickets       | $30.00 | Yesterday | Entertainment |

  Scenario: Handling invalid or unparseable text
    Given the user is on the bulk transaction entry page
    When the user enters text that cannot be parsed as transactions:
      """
      This is not a valid transaction format
      """
    And the user clicks the "Parse" button
    Then the system should display an error message "Could not identify any transactions"
    And the transactions table should remain empty

  Scenario: Parsing empty text
    Given the user is on the bulk transaction entry page
    When the user doesn't enter any text in the input box
    And the user clicks the "Parse" button
    Then the system should display a message "Please enter transaction text"
    And the transactions table should remain empty

  Scenario: Submit transaction while not logged in
    Given the user is not logged in
    When the user attempts to access the bulk transaction entry page
    Then the user should be redirected to the login page

  Scenario: System error while saving transactions
    Given the user has successfully parsed transaction text
    And the parsed transactions are displayed in the table
    When there is a system error when saving
    And the user clicks the "Add Transactions" button
    Then the user should see an error message about saving failure

  Scenario: Navigate back without saving
    Given the user has successfully parsed transaction text
    When the user clicks the back button
    Then the user should return to the previous page without saving the transactions

  Scenario: No vehicles available for transaction assignment
    Given the user has successfully parsed transaction text
    And the user has no vehicles added to their account
    Then the user should see a prompt to add a vehicle
    And the user should see a link to "Add new vehicle"
    When the user clicks on "Add new vehicle"
    Then the user should be redirected to the vehicle addition page
