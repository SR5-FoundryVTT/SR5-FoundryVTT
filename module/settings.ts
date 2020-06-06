// game settings for shadowrun 5e

export const registerSystemSettings = () => {
    /**
     * Track system version upon which a migration was last applied
     */
    game.settings.register('shadowrun5e', 'systemMigrationVersion', {
        name: 'System Migration Version',
        scope: 'world',
        config: false,
        type: String,
        default: '',
    });

    /**
     * Register diagonal movement rule setting
     */
    game.settings.register('shadowrun5e', 'diagonalMovement', {
        name: 'SETTINGS.DiagonalMovementName',
        hint: 'SETTINGS.DiagonalMovementDescription',
        scope: 'world',
        config: true,
        type: String,
        default: '1-2-1',
        choices: {
            '1-1-1': 'SETTINGS.IgnoreDiagonal',
            '1-2-1': 'SETTINGS.EstimateDiagonal',
        },
        onChange: (rule) => (canvas.grid.diagonalRule = rule),
    });

    /**
     * Default limit behavior
     */
    game.settings.register('shadowrun5e', 'applyLimits', {
        name: 'SETTINGS.ApplyLimitsName',
        hint: 'SETTINGS.ApplyLimitsDescription',
        scope: 'world',
        config: true,
        type: Boolean,
        default: true,
    });
};
