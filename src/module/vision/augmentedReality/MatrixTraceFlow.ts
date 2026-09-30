import { FLAGS, SYSTEM_NAME } from '@/module/constants';

/** A document marks can be placed on. */
type MarkedIcon = { uuid: string | null };

/** An actor whose icon can be traced: its own persona, or the persona device it carries. */
type TraceTarget = MarkedIcon & {
    hasActorPersona(): boolean;
    getMatrixDevice(): MarkedIcon | undefined;
};

/** A persona that places marks and remembers which of the marked icons it traced. */
type TracingPersona = {
    getFlag(scope: string, key: string): unknown;
    setFlag(scope: string, key: string, value: unknown): Promise<unknown>;
    getMarksPlaced(uuid: string): number;
};

const FLAG_PATH = `flags.${SYSTEM_NAME}.${FLAGS.TracedIcons}`;

/**
 * SR5#243 Trace Icon: a successful trace reveals the physical location of a device or persona for as long as the
 * tracer keeps at least one mark on it.
 *
 * Traces are stored on the tracing persona as the uuids its marks are placed on.
 */
export class MatrixTraceFlow {
    /** The uuid marks on the actor land on: the actor itself when it is its own persona, else its persona device. */
    static iconUuid(target: TraceTarget) {
        return target.hasActorPersona() ? target.uuid : target.getMatrixDevice()?.uuid;
    }

    static tracedUuids(persona: Pick<TracingPersona, 'getFlag'>): string[] {
        const traced = persona.getFlag(SYSTEM_NAME, FLAGS.TracedIcons);
        return Array.isArray(traced) ? traced : [];
    }

    /** Remember a successful trace of an icon, which is an actor or the device marks were placed on. */
    static async trace(persona: TracingPersona, icon: MarkedIcon | TraceTarget) {
        const uuid = 'hasActorPersona' in icon ? this.iconUuid(icon) : icon.uuid;
        if (!uuid) return;
        const traced = this.tracedUuids(persona).filter(tracedUuid => persona.getMarksPlaced(tracedUuid) > 0);
        if (!traced.includes(uuid)) traced.push(uuid);
        await persona.setFlag(SYSTEM_NAME, FLAGS.TracedIcons, traced);
    }

    /** Whether the persona knows where the target is, by a trace it still holds a mark for. */
    static isTraced(persona: Pick<TracingPersona, 'getFlag' | 'getMarksPlaced'>, target: TraceTarget) {
        const uuid = this.iconUuid(target);
        if (!uuid) return false;
        return this.tracedUuids(persona).includes(uuid) && persona.getMarksPlaced(uuid) > 0;
    }

    /**
     * The update dropping traces of icons the persona no longer has marks on, to merge into the update storing
     * those marks. Losing every mark ends a trace, so marking the icon again doesn't restore it.
     */
    static pruneUpdate(persona: Pick<TracingPersona, 'getFlag'>, marks: { uuid: string; marks: number }[]) {
        const traced = this.tracedUuids(persona);
        if (!traced.length) return {};
        const kept = traced.filter(uuid => marks.some(mark => mark.uuid === uuid && mark.marks > 0));
        return kept.length === traced.length ? {} : { [FLAG_PATH]: kept };
    }
}
