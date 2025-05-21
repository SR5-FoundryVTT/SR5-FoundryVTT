import { FormDialog, FormDialogData, FormDialogOptions } from "./FormDialog";
import { SR5Actor } from "../../actor/SR5Actor";
import { SkillEntry, SkillGroup, TeamworkFlow } from "../../actor/flows/TeamworkFlow";
import { SR5 } from "../../config";

export interface TeamWorkDialogData extends FormDialogData {
  /** Liste aller wählbaren Akteure */
  actors: SR5Actor[];
  /** Aktuell ausgewählter Akteur */
  selectedActor: SR5Actor;
  /** Gruppierte und sortierte Skills des ausgewählten Akteurs */
  skills: SkillGroup[];
  /** Sortierte Attribute des ausgewählten Akteurs */
  attributes: Shadowrun.Attributes;
  /** Aktuell ausgewählter Skill */
  selectedSkill?: SkillEntry;
  /** Aktuell ausgewähltes Attribut */
  selectedAttribute?: Shadowrun.ActorAttribute;
  /** Vorgeschlagener Schwellenwert */
  threshold: number;
  /** Checkbox: auch andere Skills erlauben */
  allowOtherSkills: boolean;
  /** Filter-String für Live-Suche */
  filter: string;
  /** Soll die Checkbox angezeigt werden? */
  showAllowOtherSkills: boolean;
  limitNumber: number;
  limitSelect: string;
  limits: Record<string, string>;
  request: boolean;
  specialization: boolean;
}




export class TeamWorkDialog extends FormDialog {
  override data: TeamWorkDialogData;
  private baseActors: SR5Actor[];
  private baseSkills: SkillGroup[];
  private filter: string;
  private lockedSkill: boolean;


  constructor(
    teamworkData: {
      actors?: SR5Actor[];
      selectedActor?: SR5Actor;
      selectedSkill?: string;
      selectedAttribute?: string;
      threshold?: number;
      allowOtherSkills?: boolean;
      limit?: string | number;
      request: boolean;
      lockedSkill: boolean
    },
    // @ts-expect-error // TODO: default option value with all the values...
    options: FormDialogOptions = {}) {
    options.applyFormChangesOnSubmit = true;

    const actors = teamworkData.actors ?? game.actors?.filter(actor => actor.testUserPermission(game.user!, "OWNER")) ?? [];
    const selectedActor = teamworkData.selectedActor ?? actors[0] ?? null;
    const attributes = selectedActor
      ? TeamworkFlow.buildAttributesList(selectedActor)
      : [];
    const skills = TeamworkFlow.buildSkillsList(selectedActor);
    const selectedSkill = teamworkData.selectedSkill
      ? skills
        .flatMap(group => group.skills)
        .find(s => s.label === teamworkData.selectedSkill || s.id === teamworkData.selectedSkill)
      : undefined;
    const selectedAttribute = teamworkData.selectedAttribute
      ? attributes.find(a => a.name === teamworkData.selectedAttribute || a.label === teamworkData.selectedAttribute)
      : undefined;

    const threshold = teamworkData.threshold ?? 0;
    const showAllowOtherSkills = true;
    const allowOtherSkills = showAllowOtherSkills;
    const limit = teamworkData.limit ?? selectedSkill?.defaultLimit ?? ''
    const request = teamworkData.request;
    const lockedSkill = teamworkData.lockedSkill;

    const templateData = {
      actors: actors,
      selectedActor: selectedActor,
      attributes,
      skills: skills,
      selectedAttribute,
      selectedSkill: selectedSkill,
      threshold: threshold,
      showAllowOtherSkills: showAllowOtherSkills,
      allowOtherSkills: allowOtherSkills,
      filter: '',
      limitNumber: typeof limit === "number" ? limit : undefined,
      limitSelect: typeof limit === "string" ? limit : '',
      limits: SR5.limits,
      request: request,
      lockedSkill: lockedSkill,
      specialization: false
    };

    const buttons = {
      roll: { label: game.i18n.localize("SR5.Roll"), icon: '<i class="fas fa-handshake"></i>' },
      cancel: { label: game.i18n.localize("SR5.Dialogs.Common.Cancel") }
    };

    const data: FormDialogData = {
      templateData,
      templatePath: "systems/shadowrun5e/dist/templates/apps/dialogs/teamwork-dialog.html",
      title: "Teamwork",
      content: "",      // bleibt leer, wird vom Template befüllt
      buttons        // Buttons hier  
    };

    super(data, options);

    console.log(data);

    // Initialisiere Deine Caches
    this.baseActors = actors;
    this.baseSkills = TeamworkFlow.buildSkillsList(selectedActor);
  }

