import { test, expect } from "@playwright/test"
import { MainPage } from "../pages/mainPage"

test.describe("Deleting tasks", () => {
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

    test("delete an active task", async ({ page }) => {
        const mainPage = new MainPage(page)

        // we start with 3 tasks
        await expect(mainPage.allTasks().all()).resolves.toHaveLength(3)

        // delete one of the tasks
        const task = mainPage.allTasks().first()
        await mainPage.deleteTask(task)

        // two are left
        await expect(mainPage.getTask(text1)).not.toBeVisible()
        await expect(mainPage.allTasks().all()).resolves.toHaveLength(2)
        await expect(mainPage.taskCounter).toContainText("2 items left")
    })

    test("delete a completed task", async ({ page }) => {
        const mainPage = new MainPage(page)

        // complete one task
        await mainPage.check(mainPage.allTasks().nth(1))

        // we start with 2 active and 1 completed task
        await expect(mainPage.activeTasks().all()).resolves.toHaveLength(2)
        await expect(mainPage.completedTasks().all()).resolves.toHaveLength(1)

        // delete the completed task
        const task = mainPage.allTasks().nth(1)
        await mainPage.deleteTask(task)

        // two are left
        await expect(mainPage.getTask(text2)).not.toBeVisible()
        await expect(mainPage.allTasks().all()).resolves.toHaveLength(2)
        await expect(mainPage.taskCounter).toContainText("2 items left")
    })

    test("delete a task while filter is applied", async ({ page }) => {
        const mainPage = new MainPage(page)

        // complete one task and filter only Completed tasks
        await mainPage.check(mainPage.allTasks().nth(2))
        await mainPage.filterCompleted()
        await expect(mainPage.allTasks().all()).resolves.toHaveLength(1)

        // delete the completed task
        const task = mainPage.allTasks().first()
        await mainPage.deleteTask(task)

        // two are left
        await expect(mainPage.getTask(text3)).not.toBeVisible()
        await expect(mainPage.allTasks().all()).resolves.toHaveLength(0)
        await expect(mainPage.taskCounter).toContainText("2 items left")
    })

    for (const filter of [
        { name: "All", filterMethod: (page) => {}, expectedTasks: 1 },
        { name: "Active", filterMethod: (page) => page.filterActive(), expectedTasks: 1 },
        { name: "Completed", filterMethod: (page) => page.filterCompleted(), expectedTasks: 0 },
    ]) {
        test(`clear completed when ${filter.name} filter is applied`, async ({ page }) => {
            const mainPage = new MainPage(page)
            const allTasks = mainPage.allTasks()

            // Setup: complete two tasks
            await mainPage.check(allTasks.nth(0))
            await mainPage.check(allTasks.nth(1))
            await expect(mainPage.activeTasks().all()).resolves.toHaveLength(1)
            await expect(mainPage.completedTasks().all()).resolves.toHaveLength(2)

            // Apply the specific filter
            await filter.filterMethod(mainPage)

            // Clear completed tasks
            await mainPage.clearCompletedTasks()

            // Verify the completed task is deleted
            await expect(mainPage.getTask(text2)).toBeHidden()
            await expect(mainPage.completedTasks().all()).resolves.toHaveLength(0)

            // Additional verification for All filter
            await expect(allTasks.all()).resolves.toHaveLength(filter.expectedTasks)

            // Go to All filter and verify the completed tasks are deleted
            await mainPage.filterAll()
            await expect(allTasks.all()).resolves.toHaveLength(1)
            await expect(allTasks.nth(0)).toContainText(text3)
        })
    }
})
