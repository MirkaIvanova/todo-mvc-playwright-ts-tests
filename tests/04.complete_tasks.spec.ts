import { test } from "../fixtures/fixtures"
import { expect } from "../pages/matchers"

test.describe("Completing tasks", () => {
    const text1 = "reply to emails like a responsible adult"
    const text2 = "call mom before she calls again"
    const text3 = "start sorting the laundry and hope for the best"

    test.beforeEach(async ({ todoPage }) => {
        await todoPage.goto()

        await todoPage.addNewTask(text1)
        await todoPage.addNewTask(text2)
        await todoPage.addNewTask(text3)
    })

    test("mark a task as completed", async ({ todoPage }) => {
        const allTasks = todoPage.allTasks()

        // Initially all tasks are active
        await expect(todoPage.allTasks().all()).resolves.toHaveLength(3)
        await expect(todoPage.activeTasks().all()).resolves.toHaveLength(3)
        await expect(todoPage.completedTasks().all()).resolves.toHaveLength(0)

        // Mark the first task as completed
        await todoPage.check(allTasks.first())

        // await expect(todoPage.isCompleted(todoPage.allTasks().nth(0))).toBeTruthy()
        await expect(todoPage.allTasks().nth(0)).toBeCompleted()

        await expect(todoPage.activeTasks().all()).resolves.toHaveLength(2)
        await expect(todoPage.completedTasks().all()).resolves.toHaveLength(1)

        // await expect(todoPage.isChecked(todoPage.allTasks().nth(0))).toBeTruthy()
        // await expect(todoPage.isCompleted(todoPage.allTasks().nth(0))).toBeTruthy()
        await expect(todoPage.allTasks().nth(0)).toBeCompleted()
        await expect(todoPage.taskCounter).toContainText("2 items left")
    })

    test("mark a task as uncompleted", async ({ todoPage }) => {
        // Mark the first task as completed
        await todoPage.check(todoPage.allTasks().nth(0))
        await expect(todoPage.allTasks().nth(0)).toBeCompleted()
        await expect(todoPage.taskCounter).toContainText("2 items left")

        // Mark the first task as completed
        await todoPage.uncheck(await todoPage.allTasks().nth(0))

        await expect(todoPage.allTasks().nth(0)).not.toBeCompleted()
        await expect(todoPage.taskCounter).toContainText("3 items left")
    })

    test("mark all items as completed, start from mixed state", async ({ todoPage }) => {
        await todoPage.check(todoPage.allTasks().nth(1))

        await expect(todoPage.activeTasks().all()).resolves.toHaveLength(2)
        await expect(todoPage.completedTasks().all()).resolves.toHaveLength(1)
        await expect(todoPage.taskCounter).toContainText("2 items left")

        await todoPage.toggleAllTasks()

        await expect(todoPage.activeTasks().all()).resolves.toHaveLength(0)
        await expect(todoPage.completedTasks().all()).resolves.toHaveLength(3)
        await expect(todoPage.allTasks().nth(0)).toBeCompleted()
        await expect(todoPage.allTasks().nth(1)).toBeCompleted()
        await expect(todoPage.allTasks().nth(2)).toBeCompleted()
        await expect(todoPage.taskCounter).toContainText("0 items left")
    })

    test("mark all items as completed from All/Active/Completed views", async ({ todoPage }) => {
        // Mark all tasks as completed from "All" view
        await todoPage.toggleAllTasks()
        await expect(todoPage.activeTasks().all()).resolves.toHaveLength(0)
        await expect(todoPage.completedTasks().all()).resolves.toHaveLength(3)
        await expect(todoPage.taskCounter).toContainText("0 items left")

        // Mark all tasks as uncompleted from "Active" view
        await todoPage.filterActiveTasks()
        await todoPage.toggleAllTasks()
        await expect(todoPage.activeTasks().all()).resolves.toHaveLength(3)
        await expect(todoPage.completedTasks().all()).resolves.toHaveLength(0)
        await expect(todoPage.taskCounter).toContainText("3 items left")

        // Mark all tasks as completed from "Completed" view
        await todoPage.filterCompletedTasks()
        await todoPage.toggleAllTasks()
        await expect(todoPage.activeTasks().all()).resolves.toHaveLength(0)
        await expect(todoPage.completedTasks().all()).resolves.toHaveLength(3)
        await expect(todoPage.taskCounter).toContainText("0 items left")
    })

    test("'mark all items as completed' checkbox updates state when tasks are completed / uncompleted", async ({
        todoPage,
    }) => {
        // The checkbox should be checked (darker color) when all tasks are completed
        await todoPage.toggleAllTasks()
        await expect(todoPage.toggleAllCheckbox).toBeChecked()

        // The checkbox should be unchecked (light color) when not all tasks are completed
        await todoPage.uncheck(todoPage.allTasks().nth(0))
        await expect(todoPage.toggleAllCheckbox).not.toBeChecked()

        // Assert the toggle all is checked again when we complete the last task
        await todoPage.check(todoPage.allTasks().nth(0))
        await expect(todoPage.toggleAllCheckbox).toBeChecked()
    })
})
