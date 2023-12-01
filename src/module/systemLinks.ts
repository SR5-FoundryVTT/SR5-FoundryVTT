/**
 * Add a few system links to the settings sidebar menu for easier access and better visibility by users.
 */
import localize from './utils/strings';

export const RenderSettings = {
    listen: () => {
        Hooks.on("renderSettings", async (_app, $html) => {
            const html = $html[0]!;
            
            const systemRow = html.querySelector('.settings-sidebar li.system');
            const systemInfo = systemRow?.cloneNode(false);

            if (!(systemInfo instanceof HTMLLIElement)) {
                throw Error("Unexpected error attach system information to settings sidebar");
            }

            systemInfo.classList.remove('system');
            systemInfo.classList.add('system-links');

            const links = [
                {
                    url: "https://github.com/SR5-FoundryVTT/SR5-FoundryVTT/releases/latest/",
                    label: "SR5.Labels.Sidebar.Changelog",
                },
                {
                    url: "https://github.com/SR5-FoundryVTT/SR5-FoundryVTT/issues/",
                    label: "SR5.Labels.Sidebar.Issues",
                },
                {
                    url: "http://sr5-foundryvtt.privateworks.com/index.php/Main_Page",
                    label: "SR5.Labels.Sidebar.Wiki",
                },
            ].map((data): HTMLAnchorElement => {
                const anchor = document.createElement('a');
                anchor.href = data.url;
                anchor.innerText = game.i18n.localize(data.label);
                anchor.target = "_blank";
                return anchor;
            });
            systemInfo.append(...links);
            systemRow?.after(systemInfo);
        });
    }
}