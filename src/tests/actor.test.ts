import { Page } from "playwright";
import { detectPage, FoundryPage, SetupPage, CONFIG, GamePage } from "./setup"

async function dataMigration(page: Page) {
    await page.click('.dialog-button')
    await page.click('.dialog-button .ok')
}

describe('FoundryVTT', () => {
    beforeAll(async () => {
        console.log("Starting test")
        let page = await detectPage()
        if (page instanceof FoundryPage) {
            let setupPage = await page.toSetup()
            await setupPage.createWorld(CONFIG.worldName)
            let loginPage = await setupPage.launchWorld(CONFIG.worldName)
            let gamePage = await loginPage.loginWorld('Gamemaster', CONFIG.adminPassword)
            switch (gamePage.constructor) {
                    case GamePage: {
                        await (gamePage as GamePage).runMigration()
                        console.log("Created an actor")
                    }
                    case Error: {
                        return
                    }
            }
        } else {
            return
        }
    })

    it('should create a Actor "Test Actor"', async () => {
        console.log("Testcase")
        let gamePage = await detectPage()
        switch (gamePage.constructor) {
                case GamePage:
                    await (gamePage as GamePage).createActor({name: "Test Actor"})
                    let actor = await page.evaluate(() => {
                        return game.actors.find(a => a.name == "Test Actor")
                    })
                    if (actor === null) { throw new Error("Actor not created") }
                    expect(actor.name).toBe("Test Actor")
                case Error: {
                    throw new Error("Wrong page")
                }
        }
    })
})
