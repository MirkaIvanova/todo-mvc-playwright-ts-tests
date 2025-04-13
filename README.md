# TodoMVC Playwright Tests

This project contains automated UI tests for the [React TodoMVC demo application](https://demo.playwright.dev/todomvc) built using Playwright and TypeScript.

## Setup Instructions

### Prerequisites

*   [Node.js](https://nodejs.org/) (LTS version recommended)
*   [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)

### Installation

1.  Clone the repository:

```bash
git clone git@github.com:MirkaIvanova/todo-mvc-playwright-ts-tests.git
```

2.  Install dependencies:

This will install Playwright and its type definitions.
```bash
cd todo-mvc-playwright-ts-tests
npm install
```


## Running the Tests

1.  **Run all tests:**
    Execute the following command in your terminal from the project's root directory:
    ```bash
    npm test
    ```
    Playwright will run the tests on Chromium only (headless by default) and output the results to the console.

    To run the tests on all configured browsers use:
    ```bash
    npm run test:allbrowsers
    ```

2.  **Run tests in headed mode (visible browser):**
    ```bash
    npm run test:headed
    ```
    This command will open 6 browser instances in parallel.

3.  **Run tests for a specific browser:**
    ```bash
    npx playwright test --project=firefox
    # Or chromium, webkit
    ```

4.  **View the HTML Report:**
    After the tests run, Playwright generates an HTML report. You can view it using:
    ```bash
    npx playwright show-report
    ```
    This command opens the report in your default web browser, providing detailed results, traces (if enabled), and screenshots/videos on failure.

## Assumptions and Notes

- Tests are designed to run independently of each other
- Each test starts with a clean state (fresh load of the app)
- The tests verify both UI state and application behavior

## Test Cases
The tests cover the following functionality:

### 1. Adding Tasks 
    [x] add a new task
    [x] add multiple tasks, verify order is preserved
    [x] add tasks with duplicate text, they can be manipulated indovidually
    [x] new task with no text or only whitespaces is rejected (spaces, tabs, newlines)
    [x] trim leading/training whitespaces   
    [x] consecutive whitespaces in text are collapsed to a single space
    [x] new task text contains special characters
    [x] cancel the creation of new task via Escape key
    [x] add a new task with right to left text
    [x] click away while adding a new task, the input field is not cleared
    [x] add a new task while filter is applied
    
### 2. Editing Tasks
    [x] edit an active task
    [x] edit a completed task, does not affect the state
    [x] task is deleted when edited to empty or whitespace only
    [x] trim leading/training whitespaces on edit
    [x] in edit mode replace multiple newlines to multiple spaces
    [x] edited task text contains special characters
    [x] cancel the editing of a task via Escape key
    [x] edit a task to have right to left text
    [x] accept the edited text by clicking away from the input field
    [x] edit a task while filter is applied
    
### 3. Deleting Tasks
    [x] delete an active task
    [x] delete a completed task
    [x] delete a task while filter is applied
    [x] clear completed when All/Active/Completed filter is applied

### 4. Completing Tasks
    [x] mark a task as completed
    [x] mark a task as uncompleted 
    [x] mark all items as completed, start from mixed state
    [x] mark all items as completed from All/Active/Completed views
    [x] 'mark all items as completed' checkbox updates state when tasks are completed / uncompleted

### 5. Filtering Functionality
    [x] switch between all/active/completed filters (Check if clicking the filters updates the URL)
    [x] filter tasks by directly navigating to url
    
### 6. UI and Visual Checks
    [x] default state of web elements upon landing on the main page
    [x] default state of footer when there are no tasks in this filter
    [x] 'Clear completed' is not visible when no tasks are completed
    [x] currently selected filter is highlighted
    [x] completed tasks styling - strikethrough and grey text
    [x] delete button visible only on hover
    [x] when editing other controls are hidden

### 7. Keyboard/Accessibility
    [x] complete one task using the keyboard
    [x] mark all tasks as complete using the keyboard
    [x] focus next/previous task using TAB/SHIFT+TAB
    [x] input field is on focus after adding a new task

###  8. Data Persistence
    [x] tasks text, order and completed state persists after page refresh
    [x] applied filter persists after page refresh
    [x] clear localStorage and verify the app resets to empty state
    [x] browser back/forward functionality
  
### 9. Performance
    [x] the app can support 100+ tasks (toggle all, check counter)
    [x] the app can support tasks with very long text - (add/edit, wrap)