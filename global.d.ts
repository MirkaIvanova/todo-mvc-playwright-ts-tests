declare namespace PlaywrightTest {
    interface Matchers<R, T> {
        toBeCompleted(): Promise<R>
    }
}
