import { test, expect } from "@playwright/test"
import { MainPage } from "../pages/mainPage"

test.describe("Adding tasks", () => {
    // mii rename
    const TODO_ITEMS1 = "reply to emails like a responsible adult"
    const TODO_ITEMS2 = "call mom before she calls again"
    const TODO_ITEMS3 = "start sorting the laundry and hope for the best"

    test.beforeEach(async ({ page }) => {
        await page.goto("https://demo.playwright.dev/todomvc")
    })

    test("add a new task", async ({ page }) => {
        const mainPage = new MainPage(page)

        const newTask = await mainPage.addNewTask(TODO_ITEMS1)

        await expect(newTask).toBeVisible()
        await expect(mainPage.allTasks().all()).resolves.toHaveLength(1)
        await expect(mainPage.allTasks().first()).toContainText(TODO_ITEMS1)
        await expect(mainPage.isCompleted(newTask)).resolves.toBeFalsy()
        await expect(mainPage.taskCounter).toContainText("1 item left")
        await expect(mainPage.newTaskInput).toBeEmpty()
    })

    test("add multiple tasks, order is preserved", async ({ page }) => {
        const mainPage = new MainPage(page)

        await mainPage.addNewTask(TODO_ITEMS1)
        await mainPage.addNewTask(TODO_ITEMS2)
        await mainPage.addNewTask(TODO_ITEMS3)

        // Verify order is preserved
        await expect(mainPage.allTasks().nth(0)).toHaveText(TODO_ITEMS1)
        await expect(mainPage.allTasks().nth(1)).toHaveText(TODO_ITEMS2)
        await expect(mainPage.allTasks().nth(2)).toHaveText(TODO_ITEMS3)

        await expect(mainPage.allTasks().all()).resolves.toHaveLength(3)
        await expect(mainPage.taskCounter).toHaveText("3 items left")
    })

    test("add tasks with duplicate text, they can be manipulated individually", async ({ page }) => {
        const mainPage = new MainPage(page)

        const duplicateText = TODO_ITEMS1
        await mainPage.addNewTask(duplicateText)
        await mainPage.addNewTask(duplicateText)

        // Both tasks should appear
        await expect(mainPage.allTasks().all()).resolves.toHaveLength(2)
        await expect(mainPage.allTasks().nth(0)).toHaveText(duplicateText)
        await expect(mainPage.allTasks().nth(1)).toHaveText(duplicateText)

        // Complete the first task
        await mainPage.check(mainPage.allTasks().nth(0))
        await expect(mainPage.isCompleted(mainPage.allTasks().nth(0))).resolves.toBeTruthy()
        await expect(mainPage.isCompleted(mainPage.allTasks().nth(1))).resolves.toBeFalsy()

        // Delete the second task
        await mainPage.deleteTask(mainPage.allTasks().nth(1))
        await expect(mainPage.allTasks().all()).resolves.toHaveLength(1)
        await expect(mainPage.allTasks().first()).toHaveText(duplicateText)
    })

    test("new task with no text or only spaces/tabs/newlines is rejected", async ({ page }) => {
        const mainPage = new MainPage(page)

        // Try to add a task with empty text
        await mainPage.addNewTask("")

        // Try to add a task with only spaces
        await mainPage.addNewTask("     ")

        // Try to add a task with only tabs
        await mainPage.addNewTask("\t\t\t")

        // Try to add a task with only newlines
        await mainPage.addNewTask("  \n\t  \n\r\t")

        // No new task should be added
        await expect(mainPage.allTasks().all()).resolves.toHaveLength(0)
    })

    test("trim leading/trailing whitespaces", async ({ page }) => {
        const mainPage = new MainPage(page)

        // Add a task with leading and trailing spaces, tabs, and newlines
        const rawText = "   \t\n  Walk the dog  \t\n\r "
        const trimmedText = "Walk the dog"
        await mainPage.addNewTask(rawText)

        // The task should be added with trimmed text
        await expect(mainPage.allTasks().all()).resolves.toHaveLength(1)
        await expect(mainPage.allTasks().first()).toHaveText(trimmedText)
    })

    test("consecutive whitespaces in text are collapsed to a single space", async ({ page }) => {
        const mainPage = new MainPage(page)

        // Add a task with multiple consecutive whitespaces
        const rawText = "Feed\n\n \tthe\n\r cat"
        const expectedText = "Feed the cat"
        await mainPage.addNewTask(rawText)

        // The task should be added with spaces/newlines/tabs replaced by a single space
        await expect(mainPage.allTasks().all()).resolves.toHaveLength(1)
        await expect(mainPage.allTasks().first()).toHaveText(expectedText)
    })

    test("new task text contains special characters (emoji, HTML entities, etc.)", async ({ page }) => {
        const mainPage = new MainPage(page)

        // Add a task with special characters
        const text1 = "Fix bug 🐞 &amp; <b>review</b> PR #42 ©2025"
        const text2 = "`-=[];'\\,./~!@#$%^&*()_+{}:\"|<>?"
        await mainPage.addNewTask(text1)
        await mainPage.addNewTask(text2)

        // The tasks should appear with the exact text
        await expect(mainPage.allTasks().all()).resolves.toHaveLength(2)
        await expect(mainPage.allTasks().nth(0)).toHaveText(text1)
        await expect(mainPage.allTasks().nth(1)).toHaveText(text2)
    })

    test("cancel the creation of new task via Escape key", async ({ page }) => {
        const mainPage = new MainPage(page)
        const taskText = "This will be cancelled"
        // Start typing a new task, then press Escape key
        await mainPage.newTaskInput.fill(taskText)
        await mainPage.newTaskInput.press("Escape")

        // The text should stay in the input field and no new task should be added
        await expect(mainPage.newTaskInput).toHaveValue(taskText)
        await expect(mainPage.allTasks().all()).resolves.toHaveLength(0)
    })

    test("add a new task with right to left text", async ({ page }) => {
        const mainPage = new MainPage(page)

        // Add a task with right-to-left (RTL) text (e.g., Arabic, Hebrew)
        const rtlText = "שלום עולם" // "Hello World" in Hebrew
        await mainPage.addNewTask(rtlText)

        // The task should appear with the exact RTL text
        await expect(mainPage.allTasks().all()).resolves.toHaveLength(1)
        await expect(mainPage.allTasks().first()).toHaveText(rtlText)
    })

    test("click away while adding a new task, the input field is not cleared", async ({ page }) => {
        const mainPage = new MainPage(page)

        // Start typing a new task
        const inputText = "Task in progress"
        await mainPage.newTaskInput.fill(inputText)

        // Click elsewhere on the page (e.g., the header or body)
        await page.locator("body").click()

        // The input field should still contain the text and the task is not added
        await expect(mainPage.newTaskInput).toHaveValue(inputText)
        await expect(mainPage.allTasks().all()).resolves.toHaveLength(0)
    })

    test("add a new task while filter is applied", async ({ page }) => {
        const mainPage = new MainPage(page)
        const taskText1 = "New task 1"
        const taskText2 = "New task 2"

        // Add a completed task to enable the filter
        const completedTask = await mainPage.addNewTask("Completed task")
        await mainPage.check(completedTask)

        // Add a new active task while "Completed" filter is applied
        await mainPage.filterCompletedTasks()
        await mainPage.addNewTask(taskText1)

        // Add a new active task while "Active" filter is applied
        await mainPage.filterActiveTasks()
        await mainPage.addNewTask(taskText2)

        // The new tasks appear in the "All" filter view
        await mainPage.filterAllTasks()
        await expect(mainPage.allTasks().all()).resolves.toHaveLength(3)
        await expect(mainPage.allTasks().nth(0)).toHaveText("Completed task")
        await expect(mainPage.allTasks().nth(1)).toHaveText(taskText1)
        await expect(mainPage.allTasks().nth(2)).toHaveText(taskText2)

        // The new tasks appear in the "Active" filter view
        await mainPage.filterActiveTasks()
        await expect(mainPage.allTasks().all()).resolves.toHaveLength(2)

        // The new tasks not appear in the "Completed" filter view
        await mainPage.filterCompletedTasks()
        await expect(mainPage.allTasks().all()).resolves.toHaveLength(1)
    })
})
