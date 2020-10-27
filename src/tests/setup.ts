import { Page } from "playwright";

const BASEURL: String = "http://localhost:30000/"

export const CONFIG = {
    worldName: "test-world",
    adminPassword: "123456789"
}

export abstract class FoundryPage {
    page: Page

    constructor(page: Page) {
        this.page = page
    }

    abstract async toSetup(): Promise<SetupPage>;
}

/** The page that requires entering of the admin key */
export class PreSetupPage extends FoundryPage {
    static subpath: string = "setup"

    async login(password: string) {
        await page.goto('http://localhost:30000/')
        await page.type("#key", password)
        await page.keyboard.press("Enter")
        await page.waitForNavigation()
    }

    /** Find out if this page is the Setup or the page asking for the adminkey.
     *
     * Both setup & adminkey have the same url
     */
    static async isLogin(): Promise<Boolean> {
        let adminKey = await page.$("#key")
        if (adminKey) {
            return Promise.resolve(true)
        } else {
            return Promise.resolve(false)
        }
    }

    async toSetup(): Promise<SetupPage> {
        await this.login(CONFIG.adminPassword)
        return Promise.resolve(new SetupPage(this.page))
    }
}

/** The page that requires entering of the admin key */
export class GamePage extends FoundryPage {
    static subpath: string = "game"

    // TODO: This is the first method only applicable to the Shadowrun system
    // and should be composed out.
    async runMigration(): Promise<GamePage> {
        try {
            await this.page.waitForSelector("h2 >> text=Migration Warning", {timeout: 5000})
        } catch (e) {
            console.debug("No migration dialog found - not running migration.")
            // Migration probably already ran
            return Promise.resolve(this)
        }
        // Start a migration
        await Promise.all(
            [this.page.click("button >> text=Begin Migration"),
             this.page.waitForNavigation()]
        )
        // Migration is complete
        await Promise.all(
            [this.page.waitForSelector("h2 >> text=Migration Complete"),
             this.page.click("button >> text=Close"),
             this.page.waitForNavigation()]
        )
        return Promise.resolve(this)
    }

    async createActor(data: {}): Promise<GamePage> {
        let actor = this.page.evaluate(() => {
            Actor.create(data)
        })
        await actor
        return Promise.resolve(this)
    }

    async toSetup(): Promise<SetupPage> {
        return Promise.resolve(new SetupPage(this.page))
    }
}

/** The page that allow downloading systems/creating worlds */
export class SetupPage extends FoundryPage {
    static subpath: string = "setup"

    /** Delete the given game.
     * @return true is deleted successfully, false otherwise
     */
    async deleteGame(gameName: string): Promise<Boolean> {
        return Promise.resolve(false)
    }

    async createWorld(worldName: string) {
        await this.page.waitForSelector("#create-world")
        await this.page.click("#create-world")

        let titleSelector = "input[name=title]"
        let nameSelector = "input[name=name]"
        let systemSelector = "select[name=system]"
        await this.page.type(titleSelector, worldName)
        await this.page.type(nameSelector, worldName)
        await this.page.selectOption(systemSelector, "shadowrun5e")
        console.log("Creating world")
        await this.page.click("button[type=submit] >> text=Create World")
    }

    async launchWorld(worldName: string): Promise<LoginPage> {
        console.log("Launching world")
        let worldSelector = `button[name=action][value=launchWorld][data-world=${worldName}]`
        await Promise.all(
            [page.click(worldSelector),
             page.waitForNavigation()]
        )
        return Promise.resolve(new LoginPage(this.page))
    }

    async toSetup(): Promise<SetupPage> {
        return Promise.resolve(new SetupPage(this.page))
    }
}

/** The page that requires entering of the admin key */
export class LoginPage extends FoundryPage {
    static subpath: string = "join"

    async loginWorld(player: string, password: string): Promise<GamePage|Error> {
        console.log("Login world")
        let playerSelector = 'select[name=userid]'
        let passwordSelector = 'input[name=password]'
        let joinButton = 'button[type=submit][name=submit][data-action=join]'
        await Promise.all([page.waitForSelector(playerSelector),
                           page.waitForSelector(passwordSelector)])
        const option = await page.$('//select[@name = "userid"]/option[text() = "' + player + '"]');
        if (option == null) { return Promise.resolve(new Error("Could not find user to login")) }
        let optionValue = await option.getProperty('value')
        const value = await optionValue.jsonValue()
        await Promise.all([this.page.selectOption(playerSelector, value as string),
                           this.page.type(passwordSelector, password),
                           this.page.click(joinButton),
                           this.page.waitForNavigation()])
        return Promise.resolve(new GamePage(this.page))
    }

    async toSetup(): Promise<SetupPage> {
        let adminKeyInput = 'input[name=adminKey]'
        let returnToSetupButton = 'button[type=submit][name=submit][data-action=shutdown]'
        await Promise.all([
            this.page.type(adminKeyInput, CONFIG.adminPassword),
            this.page.click(returnToSetupButton),
            this.page.waitForNavigation()
        ])
        return Promise.resolve(new SetupPage(this.page))
    }
}

/** Find out which page is currently active */
export async function detectPage(): Promise<FoundryPage|Error> {
    await Promise.all([
        page.goto('http://localhost:30000/'),
        page.waitForNavigation()
    ])
    console.log("Waited")
    let url = page.url()
    var currentPage;
    switch(url) {
            case BASEURL + LoginPage.subpath: {
                currentPage = new LoginPage(page)
                break
            }
            case BASEURL + GamePage.subpath: {
                currentPage = new GamePage(page)
                break
            }
            case BASEURL + SetupPage.subpath: {
                let isLogin = await PreSetupPage.isLogin()
                if (isLogin) {
                    currentPage = new PreSetupPage(page)
                    break
                }
                currentPage = new SetupPage(page)
                break
            }
            default: {
                currentPage = new Error()
            }
    }
    console.log("Current page: ", currentPage)
    return Promise.resolve(currentPage)
}
