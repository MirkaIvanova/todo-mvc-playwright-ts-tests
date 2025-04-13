import { test, expect } from "../fixtures/fixtures"

test.describe("Deleting tasks", () => {
    const text1 = "reply to emails like a responsible adult"
    const text2 = "call mom before she calls again"
    const text3 = "start sorting the laundry and hope for the best"

    test.beforeEach(async ({ todoPage }) => {
        await todoPage.goto()

        await todoPage.addNewTask(text1)
        await todoPage.addNewTask(text2)
        await todoPage.addNewTask(text3)
    })

    test("delete an active task", async ({ todoPage }) => {
        // we start with 3 tasks
        await expect(todoPage.allTasks().all()).resolves.toHaveLength(3)

        // delete one of the tasks
        const task = todoPage.allTasks().first()
        await todoPage.deleteTask(task)

        // two are left
        await expect(todoPage.task(text1)).not.toBeVisible()
        await expect(todoPage.allTasks().all()).resolves.toHaveLength(2)
        await expect(todoPage.taskCounter).toContainText("2 items left")
    })

    test("delete a completed task", async ({ todoPage }) => {
        // complete one task
        await todoPage.check(todoPage.allTasks().nth(1))

        // we start with 2 active and 1 completed task
        await expect(todoPage.activeTasks().all()).resolves.toHaveLength(2)
        await expect(todoPage.completedTasks().all()).resolves.toHaveLength(1)

        // delete the completed task
        const task = todoPage.allTasks().nth(1)
        await todoPage.deleteTask(task)

        // two are left
        await expect(todoPage.task(text2)).not.toBeVisible()
        await expect(todoPage.allTasks().all()).resolves.toHaveLength(2)
        await expect(todoPage.taskCounter).toContainText("2 items left")
    })

    test("delete a task while filter is applied", async ({ todoPage }) => {
        // complete one task and filter only Completed tasks
        await todoPage.check(todoPage.allTasks().nth(2))
        await todoPage.filterCompletedTasks()
        await expect(todoPage.allTasks().all()).resolves.toHaveLength(1)

        // delete the completed task
        const task = todoPage.allTasks().first()
        await todoPage.deleteTask(task)

        // two are left
        await expect(todoPage.task(text3)).not.toBeVisible()
        await expect(todoPage.allTasks().all()).resolves.toHaveLength(0)
        await expect(todoPage.taskCounter).toContainText("2 items left")
    })

    for (const filter of [
        { name: "All", filterMethod: (page) => {}, expectedTasks: 1 },
        { name: "Active", filterMethod: (page) => page.filterActiveTasks(), expectedTasks: 1 },
        { name: "Completed", filterMethod: (page) => page.filterCompletedTasks(), expectedTasks: 0 },
    ]) {
        test(`clear completed when ${filter.name} filter is applied`, async ({ todoPage }) => {
            const allTasks = todoPage.allTasks()

            // Setup: complete two tasks
            await todoPage.check(allTasks.nth(0))
            await todoPage.check(allTasks.nth(1))
            await expect(todoPage.activeTasks().all()).resolves.toHaveLength(1)
            await expect(todoPage.completedTasks().all()).resolves.toHaveLength(2)

            // Apply the specific filter
            await filter.filterMethod(todoPage)

            // Clear completed tasks
            await todoPage.clearCompletedTasks()

            // Verify the completed task is deleted
            await expect(todoPage.task(text2)).toBeHidden()
            await expect(todoPage.completedTasks().all()).resolves.toHaveLength(0)

            // Additional verification for All filter
            await expect(allTasks.all()).resolves.toHaveLength(filter.expectedTasks)

            // Go to All filter and verify the completed tasks are deleted
            await todoPage.filterAllTasks()
            await expect(allTasks.all()).resolves.toHaveLength(1)
            await expect(allTasks.nth(0)).toContainText(text3)
        })
    }
})
