import { type Locator, type Page } from "@playwright/test"

// TODO_ITEMS

export class MainPage {
    readonly page: Page
    readonly newTaskInput: Locator
    readonly taskCounter: Locator
    readonly clearCompletedButton: Locator
    readonly toggleAllCheckbox: Locator
    readonly filters: {
        all: Locator
        active: Locator
        completed: Locator
    }

    readonly tasksContainer: Locator

    constructor(page: Page) {
        this.page = page
        this.newTaskInput = page.getByPlaceholder("What needs to be done?")
        this.taskCounter = page.locator(".todo-count")
        this.tasksContainer = page.locator(".todo-list")
        this.clearCompletedButton = page.getByRole("button", { name: "Clear completed" })
        this.toggleAllCheckbox = page.getByLabel("Mark all as complete")
        this.filters = {
            all: page.getByRole("link", { name: "All" }),
            active: page.getByRole("link", { name: "Active" }),
            completed: page.getByRole("link", { name: "Completed" }),
        }
    }

    // @mii getter
    // @mii rename to task to be consistent with other getters
    getTask(selector: string | number): Locator {
        if (typeof selector === "string") {
            return this.tasksContainer.locator("li").filter({ hasText: selector })
        } else {
            return this.tasksContainer.locator("li").nth(selector)
        }
    }

    taskEditInput(task: Locator): Locator {
        return task.getByRole("textbox", { name: "Edit" })
    }

    allTasks(): Locator {
        return this.tasksContainer.locator("li")
    }

    completedTasks(): Locator {
        return this.tasksContainer.locator("li.completed")
    }

    activeTasks(): Locator {
        return this.tasksContainer.locator("li:not(.completed)")
    }

    deleteButton(task: Locator): Locator {
        return task.locator("button.destroy")
    }

    async goto() {
        await this.page.goto("https://demo.playwright.dev/todomvc")
    }

    async addNewTask(taskText: string): Promise<Locator> {
        await this.newTaskInput.fill(taskText)
        await this.newTaskInput.press("Enter")

        // Return the locator for the newly added task
        return this.getTask(taskText)
    }

    async editTask(task: Locator, newText: string) {
        await task.dblclick()
        await this.taskEditInput(task).fill(newText)
        await this.taskEditInput(task).press("Enter")
    }

    async deleteTask(task: Locator) {
        await task.hover()
        await this.deleteButton(task).click()
    }

    async check(task: Locator) {
        await task.getByRole("checkbox").check()
    }

    async uncheck(task: Locator) {
        await task.getByRole("checkbox").uncheck()
    }

    async isChecked(locator: Locator): Promise<boolean> {
        const checkbox = locator.getByRole("checkbox")
        return await checkbox.isChecked()
    }

    async isCompleted(locator: Locator): Promise<boolean> {
        const classes = await locator.getAttribute("class")
        return classes?.includes("completed") ?? false
    }

    async clearCompletedTasks() {
        await this.clearCompletedButton.click()
    }

    async toggleAllTasks() {
        await this.toggleAllCheckbox.click()
    }

    async filterAllTasks() {
        await this.filters.all.click()
    }

    async filterActiveTasks() {
        await this.filters.active.click()
    }

    async filterCompletedTasks() {
        await this.filters.completed.click()
    }
}
