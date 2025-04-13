import { test, expect } from "@playwright/test"
import { MainPage } from "../pages/mainPage"

test.describe("Filtering tasks", () => {
    const text1 = "reply to emails like a responsible adult"
    const text2 = "call mom before she calls again"
    const text3 = "start sorting the laundry and hope for the best"

    test.beforeEach(async ({ page }) => {
        await page.goto("https://demo.playwright.dev/todomvc")

        const mainPage = new MainPage(page)
        await mainPage.addNewTask(text1)
        await mainPage.addNewTask(text2)
        await mainPage.addNewTask(text3)
    })

    test("filter tasks by All/Active/Completed", async ({ page }) => {
        const mainPage = new MainPage(page)

        // Start with 3 active tasks, 0 completed tasks
        // Go through all filters and check the number of tasks
        await expect(mainPage.activeTasks().all()).resolves.toHaveLength(3)
        await expect(mainPage.completedTasks().all()).resolves.toHaveLength(0)

        await mainPage.filterActive()
        await expect(mainPage.allTasks().all()).resolves.toHaveLength(3)

        await mainPage.filterCompleted()
        await expect(mainPage.allTasks().all()).resolves.toHaveLength(0)

        // Complete the first task and check the three filters
        await mainPage.filterAll()
        await mainPage.check(mainPage.allTasks().nth(0))
        await expect(mainPage.activeTasks().all()).resolves.toHaveLength(2)
        await expect(mainPage.completedTasks().all()).resolves.toHaveLength(1)

        await mainPage.filterActive()
        await expect(mainPage.allTasks().all()).resolves.toHaveLength(2)

        await mainPage.filterCompleted()
        await expect(mainPage.allTasks().all()).resolves.toHaveLength(1)
        await expect(mainPage.allTasks().nth(0)).toContainText(text1)

        // Delete the second first task and check the three filters
        await mainPage.filterAll()
        await mainPage.deleteTask(mainPage.allTasks().nth(1))
        await expect(mainPage.activeTasks().all()).resolves.toHaveLength(1)
        await expect(mainPage.completedTasks().all()).resolves.toHaveLength(1)
        await expect(mainPage.allTasks().nth(0)).toContainText(text1)
        await expect(mainPage.allTasks().nth(1)).toContainText(text3)

        await mainPage.filterActive()
        await expect(mainPage.allTasks().all()).resolves.toHaveLength(1)
        await expect(mainPage.allTasks().nth(0)).toContainText(text3)

        await mainPage.filterCompleted()
        await expect(mainPage.allTasks().all()).resolves.toHaveLength(1)
        await expect(mainPage.allTasks().nth(0)).toContainText(text1)
    })

    test("filter tasks by directly navgating to url", async ({ page }) => {
        const mainPage = new MainPage(page)
        const allTasks = mainPage.allTasks()

        // Setup: Have one task
        await mainPage.check(mainPage.allTasks().nth(1))

        // Filter Active directly by navigating to URL
        page.goto("https://demo.playwright.dev/todomvc/#/active")
        await expect(allTasks.all()).resolves.toHaveLength(2)
        await expect(allTasks.nth(0)).toContainText(text1)
        await expect(allTasks.nth(1)).toContainText(text3)

        // Filter Completed directly by navigating to URL
        page.goto("https://demo.playwright.dev/todomvc/#/completed")
        await expect(allTasks.all()).resolves.toHaveLength(1)
        await expect(allTasks.nth(0)).toContainText(text2)
    })
})