  static override get defaultOptions() {
    const options = super.defaultOptions;
    options.id = 'teamwork-dialog';
    options.classes = ['sr5', 'form-dialog'];
    options.resizable = true;
    options.height = 'auto';
    // @ts-expect-error width:auto
    options.width = 'auto';
    return options;
  }

  override get templateContent(): string {
    return 'systems/shadowrun5e/dist/templates/apps/dialogs/teamwork-dialog.html';
  }

  override getData(): TeamWorkDialogData {
    const data = super.getData() as unknown as TeamWorkDialogData;

    if (!this.baseActors) {
      this.baseActors = this.data.actors;
      this.baseSkills = TeamworkFlow.buildSkillsList(this.data.selectedActor);
    }
    this.data.skills = this.baseSkills;
    return data;
  }

  override activateListeners(html: JQuery) {
    super.activateListeners(html);

    const numberInput = html.find<HTMLInputElement>('input[name="limitNumber"]');
    const selectInput = html.find<HTMLSelectElement>('select[name="limitSelect"]');

    // Sobald im Zahlenfeld etwas steht, wird das Dropdown deaktiviert
    numberInput.on('input', () => {
      const val = numberInput.val() as string;
      selectInput.prop('disabled', val.trim() !== '');
    });

    // Initialer Zustand
    numberInput.trigger('input');
  }


  override get title(): string {
    return "Teamwork";
  }

  override get buttons() {
    return {
      roll: { label: game.i18n.localize('SR5.Roll'), icon: '<i class="fas fa-dice-six"></i>' },
      cancel: { label: game.i18n.localize('SR5.Dialogs.Common.Cancel') }
    };
  }

  override onAfterClose(html: JQuery<HTMLElement>): object {

    const {
      selectedActor,
      selectedSkill,
      selectedAttribute,
      actors,
      attributes,
      filter,
      limits,
      skills,
      limitNumber,
      limitSelect,
      ...keep
    } = this.data.templateData as any;

    // Gib nur die übrigen Felder plus das limit zurück
    return {
      ...keep,
      limit: limitNumber != null && limitNumber !== "" ? limitNumber : limitSelect,
      actor: selectedActor,
      skill: selectedSkill,
      attribute: selectedAttribute
    };
  }

  override _emptySelection(): object {
    return {
      actor: this.data.selectedActor,
      attribute: this.data.selectedAttribute,
      skill: this.data.selectedSkill,
      threshold: this.data.threshold,
      limit: this.data.limitNumber ? this.data.limitNumber : this.data.limitSelect,          // neu
      allowOtherSkills: this.data.allowOtherSkills,
      specialization: this.data.specialization
    };
  }

  override async _onChangeInput(event: any): Promise<void> {
    const el = event.target as HTMLSelectElement;
    const name = el.name;
    const data = this.data.templateData as TeamWorkDialogData;

    if (name === 'actor') {
      const uuid = el.value;

      console.log("Uuid: ", uuid)

      const actor = this.baseActors.find(a => a.uuid === uuid);
      if (!actor) return;                  // falls nichts gefunden wurde, abbrechen
      data.selectedActor = actor;

      this.baseSkills = TeamworkFlow.buildSkillsList(actor);
      data.skills = this.baseSkills;

      data.filter = '';
      data.actors = this.baseActors;

      console.log("Actor wurde ausgewählt: ", data.selectedActor)

      await this.render();
      return;
    }
    if (name === 'filter') {
      data.filter = el.value;

      const term = data.filter.trim().toLowerCase();
      const filtered = this.baseActors.filter(a => (a.name ?? '').toLowerCase().includes(term));

      if (!filtered.some(a => a.uuid === data.selectedActor.uuid)) {
        filtered.unshift(data.selectedActor);
      }
      data.actors = filtered;
      await this.render();
      return
    }
    if (name === 'selectedSkill.id') {
      // 1) Finde den neuen SkillEntry
      const skillId = el.value;
      const newSkill = this.baseSkills
        .flatMap(g => g.skills)
        .find(s => s.id === skillId)!;

      // 2) Setze Attribut und Limit
      data.selectedSkill = newSkill;
      data.selectedAttribute = newSkill.attribute;
      data.limitSelect = newSkill.defaultLimit;

      // 3) Aktualisiere threshold ggf. auf 0 oder bestaetige alten Wert
      data.threshold = 0;

      // 4) Re-render um UI up-to-date zu halten
      await this.render();
      return;
    }

    await super._onChangeInput(event as any);
  }
}
