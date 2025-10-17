import Terms = foundry.dice.terms;

export class SR5Die extends Terms.Die {
    static override DENOMINATION = 's' as const;
    static sr5Modifiers = ['cf=1', 'cs>=5'] as readonly string[];

    // Add SR5 specific modifiers to the expression
    constructor(options?: ConstructorParameters<typeof Terms.Die>[0]) {
        options ??= {};
        options.modifiers ??= [];
        // Remove any existing 'cs' or 'cf' modifiers (e.g. 'cs>=5', 'cf=1')
        options.modifiers = options.modifiers.filter(m => !/^c[sf]/.test(m));
        options.modifiers.push(...SR5Die.sr5Modifiers);
        options.faces = 6;
        super(options);
    }

    // Remove SR5 specific modifiers from the expression
    override get expression(): string {
        const modifiers = this.modifiers.filter(mod => !/^c[sf]/.test(mod));
        return `${this._number}d${SR5Die.DENOMINATION}${modifiers.join('')}`;
    }

    static getResultCSS(...args: Parameters<Terms.Die['getResultCSS']>) {
        return new SR5Die().getResultCSS(...args);
    }
}
