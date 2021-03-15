import {Modifiers} from "../module/sr5/Modifiers";


export const shadowrunRulesModifiers = context => {
    const {describe, it, expect, assert} = context;
    console.error(context);

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

            expect(modifiers).to.eql(defaultModifiers);
        })
        it('should use default modifiers for faulty constructor params', () => {
            //@ts-ignore
            expect(new Modifiers({}).data).to.eql(defaultModifiers);
            //@ts-ignore
            expect(new Modifiers(undefined).data).to.eql(defaultModifiers);
            //@ts-ignore
            expect(new Modifiers(null).data).to.eql(defaultModifiers);
            //@ts-ignore
            expect(new Modifiers(0).data).to.eql(defaultModifiers);
            //@ts-ignore
            expect(new Modifiers(1).data).to.eql(defaultModifiers);
            //@ts-ignore
            expect(new Modifiers().data).to.eql(defaultModifiers);
        })
        it('should set an environmental modifier active', () => {
            const modifiers = new Modifiers(defaultModifiers);
            modifiers._setEnvironmentalCategoryActive('wind', -1);

            expect(modifiers.environmental.active).to.eql({wind: -1});
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

            expect(modifiers.environmental.active).to.eql({light: -3});
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
            expect(modifiersActive.hasActiveEnvironmental).to.equal(true);
            const modifiersInactive = new Modifiers({
                environmental: {
                    active: {},
                    total: 0
                }
            });
            expect(modifiersInactive.hasActiveEnvironmental).to.equal(false);
        })
        it('should calculate the total according to sr5 rules', () => {
            const modifiers = new Modifiers(defaultModifiers);

            expect(modifiers.environmental.total).to.equal(0);
            modifiers.environmental.active.wind = -1;
            modifiers.calcEnvironmentalTotal();
            expect(modifiers.environmental.total).to.equal(-1);
            modifiers.environmental.active.light = -1;
            modifiers.calcEnvironmentalTotal();
            expect(modifiers.environmental.total).to.equal(-3);
            modifiers.environmental.active.range = -1;
            modifiers.calcEnvironmentalTotal();
            expect(modifiers.environmental.total).to.equal(-3);
            delete modifiers.environmental.active.light;
            modifiers.calcEnvironmentalTotal();
            expect(modifiers.environmental.total).to.equal(-3);
            modifiers.environmental.active.light = 0;
            modifiers.calcEnvironmentalTotal();
            expect(modifiers.environmental.total).to.equal(-3);

            modifiers.environmental.active.wind = -3;
            modifiers.calcEnvironmentalTotal();
            expect(modifiers.environmental.total).to.equal(-3);
            modifiers.environmental.active.light = -3;
            modifiers.calcEnvironmentalTotal();
            expect(modifiers.environmental.total).to.equal(-6);
            modifiers.environmental.active.range = -3;
            modifiers.calcEnvironmentalTotal();
            expect(modifiers.environmental.total).to.equal(-6);
            delete modifiers.environmental.active.light;
            modifiers.calcEnvironmentalTotal();
            expect(modifiers.environmental.total).to.equal(-6);
            modifiers.environmental.active.light = 0;
            modifiers.calcEnvironmentalTotal();
            expect(modifiers.environmental.total).to.equal(-6);

            modifiers.environmental.active.wind = -6;
            modifiers.calcEnvironmentalTotal();
            expect(modifiers.environmental.total).to.equal(-6);
            modifiers.environmental.active.light = -6;
            modifiers.calcEnvironmentalTotal();
            expect(modifiers.environmental.total).to.equal(-10);
            modifiers.environmental.active.range = -6;
            modifiers.calcEnvironmentalTotal();
            expect(modifiers.environmental.total).to.equal(-10);
            delete modifiers.environmental.active.light;
            modifiers.calcEnvironmentalTotal();
            expect(modifiers.environmental.total).to.equal(-10);
            modifiers.environmental.active.light = 0;
            modifiers.calcEnvironmentalTotal();
            expect(modifiers.environmental.total).to.equal(-10);

            modifiers.environmental.active.value = 0;
            modifiers.calcEnvironmentalTotal();
            expect(modifiers.environmental.total).to.equal(0);
            modifiers.environmental.active.value = -1;
            modifiers.calcEnvironmentalTotal();
            expect(modifiers.environmental.total).to.equal(-1);
            modifiers.environmental.active.value = -3;
            modifiers.calcEnvironmentalTotal();
            expect(modifiers.environmental.total).to.equal(-3);
            modifiers.environmental.active.value = -6;
            modifiers.calcEnvironmentalTotal();
            expect(modifiers.environmental.total).to.equal(-6);
            modifiers.environmental.active.value = -10;
            modifiers.calcEnvironmentalTotal();
            expect(modifiers.environmental.total).to.equal(-10);
        })

        it('should reset active environmental modifiers', () => {
            const modifiers = new Modifiers(activeModifiers);
            modifiers._resetEnvironmental();

            expect(modifiers.environmental.active).to.eql({});
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

            expect(modifiers.environmental.total).to.equal(0);
        })
    })
}

