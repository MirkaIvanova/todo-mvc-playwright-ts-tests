import { test } from "../fixtures/fixtures"
import { expect } from "../pages/matchers"

test.describe("Adding tasks", () => {
    const text1 = "reply to emails like a responsible adult"
    const text2 = "call mom before she calls again"
    const text3 = "start sorting the laundry and hope for the best"

    test.beforeEach(async ({ todoPage }) => {
        await todoPage.goto()
    })

    test("add a new task", async ({ todoPage }) => {
        const newTask = await todoPage.addNewTask(text1)

        await expect(newTask).toBeVisible()
        await expect(todoPage.allTasks().all()).resolves.toHaveLength(1)
        await expect(todoPage.allTasks().first()).toContainText(text1)
        await expect(newTask).not.toBeCompleted()

        await expect(todoPage.taskCounter).toContainText("1 item left")
        await expect(todoPage.newTaskInput).toBeEmpty()
    })

    test("add multiple tasks, order is preserved", async ({ todoPage }) => {
        await todoPage.addNewTask(text1)
        await todoPage.addNewTask(text2)
        await todoPage.addNewTask(text3)

        // Verify order is preserved
        await expect(todoPage.allTasks().nth(0)).toHaveText(text1)
        await expect(todoPage.allTasks().nth(1)).toHaveText(text2)
        await expect(todoPage.allTasks().nth(2)).toHaveText(text3)

        await expect(todoPage.allTasks().all()).resolves.toHaveLength(3)
        await expect(todoPage.taskCounter).toHaveText("3 items left")
    })

    test("add tasks with duplicate text, they can be manipulated individually", async ({ todoPage }) => {
        const duplicateText = text1
        await todoPage.addNewTask(duplicateText)
        await todoPage.addNewTask(duplicateText)

        // Both tasks should appear
        await expect(todoPage.allTasks().all()).resolves.toHaveLength(2)
        await expect(todoPage.allTasks().nth(0)).toHaveText(duplicateText)
        await expect(todoPage.allTasks().nth(1)).toHaveText(duplicateText)

        // Complete the first task
        await todoPage.check(todoPage.allTasks().nth(0))
        await expect(todoPage.allTasks().nth(0)).toBeCompleted()
        await expect(todoPage.allTasks().nth(1)).not.toBeCompleted()

        // Delete the second task
        await todoPage.deleteTask(todoPage.allTasks().nth(1))
        await expect(todoPage.allTasks().all()).resolves.toHaveLength(1)
        await expect(todoPage.allTasks().first()).toHaveText(duplicateText)
    })

    test("new task with no text or only spaces/tabs/newlines is rejected", async ({ todoPage }) => {
        // Try to add a task with empty text
        await todoPage.addNewTask("")

        // Try to add a task with only spaces
        await todoPage.addNewTask("     ")

        // Try to add a task with only tabs
        await todoPage.addNewTask("\t\t\t")

        // Try to add a task with only newlines
        await todoPage.addNewTask("  \n\t  \n\r\t")

        // No new task should be added
        await expect(todoPage.allTasks().all()).resolves.toHaveLength(0)
    })

    test("trim leading/trailing whitespaces", async ({ todoPage }) => {
        // Add a task with leading and trailing spaces, tabs, and newlines
        const rawText = "   \t\n  Walk the dog  \t\n\r "
        const trimmedText = "Walk the dog"
        await todoPage.addNewTask(rawText)

        // The task should be added with trimmed text
        await expect(todoPage.allTasks().all()).resolves.toHaveLength(1)
        await expect(todoPage.allTasks().first()).toHaveText(trimmedText)
    })

    test("consecutive whitespaces in text are collapsed to a single space", async ({ todoPage }) => {
        // Add a task with multiple consecutive whitespaces
        const rawText = "Feed\n\n \tthe\n\r cat"
        const expectedText = "Feed the cat"
        await todoPage.addNewTask(rawText)

        // The task should be added with spaces/newlines/tabs replaced by a single space
        await expect(todoPage.allTasks().all()).resolves.toHaveLength(1)
        await expect(todoPage.allTasks().first()).toHaveText(expectedText)
    })

    test("new task text contains special characters (emoji, HTML entities, etc.)", async ({ todoPage }) => {
        // Add a task with special characters
        const text1 = "Fix bug 🐞 &amp; <b>review</b> PR #42 ©2025"
        const text2 = "`-=[];'\\,./~!@#$%^&*()_+{}:\"|<>?"
        await todoPage.addNewTask(text1)
        await todoPage.addNewTask(text2)

        // The tasks should appear with the exact text
        await expect(todoPage.allTasks().all()).resolves.toHaveLength(2)
        await expect(todoPage.allTasks().nth(0)).toHaveText(text1)
        await expect(todoPage.allTasks().nth(1)).toHaveText(text2)
    })

    test("cancel the creation of new task via Escape key", async ({ todoPage }) => {
        const taskText = "This will be cancelled"
        // Start typing a new task, then press Escape key
        await todoPage.newTaskInput.fill(taskText)
        await todoPage.newTaskInput.press("Escape")

        // The text should stay in the input field and no new task should be added
        await expect(todoPage.newTaskInput).toHaveValue(taskText)
        await expect(todoPage.allTasks().all()).resolves.toHaveLength(0)
    })

    test("add a new task with right to left text", async ({ todoPage }) => {
        // Add a task with right-to-left (RTL) text (e.g., Arabic, Hebrew)
        const rtlText = "שלום עולם" // "Hello World" in Hebrew
        await todoPage.addNewTask(rtlText)

        // The task should appear with the exact RTL text
        await expect(todoPage.allTasks().all()).resolves.toHaveLength(1)
        await expect(todoPage.allTasks().first()).toHaveText(rtlText)
    })

    test("click away while adding a new task, the input field is not cleared", async ({ page, todoPage }) => {
        // Start typing a new task
        const inputText = "Task in progress"
        await todoPage.newTaskInput.fill(inputText)

        // Click elsewhere on the page (e.g., the header or body)
        await page.locator("body").click()

        // The input field should still contain the text and the task is not added
        await expect(todoPage.newTaskInput).toHaveValue(inputText)
        await expect(todoPage.allTasks().all()).resolves.toHaveLength(0)
    })

    test("add a new task while filter is applied", async ({ todoPage }) => {
        const taskText1 = "New task 1"
        const taskText2 = "New task 2"

        // Add a completed task to enable the filter
        const completedTask = await todoPage.addNewTask("Completed task")
        await todoPage.check(completedTask)

        // Add a new active task while "Completed" filter is applied
        await todoPage.filterCompletedTasks()
        await todoPage.addNewTask(taskText1)

        // Add a new active task while "Active" filter is applied
        await todoPage.filterActiveTasks()
        await todoPage.addNewTask(taskText2)

        // The new tasks appear in the "All" filter view
        await todoPage.filterAllTasks()
        await expect(todoPage.allTasks().all()).resolves.toHaveLength(3)
        await expect(todoPage.allTasks().nth(0)).toHaveText("Completed task")
        await expect(todoPage.allTasks().nth(1)).toHaveText(taskText1)
        await expect(todoPage.allTasks().nth(2)).toHaveText(taskText2)

        // The new tasks appear in the "Active" filter view
        await todoPage.filterActiveTasks()
        await expect(todoPage.allTasks().all()).resolves.toHaveLength(2)

        // The new tasks not appear in the "Completed" filter view
        await todoPage.filterCompletedTasks()
        await expect(todoPage.allTasks().all()).resolves.toHaveLength(1)
    })
})
