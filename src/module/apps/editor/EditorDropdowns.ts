import { RollEnricherDialog } from "../dialogs/RollEnricherDialog";
import { Helpers } from "../../helpers";

export class EditorDropdowns {
    // ProseMirror-API ist auf `foundry.prosemirror` verfügbar
    // @ts-expect-error: foundry.prosemirror lacks type declarations
    private static ProseMirror = foundry.prosemirror;

    /** Referenz auf das gerade verwendete ProseMirrorMenu */
    private static menu: any;

    /** Die sechs Roll-Typen */
    private static rollTypeOptions = [
        "action",
        "attribute",
        "macro",
        "skill",
        "teamwork"
    ] as const;

    /** Die drei Test-Untertypen */
    private static testTypeOptions = [
        "success",
        "extended",
        "opposed",
    ] as const;

    /** Muss im `init`-Hook einmalig aufgerufen werden */
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

    /** Baut das `@Roll`-Dropdown dynamisch auf */
    private static setRollEnricherDropdown(
        dropdowns: Record<string, any>
    ): void {
        dropdowns["@Roll"] = {
            title: "@Roll",
            icon: '<span class="fa-stack fa-2x"><i class="fas fa-dice-d6 fa-stack-1x"></i><i class="fas fa-dice-d6 fa-stack-1x" style="transform: translate(0.4em,0.4em);"></i></span>',
            entries: [
                // 1) Flache Einträge für action, attribute, macro, skill, teamwork
                ...this.rollTypeOptions
                    .map((rt) => ({
                        action: `helper-roll-${rt}`,
                        title: `@Roll${Helpers.capitalizeFirstLetter(rt)}`,
                        cmd: async () =>
                            this.addElement(
                                await new RollEnricherDialog(rt).select()
                            ),
                    })),
                // 2) Verschachtelter Block für "test"
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

    private static addElement(htmlString: string) {
        if (!htmlString) return;
        // 1) Verwende den DOMParser aus deinem Schema
        const parser = this.ProseMirror.DOMParser.fromSchema(this.ProseMirror.defaultSchema);
        // 2) Parse den String als Inline-Slice (nicht als ganzen Block)
        const slice = parser.parseSlice(new DOMParser().parseFromString(htmlString, "text/html").body);

        const view = this.menu.view;
        const { state, dispatch } = view;
        const { from, to } = state.selection;
        // 3) Füge nur den Inline-Slice ein (ersetzt ggf. Auswahl)
        dispatch(state.tr.replaceRange(from, to, slice));
        view.focus();
    }
}
