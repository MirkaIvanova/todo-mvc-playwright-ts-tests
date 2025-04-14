import { test as base } from "@playwright/test"
import { TodoPage } from "../pages/todoPage"

type TodoMVCFixtures = {
    todoPage: TodoPage
}

export const test = base.extend<TodoMVCFixtures>({
    todoPage: async ({ page }, use) => {
        const todoPage = new TodoPage(page)
        await use(todoPage)
    },
})

export { expect } from "@playwright/test"
