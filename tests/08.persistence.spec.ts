import { test, expect } from "@playwright/test"
import { MainPage } from "../pages/mainPage"

test.describe("Persistence", () => {
    const text1 = "reply to emails like a responsible adult"
    const text2 = "call mom before she calls again"
    const text3 = "start sorting the laundry and hope for the best"

    test.beforeEach(async ({ page }) => {
        await page.goto("https://demo.playwright.dev/todomvc")
    })

    test("tasks text, order and completed state persists after page refresh", async ({ page }) => {
        const mainPage = new MainPage(page)
        await mainPage.addNewTask(text1)
        await mainPage.addNewTask(text2)
        await mainPage.addNewTask(text3)
        await mainPage.check(mainPage.allTasks().nth(1))

        const allTasks = mainPage.allTasks()
        await expect(allTasks.nth(0)).toContainText(text1)
        await expect(allTasks.nth(1)).toContainText(text2)
        await expect(allTasks.nth(2)).toContainText(text3)
        await expect(mainPage.activeTasks().all()).resolves.toHaveLength(2)
        await expect(mainPage.completedTasks().all()).resolves.toHaveLength(1)

        await page.reload()

        const reloadedPage = new MainPage(page)
        const reloadedAllTasks = reloadedPage.allTasks()

        // Verify the order and completed state is preserved
        await expect(reloadedAllTasks.nth(0)).toContainText(text1)
        await expect(reloadedAllTasks.nth(1)).toContainText(text2)
        await expect(reloadedAllTasks.nth(2)).toContainText(text3)
        await expect(reloadedPage.activeTasks().all()).resolves.toHaveLength(2)
        await expect(reloadedPage.completedTasks().all()).resolves.toHaveLength(1)
    })

    test("applied filter persists after page refresh", async ({ page }) => {
        const mainPage = new MainPage(page)
        await mainPage.addNewTask(text1)
        await mainPage.addNewTask(text2)
        await mainPage.check(mainPage.allTasks().nth(1))
        await mainPage.filterCompleted()
        await expect(mainPage.allTasks().all()).resolves.toHaveLength(1)

        await page.reload()

        const reloadedPage = new MainPage(page)

        // Verify the filter is preserved
        await expect(reloadedPage.allTasks().all()).resolves.toHaveLength(1)
        await expect(reloadedPage.filters.all).not.toHaveClass("selected")
        await expect(reloadedPage.filters.active).not.toHaveClass("selected")
        await expect(reloadedPage.filters.completed).toHaveClass("selected")
    })

    test("clear localStorage and verify the app resets to empty state", async ({ page }) => {
        const mainPage = new MainPage(page)
        await mainPage.addNewTask(text1)
        await mainPage.addNewTask(text2)
        await mainPage.check(mainPage.allTasks().nth(1))
        await expect(mainPage.allTasks().all()).resolves.toHaveLength(2)

        // Clear localStorage
        await page.evaluate(() => localStorage.clear())
        await page.reload()

        // Verify the app resets to empty state
        const reloadedPage = new MainPage(page)
        await expect(reloadedPage.allTasks().all()).resolves.toHaveLength(0)
    })

    test("should respect the back button", async ({ page }) => {
        const mainPage = new MainPage(page)
        const allTasks = mainPage.allTasks()

        // Arrange: have 3 tasks, 1 of them completed
        await mainPage.addNewTask(text1)
        await mainPage.addNewTask(text2)
        await mainPage.addNewTask(text3)
        await mainPage.check(mainPage.allTasks().nth(1))

        // Tasks in the All filter are 3
        await expect(allTasks.all()).resolves.toHaveLength(3)

        // Tasks in the Active filter are 2
        await mainPage.filterActive()
        await expect(allTasks.all()).resolves.toHaveLength(2)

        // Tasks in the Completed filter are 1
        await mainPage.filterCompleted()
        await expect(allTasks.all()).resolves.toHaveLength(1)

        // press Back button repeatedly and check the expected number of tasks
        await page.goBack()
        await expect(allTasks.all()).resolves.toHaveLength(2)

        await page.goBack()
        await expect(allTasks.all()).resolves.toHaveLength(3)
    })
})
