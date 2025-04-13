import { test as base } from "@playwright/test"
import { MainPage } from "../pages/mainPage"

type TodoMVCFixtures = {
    todoPage: MainPage
}

export const test = base.extend<TodoMVCFixtures>({
    todoPage: async ({ page }, use) => {
        const todoPage = new MainPage(page)
        await use(todoPage)
    },
})

export { expect } from "@playwright/test"
