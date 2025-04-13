import { test, expect } from "@playwright/test"
import { MainPage } from "../pages/mainPage"

test.describe("Keyboard/Accessibility", () => {
    const text1 = "reply to emails like a responsible adult"
    const text2 = "call mom before she calls again"
    const text3 = "start sorting the laundry and hope for the best"

    test.beforeEach(async ({ page }) => {
        await page.goto("https://demo.playwright.dev/todomvc")
    })

    test("complete one task using the keyboard", async ({ page }) => {
        const mainPage = new MainPage(page)

        // Arrange: have 2 active tasks
        await mainPage.addNewTask(text1)
        await mainPage.addNewTask(text2)
        await expect(mainPage.activeTasks().all()).resolves.toHaveLength(2)
        await expect(mainPage.completedTasks().all()).resolves.toHaveLength(0)

        // press TAB, then SPACE to check the toggle all checkbox
        await page.keyboard.press("Tab")
        await page.keyboard.press("Space")

        await expect(mainPage.activeTasks().all()).resolves.toHaveLength(0)
        await expect(mainPage.completedTasks().all()).resolves.toHaveLength(2)
    })

    test("mark all tasks as complete using the keyboard", async ({ page }) => {
        const mainPage = new MainPage(page)

        await mainPage.addNewTask(text1)
        await mainPage.addNewTask(text2)

        await expect(mainPage.activeTasks().all()).resolves.toHaveLength(2)
        await expect(mainPage.completedTasks().all()).resolves.toHaveLength(0)

        // press TAB twice, then SPACE to complete the first task
        await page.keyboard.press("Tab")
        await page.keyboard.press("Tab")
        await page.keyboard.press("Space")

        await expect(mainPage.isCompleted(mainPage.allTasks().nth(0))).resolves.toBeTruthy()
        await expect(mainPage.isCompleted(mainPage.allTasks().nth(1))).resolves.toBeFalsy()
    })

    test("focus next/previous task using the keyboard", async ({ page }) => {
        const mainPage = new MainPage(page)

        await mainPage.addNewTask(text1)
        await mainPage.addNewTask(text2)
        await mainPage.addNewTask(text3)

        await expect(mainPage.isCompleted(mainPage.allTasks().nth(0))).resolves.toBeFalsy()
        await expect(mainPage.isCompleted(mainPage.allTasks().nth(1))).resolves.toBeFalsy()
        await expect(mainPage.isCompleted(mainPage.allTasks().nth(2))).resolves.toBeFalsy()

        // press TAB twice, then SPACE to complete the first task
        await page.keyboard.press("Tab") // focus the toggle checkbox
        await page.keyboard.press("Tab") // focus the first task
        await page.keyboard.press("Tab") // focus the second task
        await page.keyboard.press("Tab") // focus the third task

        // press SHIFT and TAB to go back to the second task
        await page.keyboard.press("Shift+Tab")
        await page.keyboard.press("Space")

        // make sure we completed the second task
        await expect(mainPage.isCompleted(mainPage.allTasks().nth(0))).resolves.toBeFalsy()
        await expect(mainPage.isCompleted(mainPage.allTasks().nth(1))).resolves.toBeTruthy()
        await expect(mainPage.isCompleted(mainPage.allTasks().nth(2))).resolves.toBeFalsy()
    })

    test("input field is on focus after adding a new task", async ({ page }) => {
        const mainPage = new MainPage(page)

        await mainPage.addNewTask(text1)
        await expect(mainPage.newTaskInput).toBeFocused()
    })
})
