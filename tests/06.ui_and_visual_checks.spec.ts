import { test, expect } from "../fixtures/fixtures"

test.describe("UI and Visual Checks", () => {
    const text1 = "reply to emails like a responsible adult"
    const text2 = "call mom before she calls again"

    test.beforeEach(async ({ todoPage }) => {
        await todoPage.goto()
    })

    test("landing page - default state", async ({ page, todoPage }) => {
        // title of the page
        await expect(page).toHaveTitle("React • TodoMVC")

        // info message at top of page
        const infoMessage = page.locator("body > div:nth-child(1)")
        await expect(infoMessage).toHaveText("This is just a demo of TodoMVC for testing, not the real TodoMVC app.")

        // name of the app
        const appName = page.locator(".todoapp h1:nth-child(1)")
        await expect(appName).toHaveText("todos")

        //input field
        await expect(todoPage.newTaskInput).toBeVisible()
        await expect(todoPage.newTaskInput).toBeEmpty()
        await expect(todoPage.newTaskInput).toHaveAttribute("placeholder", "What needs to be done?")

        // no tasks
        await expect(todoPage.allTasks().all()).resolves.toHaveLength(0)

        // footer is not visible when the task list is empty
        await expect(todoPage.taskCounter).toBeHidden()
        await expect(todoPage.clearCompletedButton).toBeHidden()
        await expect(todoPage.toggleAllCheckbox).toBeHidden()
        await expect(todoPage.filters.all).toBeHidden()
        await expect(todoPage.filters.active).toBeHidden()
        await expect(todoPage.filters.completed).toBeHidden()
        await expect(todoPage.tasksContainer).toBeHidden()
        await expect(todoPage.taskCounter).toBeHidden()
    })

    test("default state of footer when there are no tasks in this filter", async ({ todoPage }) => {
        // Create 1 task and complete it
        await todoPage.addNewTask(text1)
        await todoPage.check(todoPage.allTasks().first())

        // No tasks is the Active filter, check footer
        await todoPage.filterActiveTasks()
        await expect(todoPage.allTasks().all()).resolves.toHaveLength(0)
        await expect(todoPage.taskCounter).toHaveText("0 items left")
        await expect(todoPage.clearCompletedButton).toBeVisible()
        await expect(todoPage.toggleAllCheckbox).toBeVisible()
        await expect(todoPage.filters.all).toBeVisible()
        await expect(todoPage.filters.completed).toBeVisible()
    })

    test("'Clear completed' is not visible when no tasks are completed", async ({ todoPage }) => {
        // Create 1 task
        await todoPage.addNewTask(text1)
        await expect(todoPage.clearCompletedButton).toBeHidden()

        // Complete the task
        await todoPage.check(todoPage.allTasks().first())
        await expect(todoPage.clearCompletedButton).toBeVisible()
    })

    test("currently selected filter is highlighted", async ({ todoPage }) => {
        todoPage.addNewTask(text1)

        await expect(todoPage.filters.all).toHaveClass("selected")
        await expect(todoPage.filters.active).not.toHaveClass("selected")
        await expect(todoPage.filters.completed).not.toHaveClass("selected")

        await todoPage.filterActiveTasks()
        await expect(todoPage.filters.all).not.toHaveClass("selected")
        await expect(todoPage.filters.active).toHaveClass("selected")
        await expect(todoPage.filters.completed).not.toHaveClass("selected")

        await todoPage.filterCompletedTasks()
        await expect(todoPage.filters.all).not.toHaveClass("selected")
        await expect(todoPage.filters.active).not.toHaveClass("selected")
        await expect(todoPage.filters.completed).toHaveClass("selected")
    })

    test("completed tasks styling - strikethrough and dimmed text", async ({ todoPage }) => {
        // Arrange: add 2 tasks, complete one of them
        await todoPage.addNewTask(text1)
        await todoPage.addNewTask(text2)
        await todoPage.check(todoPage.task(0))

        await expect(todoPage.allTasks().nth(0).locator("label")).toHaveCSS(
            "text-decoration",
            "line-through solid rgb(217, 217, 217)"
        )
        await expect(todoPage.allTasks().nth(0)).toHaveCSS("color", "rgb(77, 77, 77)")
        await expect(todoPage.allTasks().nth(1)).not.toHaveCSS("text-decoration", "line-through")
        await expect(todoPage.allTasks().nth(1)).not.toHaveCSS("color", "rgb(186, 189, 182)")
    })

    test("delete button visible only on hover", async ({ page, todoPage }) => {
        // Arrange: add 2 tasks
        await todoPage.addNewTask(text1)
        await todoPage.addNewTask(text2)

        const task1 = todoPage.allTasks().nth(0)
        const task2 = todoPage.allTasks().nth(1)

        // delete button is not visible when task is not hovered
        await expect(todoPage.deleteButton(task1)).toBeHidden()

        // delete button appears when task is hovered
        await task1.hover()
        await expect(todoPage.deleteButton(task1)).toBeVisible()
        await expect(todoPage.deleteButton(task2)).toBeHidden()

        // delete button disappears when mouse moves away
        await page.locator("body").click()
        await task2.hover()
        await expect(todoPage.deleteButton(task1)).toBeHidden()
    })

    test("hide other controls when editing task", async ({ todoPage }) => {
        await todoPage.addNewTask(text1)
        await todoPage.addNewTask(text2)

        // start editing a task
        const task1 = todoPage.task(1)
        await task1.dblclick()

        // check the other controls
        await expect(task1.getByRole("checkbox")).toBeHidden()
        await expect(todoPage.deleteButton(task1)).toBeHidden()
    })
})
