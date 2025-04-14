import { test } from "../fixtures/fixtures"
import { expect } from "../pages/matchers"

test.describe("Keyboard/Accessibility", () => {
    const text1 = "reply to emails like a responsible adult"
    const text2 = "call mom before she calls again"
    const text3 = "start sorting the laundry and hope for the best"

    test.beforeEach(async ({ todoPage }) => {
        await todoPage.goto()
    })

    test("complete one task using the keyboard", async ({ page, todoPage }) => {
        // Arrange: have 2 active tasks
        await todoPage.addNewTask(text1)
        await todoPage.addNewTask(text2)
        await expect(todoPage.activeTasks().all()).resolves.toHaveLength(2)
        await expect(todoPage.completedTasks().all()).resolves.toHaveLength(0)

        // press TAB, then SPACE to check the toggle all checkbox
        await page.keyboard.press("Tab")
        await page.keyboard.press("Space")

        await expect(todoPage.activeTasks().all()).resolves.toHaveLength(0)
        await expect(todoPage.completedTasks().all()).resolves.toHaveLength(2)
    })

    test("mark all tasks as complete using the keyboard", async ({ page, todoPage }) => {
        await todoPage.addNewTask(text1)
        await todoPage.addNewTask(text2)

        await expect(todoPage.activeTasks().all()).resolves.toHaveLength(2)
        await expect(todoPage.completedTasks().all()).resolves.toHaveLength(0)

        // press TAB twice, then SPACE to complete the first task
        await page.keyboard.press("Tab")
        await page.keyboard.press("Tab")
        await page.keyboard.press("Space")

        await expect(todoPage.allTasks().nth(0)).toBeCompleted()
        await expect(todoPage.allTasks().nth(1)).not.toBeCompleted()
    })

    test("focus next/previous task using the keyboard", async ({ page, todoPage }) => {
        await todoPage.addNewTask(text1)
        await todoPage.addNewTask(text2)
        await todoPage.addNewTask(text3)

        await expect(todoPage.allTasks().nth(0)).not.toBeCompleted()
        await expect(todoPage.allTasks().nth(1)).not.toBeCompleted()
        await expect(todoPage.allTasks().nth(2)).not.toBeCompleted()

        // press TAB twice, then SPACE to complete the first task
        await page.keyboard.press("Tab") // focus the toggle checkbox
        await page.keyboard.press("Tab") // focus the first task
        await page.keyboard.press("Tab") // focus the second task
        await page.keyboard.press("Tab") // focus the third task

        // press SHIFT and TAB to go back to the second task
        await page.keyboard.press("Shift+Tab")
        await page.keyboard.press("Space")

        // make sure we completed the second task
        await expect(todoPage.allTasks().nth(0)).not.toBeCompleted()
        await expect(todoPage.allTasks().nth(1)).toBeCompleted()
        await expect(todoPage.allTasks().nth(2)).not.toBeCompleted()
    })

    test("input field is on focus after adding a new task", async ({ todoPage }) => {
        await todoPage.addNewTask(text1)
        await expect(todoPage.newTaskInput).toBeFocused()
    })
})
