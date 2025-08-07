import { FormDialog, FormDialogData, FormDialogOptions } from "./FormDialog";
import { SR5Actor } from "../../actor/SR5Actor";
import { AttributeEntry, LimitEntry, SkillEntry, SkillGroup, TeamworkData, TeamworkFlow } from "../../actor/flows/TeamworkFlow";
import { SR5 } from "../../config";
import { FLAGS, SYSTEM_NAME } from "@/module/constants";

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
      // Prevent automatic form data binding on submit; we apply changes manually in onAfterClose
    options.applyFormChangesOnSubmit = false;

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
    const showAllowOtherSkills = game.settings.get(SYSTEM_NAME, FLAGS.AllowDifferentSkillForTeamworkTests) as boolean;
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
      content: "",
      buttons 
    };

    super(data, options);

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
    const data = super.getData() as unknown as TeamWorkDialogData;

    if (!this.baseActors) {
      this.baseActors = this.data.templateData.actors;
      this.baseSkills = TeamworkFlow.buildSkillGroups(this.data.templateData.actor);
    }
    this.data.templateData.skills = this.baseSkills;
    return data;
  }

  override activateListeners(html: JQuery) {
    super.activateListeners(html);
    const data = this.data.templateData;

    const limitBaseInput = html.find<HTMLInputElement>('input[name="limit.base"]');
    const LimitNameInput = html.find<HTMLSelectElement>('select[name="limit.name"]');

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

    limitBaseInput.trigger('input');
    LimitNameInput.trigger('change');
  }


  override get title(): string {
    return "SR5.DIALOG.Teamwork.Title";
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
        if (!actor) return;
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
        const skillId = el.value;
        const newSkill: SkillEntry = this.baseSkills
          .flatMap(g => g.skills)
          .find(s => s.id === skillId)!;
          
        data.skill = newSkill;
        data.attribute = { name: newSkill.attribute, label: SR5.attributes[newSkill.attribute] };
        if (data.limit) data.limit.name = newSkill.limit;
        if (data.limit) data.limit.label = SR5.limits[newSkill.limit];

        await this.render();
        return;

      case 'attribute':
        const attributeKey = el.value;
        const attributes = TeamworkFlow.buildAttributeList(this.data.templateData.actor);
        const attribute = attributes.find(a => a.name === attributeKey)
          ?? attributes.find(a => a.label === attributeKey);
        if (attribute) {
          data.attribute = attribute;
        }
        return;

      case 'limit.name':
        const limitKey = el.value;
        const limits = TeamworkFlow.limitList;
        const limit = limits.find(a => a.name === limitKey)
          ?? limits.find(a => a.label === limitKey);
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
}
