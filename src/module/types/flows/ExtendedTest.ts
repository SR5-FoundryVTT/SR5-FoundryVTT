import { SuccessTestData } from "@/module/tests/SuccessTest";

export type ExtendedTestStatus = 'active' | 'completed' | 'failed' | 'paused' | 'cancelled';

export type ExtendedTestVisibility = 'public' | 'gmAndOwner' | 'selectedUsers' | 'gmOnly';

export type ExtendedIntervalUnit = 'rounds' | 'seconds' | 'minutes' | 'hours' | 'days' | 'weeks' | 'months';

export interface ExtendedTestInterval {
    value: number;
    unit: ExtendedIntervalUnit;
}

export interface ExtendedTestRollEntry {
    hits: number;
    glitch: boolean;
    criticalGlitch: boolean;
    // The final pool value actually rolled.
    poolUsed: number;
    // Real world time (Date.now()).
    timestamp: number;
    // game.time.worldTime at the moment of the roll.
    worldTime: number;
    // Chat message created by the SuccessTest roll.
    messageUuid?: string;
    userId: string;
}

export interface ExtendedTestLogEntry {
    timestamp: number;
    worldTime: number;
    userId: string;
    action: 'create' | 'update' | 'roll' | 'pause' | 'resume' | 'complete' | 'cancel' | 'fail';
    detail?: string;
}

export interface ExtendedTestPermissions {
    visibility: ExtendedTestVisibility;
    // Users allowed to view when visibility is 'selectedUsers'.
    visibleUsers: string[];
    // Additional users allowed to edit. GM and creator are implicit.
    editUsers: string[];
    // Additional users allowed to roll. GM, creator and actor owners are implicit.
    rollUsers: string[];
}

export interface ExtendedTestRecord {
    id: string;
    name: string;
    // Free text about the test, searched alongside the name.
    notes: string;
    // Actor this test belongs to, if any.
    actorUuid?: string;
    creatorUserId: string;

    // Test class name used with TestCreator._getTestClass.
    testType: string;
    // Snapshot of the last rolled test's data. Used to rebuild follow up rolls.
    testData?: SuccessTestData;

    // Starting dice pool of the extended test. Only used while testData is absent, as the
    // snapshot of a registered test is what actually gets rolled. See ExtendedTestRules.nextPool.
    dicePool: number;
    // Apply the cumulative -1 dice pool modifier per roll.
    cumulativeModifier: boolean;
    threshold: number;
    accumulatedHits: number;
    rollCount: number;

    interval: ExtendedTestInterval;
    // Advance world time by the interval after each roll.
    advanceTimeOnRoll: boolean;

    status: ExtendedTestStatus;
    permissions: ExtendedTestPermissions;

    createdAt: number;
    createdWorldTime: number;
    updatedAt: number;
    lastRollWorldTime?: number;
    // Roll count the due message was last posted for. Keeps a rewind and re-advance of world
    // time from announcing the same pending roll twice. See ExtendedTestDueFlow.
    dueAnnouncedRollCount?: number;

    rolls: ExtendedTestRollEntry[];
    log: ExtendedTestLogEntry[];
}
