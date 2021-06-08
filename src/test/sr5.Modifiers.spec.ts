import {Modifiers} from "../module/rules/Modifiers";

export const shadowrunRulesModifiers = context => {
    const {describe, it, assert} = context;


    const defaultModifiers = {
        environmental: {
            active: {},
            total: 0
        }
    };

    const activeModifiers = {
        environmental: {
            active: {
                wind: -1,
                light: -1
            },
            total: -3
        }
    };

    describe('SR5 Modifiers', () => {
        it('should create default modifier values', () => {
            const modifiers = Modifiers.getDefaultModifiers();

            assert.deepEqual(modifiers, defaultModifiers)
        })
        it('should use default modifiers for faulty constructor params', () => {
            //@ts-ignore
            assert.deepEqual(new Modifiers({}).data, defaultModifiers);
            //@ts-ignore
            assert.deepEqual(new Modifiers(undefined).data, defaultModifiers);
            //@ts-ignore
            assert.deepEqual(new Modifiers(null).data, defaultModifiers);
            //@ts-ignore
            assert.deepEqual(new Modifiers(0).data, defaultModifiers);
            //@ts-ignore
            assert.deepEqual(new Modifiers(1).data, defaultModifiers);
            //@ts-ignore
            assert.deepEqual(new Modifiers().data, defaultModifiers);
        })
        it('should set an environmental modifier active', () => {
            const modifiers = new Modifiers(defaultModifiers);
            modifiers._setEnvironmentalCategoryActive('wind', -1);

            //@ts-ignore(modifiers.environmental.active).to.eql({wind: -1});
        })
        it('should set an environmental modifier inactive', () => {
            const modifiers = new Modifiers({
                environmental: {
                    active: {
                        wind: -1,
                        light: -3
                    },
                    total: 0
                }
            });
            modifiers._setEnvironmentalCategoryInactive('wind');

            assert.deepEqual(modifiers.environmental.active, {light: -3});
        })
        it('should understand active environmental modifiers', () => {
            const modifiersActive = new Modifiers({
                environmental: {
                    active: {
                        wind: -1,
                        light: -3
                    },
                    total: 0
                }
            });
            assert.equal(modifiersActive.hasActiveEnvironmental, true);
            const modifiersInactive = new Modifiers({
                environmental: {
                    active: {},
                    total: 0
                }
            });
            assert.equal(modifiersInactive.hasActiveEnvironmental, false);
        })
        it('should calculate the total according to sr5 rules', () => {
            const modifiers = new Modifiers(defaultModifiers);

            assert.equal(modifiers.environmental.total, 0);
            modifiers.environmental.active.wind = -1;
            modifiers.calcEnvironmentalTotal();
            assert.equal(modifiers.environmental.total, -1);
            modifiers.environmental.active.light = -1;
            modifiers.calcEnvironmentalTotal();
            assert.equal(modifiers.environmental.total, -3);
            modifiers.environmental.active.range = -1;
            modifiers.calcEnvironmentalTotal();
            assert.equal(modifiers.environmental.total, -3);
            delete modifiers.environmental.active.light;
            modifiers.calcEnvironmentalTotal();
            assert.equal(modifiers.environmental.total, -3);
            modifiers.environmental.active.light = 0;
            modifiers.calcEnvironmentalTotal();
            assert.equal(modifiers.environmental.total, -3);

            modifiers.environmental.active.wind = -3;
            modifiers.calcEnvironmentalTotal();
            assert.equal(modifiers.environmental.total, -3);
            modifiers.environmental.active.light = -3;
            modifiers.calcEnvironmentalTotal();
            assert.equal(modifiers.environmental.total, -6);
            modifiers.environmental.active.range = -3;
            modifiers.calcEnvironmentalTotal();
            assert.equal(modifiers.environmental.total, -6);
            delete modifiers.environmental.active.light;
            modifiers.calcEnvironmentalTotal();
            assert.equal(modifiers.environmental.total, -6);
            modifiers.environmental.active.light = 0;
            modifiers.calcEnvironmentalTotal();
            assert.equal(modifiers.environmental.total, -6);

            modifiers.environmental.active.wind = -6;
            modifiers.calcEnvironmentalTotal();
            assert.equal(modifiers.environmental.total, -6);
            modifiers.environmental.active.light = -6;
            modifiers.calcEnvironmentalTotal();
            assert.equal(modifiers.environmental.total, -10);
            modifiers.environmental.active.range = -6;
            modifiers.calcEnvironmentalTotal();
            assert.equal(modifiers.environmental.total, -10);
            delete modifiers.environmental.active.light;
            modifiers.calcEnvironmentalTotal();
            assert.equal(modifiers.environmental.total, -10);
            modifiers.environmental.active.light = 0;
            modifiers.calcEnvironmentalTotal();
            assert.equal(modifiers.environmental.total, -10);

            modifiers.environmental.active.value = 0;
            modifiers.calcEnvironmentalTotal();
            assert.equal(modifiers.environmental.total, 0);
            modifiers.environmental.active.value = -1;
            modifiers.calcEnvironmentalTotal();
            assert.equal(modifiers.environmental.total, -1);
            modifiers.environmental.active.value = -3;
            modifiers.calcEnvironmentalTotal();
            assert.equal(modifiers.environmental.total, -3);
            modifiers.environmental.active.value = -6;
            modifiers.calcEnvironmentalTotal();
            assert.equal(modifiers.environmental.total, -6);
            modifiers.environmental.active.value = -10;
            modifiers.calcEnvironmentalTotal();
            assert.equal(modifiers.environmental.total, -10);
        })

        it('should reset active environmental modifiers', () => {
            const modifiers = new Modifiers(activeModifiers);
            modifiers._resetEnvironmental();

            assert.deepEqual(modifiers.environmental.active, {});
        })

        it('should calculate total for faulty active', () => {
            const modifiers = new Modifiers({
                environmental: {
                    total: -1,
                    active: {
                        //@ts-ignore
                        light: null,
                        wind: undefined,
                        //@ts-ignore
                        range: '',
                        //@ts-ignore
                        visibility: 'string'
                    }
                }
            });

            modifiers.calcEnvironmentalTotal();

            assert.equal(modifiers.environmental.total, 0);
        })
    })
}

