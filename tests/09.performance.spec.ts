import { test, expect } from "@playwright/test"
import { MainPage } from "../pages/mainPage"

test.describe("Performace", () => {
    test.beforeEach(async ({ page }) => {
        await page.goto("https://demo.playwright.dev/todomvc")
    })

    test("the app can support 200+ tasks", async ({ page }) => {
        const mainPage = new MainPage(page)

        // Add 200 tasks
        for (let i = 0; i < 200; i++) {
            await mainPage.addNewTask(`Task ${i + 1}`)
        }
        await expect(mainPage.allTasks().all()).resolves.toHaveLength(200)
        await expect(mainPage.completedTasks().all()).resolves.toHaveLength(0)
        await expect(mainPage.taskCounter).toHaveText("200 items left")

        // Mark all tasks as completed
        await mainPage.toggleAllTasks()
        await expect(mainPage.completedTasks().all()).resolves.toHaveLength(200)

        // Delete all completed tasks
        await mainPage.clearCompletedTasks()
        await expect(mainPage.allTasks().all()).resolves.toHaveLength(0)
    })

    test("the app can support tasks with very long text", async ({ page }) => {
        const mainPage = new MainPage(page)

        // Generate a long text with random characters
        const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789 .,!?-_"
        let longText = ""
        for (let i = 0; i < 100000; i++) {
            longText += characters.charAt(Math.floor(Math.random() * characters.length))
        }

        await mainPage.addNewTask(longText)

        await expect(mainPage.allTasks().all()).resolves.toHaveLength(1)
        await expect(mainPage.allTasks().first()).toContainText(longText)

        const longText2 = longText.split("").reverse().join("")

        await mainPage.editTask(mainPage.allTasks().first(), longText2)
        await expect(mainPage.allTasks().first()).toContainText(longText2)
    })
})
