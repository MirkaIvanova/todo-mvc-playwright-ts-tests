import { test, expect } from "@playwright/test"
import { MainPage } from "../pages/mainPage"

test.describe("Editing tasks", () => {
    const oldText1 = "water plants"
    const oldText2 = "clean fridge"
    const oldText3 = "fold laundry"

    const newText1 = "water the plants before they stage a protest"
    const newText2 = "figure out what that weird smell in the fridge is"
    const newText3 = "actually fold the laundry this time, not just stare at it"

    test.beforeEach(async ({ page }) => {
        await page.goto("https://demo.playwright.dev/todomvc")

        const mainPage = new MainPage(page)
        await mainPage.addNewTask(oldText1)
        await mainPage.addNewTask(oldText2)
        await mainPage.addNewTask(oldText3)
    })

    test("edit an active task", async ({ page }) => {
        const mainPage = new MainPage(page)

        const allTasks = mainPage.allTasks()
        await mainPage.editTask(allTasks.nth(1), newText2)

        // The second task is edited, the others remain unchanged
        await expect(allTasks.nth(0)).toHaveText(oldText1)
        await expect(allTasks.nth(1)).toHaveText(newText2)
        await expect(allTasks.nth(2)).toHaveText(oldText3)
    })

    test("edit a completed task, state is unaffected", async ({ page }) => {
        const mainPage = new MainPage(page)

        const allTasks = mainPage.allTasks()
        await mainPage.check(allTasks.nth(2))
        await mainPage.editTask(allTasks.nth(2), newText3)

        // The third task is edited, the others remain unchanged
        await expect(allTasks.nth(0)).toHaveText(oldText1)
        await expect(allTasks.nth(1)).toHaveText(oldText2)
        await expect(allTasks.nth(2)).toHaveText(newText3)

        // The editing of the text did not affect tthe completed state
        await expect(mainPage.isChecked(allTasks.nth(0))).resolves.toBeFalsy()
        await expect(mainPage.isChecked(allTasks.nth(1))).resolves.toBeFalsy()
        await expect(mainPage.isChecked(allTasks.nth(2))).resolves.toBeTruthy()
    })

    test("task is deleted when edited to empty or whitespace only", async ({ page }) => {
        const mainPage = new MainPage(page)
        const allTasks = mainPage.allTasks()

        // edit the middle task
        await mainPage.editTask(allTasks.nth(1), "")
        await expect(allTasks.all()).resolves.toHaveLength(2)
        await expect(allTasks.nth(0)).toContainText(oldText1)
        await expect(allTasks.nth(1)).toContainText(oldText3)

        // edit the last task
        await mainPage.editTask(allTasks.nth(1), "")
        await expect(allTasks.all()).resolves.toHaveLength(1)
        await expect(allTasks.nth(0)).toContainText(oldText1)

        // edit the last remaining task
        await mainPage.editTask(allTasks.nth(0), "")
        await expect(allTasks.all()).resolves.toHaveLength(0)
    })

    test("trim leading/trailing whitespaces", async ({ page }) => {
        const mainPage = new MainPage(page)
        const allTasks = mainPage.allTasks()

        const rawText = "   \t\n  Walk the dog  \t\n\r "
        const trimmedText = "Walk the dog"
        await mainPage.editTask(allTasks.nth(1), rawText)

        // The task should be edited with trimmed text
        await expect(mainPage.allTasks().nth(0)).toHaveText(oldText1)
        await expect(mainPage.allTasks().nth(1)).toHaveText(trimmedText)
        await expect(mainPage.allTasks().nth(2)).toHaveText(oldText3)
    })

    test("consecutive whitespaces in text are collapsed to a single space", async ({ page }) => {
        const mainPage = new MainPage(page)
        const allTasks = mainPage.allTasks()

        // Add a task with multiple consecutive whitespaces
        const rawText = "Feed\n\n \tthe\n\r cat"
        const expectedText = "Feed the cat"
        await mainPage.editTask(allTasks.nth(1), rawText)

        // The task should be added with spaces/newlines/tabs replaced by a single space
        await expect(mainPage.allTasks().nth(0)).toHaveText(oldText1)
        await expect(mainPage.allTasks().nth(1)).toHaveText(expectedText)
        await expect(mainPage.allTasks().nth(2)).toHaveText(oldText3)
    })

    test("edited task text contains special characters", async ({ page }) => {
        const mainPage = new MainPage(page)
        const allTasks = mainPage.allTasks()

        // Edit two tasks to contain with special characters
        const text1 = "Fix bug 🐝 &amp; <b>review</b> PR #42 ©2025"
        const text2 = "`-=[];'\\,./~!@#$%^&*()_+{}:\"|<>?"
        await mainPage.editTask(allTasks.nth(0), text1)
        await mainPage.editTask(allTasks.nth(1), text2)

        await expect(mainPage.allTasks().nth(0)).toHaveText(text1)
        await expect(mainPage.allTasks().nth(1)).toHaveText(text2)
        await expect(mainPage.allTasks().nth(2)).toHaveText(oldText3)
    })

    test("cancel the editing of a task via Escape key", async ({ page }) => {
        const mainPage = new MainPage(page)
        const allTasks = mainPage.allTasks()

        await allTasks.nth(1).dblclick()
        await mainPage.taskEditInput(allTasks.nth(1)).fill(newText2)
        await mainPage.taskEditInput(allTasks.nth(1)).press("Escape")

        await expect(allTasks.nth(0)).toHaveText(oldText1)
        await expect(allTasks.nth(1)).toHaveText(oldText2)
        await expect(allTasks.nth(2)).toHaveText(oldText3)
    })

    test("edit a task to have right to left text", async ({ page }) => {
        const mainPage = new MainPage(page)
        const allTasks = mainPage.allTasks()
        const newText = "مرحبا بكم في TodoMVC"

        await mainPage.editTask(allTasks.nth(1), newText)

        await expect(allTasks.nth(0)).toHaveText(oldText1)
        await expect(allTasks.nth(1)).toHaveText(newText)
        await expect(allTasks.nth(2)).toHaveText(oldText3)
    })

    test("accept the edited text by clicking away from the input field", async ({ page }) => {
        const mainPage = new MainPage(page)
        const allTasks = mainPage.allTasks()

        await allTasks.nth(1).dblclick()
        await mainPage.taskEditInput(allTasks.nth(1)).fill(newText2)
        await allTasks.nth(0).click()

        await expect(allTasks.nth(0)).toHaveText(oldText1)
        await expect(allTasks.nth(1)).toHaveText(newText2)
        await expect(allTasks.nth(2)).toHaveText(oldText3)
    })

    test("edit a task while filter is applied", async ({ page }) => {
        const mainPage = new MainPage(page)
        const allTasks = mainPage.allTasks()

        // Complete the first task to activate the Completed filter
        await mainPage.check(allTasks.nth(0))

        // Edit a task in the Active filter
        await mainPage.filterActive()
        await mainPage.editTask(allTasks.nth(1), newText2)

        // Edit a task in the Completed filter
        await mainPage.filterCompleted()
        await mainPage.editTask(allTasks.nth(0), newText1)
        await expect(allTasks.nth(0)).toHaveText(newText1)
    })
})
