// jest-playwright.config.js
module.exports = {
    launchOptions: {
        headless: false,
        devtools: false,
        slMo: 0
    },
    options: {
        viewport: {
            width: 1920,
            height: 1080
        }
    }
}
