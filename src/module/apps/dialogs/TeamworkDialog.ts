import { FormDialog, FormDialogData, FormDialogOptions } from "./FormDialog";
import { SR5Actor } from "../../actor/SR5Actor";
import { AttributeEntry, LimitEntry, LimitKey, SkillEntry, SkillGroup, TeamworkData, TeamworkFlow } from "../../actor/flows/TeamworkFlow";
import { SR5 } from "../../config";

import { Translation } from "../../utils/strings";

export interface TeamWorkDialogData extends Omit<FormDialogData, "templateData"> {
  templateData: {
    actors: SR5Actor[];
    skills: SkillGroup[];
    attributes: AttributeEntry[];
    filter: string;
    limits: LimitEntry[];
    request: boolean;
    specialization: boolean;
    cancelled: boolean;
    showAllowOtherSkills: boolean;
    lockedSkill: boolean;
  } & TeamworkData;
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
      actor?: SR5Actor;
      skill?: SkillEntry;
      attribute?: AttributeEntry;
      threshold?: number;
      allowOtherSkills?: boolean;
      limit?: LimitEntry;
      request?: boolean;
    },
    // @ts-expect-error // TODO: default option value with all the values...
    options: FormDialogOptions = {}) {
    options.applyFormChangesOnSubmit = true;

    const actors = teamworkData.actors ?? game.actors?.filter(actor => actor.testUserPermission(game.user!, "OWNER")) ?? [];
    const actor = teamworkData.actor ?? actors[0] ?? undefined;
    const attributes = actor
      ? TeamworkFlow.buildAttributeList(actor)
      : [];
    const skills = TeamworkFlow.buildSkillGroups(actor);
    const givenSkill: SkillEntry | undefined = teamworkData.skill
      ? skills
        .flatMap(g => g.skills)
        .find(s => s.id === teamworkData.skill?.id || s.label === teamworkData.skill?.id)
      : undefined;
    const skill: SkillEntry = givenSkill ?? skills[0]?.skills[0]!;
    const attributeKey = teamworkData.attribute?.name ?? skill?.attribute
    const attribute = attributes.find(a =>
      a.name === attributeKey || a.label === attributeKey
    );

    const threshold = teamworkData.threshold ?? 0;
    const showAllowOtherSkills = true;
    const allowOtherSkills = Boolean(showAllowOtherSkills && teamworkData.allowOtherSkills);
    const limit = teamworkData.limit?.name != undefined && teamworkData.limit.name !== "" ? teamworkData.limit.name : skill?.limit ?? "";
    const limits = TeamworkFlow.limitList;
    const request = Boolean(teamworkData.request);
    const lockedSkill = !request && (!showAllowOtherSkills || !allowOtherSkills);

    const templateData = {
      actors,
      actor,
      attributes,
      skills,
      attribute,
      skill,
      threshold,
      showAllowOtherSkills,
      allowOtherSkills,
      filter: '',
      limit: {
        name: typeof limit === "string" ? limit : '',
        label: typeof limit === "string" ? limits[limit] : '',
        base: typeof limit === "number" ? limit : undefined
      },
      limits,
      request,
      lockedSkill,
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

    // Initialisiere Deine Caches
    this.baseActors = actors;
    this.baseSkills = TeamworkFlow.buildSkillGroups(actor);
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
    console.log("🔍 Initial this.data.attribute =", this.data.templateData.attribute);
    const data = super.getData() as unknown as TeamWorkDialogData;

    if (!this.baseActors) {
      this.baseActors = this.data.templateData.actors;
      this.baseSkills = TeamworkFlow.buildSkillGroups(this.data.templateData.actor);
    }
    this.data.templateData.skills = this.baseSkills;
    return data;
  }

  // /**
  // * Wurde im Dialog auf „Submit“ geklickt: Form-Daten übernehmen und Dialog schließen.
  // */
  // override async _updateData(formData: Record<string, any>): Promise<void> {
  //   console.log('➤ TeamworkDialog: _updateData', formData);
  //   // Alle Werte ins this.data schreiben, der FormDialog schließt dann automatisch mit this.data
  //   const actor = this.data.actor = (await fromUuid(formData.actor)) as SR5Actor;
  //   this.data.skill = TeamworkFlow.constructSkillEntry(
  //     { id: formData["skill.id"] },
  //     actor
  //   );
  //   this.data.attribute = TeamworkFlow.constructAttributeEntry(
  //     formData.attribute
  //   );
  //   const limitEntry = TeamworkFlow.constructLimitEntry(formData["limit.name"]);
  //   limitEntry.base = Number(formData["limit.base"]);
  //   this.data.limit = limitEntry;

  //   this.data.threshold = Number(formData.threshold);
  //   this.data.allowOtherSkills = Boolean(formData.allowOtherSkills);
  //   this.data.specialization = Boolean(formData.specialization);
  // }

  override activateListeners(html: JQuery) {
    super.activateListeners(html);
    const data = this.data.templateData;

    const limitBaseInput = html.find<HTMLInputElement>('input[name="limit.base"]');
    const LimitNameInput = html.find<HTMLSelectElement>('select[name="limit.name"]');

    // Sobald im Zahlenfeld etwas steht, wird das Dropdown deaktiviert
    limitBaseInput.on('input', () => {
      const val = limitBaseInput.val() as string;
      LimitNameInput.prop('disabled', val.trim() !== '');
    });

    limitBaseInput.on('blur', () => {
      const val = limitBaseInput.val() as string;
      const limit = Number.parseInt(val, 10);
      if (!val || isNaN(limit) || limit < 1) {
        limitBaseInput.val("");
        LimitNameInput.prop('disabled', false);
        // Zugriff auf deine data
        if (data.limit) data.limit.base = undefined;
      } else {
        if (data.limit) data.limit.base = limit;
      }
    });

    // Initialer Zustand
    limitBaseInput.trigger('input');
    LimitNameInput.trigger('change');
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

  override onAfterClose(html: JQuery<HTMLElement>): {
    actor: SR5Actor,
    skill: SkillEntry,
    attribute: AttributeEntry,
    limit?: LimitEntry,
    threshold: number,
    allowOtherSkills: boolean,
    specialization: boolean
  } | undefined {

    if (this.selectedButton === "cancel") {
      return this._emptySelection() as any;
    }

    const {
      actor,
      skill,
      attribute,
      limit,
      threshold,
      allowOtherSkills,
      specialization
    } = this.data.templateData;

    if (!actor || !skill || !attribute) return this._emptySelection() as any;

    console.log("onAfterClose: ", {
      actor: actor,
      skill: skill,
      attribute: attribute,
      limit: limit,
      threshold: threshold ?? 0,
      allowOtherSkills: allowOtherSkills ?? false,
      specialization: specialization ?? false
    })


    return {
      actor: actor,
      skill: skill,
      attribute: attribute,
      limit: limit,
      threshold: threshold ?? 0,
      allowOtherSkills: allowOtherSkills ?? false,
      specialization: specialization ?? false
    };
  }

  override _emptySelection(): object {
    return { cancelled: true };
  }

  override async _onChangeInput(event: any): Promise<void> {
    const el = event.target as HTMLInputElement;
    const name = el.name;
    const data = this.data.templateData;

    switch (name) {
      case 'actor':
        const uuid = el.value;

        const actor = this.baseActors.find(a => a.uuid === uuid);
        if (!actor) return;                  // falls nichts gefunden wurde, abbrechen
        data.actor = actor;

        this.baseSkills = TeamworkFlow.buildSkillGroups(actor);
        data.skills = this.baseSkills;

        data.filter = '';
        data.actors = this.baseActors;

        await this.render();
        return;

      case 'filter':
        data.filter = el.value;

        const term = data.filter.trim().toLowerCase();
        const filtered = this.baseActors.filter(a => (a.name ?? '').toLowerCase().includes(term));

        if (!filtered.some(a => a.uuid === data.actor.uuid)) {
          filtered.unshift(data.actor);
        }
        data.actors = filtered;
        await this.render();
        return

      case 'skill':
        // 1) Finde den neuen SkillEntry
        const skillId = el.value;
        const newSkill: SkillEntry = this.baseSkills
          .flatMap(g => g.skills)
          .find(s => s.id === skillId)!;


        // 2) Setze Attribut und Limit
        data.skill = newSkill;
        data.attribute = { name: newSkill.attribute, label: SR5.attributes[newSkill.attribute] };
        if (data.limit) data.limit.name = newSkill.limit;
        if (data.limit) data.limit.label = SR5.limits[newSkill.limit];

        // 4) Re-render um UI up-to-date zu halten
        await this.render();
        return;

      case 'attribute':
        // Hier fangen wir manuelles Attribut-Ändern ab:
        const attributeKey = el.value;
        // `this.baseActors` kennst Du schon, aber hier brauchst Du die Attributliste:
        const attributes = TeamworkFlow.buildAttributeList(this.data.templateData.actor);
        // finde das Objekt in der Liste
        const attribute = attributes.find(a => a.name === attributeKey)
          ?? attributes.find(a => a.label === attributeKey);
        if (attribute) {
          data.attribute = attribute;
        }
        // kein Re-render nötig, das Dropdown aktualisiert sich selbst
        return;

      case 'limit.name':
        console.log("[onChangeInput] limit.name changed:", el.value);
        const limitKey = el.value;
        const limits = TeamworkFlow.limitList;
        const limit = limits.find(a => a.name === limitKey)
          ?? limits.find(a => a.label === limitKey);
        console.log("[onChangeInput] found limit:", limit);
        if (limit) {
          data.limit = limit;
        }
        return;

      case "specialization":
        data.specialization = el.checked;
        return;

      case "allowOtherSkills":
        data.allowOtherSkills = el.checked;
        return;

      case 'limit.base':
        return;

      default:
        break;
    }

    await super._onChangeInput(event as any);
  }

  override applyFormData(): void {

  }
}
