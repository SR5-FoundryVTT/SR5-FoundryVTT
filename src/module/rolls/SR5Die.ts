import Terms = foundry.dice.terms;

export class SR5Die extends Terms.Die {
    static override DENOMINATION = "s" as const;
    static SR5Modifiers = ['cf=1', 'cs>=5'] as readonly string[];

    // Add SR5 specific modifiers to the expression
    constructor(options: ConstructorParameters<typeof Terms.Die>[0]) {
        options ??= {};
        options.modifiers ??= [];
        options.modifiers = options.modifiers.filter(mod => !['cs', 'cf'].includes(mod));
        options.modifiers.push(...SR5Die.SR5Modifiers);
        options.faces = 6;
        super(options);
    }

    // Remove SR5 specific modifiers from the expression
    override get expression(): string {
        const modifiers = this.modifiers.filter(mod => !SR5Die.SR5Modifiers.includes(mod));
        return `${this._number}d${SR5Die.DENOMINATION}${modifiers.join("")}`;
    }
}
