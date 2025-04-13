import { test, expect } from "@playwright/test"
import { MainPage } from "../pages/mainPage"

test.describe("Completing tasks", () => {
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

    test("mark a task as completed", async ({ page }) => {
        const mainPage = new MainPage(page)
        const allTasks = mainPage.allTasks()

        // Initially all tasks are active
        await expect(mainPage.allTasks().all()).resolves.toHaveLength(3)
        await expect(mainPage.activeTasks().all()).resolves.toHaveLength(3)
        await expect(mainPage.completedTasks().all()).resolves.toHaveLength(0)

        // Mark the first task as completed
        await mainPage.check(allTasks.first())

        await expect(mainPage.isCompleted(mainPage.allTasks().nth(0))).toBeTruthy()
        await expect(mainPage.activeTasks().all()).resolves.toHaveLength(2)
        await expect(mainPage.completedTasks().all()).resolves.toHaveLength(1)
        await expect(mainPage.isChecked(mainPage.allTasks().nth(0))).toBeTruthy()
        await expect(mainPage.isCompleted(mainPage.allTasks().nth(0))).toBeTruthy()
        await expect(mainPage.taskCounter).toContainText("2 items left")
    })

    test("mark a task as uncompleted", async ({ page }) => {
        const mainPage = new MainPage(page)

        // Mark the first task as completed
        await mainPage.check(mainPage.allTasks().nth(0))
        await expect(mainPage.isCompleted(mainPage.allTasks().nth(0))).resolves.toBeTruthy()
        await expect(mainPage.taskCounter).toContainText("2 items left")

        // Mark the first task as completed
        await mainPage.uncheck(await mainPage.allTasks().nth(0))

        await expect(mainPage.isChecked(mainPage.allTasks().nth(0))).resolves.toBeFalsy()
        await expect(mainPage.taskCounter).toContainText("3 items left")
    })

    test("mark all items as completed, start from mixed state", async ({ page }) => {
        const mainPage = new MainPage(page)

        await mainPage.check(mainPage.allTasks().nth(1))

        await expect(mainPage.activeTasks().all()).resolves.toHaveLength(2)
        await expect(mainPage.completedTasks().all()).resolves.toHaveLength(1)
        await expect(mainPage.taskCounter).toContainText("2 items left")

        await mainPage.toggleAllTasks()

        await expect(mainPage.activeTasks().all()).resolves.toHaveLength(0)
        await expect(mainPage.completedTasks().all()).resolves.toHaveLength(3)
        await expect(mainPage.isCompleted(mainPage.allTasks().nth(0))).resolves.toBeTruthy()
        await expect(mainPage.isCompleted(mainPage.allTasks().nth(1))).resolves.toBeTruthy()
        await expect(mainPage.isCompleted(mainPage.allTasks().nth(2))).resolves.toBeTruthy()
        await expect(mainPage.taskCounter).toContainText("0 items left")
    })

    test("mark all items as completed from All/Active/Completed views", async ({ page }) => {
        const mainPage = new MainPage(page)

        // Mark all tasks as completed from "All" view
        await mainPage.toggleAllTasks()
        await expect(mainPage.activeTasks().all()).resolves.toHaveLength(0)
        await expect(mainPage.completedTasks().all()).resolves.toHaveLength(3)
        await expect(mainPage.taskCounter).toContainText("0 items left")

        // Mark all tasks as uncompleted from "Active" view
        await mainPage.filterActive()
        await mainPage.toggleAllTasks()
        await expect(mainPage.activeTasks().all()).resolves.toHaveLength(3)
        await expect(mainPage.completedTasks().all()).resolves.toHaveLength(0)
        await expect(mainPage.taskCounter).toContainText("3 items left")

        // Mark all tasks as completed from "Completed" view
        await mainPage.filterCompleted()
        await mainPage.toggleAllTasks()
        await expect(mainPage.activeTasks().all()).resolves.toHaveLength(0)
        await expect(mainPage.completedTasks().all()).resolves.toHaveLength(3)
        await expect(mainPage.taskCounter).toContainText("0 items left")
    })

    test("'mark all items as completed' checkbox updates state when tasks are completed / uncompleted", async ({
        page,
    }) => {
        const mainPage = new MainPage(page)

        // The checkbox should be checked (darker color) when all tasks are completed
        await mainPage.toggleAllTasks()
        await expect(mainPage.toggleAllCheckbox).toBeChecked()

        // The checkbox should be unchecked (light color) when not all tasks are completed
        await mainPage.uncheck(mainPage.allTasks().nth(0))
        await expect(mainPage.toggleAllCheckbox).not.toBeChecked()

        // Assert the toggle all is checked again when we complete the last task
        await mainPage.check(mainPage.allTasks().nth(0))
        await expect(mainPage.toggleAllCheckbox).toBeChecked()
    })
})
