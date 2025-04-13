export class BasePage {
    constructor(protected readonly page) {}

    async goto(path = "/todomvc/") {
        await this.page.goto(`${path}`)
    }
}
