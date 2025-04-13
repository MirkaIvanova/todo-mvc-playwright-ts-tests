import { test, expect } from "@playwright/test"
import { MainPage } from "../pages/mainPage"

test.describe("UI and Visual Checks", () => {
    const text1 = "reply to emails like a responsible adult"
    const text2 = "call mom before she calls again"

    test.beforeEach(async ({ page }) => {
        await page.goto("https://demo.playwright.dev/todomvc")
    })

    test("landing page - default state", async ({ page }) => {
        const mainPage = new MainPage(page)

        // title of the page
        await expect(page).toHaveTitle("React • TodoMVC")

        // info message at top of page
        const infoMessage = page.locator("body > div:nth-child(1)")
        await expect(infoMessage).toHaveText("This is just a demo of TodoMVC for testing, not the real TodoMVC app.")

        // name of the app
        const appName = page.locator(".todoapp h1:nth-child(1)")
        await expect(appName).toHaveText("todos")

        //input field
        await expect(mainPage.newTaskInput).toBeVisible()
        await expect(mainPage.newTaskInput).toBeEmpty()
        await expect(mainPage.newTaskInput).toHaveAttribute("placeholder", "What needs to be done?")

        // no tasks
        await expect(mainPage.allTasks().all()).resolves.toHaveLength(0)

        // footer is not visible when the task list is empty
        await expect(mainPage.taskCounter).toBeHidden()
        await expect(mainPage.clearCompletedButton).toBeHidden()
        await expect(mainPage.toggleAllCheckbox).toBeHidden()
        await expect(mainPage.filters.all).toBeHidden()
        await expect(mainPage.filters.active).toBeHidden()
        await expect(mainPage.filters.completed).toBeHidden()
        await expect(mainPage.tasksContainer).toBeHidden()
        await expect(mainPage.taskCounter).toBeHidden()
    })

    test("default state of footer when there are no tasks in this filter", async ({ page }) => {
        const mainPage = new MainPage(page)

        // Create 1 task and complete it
        await mainPage.addNewTask(text1)
        await mainPage.check(mainPage.allTasks().first())

        // No tasks is the Active filter, check footer
        await mainPage.filterActive()
        await expect(mainPage.allTasks().all()).resolves.toHaveLength(0)
        await expect(mainPage.taskCounter).toHaveText("0 items left")
        await expect(mainPage.clearCompletedButton).toBeVisible()
        await expect(mainPage.toggleAllCheckbox).toBeVisible()
        await expect(mainPage.filters.all).toBeVisible()
        await expect(mainPage.filters.completed).toBeVisible()
    })

    test("'Clear completed' is not visible when no tasks are completed", async ({ page }) => {
        const mainPage = new MainPage(page)

        // Create 1 task
        await mainPage.addNewTask(text1)
        await expect(mainPage.clearCompletedButton).toBeHidden()

        // Complete the task
        await mainPage.check(mainPage.allTasks().first())
        await expect(mainPage.clearCompletedButton).toBeVisible()
    })

    test("currently selected filter is highlighted", async ({ page }) => {
        const mainPage = new MainPage(page)

        mainPage.addNewTask(text1)

        await expect(mainPage.filters.all).toHaveClass("selected")
        await expect(mainPage.filters.active).not.toHaveClass("selected")
        await expect(mainPage.filters.completed).not.toHaveClass("selected")

        await mainPage.filterActive()
        await expect(mainPage.filters.all).not.toHaveClass("selected")
        await expect(mainPage.filters.active).toHaveClass("selected")
        await expect(mainPage.filters.completed).not.toHaveClass("selected")

        await mainPage.filterCompleted()
        await expect(mainPage.filters.all).not.toHaveClass("selected")
        await expect(mainPage.filters.active).not.toHaveClass("selected")
        await expect(mainPage.filters.completed).toHaveClass("selected")
    })

    test("completed tasks styling - strikethrough and dimmed text", async ({ page }) => {
        const mainPage = new MainPage(page)

        // Arrange: add 2 tasks, complete one of them
        await mainPage.addNewTask(text1)
        await mainPage.addNewTask(text2)
        await mainPage.check(mainPage.getTask(0))

        await expect(mainPage.allTasks().nth(0).locator("label")).toHaveCSS(
            "text-decoration",
            "line-through solid rgb(217, 217, 217)"
        )
        await expect(mainPage.allTasks().nth(0)).toHaveCSS("color", "rgb(77, 77, 77)")
        await expect(mainPage.allTasks().nth(1)).not.toHaveCSS("text-decoration", "line-through")
        await expect(mainPage.allTasks().nth(1)).not.toHaveCSS("color", "rgb(186, 189, 182)")
    })

    test("delete button visible only on hover", async ({ page }) => {
        const mainPage = new MainPage(page)

        // Arrange: add 2 tasks
        await mainPage.addNewTask(text1)
        await mainPage.addNewTask(text2)

        const task1 = mainPage.allTasks().nth(0)
        const task2 = mainPage.allTasks().nth(1)

        // delete button is not visible when task is not hovered
        await expect(mainPage.deleteButton(task1)).toBeHidden()

        // delete button appears when task is hovered
        await task1.hover()
        await expect(mainPage.deleteButton(task1)).toBeVisible()
        await expect(mainPage.deleteButton(task2)).toBeHidden()

        // delete button disappears when mouse moves away
        await page.locator("body").click()
        await task2.hover()
        await expect(mainPage.deleteButton(task1)).toBeHidden()
    })

    test("hide other controls when editing task", async ({ page }) => {
        const mainPage = new MainPage(page)

        await mainPage.addNewTask(text1)
        await mainPage.addNewTask(text2)

        // start editing a task
        const task1 = mainPage.getTask(1)
        await task1.dblclick()

        // check the other controls
        await expect(task1.getByRole("checkbox")).toBeHidden()
        await expect(mainPage.deleteButton(task1)).toBeHidden()
    })
})
