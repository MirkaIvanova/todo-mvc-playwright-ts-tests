import { test, expect } from "../fixtures/fixtures"

test.describe("Filtering tasks", () => {
    const text1 = "reply to emails like a responsible adult"
    const text2 = "call mom before she calls again"
    const text3 = "start sorting the laundry and hope for the best"

    test.beforeEach(async ({ todoPage }) => {
        await todoPage.goto()

        await todoPage.addNewTask(text1)
        await todoPage.addNewTask(text2)
        await todoPage.addNewTask(text3)
    })

    test("filter tasks by All/Active/Completed", async ({ todoPage }) => {
        // Start with 3 active tasks, 0 completed tasks
        // Go through all filters and check the number of tasks
        await expect(todoPage.activeTasks().all()).resolves.toHaveLength(3)
        await expect(todoPage.completedTasks().all()).resolves.toHaveLength(0)

        await todoPage.filterActiveTasks()
        await expect(todoPage.allTasks().all()).resolves.toHaveLength(3)

        await todoPage.filterCompletedTasks()
        await expect(todoPage.allTasks().all()).resolves.toHaveLength(0)

        // Complete the first task and check the three filters
        await todoPage.filterAllTasks()
        await todoPage.check(todoPage.allTasks().nth(0))
        await expect(todoPage.activeTasks().all()).resolves.toHaveLength(2)
        await expect(todoPage.completedTasks().all()).resolves.toHaveLength(1)

        await todoPage.filterActiveTasks()
        await expect(todoPage.allTasks().all()).resolves.toHaveLength(2)

        await todoPage.filterCompletedTasks()
        await expect(todoPage.allTasks().all()).resolves.toHaveLength(1)
        await expect(todoPage.allTasks().nth(0)).toContainText(text1)

        // Delete the second first task and check the three filters
        await todoPage.filterAllTasks()
        await todoPage.deleteTask(todoPage.allTasks().nth(1))
        await expect(todoPage.activeTasks().all()).resolves.toHaveLength(1)
        await expect(todoPage.completedTasks().all()).resolves.toHaveLength(1)
        await expect(todoPage.allTasks().nth(0)).toContainText(text1)
        await expect(todoPage.allTasks().nth(1)).toContainText(text3)

        await todoPage.filterActiveTasks()
        await expect(todoPage.allTasks().all()).resolves.toHaveLength(1)
        await expect(todoPage.allTasks().nth(0)).toContainText(text3)

        await todoPage.filterCompletedTasks()
        await expect(todoPage.allTasks().all()).resolves.toHaveLength(1)
        await expect(todoPage.allTasks().nth(0)).toContainText(text1)
    })

    test("filter tasks by directly navgating to url", async ({ todoPage }) => {
        const allTasks = todoPage.allTasks()

        // Setup: Have one task
        await todoPage.check(todoPage.allTasks().nth(1))

        // Filter Active directly by navigating to URL
        todoPage.goto("/todomvc/#/active")
        await expect(allTasks.all()).resolves.toHaveLength(2)
        await expect(allTasks.nth(0)).toContainText(text1)
        await expect(allTasks.nth(1)).toContainText(text3)

        // Filter Completed directly by navigating to URL
        todoPage.goto("/todomvc/#/completed")
        await expect(allTasks.all()).resolves.toHaveLength(1)
        await expect(allTasks.nth(0)).toContainText(text2)
    })
})
