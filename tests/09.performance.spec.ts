import { test, expect } from "../fixtures/fixtures"

test.describe("Performace", () => {
    test.beforeEach(async ({ todoPage }) => {
        await todoPage.goto()
    })

    test("the app can support 200+ tasks", async ({ todoPage }) => {
        // Add 200 tasks
        for (let i = 0; i < 200; i++) {
            await todoPage.addNewTask(`Task ${i + 1}`)
        }
        await expect(todoPage.allTasks().all()).resolves.toHaveLength(200)
        await expect(todoPage.completedTasks().all()).resolves.toHaveLength(0)
        await expect(todoPage.taskCounter).toHaveText("200 items left")

        // Mark all tasks as completed
        await todoPage.toggleAllTasks()
        await expect(todoPage.completedTasks().all()).resolves.toHaveLength(200)

        // Delete all completed tasks
        await todoPage.clearCompletedTasks()
        await expect(todoPage.allTasks().all()).resolves.toHaveLength(0)
    })

    test("the app can support tasks with very long text", async ({ todoPage }) => {
        // Generate a long text with random characters
        const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789 .,!?-_"
        let longText = ""
        for (let i = 0; i < 100000; i++) {
            longText += characters.charAt(Math.floor(Math.random() * characters.length))
        }

        await todoPage.addNewTask(longText)

        await expect(todoPage.allTasks().all()).resolves.toHaveLength(1)
        await expect(todoPage.allTasks().first()).toContainText(longText)

        const longText2 = longText.split("").reverse().join("")

        await todoPage.editTask(todoPage.allTasks().first(), longText2)
        await expect(todoPage.allTasks().first()).toContainText(longText2)
    })
})
