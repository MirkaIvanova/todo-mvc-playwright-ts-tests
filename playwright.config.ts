import { defineConfig, devices } from "@playwright/test"

export default defineConfig({
    testDir: "./tests",
    timeout: 30000,
    fullyParallel: true,
    // workers: 1,
    reporter: [["list"], ["html", { open: "never" }]],
    use: {
        baseURL: "https://demo.playwright.dev",
        headless: true,
        trace: "on-first-retry",
        screenshot: "only-on-failure",
    },
    projects: [
        {
            name: "chromium",
            use: { ...devices["Desktop Chrome"] },
        },

        {
            name: "firefox",
            use: { ...devices["Desktop Firefox"] },
        },

        {
            name: "webkit",
            use: { ...devices["Desktop Safari"] },
        },
    ],
})
