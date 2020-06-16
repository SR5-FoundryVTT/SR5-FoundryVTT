// game settings for shadowrun 5e

import { VersionMigration } from './migrator/VersionMigration';

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

    game.settings.register('shadowrun5e', 'displayDefaultRollCard', {
        name: 'SETTINGS.DisplayDefaultRollCardName',
        hint: 'SETTINGS.DisplayDefaultRollCardDescription',
        scope: 'user',
        config: true,
        type: Boolean,
        default: false,
    });

    game.settings.register('shadowrun5e', VersionMigration.KEY_DATA_VERSION, {
        name: 'System Data Version.',
        scope: 'world',
        config: false,
        type: String,
        default: '0',
    })
};
