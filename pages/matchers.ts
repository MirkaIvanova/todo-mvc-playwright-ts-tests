import { expect } from "@playwright/test"

expect.extend({
    async toBeCompleted(received) {
        const locator =
            typeof received === "object" && received !== null && "getAttribute" in received ? received : received

        const classes = await locator.getAttribute("class")
        const isCompleted = classes?.includes("completed") ?? false

        return {
            pass: isCompleted,
            message: () =>
                isCompleted
                    ? `Expected element not to have 'completed' class, but it did`
                    : `Expected element to have 'completed' class, but it didn't`,
        }
    },
})

export { expect }
