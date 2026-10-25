import { QuenchBatchContext } from '@ethaks/fvtt-quench';
import { FlowNodeField, FlowRelation } from '@/module/types/flows/FlowNodeField';
const { SchemaField, StringField, NumberField, BooleanField } = foundry.data.fields;

/**
 * The recursive action node field on a stand-alone data model, outside of any item type.
 *
 * The fixture tree uses its own relations, so it can nest deeper than the item action does.
 */
export const shadowrunFlowNodeField = (context: QuenchBatchContext) => {
    const { describe, it } = context;
    const assert: Chai.AssertStatic = context.assert;

    const NodeFields = () => ({
        test: new StringField({ required: true }),
        type: new StringField({ required: true }),
        description: new StringField({ required: true }),
        mod: new NumberField({ required: true, nullable: false, integer: true, initial: 0 }),
        skill: new StringField({ required: true }),
        attribute: new StringField({ blank: true, required: true }),
        attribute2: new StringField({ blank: true, required: true }),
        armor: new BooleanField(),
    });

    const relations: Record<string, FlowRelation> = {
        opposed: { fields: NodeFields, children: ['resist', 'followed', 'before'] },
        resist: { fields: NodeFields, children: ['followed'] },
        followed: { fields: NodeFields, children: ['resist'] },
        before: { fields: NodeFields, children: ['option', 'opposed'] },
        option: { fields: NodeFields, children: ['opposed', 'resist', 'followed'], map: true },
    };

    const FixtureSchema = () => ({
        action: new SchemaField({
            ...NodeFields(),
            opposed: new FlowNodeField('opposed', { nullable: false, relations, children: { resist: { nullable: false } } }),
            followed: new FlowNodeField('followed', { nullable: false, relations }),
            before: new FlowNodeField('before', { relations }),
        }),
    });

    // DataModel caches its schema per class, so every test gets its own class to count node builds.
    const createFixture = () => class FlowNodeFixture extends foundry.abstract.DataModel<ReturnType<typeof FixtureSchema>> {
        static override defineSchema() {
            return FixtureSchema();
        }
    };

    const deepSource = () => ({
        action: {
            before: {
                test: 'ChoiceTest',
                option: {
                    accept: { test: '' },
                    resist: { test: 'MeleeAttackTest', opposed: { test: 'PhysicalDefenseTest', followed: { test: 'DrainTest', mod: 1 } } },
                },
            },
        },
    });

    const get = (source: object, path: string): unknown => foundry.utils.getProperty(source, path);

    // Dot notation keys, as real document updates use them, aren't part of the typed update shape.
    type FixtureChanges = Parameters<InstanceType<ReturnType<typeof createFixture>>['updateSource']>[0];
    const changes = (data: Record<string, unknown>) => data as FixtureChanges;

    describe('Building the schema', () => {
        it('creates an empty model with defaults for the always present nodes only', () => {
            const Fixture = createFixture();
            const model = new Fixture({});
            const source = model.toObject();

            assert.isObject(get(source, 'action.opposed'));
            assert.isObject(get(source, 'action.opposed.resist'));
            assert.isObject(get(source, 'action.followed'));
            assert.strictEqual(get(source, 'action.opposed.resist.mod'), 0);
            assert.isNull(get(source, 'action.before'));
            assert.isNull(get(source, 'action.opposed.followed'));
            assert.isNull(get(source, 'action.followed.resist'));
        });

        it('builds node schemas only for nodes reached by data', () => {
            const Fixture = createFixture();
            const start = FlowNodeField.built;
            new Fixture({});
            // opposed, opposed.resist and followed
            assert.strictEqual(FlowNodeField.built - start, 3);

            new Fixture(deepSource());
            // before, the option entry node, the option's opposed and its followed
            assert.strictEqual(FlowNodeField.built - start, 7);
        });
    });

    describe('Data handling', () => {
        it('cleans and validates a node four levels deep', () => {
            const Fixture = createFixture();
            const model = new Fixture(deepSource());
            const source = model.toObject();

            assert.strictEqual(get(source, 'action.before.option.resist.opposed.followed.test'), 'DrainTest');
            assert.strictEqual(get(source, 'action.before.option.resist.opposed.followed.mod'), 1);
            // Defaults are filled in deep down, optional children stay empty.
            assert.strictEqual(get(source, 'action.before.option.resist.opposed.followed.skill'), '');
            assert.isNull(get(source, 'action.before.option.resist.opposed.followed.resist'));
            assert.isNull(get(source, 'action.before.opposed'));
        });

        it('reports an invalid value deep down at its nested key', () => {
            const Fixture = createFixture();
            const source = deepSource();
            foundry.utils.setProperty(source, 'action.before.option.resist.opposed.followed.mod', 'x');

            let thrown: unknown;
            try {
                new Fixture(source, { strict: true });
            } catch (error) {
                thrown = error;
            }
            assert.instanceOf(thrown, foundry.data.validation.DataModelValidationError, String(thrown));
            // The message nests one line per field, from the schema root down to the invalid field.
            const path = ['action', 'before', 'option', 'resist', 'opposed', 'followed', 'mod: must be a number'];
            assert.match((thrown as Error).message, new RegExp(path.join(':?[\\s\\S]*?')));
        });

        it('round trips through toObject', () => {
            const Fixture = createFixture();
            const first = new Fixture(deepSource()).toObject();
            const second = new Fixture(foundry.utils.deepClone(first)).toObject();
            assert.deepEqual(second, first);
        });
    });

    describe('Field lookup', () => {
        it('resolves nested field paths', () => {
            const schema = createFixture().schema;
            assert.instanceOf(schema.getField('action.opposed.resist.mod'), NumberField);
            assert.instanceOf(schema.getField('action.followed.resist.followed.resist.mod'), NumberField);
            assert.isUndefined(schema.getField('action.opposed.unknown'));
            // resist allows no opposed child
            assert.isUndefined(schema.getField('action.opposed.resist.opposed'));
        });

        it('resolves map entries by name against the source, as effect changes do', () => {
            const Fixture = createFixture();
            const model = new Fixture(deepSource());
            // DataModel.getFieldForProperty is what ActiveEffect change application uses.
            assert.instanceOf(model.getFieldForProperty('action.before.option.resist.opposed.mod'), NumberField);
            assert.instanceOf(model.getFieldForProperty('action.before.option.accept.followed.resist.mod'), NumberField);
            // Without a source, map entries resolve by the element name only.
            assert.instanceOf(Fixture.schema.getField('action.before.option.element.opposed.mod'), NumberField);
        });
    });

    describe('Walking the schema without data', () => {
        it('stops at optional nodes', () => {
            const schema = createFixture().schema;
            const visited: string[] = [];
            schema.apply(function (this: unknown) {
                if (this instanceof FlowNodeField) visited.push(this.fieldPath);
            }, {});

            assert.sameMembers(visited, [
                'action.opposed',
                'action.opposed.resist',
                'action.opposed.resist.followed',
                'action.opposed.followed',
                'action.opposed.before',
                'action.followed',
                'action.followed.resist',
                'action.before',
            ]);
        });

        it('lets label localization finish', () => {
            const schema = createFixture().schema;
            const start = FlowNodeField.built;
            foundry.helpers.Localization.localizeSchema(schema, ['SR5.FlowNodeFieldSpike']);
            // Only the three always present nodes are built.
            assert.strictEqual(FlowNodeField.built - start, 3);
        });
    });

    describe('Updating nodes', () => {
        it('creates a node from an empty object, merges into it and removes it with null', () => {
            const Fixture = createFixture();
            const model = new Fixture({});

            model.updateSource(changes({ 'action.before': {} }));
            assert.isObject(get(model._source, 'action.before'));
            assert.strictEqual(get(model._source, 'action.before.mod'), 0);
            assert.isNull(get(model._source, 'action.before.opposed'));

            model.updateSource(changes({ 'action.before.test': 'ChoiceTest' }));
            assert.strictEqual(get(model._source, 'action.before.test'), 'ChoiceTest');
            assert.strictEqual(get(model._source, 'action.before.mod'), 0);

            model.updateSource(changes({ 'action.before': null }));
            assert.isNull(get(model._source, 'action.before'));
        });

        it('changes a single nested key only', () => {
            const Fixture = createFixture();
            const model = new Fixture(deepSource());
            const before = model.toObject();

            model.updateSource(changes({ 'action.opposed.resist.mod': 2 }));
            const diff = foundry.utils.diffObject(before, model.toObject());
            assert.deepEqual(diff, { action: { opposed: { resist: { mod: 2 } } } });
        });
    });
};
