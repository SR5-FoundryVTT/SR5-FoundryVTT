import { FormDialogOptions } from "../dialogs/FormDialog";
import { RollEnricherDialog } from "../dialogs/RollEnricherDialog";



/**
 * Statische Klasse zum Hinzufügen individueller Editor-Buttons
 */
export class EditorButtons {

  /**
   * Führt alle Button-spezifischen Methoden aus
   */
  static applyAllButtons(html: JQuery<HTMLElement>): void {
    EditorButtons.addRollButton(html);
    // In Zukunft: EditorButtons.addAnotherButton(html);
  }

  /**
   * Fügt den Roll-Button zur Toolbar hinzu
   */
  static addRollButton(html: JQuery<HTMLElement>): void {
    if (html.data("roll-btn-added")) return;
    html.data("roll-btn-added", true);

    const btn = $('<button type="button" class="editor-button insert-roll" title="Roll einfügen"><i class="fas fa-dice-d20"></i></button>');
    btn.on("click", () => EditorButtons.openRollDialog());
    html.find(".editor-toolbar .editor-controls").append(btn);
  }

  /**
   * Öffnet den Dialog zur Auswahl und Eingabe der Roll-Parameter
   */
  static async openRollDialog(): Promise<void> { 
    // const dialogData = await new RollEnricherDialog(.select();
  }
}
