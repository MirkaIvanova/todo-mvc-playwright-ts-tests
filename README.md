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
    Playwright will run the tests on Chrome only (headless by default) and output the results to the console.

    To run the tests on all configured browsers use 
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
    # Or firefox, webkit
    ```

4.  **View the HTML Report:**
    After the tests run, Playwright generates an HTML report. You can view it using:
    ```bash
    npx playwright show-report
    ```
    This command opens the report in your default web browser, providing detailed results, traces (if enabled), and screenshots/videos on failure.

## Assumptions and Notes

Tests are designed to run independently of each other
Each test starts with a clean state (fresh load of the app)
The tests verify both UI state and application behavior


