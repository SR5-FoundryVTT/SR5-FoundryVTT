import { RollEnricherDialog } from "../dialogs/RollEnricherDialog";
import { Helpers } from "../../helpers";

/**
 * Utility class to configure and handle custom ProseMirror dropdown menus
 */
export class EditorDropdowns {
    // @ts-expect-error
    private static ProseMirror = foundry.prosemirror;

    private static menu: any;

    private static rollTypeOptions = [
        "action",
        "attribute",
        "macro",
        "skill",
        "teamwork"
    ] as const;

    private static testTypeOptions = [
        "success",
        "extended",
        "opposed",
    ] as const;

     /**
     * Registers hooks to extend the ProseMirror editor with roll-enricher dropdowns.
     */
    static setProseMirrorDropdowns(): void {
        Hooks.on(
            "getProseMirrorMenuDropDowns",
            (menu: any, dropdowns: Record<string, any>) => {
                this.menu = menu;
                this.setRollEnricherDropdown(dropdowns);
                return dropdowns;
            }
        );
    }

    /**
     * Populates the roll enricher dropdown entries based on configured roll and test types.
     *
     * @param dropdowns - The existing dropdown menus to augment.
     */
    private static setRollEnricherDropdown(
        dropdowns: Record<string, any>
    ): void {
        dropdowns["@Roll"] = {
            title: "@Roll",
            icon: '<span class="fa-stack fa-2x"><i class="fas fa-dice-d6 fa-stack-1x"></i><i class="fas fa-dice-d6 fa-stack-1x" style="transform: translate(0.4em,0.4em);"></i></span>',
            entries: [
                ...this.rollTypeOptions
                    .map((rt) => ({
                        action: `helper-roll-${rt}`,
                        title: `@Roll${Helpers.capitalizeFirstLetter(rt)}`,
                        cmd: async () =>
                            this.addElement(
                                await new RollEnricherDialog(rt).select()
                            ),
                    })),
                {
                    action: "helper-roll-test",
                    title: "@RollTest",
                    children: this.testTypeOptions.map((tt) => ({
                        action: `helper-roll-${tt}`,
                        title: `${Helpers.capitalizeFirstLetter(tt)}`,
                        cmd: async () =>
                            this.addElement(
                                await new RollEnricherDialog(tt).select()
                            ),
                    })),
                },
            ],
        };
    }

    /**
     * Inserts HTML content into the ProseMirror editor at the current selection.
     *
     * @param htmlString - The HTML string to parse and insert.
     */
    private static addElement(htmlString: string) {
        if (!htmlString) return;
        const parser = this.ProseMirror.DOMParser.fromSchema(this.ProseMirror.defaultSchema);
        const slice = parser.parseSlice(new DOMParser().parseFromString(htmlString, "text/html").body);

        const view = this.menu.view;
        const { state, dispatch } = view;
        const { from, to } = state.selection;
        dispatch(state.tr.replaceRange(from, to, slice));
        view.focus();
    }
}
