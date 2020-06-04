(function () {
    function r(e, n, t) {
        function o(i, f) {
            if (!n[i]) {
                if (!e[i]) {
                    var c = 'function' == typeof require && require;
                    if (!f && c) return c(i, !0);
                    if (u) return u(i, !0);
                    var a = new Error("Cannot find module '" + i + "'");
                    throw ((a.code = 'MODULE_NOT_FOUND'), a);
                }
                var p = (n[i] = { exports: {} });
                e[i][0].call(
                    p.exports,
                    function (r) {
                        var n = e[i][1][r];
                        return o(n || r);
                    },
                    p,
                    p.exports,
                    r,
                    e,
                    n,
                    t
                );
            }
            return n[i].exports;
        }
        for (var u = 'function' == typeof require && require, i = 0; i < t.length; i++) o(t[i]);
        return o;
    }
    return r;
})()(
    {
        1: [
            function (require, module, exports) {
                'use strict';

                var _interopRequireDefault = require('@babel/runtime/helpers/interopRequireDefault');

                Object.defineProperty(exports, '__esModule', {
                    value: true,
                });
                exports.SR5Actor = void 0;

                var _defineProperty2 = _interopRequireDefault(
                    require('@babel/runtime/helpers/defineProperty')
                );

                var _slicedToArray2 = _interopRequireDefault(
                    require('@babel/runtime/helpers/slicedToArray')
                );

                var _regenerator = _interopRequireDefault(require('@babel/runtime/regenerator'));

                var _asyncToGenerator2 = _interopRequireDefault(
                    require('@babel/runtime/helpers/asyncToGenerator')
                );

                var _classCallCheck2 = _interopRequireDefault(
                    require('@babel/runtime/helpers/classCallCheck')
                );

                var _createClass2 = _interopRequireDefault(
                    require('@babel/runtime/helpers/createClass')
                );

                var _get2 = _interopRequireDefault(require('@babel/runtime/helpers/get'));

                var _inherits2 = _interopRequireDefault(require('@babel/runtime/helpers/inherits'));

                var _possibleConstructorReturn2 = _interopRequireDefault(
                    require('@babel/runtime/helpers/possibleConstructorReturn')
                );

                var _getPrototypeOf2 = _interopRequireDefault(
                    require('@babel/runtime/helpers/getPrototypeOf')
                );

                var _dice = require('../dice.js');

                var _helpers = require('../helpers.js');

                var _config = require('../config.js');

                function ownKeys(object, enumerableOnly) {
                    var keys = Object.keys(object);
                    if (Object.getOwnPropertySymbols) {
                        var symbols = Object.getOwnPropertySymbols(object);
                        if (enumerableOnly)
                            symbols = symbols.filter(function (sym) {
                                return Object.getOwnPropertyDescriptor(object, sym).enumerable;
                            });
                        keys.push.apply(keys, symbols);
                    }
                    return keys;
                }

                function _objectSpread(target) {
                    for (var i = 1; i < arguments.length; i++) {
                        var source = arguments[i] != null ? arguments[i] : {};
                        if (i % 2) {
                            ownKeys(Object(source), true).forEach(function (key) {
                                (0, _defineProperty2['default'])(target, key, source[key]);
                            });
                        } else if (Object.getOwnPropertyDescriptors) {
                            Object.defineProperties(
                                target,
                                Object.getOwnPropertyDescriptors(source)
                            );
                        } else {
                            ownKeys(Object(source)).forEach(function (key) {
                                Object.defineProperty(
                                    target,
                                    key,
                                    Object.getOwnPropertyDescriptor(source, key)
                                );
                            });
                        }
                    }
                    return target;
                }

                function _createForOfIteratorHelper(o, allowArrayLike) {
                    var it;
                    if (typeof Symbol === 'undefined' || o[Symbol.iterator] == null) {
                        if (
                            Array.isArray(o) ||
                            (it = _unsupportedIterableToArray(o)) ||
                            (allowArrayLike && o && typeof o.length === 'number')
                        ) {
                            if (it) o = it;
                            var i = 0;
                            var F = function F() {};
                            return {
                                s: F,
                                n: function n() {
                                    if (i >= o.length) return { done: true };
                                    return { done: false, value: o[i++] };
                                },
                                e: function e(_e) {
                                    throw _e;
                                },
                                f: F,
                            };
                        }
                        throw new TypeError(
                            'Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.'
                        );
                    }
                    var normalCompletion = true,
                        didErr = false,
                        err;
                    return {
                        s: function s() {
                            it = o[Symbol.iterator]();
                        },
                        n: function n() {
                            var step = it.next();
                            normalCompletion = step.done;
                            return step;
                        },
                        e: function e(_e2) {
                            didErr = true;
                            err = _e2;
                        },
                        f: function f() {
                            try {
                                if (!normalCompletion && it['return'] != null) it['return']();
                            } finally {
                                if (didErr) throw err;
                            }
                        },
                    };
                }

                function _unsupportedIterableToArray(o, minLen) {
                    if (!o) return;
                    if (typeof o === 'string') return _arrayLikeToArray(o, minLen);
                    var n = Object.prototype.toString.call(o).slice(8, -1);
                    if (n === 'Object' && o.constructor) n = o.constructor.name;
                    if (n === 'Map' || n === 'Set') return Array.from(o);
                    if (n === 'Arguments' || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n))
                        return _arrayLikeToArray(o, minLen);
                }

                function _arrayLikeToArray(arr, len) {
                    if (len == null || len > arr.length) len = arr.length;
                    for (var i = 0, arr2 = new Array(len); i < len; i++) {
                        arr2[i] = arr[i];
                    }
                    return arr2;
                }

                function _createSuper(Derived) {
                    var hasNativeReflectConstruct = _isNativeReflectConstruct();
                    return function _createSuperInternal() {
                        var Super = (0, _getPrototypeOf2['default'])(Derived),
                            result;
                        if (hasNativeReflectConstruct) {
                            var NewTarget = (0, _getPrototypeOf2['default'])(this).constructor;
                            result = Reflect.construct(Super, arguments, NewTarget);
                        } else {
                            result = Super.apply(this, arguments);
                        }
                        return (0, _possibleConstructorReturn2['default'])(this, result);
                    };
                }

                function _isNativeReflectConstruct() {
                    if (typeof Reflect === 'undefined' || !Reflect.construct) return false;
                    if (Reflect.construct.sham) return false;
                    if (typeof Proxy === 'function') return true;
                    try {
                        Date.prototype.toString.call(Reflect.construct(Date, [], function () {}));
                        return true;
                    } catch (e) {
                        return false;
                    }
                }

                var SR5Actor = /*#__PURE__*/ (function (_Actor) {
                    (0, _inherits2['default'])(SR5Actor, _Actor);

                    var _super = _createSuper(SR5Actor);

                    function SR5Actor() {
                        (0, _classCallCheck2['default'])(this, SR5Actor);
                        return _super.apply(this, arguments);
                    }

                    (0, _createClass2['default'])(
                        SR5Actor,
                        [
                            {
                                key: 'update',
                                value: (function () {
                                    var _update = (0, _asyncToGenerator2['default'])(
                                        /*#__PURE__*/ _regenerator['default'].mark(function _callee(
                                            data,
                                            options
                                        ) {
                                            var itemUpdates, _iterator, _step, item;

                                            return _regenerator['default'].wrap(
                                                function _callee$(_context) {
                                                    while (1) {
                                                        switch ((_context.prev = _context.next)) {
                                                            case 0:
                                                                _context.next = 2;
                                                                return (0, _get2['default'])(
                                                                    (0,
                                                                    _getPrototypeOf2['default'])(
                                                                        SR5Actor.prototype
                                                                    ),
                                                                    'update',
                                                                    this
                                                                ).call(this, data, options);

                                                            case 2:
                                                                // trigger update for all items with action
                                                                // needed for rolls to properly update when items or attributes update
                                                                itemUpdates = [];
                                                                _iterator = _createForOfIteratorHelper(
                                                                    this.data.items
                                                                );

                                                                try {
                                                                    for (
                                                                        _iterator.s();
                                                                        !(_step = _iterator.n())
                                                                            .done;

                                                                    ) {
                                                                        item = _step.value;

                                                                        if (
                                                                            item &&
                                                                            item.data.action
                                                                        ) {
                                                                            itemUpdates.push(item);
                                                                        }
                                                                    }
                                                                } catch (err) {
                                                                    _iterator.e(err);
                                                                } finally {
                                                                    _iterator.f();
                                                                }

                                                                _context.next = 7;
                                                                return this.updateEmbeddedEntity(
                                                                    'OwnedItem',
                                                                    itemUpdates
                                                                );

                                                            case 7:
                                                                return _context.abrupt(
                                                                    'return',
                                                                    this
                                                                );

                                                            case 8:
                                                            case 'end':
                                                                return _context.stop();
                                                        }
                                                    }
                                                },
                                                _callee,
                                                this
                                            );
                                        })
                                    );

                                    function update(_x, _x2) {
                                        return _update.apply(this, arguments);
                                    }

                                    return update;
                                })(),
                            },
                            {
                                key: 'getOverwatchScore',
                                value: function getOverwatchScore() {
                                    var os = this.getFlag('shadowrun5e', 'overwatchScore');
                                    return os !== undefined ? os : 0;
                                },
                            },
                            {
                                key: 'setOverwatchScore',
                                value: (function () {
                                    var _setOverwatchScore = (0, _asyncToGenerator2['default'])(
                                        /*#__PURE__*/ _regenerator['default'].mark(
                                            function _callee2(value) {
                                                var num;
                                                return _regenerator['default'].wrap(
                                                    function _callee2$(_context2) {
                                                        while (1) {
                                                            switch (
                                                                (_context2.prev = _context2.next)
                                                            ) {
                                                                case 0:
                                                                    num = parseInt(value);

                                                                    if (isNaN(num)) {
                                                                        _context2.next = 3;
                                                                        break;
                                                                    }

                                                                    return _context2.abrupt(
                                                                        'return',
                                                                        this.setFlag(
                                                                            'shadowrun5e',
                                                                            'overwatchScore',
                                                                            num
                                                                        )
                                                                    );

                                                                case 3:
                                                                case 'end':
                                                                    return _context2.stop();
                                                            }
                                                        }
                                                    },
                                                    _callee2,
                                                    this
                                                );
                                            }
                                        )
                                    );

                                    function setOverwatchScore(_x3) {
                                        return _setOverwatchScore.apply(this, arguments);
                                    }

                                    return setOverwatchScore;
                                })(),
                            },
                            {
                                key: 'prepareData',
                                value: function prepareData() {
                                    (0, _get2['default'])(
                                        (0, _getPrototypeOf2['default'])(SR5Actor.prototype),
                                        'prepareData',
                                        this
                                    ).call(this);
                                    var actorData = this.data;
                                    var items = actorData.items;
                                    var data = actorData.data;
                                    var attrs = data.attributes;
                                    var armor = data.armor;
                                    var limits = data.limits;
                                    attrs.magic.hidden = !(data.special === 'magic');
                                    attrs.resonance.hidden = !(data.special === 'resonance');
                                    if (!data.modifiers) data.modifiers = {};
                                    var mods = {};
                                    var modifiers = [
                                        'soak',
                                        'drain',
                                        'armor',
                                        'physical_limit',
                                        'social_limit',
                                        'mental_limit',
                                        'stun_track',
                                        'physical_track',
                                        'initiative',
                                        'initiative_dice',
                                        'composure',
                                        'lift_carry',
                                        'judge_intentions',
                                        'memory',
                                        'walk',
                                        'run',
                                        'defense',
                                        'wound_tolerance',
                                        'essence',
                                        'fade',
                                    ];
                                    modifiers.sort();
                                    modifiers.unshift('global');

                                    for (
                                        var _i = 0, _modifiers = modifiers;
                                        _i < _modifiers.length;
                                        _i++
                                    ) {
                                        var item = _modifiers[_i];
                                        mods[item] = data.modifiers[item] || 0;
                                    }

                                    data.modifiers = mods;
                                    var totalEssence = 6;
                                    armor.value = 0;
                                    armor.mod = 0;
                                    var ELEMENTS = [
                                        'acid',
                                        'cold',
                                        'fire',
                                        'electricity',
                                        'radiation',
                                    ];
                                    ELEMENTS.forEach(function (element) {
                                        armor[element] = 0;
                                    }); // DEFAULT MATRIX ATTS TO MOD VALUE

                                    var matrix = data.matrix;
                                    matrix.firewall.value = matrix.firewall.mod;
                                    matrix.data_processing.value = matrix.data_processing.mod;
                                    matrix.attack.value = matrix.attack.mod;
                                    matrix.sleaze.value = matrix.sleaze.mod;
                                    matrix.condition_monitor.max = 0;
                                    matrix.rating = 0;
                                    matrix.name = '';
                                    matrix.device = ''; // PARSE WEAPONS AND SET VALUES AS NEEDED

                                    var _loop = function _loop() {
                                        var item = _Object$values[_i2];

                                        if (
                                            item.data.armor &&
                                            item.data.armor.value &&
                                            item.data.technology.equipped
                                        ) {
                                            if (item.data.armor.mod)
                                                armor.mod += item.data.armor.value;
                                            // if it's a mod, add to the mod field
                                            else armor.value = item.data.armor.value; // if not a mod, set armor.value to the items value

                                            ELEMENTS.forEach(function (element) {
                                                armor[element] += item.data.armor[element];
                                            });
                                        } // MODIFIES ESSENCE

                                        if (
                                            item.data.essence &&
                                            item.data.technology &&
                                            item.data.technology.equipped
                                        ) {
                                            totalEssence -= item.data.essence;
                                        } // MODIFIES MATRIX ATTRIBUTES

                                        if (
                                            item.type === 'device' &&
                                            item.data.technology.equipped
                                        ) {
                                            matrix.device = item._id;
                                            matrix.condition_monitor.max =
                                                item.data.condition_monitor.max;
                                            matrix.rating = item.data.technology.rating;
                                            matrix.is_cyberdeck =
                                                item.data.category === 'cyberdeck';
                                            matrix.name = item.name;
                                            matrix.item = item.data;

                                            if (item.data.category === 'cyberdeck') {
                                                for (
                                                    var _i3 = 0,
                                                        _Object$entries = Object.entries(
                                                            item.data.atts
                                                        );
                                                    _i3 < _Object$entries.length;
                                                    _i3++
                                                ) {
                                                    var _Object$entries$_i = (0,
                                                        _slicedToArray2['default'])(
                                                            _Object$entries[_i3],
                                                            2
                                                        ),
                                                        key = _Object$entries$_i[0],
                                                        att = _Object$entries$_i[1];

                                                    matrix[att.att].value += att.value;
                                                    matrix[att.att].device_att = key;
                                                }
                                            } else {
                                                matrix.firewall.value += matrix.rating;
                                                matrix.data_processing.value += matrix.rating;
                                            }
                                        }
                                    };

                                    for (
                                        var _i2 = 0, _Object$values = Object.values(items);
                                        _i2 < _Object$values.length;
                                        _i2++
                                    ) {
                                        _loop();
                                    } // ATTRIBUTES

                                    for (
                                        var _i4 = 0, _Object$entries2 = Object.entries(attrs);
                                        _i4 < _Object$entries2.length;
                                        _i4++
                                    ) {
                                        var _Object$entries2$_i = (0, _slicedToArray2['default'])(
                                                _Object$entries2[_i4],
                                                2
                                            ),
                                            att = _Object$entries2$_i[1];

                                        if (!att.hidden) {
                                            if (!att.mod) att.mod = 0;
                                            att.value = att.base + att.mod;
                                        }
                                    }

                                    var language = data.skills.language;

                                    if (language) {
                                        if (!language.value) language.value = {};
                                        language.attribute = 'intution';
                                    }

                                    for (
                                        var _i5 = 0,
                                            _Object$entries3 = Object.entries(data.skills.active);
                                        _i5 < _Object$entries3.length;
                                        _i5++
                                    ) {
                                        var _Object$entries3$_i = (0, _slicedToArray2['default'])(
                                                _Object$entries3[_i5],
                                                2
                                            ),
                                            skill = _Object$entries3$_i[1];

                                        if (!skill.hidden) {
                                            if (!skill.mod) skill.mod = 0;
                                            skill.value = skill.base + skill.mod;
                                        }
                                    }

                                    {
                                        var entries = Object.entries(data.skills.language.value); // remove entries which are deleted TODO figure out how to delete these from the data

                                        entries.forEach(function (_ref) {
                                            var _ref2 = (0, _slicedToArray2['default'])(_ref, 2),
                                                key = _ref2[0],
                                                val = _ref2[1];

                                            return (
                                                val._delete &&
                                                delete data.skills.language.value[key]
                                            );
                                        });
                                    }

                                    for (
                                        var _i6 = 0,
                                            _Object$values2 = Object.values(
                                                data.skills.language.value
                                            );
                                        _i6 < _Object$values2.length;
                                        _i6++
                                    ) {
                                        var _skill = _Object$values2[_i6];
                                        if (!_skill.mod) _skill.mod = 0;
                                        _skill.value = _skill.base + _skill.mod;
                                    }

                                    for (
                                        var _i7 = 0,
                                            _Object$entries4 = Object.entries(
                                                data.skills.knowledge
                                            );
                                        _i7 < _Object$entries4.length;
                                        _i7++
                                    ) {
                                        var _Object$entries4$_i = (0, _slicedToArray2['default'])(
                                                _Object$entries4[_i7],
                                                2
                                            ),
                                            group = _Object$entries4$_i[1];

                                        var _entries = Object.entries(group.value); // remove entries which are deleted TODO figure out how to delete these from the data

                                        group.value = _entries
                                            .filter(function (_ref3) {
                                                var _ref4 = (0, _slicedToArray2['default'])(
                                                        _ref3,
                                                        2
                                                    ),
                                                    val = _ref4[1];

                                                return !val._delete;
                                            })
                                            .reduce(function (acc, _ref5) {
                                                var _ref6 = (0, _slicedToArray2['default'])(
                                                        _ref5,
                                                        2
                                                    ),
                                                    id = _ref6[0],
                                                    skill = _ref6[1];

                                                if (!skill.mod) skill.mod = 0;
                                                skill.value = skill.base + skill.mod;
                                                acc[id] = skill;
                                                return acc;
                                            }, {});
                                    } // TECHNOMANCER LIVING PERSONA

                                    if (data.special === 'resonance') {
                                        // if value is equal to mod, we don't have an item equipped TODO this is horrible
                                        if (matrix.firewall.value === matrix.firewall.mod) {
                                            // we should use living persona
                                            matrix.firewall.value += attrs.willpower.value;
                                            matrix.data_processing.value += attrs.logic.value;
                                            matrix.rating = attrs.resonance.value;
                                            matrix.attack.value += attrs.charisma.value;
                                            matrix.sleaze.value += attrs.intuition.value;
                                            matrix.name = 'Living Persona';
                                            matrix.device = '';
                                            matrix.condition_monitor.max = 0;
                                        }
                                    } // set matrix condition monitor to max if greater than

                                    if (
                                        matrix.condition_monitor.value >
                                        matrix.condition_monitor.max
                                    )
                                        matrix.condition_monitor.value =
                                            matrix.condition_monitor.max; // ADD MATRIX ATTS TO LIMITS

                                    limits.firewall = {
                                        value: matrix.firewall.value,
                                        hidden: true,
                                    };
                                    limits.data_processing = {
                                        value: matrix.data_processing.value,
                                        hidden: true,
                                    };
                                    limits.attack = {
                                        value: matrix.attack.value,
                                        hidden: true,
                                    };
                                    limits.sleaze = {
                                        value: matrix.sleaze.value,
                                        hidden: true,
                                    };
                                    attrs.firewall = {
                                        value: matrix.firewall.value,
                                        hidden: true,
                                    };
                                    attrs.data_processing = {
                                        value: matrix.data_processing.value,
                                        hidden: true,
                                    };
                                    attrs.attack = {
                                        value: matrix.attack.value,
                                        hidden: true,
                                    };
                                    attrs.sleaze = {
                                        value: matrix.sleaze.value,
                                        hidden: true,
                                    }; // SET ARMOR

                                    armor.value += armor.mod + mods.armor; // SET ESSENCE

                                    actorData.data.attributes.essence.value = +(
                                        totalEssence + mods.essence
                                    ).toFixed(3); // SETUP LIMITS

                                    limits.physical.value =
                                        Math.ceil(
                                            (2 * attrs.strength.value +
                                                attrs.body.value +
                                                attrs.reaction.value) /
                                                3
                                        ) + mods.physical_limit;
                                    limits.mental.value =
                                        Math.ceil(
                                            (2 * attrs.logic.value +
                                                attrs.intuition.value +
                                                attrs.willpower.value) /
                                                3
                                        ) + mods.mental_limit;
                                    limits.social.value =
                                        Math.ceil(
                                            (2 * attrs.charisma.value +
                                                attrs.willpower.value +
                                                attrs.essence.value) /
                                                3
                                        ) + mods.social_limit; // MOVEMENT

                                    var movement = data.movement;
                                    movement.walk.value = attrs.agility.value * (2 + mods.walk);
                                    movement.run.value = attrs.agility.value * (4 + mods.run); // CONDITION_MONITORS

                                    var track = data.track;
                                    track.physical.max =
                                        8 + Math.ceil(attrs.body.value / 2) + mods.physical_track;
                                    track.physical.overflow.max = attrs.body.value;
                                    track.stun.max =
                                        8 + Math.ceil(attrs.willpower.value / 2) + mods.stun_track; // CALCULATE RECOIL

                                    data.recoil_compensation =
                                        1 + Math.ceil(attrs.strength.value / 3); // INITIATIVE

                                    var init = data.initiative;
                                    init.meatspace.base.base =
                                        attrs.intuition.value + attrs.reaction.value;
                                    init.meatspace.dice.base = 1;
                                    init.astral.base.base = attrs.intuition.value * 2;
                                    init.astral.dice.base = 2;
                                    init.matrix.base.base =
                                        attrs.intuition.value + data.matrix.data_processing.value;
                                    init.matrix.dice.base = data.matrix.hot_sim ? 4 : 3;
                                    if (init.perception === 'matrix') init.current = init.matrix;
                                    else if (init.perception === 'astral')
                                        init.current = init.astral;
                                    else {
                                        init.current = init.meatspace;
                                        init.perception = 'meatspace';
                                    }
                                    init.current.dice.value =
                                        init.current.dice.base + mods.initiative_dice;
                                    if (init.edge) init.current.dice.value = 5;
                                    init.current.dice.value = Math.min(5, init.current.dice.value); // maximum of 5d6 for initiative

                                    init.current.dice.text = ''.concat(
                                        init.current.dice.value,
                                        'd6'
                                    );
                                    init.current.base.value =
                                        init.current.base.base + mods.initiative;
                                    var soak = attrs.body.value + armor.value + mods.soak;
                                    var drainAtt = attrs[data.magic.attribute];
                                    data.rolls = _objectSpread(
                                        _objectSpread({}, data.rolls),
                                        {},
                                        {
                                            defense:
                                                attrs.reaction.value +
                                                attrs.intuition.value +
                                                mods.defense,
                                            drain:
                                                attrs.willpower.value +
                                                (drainAtt ? drainAtt.value : 0) +
                                                mods.drain,
                                            fade:
                                                attrs.willpower.value +
                                                attrs.resonance.value +
                                                mods.fade,
                                            soak: {
                                                default: soak,
                                                cold: soak + armor.cold,
                                                fire: soak + armor.fire,
                                                acid: soak + armor.acid,
                                                electricity: soak + armor.electricity,
                                                radiation: soak + armor.radiation,
                                            },
                                            composure:
                                                attrs.charisma.value +
                                                attrs.willpower.value +
                                                mods.composure,
                                            judge_intentions:
                                                attrs.charisma.value +
                                                attrs.intuition.value +
                                                mods.judge_intentions,
                                            lift_carry:
                                                attrs.strength.value +
                                                attrs.body.value +
                                                mods.lift_carry,
                                            memory:
                                                attrs.willpower.value +
                                                attrs.logic.value +
                                                mods.memory,
                                        }
                                    );
                                    {
                                        var count = 3 + mods.wound_tolerance;
                                        var stunWounds = Math.floor(data.track.stun.value / count);
                                        var physicalWounds = Math.floor(
                                            data.track.physical.value / count
                                        );
                                        data.track.stun.wounds = stunWounds;
                                        data.track.physical.wounds = physicalWounds;
                                        data.wounds = {
                                            value: stunWounds + physicalWounds,
                                        };
                                    } // limit labels

                                    for (
                                        var _i8 = 0, _Object$entries5 = Object.entries(data.limits);
                                        _i8 < _Object$entries5.length;
                                        _i8++
                                    ) {
                                        var _Object$entries5$_i = (0, _slicedToArray2['default'])(
                                                _Object$entries5[_i8],
                                                2
                                            ),
                                            l = _Object$entries5$_i[0],
                                            _limit = _Object$entries5$_i[1];

                                        _limit.label = CONFIG.SR5.limits[l];
                                    } // skill labels

                                    for (
                                        var _i9 = 0,
                                            _Object$entries6 = Object.entries(data.skills.active);
                                        _i9 < _Object$entries6.length;
                                        _i9++
                                    ) {
                                        var _Object$entries6$_i = (0, _slicedToArray2['default'])(
                                                _Object$entries6[_i9],
                                                2
                                            ),
                                            s = _Object$entries6$_i[0],
                                            _skill2 = _Object$entries6$_i[1];

                                        _skill2.label = CONFIG.SR5.activeSkills[s];
                                    } // attribute labels

                                    for (
                                        var _i10 = 0,
                                            _Object$entries7 = Object.entries(data.attributes);
                                        _i10 < _Object$entries7.length;
                                        _i10++
                                    ) {
                                        var _Object$entries7$_i = (0, _slicedToArray2['default'])(
                                                _Object$entries7[_i10],
                                                2
                                            ),
                                            a = _Object$entries7$_i[0],
                                            _att = _Object$entries7$_i[1];

                                        _att.label = CONFIG.SR5.attributes[a];
                                    } // tracks

                                    for (
                                        var _i11 = 0, _Object$entries8 = Object.entries(data.track);
                                        _i11 < _Object$entries8.length;
                                        _i11++
                                    ) {
                                        var _Object$entries8$_i = (0, _slicedToArray2['default'])(
                                                _Object$entries8[_i11],
                                                2
                                            ),
                                            t = _Object$entries8$_i[0],
                                            _track = _Object$entries8$_i[1];

                                        _track.label = CONFIG.SR5.damageTypes[t];
                                    }
                                },
                            },
                            {
                                key: 'addKnowledgeSkill',
                                value: function addKnowledgeSkill(category, skill) {
                                    var defaultSkill = {
                                        name: '',
                                        specs: [],
                                        base: 0,
                                        value: 0,
                                        mod: 0,
                                    };
                                    skill = _objectSpread(_objectSpread({}, defaultSkill), skill);
                                    var id = randomID(16);
                                    var value = {};
                                    value[id] = skill;
                                    var fieldName = 'data.skills.knowledge.'.concat(
                                        category,
                                        '.value'
                                    );
                                    var updateData = {};
                                    updateData[fieldName] = value;
                                    this.update(updateData);
                                },
                            },
                            {
                                key: 'removeLanguageSkill',
                                value: function removeLanguageSkill(skillId) {
                                    var value = {};
                                    value[skillId] = {
                                        _delete: true,
                                    };
                                    this.update({
                                        'data.skills.language.value': value,
                                    });
                                },
                            },
                            {
                                key: 'addLanguageSkill',
                                value: function addLanguageSkill(skill) {
                                    var defaultSkill = {
                                        name: '',
                                        specs: [],
                                        base: 0,
                                        value: 0,
                                        mod: 0,
                                    };
                                    skill = _objectSpread(_objectSpread({}, defaultSkill), skill);
                                    var id = randomID(16);
                                    var value = {};
                                    value[id] = skill;
                                    var fieldName = 'data.skills.language.value';
                                    var updateData = {};
                                    updateData[fieldName] = value;
                                    this.update(updateData);
                                },
                            },
                            {
                                key: 'removeKnowledgeSkill',
                                value: function removeKnowledgeSkill(skillId, category) {
                                    var value = {};
                                    var updateData = {};
                                    var dataString = 'data.skills.knowledge.'.concat(
                                        category,
                                        '.value'
                                    );
                                    value[skillId] = {
                                        _delete: true,
                                    };
                                    updateData[dataString] = value;
                                    this.update(updateData);
                                },
                            },
                            {
                                key: 'rollFade',
                                value: function rollFade() {
                                    var options =
                                        arguments.length > 0 && arguments[0] !== undefined
                                            ? arguments[0]
                                            : {};
                                    var incoming =
                                        arguments.length > 1 && arguments[1] !== undefined
                                            ? arguments[1]
                                            : -1;
                                    var wil = this.data.data.attributes.willpower;
                                    var res = this.data.data.attributes.resonance;
                                    var parts = {};
                                    parts[wil.label] = wil.value;
                                    parts[res.label] = res.value;
                                    if (data.modifiers.fade)
                                        parts['SR5.Bonus'] = data.modifiers.fade;
                                    var title = 'Fade';
                                    if (incoming >= 0) title += ' ('.concat(incoming, ' incoming)');

                                    _dice.DiceSR.rollTest({
                                        event: options.event,
                                        parts: parts,
                                        actor: this,
                                        title: title,
                                        wounds: false,
                                    });
                                },
                            },
                            {
                                key: 'rollDrain',
                                value: function rollDrain() {
                                    var options =
                                        arguments.length > 0 && arguments[0] !== undefined
                                            ? arguments[0]
                                            : {};
                                    var incoming =
                                        arguments.length > 1 && arguments[1] !== undefined
                                            ? arguments[1]
                                            : -1;
                                    var wil = this.data.data.attributes.willpower;
                                    var drainAtt = this.data.data.attributes[
                                        this.data.data.magic.attribute
                                    ];
                                    var parts = {};
                                    parts[wil.label] = wil.value;
                                    parts[drainAtt.label] = drainAtt.value;
                                    if (this.data.data.modifiers.drain)
                                        parts['SR5.Bonus'] = this.data.data.modifiers.drain;
                                    var title = 'Drain';
                                    if (incoming >= 0) title += ' ('.concat(incoming, ' incoming)');

                                    _dice.DiceSR.rollTest({
                                        event: options.event,
                                        parts: parts,
                                        actor: this,
                                        title: title,
                                        wounds: false,
                                    });
                                },
                            },
                            {
                                key: 'rollArmor',
                                value: function rollArmor() {
                                    var options =
                                        arguments.length > 0 && arguments[0] !== undefined
                                            ? arguments[0]
                                            : {};
                                    var armor = this.data.data.armor.value;
                                    var parts = {};
                                    parts['SR5.Armor'] = armor;
                                    return _dice.DiceSR.rollTest({
                                        event: options.event,
                                        actor: this,
                                        parts: parts,
                                        title: 'Armor',
                                        wounds: false,
                                    });
                                },
                            },
                            {
                                key: 'rollDefense',
                                value: function rollDefense() {
                                    var _this = this;

                                    var options =
                                        arguments.length > 0 && arguments[0] !== undefined
                                            ? arguments[0]
                                            : {};
                                    var dialogData = {
                                        defense: this.data.data.rolls.defense,
                                        fireMode: options.fireModeDefense,
                                        cover: options.cover,
                                    };
                                    var template =
                                        'systems/shadowrun5e/templates/rolls/roll-defense.html';
                                    var special = '';
                                    var cancel = true;
                                    return new Promise(function (resolve) {
                                        renderTemplate(template, dialogData).then(function (dlg) {
                                            new Dialog({
                                                title: 'Defense',
                                                content: dlg,
                                                buttons: {
                                                    normal: {
                                                        label: game.i18n.localize('Normal'),
                                                        callback: function callback() {
                                                            return (cancel = false);
                                                        },
                                                    },
                                                    full_defense: {
                                                        label: ''
                                                            .concat(
                                                                game.i18n.localize(
                                                                    'SR5.FullDefense'
                                                                ),
                                                                ' (+'
                                                            )
                                                            .concat(
                                                                _this.data.data.attributes.willpower
                                                                    .value,
                                                                ')'
                                                            ),
                                                        callback: function callback() {
                                                            special = 'full_defense';
                                                            cancel = false;
                                                        },
                                                    },
                                                },
                                                default: 'normal',
                                                close: (function () {
                                                    var _close = (0, _asyncToGenerator2['default'])(
                                                        /*#__PURE__*/ _regenerator['default'].mark(
                                                            function _callee4(html) {
                                                                var rea,
                                                                    _int,
                                                                    parts,
                                                                    fireMode,
                                                                    cover;

                                                                return _regenerator['default'].wrap(
                                                                    function _callee4$(_context4) {
                                                                        while (1) {
                                                                            switch (
                                                                                (_context4.prev =
                                                                                    _context4.next)
                                                                            ) {
                                                                                case 0:
                                                                                    if (!cancel) {
                                                                                        _context4.next = 2;
                                                                                        break;
                                                                                    }

                                                                                    return _context4.abrupt(
                                                                                        'return'
                                                                                    );

                                                                                case 2:
                                                                                    rea =
                                                                                        _this.data
                                                                                            .data
                                                                                            .attributes
                                                                                            .reaction;
                                                                                    _int =
                                                                                        _this.data
                                                                                            .data
                                                                                            .attributes
                                                                                            .intuition;
                                                                                    parts = {};
                                                                                    parts[
                                                                                        rea.label
                                                                                    ] = rea.value;
                                                                                    parts[
                                                                                        _int.label
                                                                                    ] = _int.value;
                                                                                    if (
                                                                                        _this.data
                                                                                            .data
                                                                                            .modifiers
                                                                                            .defense
                                                                                    )
                                                                                        parts[
                                                                                            'SR5.Bonus'
                                                                                        ] =
                                                                                            _this.data.data.modifiers.defense;
                                                                                    fireMode = parseInt(
                                                                                        html
                                                                                            .find(
                                                                                                '[name=fireMode]'
                                                                                            )
                                                                                            .val()
                                                                                    );
                                                                                    cover = parseInt(
                                                                                        html
                                                                                            .find(
                                                                                                '[name=cover]'
                                                                                            )
                                                                                            .val()
                                                                                    );
                                                                                    if (
                                                                                        special ===
                                                                                        'full_defense'
                                                                                    )
                                                                                        parts[
                                                                                            'SR5.FullDefense'
                                                                                        ] =
                                                                                            _this.data.data.attributes.willpower.value;
                                                                                    if (
                                                                                        special ===
                                                                                        'dodge'
                                                                                    )
                                                                                        parts[
                                                                                            'SR5.Dodge'
                                                                                        ] =
                                                                                            _this.data.data.skills.active.gymnastics.value;
                                                                                    if (
                                                                                        special ===
                                                                                        'block'
                                                                                    )
                                                                                        parts[
                                                                                            'SR5.Block'
                                                                                        ] =
                                                                                            _this.data.data.skills.active.unarmed_combat.value;
                                                                                    if (fireMode)
                                                                                        parts[
                                                                                            'SR5.FireMode'
                                                                                        ] = fireMode;
                                                                                    if (cover)
                                                                                        parts[
                                                                                            'SR5.Cover'
                                                                                        ] = cover;
                                                                                    resolve(
                                                                                        _dice.DiceSR.rollTest(
                                                                                            {
                                                                                                event:
                                                                                                    options.event,
                                                                                                actor: _this,
                                                                                                parts: parts,
                                                                                                title:
                                                                                                    'Defense',
                                                                                            }
                                                                                        ).then(
                                                                                            /*#__PURE__*/ (function () {
                                                                                                var _ref7 = (0,
                                                                                                _asyncToGenerator2[
                                                                                                    'default'
                                                                                                ])(
                                                                                                    /*#__PURE__*/ _regenerator[
                                                                                                        'default'
                                                                                                    ].mark(
                                                                                                        function _callee3(
                                                                                                            roll
                                                                                                        ) {
                                                                                                            var defenderHits,
                                                                                                                attack,
                                                                                                                attackerHits,
                                                                                                                netHits,
                                                                                                                damage,
                                                                                                                damageType,
                                                                                                                ap;
                                                                                                            return _regenerator[
                                                                                                                'default'
                                                                                                            ].wrap(
                                                                                                                function _callee3$(
                                                                                                                    _context3
                                                                                                                ) {
                                                                                                                    while (
                                                                                                                        1
                                                                                                                    ) {
                                                                                                                        switch (
                                                                                                                            (_context3.prev =
                                                                                                                                _context3.next)
                                                                                                                        ) {
                                                                                                                            case 0:
                                                                                                                                _this.unsetFlag(
                                                                                                                                    'shadowrun5e',
                                                                                                                                    'incomingAttack'
                                                                                                                                );

                                                                                                                                if (
                                                                                                                                    options.incomingAttack
                                                                                                                                ) {
                                                                                                                                    defenderHits =
                                                                                                                                        roll.total;
                                                                                                                                    attack =
                                                                                                                                        options.incomingAttack;
                                                                                                                                    attackerHits =
                                                                                                                                        attack.hits ||
                                                                                                                                        0;
                                                                                                                                    netHits =
                                                                                                                                        attackerHits -
                                                                                                                                        defenderHits;

                                                                                                                                    if (
                                                                                                                                        netHits >=
                                                                                                                                        0
                                                                                                                                    ) {
                                                                                                                                        damage =
                                                                                                                                            options
                                                                                                                                                .incomingAttack
                                                                                                                                                .damage +
                                                                                                                                            netHits;
                                                                                                                                        damageType =
                                                                                                                                            options
                                                                                                                                                .incomingAttack
                                                                                                                                                .damageType ||
                                                                                                                                            '';
                                                                                                                                        ap =
                                                                                                                                            options
                                                                                                                                                .incomingAttack
                                                                                                                                                .ap; // ui.notifications.info(`Got Hit: DV${damage}${damageType ? damageType.charAt(0).toUpperCase() : ''} ${ap}AP`);

                                                                                                                                        _this.setFlag(
                                                                                                                                            'shadowrun5e',
                                                                                                                                            'incomingDamage',
                                                                                                                                            {
                                                                                                                                                damage: damage,
                                                                                                                                                damageType: damageType,
                                                                                                                                                ap: ap,
                                                                                                                                            }
                                                                                                                                        );

                                                                                                                                        _this.rollSoak(
                                                                                                                                            {
                                                                                                                                                event:
                                                                                                                                                    options.event,
                                                                                                                                                damage: damage,
                                                                                                                                                ap: ap,
                                                                                                                                            }
                                                                                                                                        );
                                                                                                                                    }
                                                                                                                                }

                                                                                                                            case 2:
                                                                                                                            case 'end':
                                                                                                                                return _context3.stop();
                                                                                                                        }
                                                                                                                    }
                                                                                                                },
                                                                                                                _callee3
                                                                                                            );
                                                                                                        }
                                                                                                    )
                                                                                                );

                                                                                                return function (
                                                                                                    _x5
                                                                                                ) {
                                                                                                    return _ref7.apply(
                                                                                                        this,
                                                                                                        arguments
                                                                                                    );
                                                                                                };
                                                                                            })()
                                                                                        )
                                                                                    );

                                                                                case 16:
                                                                                case 'end':
                                                                                    return _context4.stop();
                                                                            }
                                                                        }
                                                                    },
                                                                    _callee4
                                                                );
                                                            }
                                                        )
                                                    );

                                                    function close(_x4) {
                                                        return _close.apply(this, arguments);
                                                    }

                                                    return close;
                                                })(),
                                            }).render(true);
                                        });
                                    });
                                },
                            },
                            {
                                key: 'rollSoak',
                                value: function rollSoak() {
                                    var _this2 = this;

                                    var options =
                                        arguments.length > 0 && arguments[0] !== undefined
                                            ? arguments[0]
                                            : {};
                                    var dialogData = {
                                        damage: options.damage,
                                        ap: options.ap,
                                        soak: this.data.data.rolls.soak['default'],
                                    };
                                    var id = '';
                                    var cancel = true;
                                    var template =
                                        'systems/shadowrun5e/templates/rolls/roll-soak.html';
                                    return new Promise(function (resolve) {
                                        renderTemplate(template, dialogData).then(function (dlg) {
                                            new Dialog({
                                                title: 'Soak Test',
                                                content: dlg,
                                                buttons: {
                                                    base: {
                                                        label: 'Base',
                                                        icon: '<i class="fas fa-shield-alt"></i>',
                                                        callback: function callback() {
                                                            id = 'default';
                                                            cancel = false;
                                                        },
                                                    },
                                                    acid: {
                                                        label: 'Acid',
                                                        icon: '<i class="fas fa-vial"></i>',
                                                        callback: function callback() {
                                                            id = 'acid';
                                                            cancel = false;
                                                        },
                                                    },
                                                    cold: {
                                                        label: 'Cold',
                                                        icon: '<i class="fas fa-snowflake"></i>',
                                                        callback: function callback() {
                                                            id = 'cold';
                                                            cancel = false;
                                                        },
                                                    },
                                                    electricity: {
                                                        label: 'Elec',
                                                        icon: '<i class="fas fa-bolt"></i>',
                                                        callback: function callback() {
                                                            id = 'electricity';
                                                            cancel = false;
                                                        },
                                                    },
                                                    fire: {
                                                        label: 'Fire',
                                                        icon: '<i class="fas fa-fire"></i>',
                                                        callback: function callback() {
                                                            id = 'fire';
                                                            cancel = false;
                                                        },
                                                    },
                                                    radiation: {
                                                        label: 'Rad',
                                                        icon: '<i class="fas fa-radiation"></i>',
                                                        callback: function callback() {
                                                            id = 'radiation';
                                                            cancel = false;
                                                        },
                                                    },
                                                },
                                                close: (function () {
                                                    var _close2 = (0,
                                                    _asyncToGenerator2['default'])(
                                                        /*#__PURE__*/ _regenerator['default'].mark(
                                                            function _callee5(html) {
                                                                var body,
                                                                    armor,
                                                                    parts,
                                                                    armorId,
                                                                    bonusArmor,
                                                                    ap,
                                                                    armorVal,
                                                                    label,
                                                                    title;
                                                                return _regenerator['default'].wrap(
                                                                    function _callee5$(_context5) {
                                                                        while (1) {
                                                                            switch (
                                                                                (_context5.prev =
                                                                                    _context5.next)
                                                                            ) {
                                                                                case 0:
                                                                                    _this2.unsetFlag(
                                                                                        'shadowrun5e',
                                                                                        'incomingDamage'
                                                                                    );

                                                                                    if (!cancel) {
                                                                                        _context5.next = 3;
                                                                                        break;
                                                                                    }

                                                                                    return _context5.abrupt(
                                                                                        'return'
                                                                                    );

                                                                                case 3:
                                                                                    body =
                                                                                        _this2.data
                                                                                            .data
                                                                                            .attributes
                                                                                            .body;
                                                                                    armor =
                                                                                        _this2.data
                                                                                            .data
                                                                                            .armor;
                                                                                    parts = {};
                                                                                    parts[
                                                                                        body.label
                                                                                    ] = body.value;
                                                                                    parts[
                                                                                        'SR5.Armor'
                                                                                    ] = armor.value;
                                                                                    if (
                                                                                        _this2.data
                                                                                            .data
                                                                                            .modifiers
                                                                                            .soak
                                                                                    )
                                                                                        parts[
                                                                                            'SR5.Bonus'
                                                                                        ] =
                                                                                            _this2.data.data.modifiers.soak;
                                                                                    armorId =
                                                                                        id ===
                                                                                        'default'
                                                                                            ? ''
                                                                                            : id;
                                                                                    bonusArmor =
                                                                                        armor[
                                                                                            armorId
                                                                                        ] || 0;
                                                                                    if (bonusArmor)
                                                                                        parts[
                                                                                            _helpers.Helpers.label(
                                                                                                armorId
                                                                                            )
                                                                                        ] = bonusArmor;
                                                                                    ap = parseInt(
                                                                                        html
                                                                                            .find(
                                                                                                '[name=ap]'
                                                                                            )
                                                                                            .val()
                                                                                    );

                                                                                    if (ap) {
                                                                                        armorVal =
                                                                                            armor.value +
                                                                                            bonusArmor; // don't take more AP than armor

                                                                                        parts[
                                                                                            'SR5.AP'
                                                                                        ] = Math.max(
                                                                                            ap,
                                                                                            -armorVal
                                                                                        );
                                                                                    }

                                                                                    label = _helpers.Helpers.label(
                                                                                        id
                                                                                    );
                                                                                    title = 'Soak - '.concat(
                                                                                        label
                                                                                    );
                                                                                    if (
                                                                                        options.damage
                                                                                    )
                                                                                        title += ' - Incoming Damage: '.concat(
                                                                                            options.damage
                                                                                        );
                                                                                    resolve(
                                                                                        _dice.DiceSR.rollTest(
                                                                                            {
                                                                                                event:
                                                                                                    options.event,
                                                                                                actor: _this2,
                                                                                                parts: parts,
                                                                                                title: title,
                                                                                                wounds: false,
                                                                                            }
                                                                                        )
                                                                                    );

                                                                                case 18:
                                                                                case 'end':
                                                                                    return _context5.stop();
                                                                            }
                                                                        }
                                                                    },
                                                                    _callee5
                                                                );
                                                            }
                                                        )
                                                    );

                                                    function close(_x6) {
                                                        return _close2.apply(this, arguments);
                                                    }

                                                    return close;
                                                })(),
                                            }).render(true);
                                        });
                                    });
                                },
                            },
                            {
                                key: 'rollSingleAttribute',
                                value: function rollSingleAttribute(attId) {
                                    var options =
                                        arguments.length > 1 && arguments[1] !== undefined
                                            ? arguments[1]
                                            : {};
                                    var attr = this.data.data.attributes[attId];
                                    var parts = {};
                                    parts[attr.label] = attr.value;
                                    return _dice.DiceSR.rollTest({
                                        event: options.event,
                                        actor: this,
                                        parts: parts,
                                        title: _helpers.Helpers.label(attrId),
                                        matrix: _helpers.Helpers.isMatrix(attr),
                                    });
                                },
                            },
                            {
                                key: 'rollTwoAttributes',
                                value: function rollTwoAttributes(_ref8) {
                                    var _ref9 = (0, _slicedToArray2['default'])(_ref8, 2),
                                        id1 = _ref9[0],
                                        id2 = _ref9[1];

                                    var options =
                                        arguments.length > 1 && arguments[1] !== undefined
                                            ? arguments[1]
                                            : {};
                                    var attr1 = this.data.data.attributes[id1];
                                    var attr2 = this.data.data.attributes[id2];

                                    var label1 = _helpers.Helpers.label(id1);

                                    var label2 = _helpers.Helpers.label(id2);

                                    var parts = {};
                                    parts[attr1.label] = attr1.value;
                                    parts[attr2.label] = attr2.value;
                                    return _dice.DiceSR.rollTest({
                                        event: options.event,
                                        actor: this,
                                        parts: parts,
                                        title: ''.concat(label1, ' + ').concat(label2),
                                        matrix: _helpers.Helpers.isMatrix([attr1, attr2]),
                                    });
                                },
                            },
                            {
                                key: 'rollNaturalRecovery',
                                value: function rollNaturalRecovery(track) {
                                    var _this3 = this;

                                    var options =
                                        arguments.length > 1 && arguments[1] !== undefined
                                            ? arguments[1]
                                            : {};
                                    var id1 = 'body';
                                    var id2 = 'willpower';
                                    var title = 'Natural Recover';

                                    if (track === 'physical') {
                                        id2 = 'body';
                                        title += ' - Physical - 1 Day';
                                    } else {
                                        title += ' - Stun - 1 Hour';
                                    }

                                    var att1 = this.data.data.attributes[id1];
                                    var att2 = this.data.data.attributes[id2];
                                    var parts = {};
                                    parts[att1.label] = att1.value;
                                    parts[att2.label] = att2.value;
                                    return _dice.DiceSR.rollTest({
                                        event: options.event,
                                        actor: this,
                                        parts: parts,
                                        title: title,
                                        extended: true,
                                        after: (function () {
                                            var _after = (0, _asyncToGenerator2['default'])(
                                                /*#__PURE__*/ _regenerator['default'].mark(
                                                    function _callee6(roll) {
                                                        var hits, current, key, u;
                                                        return _regenerator['default'].wrap(
                                                            function _callee6$(_context6) {
                                                                while (1) {
                                                                    switch (
                                                                        (_context6.prev =
                                                                            _context6.next)
                                                                    ) {
                                                                        case 0:
                                                                            hits = roll.total;
                                                                            current =
                                                                                _this3.data.data
                                                                                    .track[track]
                                                                                    .value;
                                                                            current = Math.max(
                                                                                current - hits,
                                                                                0
                                                                            );
                                                                            key = 'data.track.'.concat(
                                                                                track,
                                                                                '.value'
                                                                            );
                                                                            u = {};
                                                                            u[key] = current;
                                                                            _context6.next = 8;
                                                                            return _this3.update(u);

                                                                        case 8:
                                                                        case 'end':
                                                                            return _context6.stop();
                                                                    }
                                                                }
                                                            },
                                                            _callee6
                                                        );
                                                    }
                                                )
                                            );

                                            function after(_x7) {
                                                return _after.apply(this, arguments);
                                            }

                                            return after;
                                        })(),
                                    });
                                },
                            },
                            {
                                key: 'rollMatrixAttribute',
                                value: (function () {
                                    var _rollMatrixAttribute = (0, _asyncToGenerator2['default'])(
                                        /*#__PURE__*/ _regenerator['default'].mark(
                                            function _callee8(attr) {
                                                var _this4 = this;

                                                var options,
                                                    matrix_att,
                                                    title,
                                                    parts,
                                                    attributes,
                                                    attribute,
                                                    dialogData,
                                                    buttons,
                                                    cancel,
                                                    _args8 = arguments;
                                                return _regenerator['default'].wrap(
                                                    function _callee8$(_context8) {
                                                        while (1) {
                                                            switch (
                                                                (_context8.prev = _context8.next)
                                                            ) {
                                                                case 0:
                                                                    options =
                                                                        _args8.length > 1 &&
                                                                        _args8[1] !== undefined
                                                                            ? _args8[1]
                                                                            : {};
                                                                    matrix_att = this.data.data
                                                                        .matrix[attr];
                                                                    title = game.i18n.localize(
                                                                        CONFIG.SR5.matrixAttributes[
                                                                            attr
                                                                        ]
                                                                    );
                                                                    parts = {};
                                                                    parts[
                                                                        CONFIG.SR5.matrixAttributes[
                                                                            attr
                                                                        ]
                                                                    ] = matrix_att.value;
                                                                    if (
                                                                        options.event[
                                                                            _config.SR5.kbmod.SPEC
                                                                        ]
                                                                    )
                                                                        parts[
                                                                            'SR5.Specialization'
                                                                        ] = 2;

                                                                    if (
                                                                        !_helpers.Helpers.hasModifiers(
                                                                            options.event
                                                                        )
                                                                    ) {
                                                                        _context8.next = 8;
                                                                        break;
                                                                    }

                                                                    return _context8.abrupt(
                                                                        'return',
                                                                        _dice.DiceSR.rollTest({
                                                                            event: options.event,
                                                                            actor: this,
                                                                            parts: parts,
                                                                            limit: limit
                                                                                ? limit.value
                                                                                : undefined,
                                                                            title: title,
                                                                            matrix: true,
                                                                        })
                                                                    );

                                                                case 8:
                                                                    attributes = _helpers.Helpers.filter(
                                                                        this.data.data.attributes,
                                                                        function (_ref10) {
                                                                            var _ref11 = (0,
                                                                                _slicedToArray2[
                                                                                    'default'
                                                                                ])(_ref10, 2),
                                                                                value = _ref11[1];

                                                                            return value.value > 0;
                                                                        }
                                                                    );
                                                                    attribute = 'willpower';
                                                                    dialogData = {
                                                                        attribute: attribute,
                                                                        attributes: attributes,
                                                                    };
                                                                    buttons = {
                                                                        roll: {
                                                                            label: 'Continue',
                                                                            callback: function callback() {
                                                                                return (cancel = false);
                                                                            },
                                                                        },
                                                                    };
                                                                    cancel = true;
                                                                    renderTemplate(
                                                                        'systems/shadowrun5e/templates/rolls/matrix-roll.html',
                                                                        dialogData
                                                                    ).then(function (dlg) {
                                                                        new Dialog({
                                                                            title: ''.concat(
                                                                                title,
                                                                                ' Test'
                                                                            ),
                                                                            content: dlg,
                                                                            buttons: buttons,
                                                                            close: (function () {
                                                                                var _close3 = (0,
                                                                                _asyncToGenerator2[
                                                                                    'default'
                                                                                ])(
                                                                                    /*#__PURE__*/ _regenerator[
                                                                                        'default'
                                                                                    ].mark(
                                                                                        function _callee7(
                                                                                            html
                                                                                        ) {
                                                                                            var newAtt,
                                                                                                att;
                                                                                            return _regenerator[
                                                                                                'default'
                                                                                            ].wrap(
                                                                                                function _callee7$(
                                                                                                    _context7
                                                                                                ) {
                                                                                                    while (
                                                                                                        1
                                                                                                    ) {
                                                                                                        switch (
                                                                                                            (_context7.prev =
                                                                                                                _context7.next)
                                                                                                        ) {
                                                                                                            case 0:
                                                                                                                if (
                                                                                                                    !cancel
                                                                                                                ) {
                                                                                                                    _context7.next = 2;
                                                                                                                    break;
                                                                                                                }

                                                                                                                return _context7.abrupt(
                                                                                                                    'return'
                                                                                                                );

                                                                                                            case 2:
                                                                                                                newAtt = html
                                                                                                                    .find(
                                                                                                                        '[name=attribute]'
                                                                                                                    )
                                                                                                                    .val();
                                                                                                                att = {};

                                                                                                                if (
                                                                                                                    newAtt
                                                                                                                ) {
                                                                                                                    att =
                                                                                                                        _this4
                                                                                                                            .data
                                                                                                                            .data
                                                                                                                            .attributes[
                                                                                                                            newAtt
                                                                                                                        ];
                                                                                                                    title += ' + '.concat(
                                                                                                                        game.i18n.localize(
                                                                                                                            CONFIG
                                                                                                                                .SR5
                                                                                                                                .attributes[
                                                                                                                                newAtt
                                                                                                                            ]
                                                                                                                        )
                                                                                                                    );
                                                                                                                }

                                                                                                                if (
                                                                                                                    att.value
                                                                                                                )
                                                                                                                    parts[
                                                                                                                        att.label
                                                                                                                    ] =
                                                                                                                        att.value;

                                                                                                                _this4._addMatrixParts(
                                                                                                                    parts,
                                                                                                                    true
                                                                                                                );

                                                                                                                _this4._addGlobalParts(
                                                                                                                    parts
                                                                                                                );

                                                                                                                return _context7.abrupt(
                                                                                                                    'return',
                                                                                                                    _dice.DiceSR.rollTest(
                                                                                                                        {
                                                                                                                            event:
                                                                                                                                options.event,
                                                                                                                            actor: _this4,
                                                                                                                            parts: parts,
                                                                                                                            title: title,
                                                                                                                        }
                                                                                                                    )
                                                                                                                );

                                                                                                            case 9:
                                                                                                            case 'end':
                                                                                                                return _context7.stop();
                                                                                                        }
                                                                                                    }
                                                                                                },
                                                                                                _callee7
                                                                                            );
                                                                                        }
                                                                                    )
                                                                                );

                                                                                function close(
                                                                                    _x9
                                                                                ) {
                                                                                    return _close3.apply(
                                                                                        this,
                                                                                        arguments
                                                                                    );
                                                                                }

                                                                                return close;
                                                                            })(),
                                                                        }).render(true);
                                                                    });

                                                                case 14:
                                                                case 'end':
                                                                    return _context8.stop();
                                                            }
                                                        }
                                                    },
                                                    _callee8,
                                                    this
                                                );
                                            }
                                        )
                                    );

                                    function rollMatrixAttribute(_x8) {
                                        return _rollMatrixAttribute.apply(this, arguments);
                                    }

                                    return rollMatrixAttribute;
                                })(),
                            },
                            {
                                key: 'promptRoll',
                                value: function promptRoll() {
                                    var options =
                                        arguments.length > 0 && arguments[0] !== undefined
                                            ? arguments[0]
                                            : {};
                                    return _dice.DiceSR.rollTest({
                                        event: options.event,
                                        actor: this,
                                        dialogOptions: {
                                            prompt: true,
                                        },
                                    });
                                },
                            },
                            {
                                key: 'rollAttributesTest',
                                value: function rollAttributesTest(rollId, options) {
                                    var title = game.i18n.localize(
                                        CONFIG.SR5.attributeRolls[rollId]
                                    );
                                    var atts = this.data.data.attributes;
                                    var modifiers = this.data.data.modifiers;
                                    var parts = {};

                                    if (rollId === 'composure') {
                                        parts[atts.charisma.label] = atts.charisma.value;
                                        parts[atts.willpower.label] = atts.willpower.value;
                                        if (modifiers.composure)
                                            parts['SR5.Bonus'] = modifiers.composure;
                                    } else if (rollId === 'judge_intentions') {
                                        parts[atts.charisma.label] = atts.charisma.value;
                                        parts[atts.intuition.label] = atts.intuition.value;
                                        if (modifiers.judge_intentions)
                                            parts['SR5.Bonus'] = modifiers.judge_intentions;
                                    } else if (rollId === 'lift_carry') {
                                        parts[atts.strength.label] = atts.strength.value;
                                        parts[atts.body.label] = atts.body.value;
                                        if (modifiers.lift_carry)
                                            parts['SR5.Bonus'] = modifiers.lift_carry;
                                    } else if (rollId === 'memory') {
                                        parts[atts.willpower.label] = atts.willpower.value;
                                        parts[atts.logic.label] = atts.logic.value;
                                        if (modifiers.memory) parts['SR5.Bonus'] = modifiers.memory;
                                    }

                                    return _dice.DiceSR.rollTest({
                                        event: options.event,
                                        actor: this,
                                        parts: parts,
                                        // base: roll,
                                        title: ''.concat(title, ' Test'),
                                    });
                                },
                            },
                            {
                                key: 'rollSkill',
                                value: function rollSkill(skill) {
                                    var _skill$specs,
                                        _this5 = this;

                                    var options =
                                        arguments.length > 1 && arguments[1] !== undefined
                                            ? arguments[1]
                                            : {};
                                    var att = this.data.data.attributes[skill.attribute];
                                    var title = skill.label;
                                    if (options.attribute)
                                        att = this.data.data.attributes[options.attribute];
                                    var limit = this.data.data.limits[att.limit];
                                    var parts = {};
                                    parts[skill.label] = skill.value;

                                    if (_helpers.Helpers.hasModifiers(options.event)) {
                                        parts[att.label] = att.value;
                                        if (options.event[_config.SR5.kbmod.SPEC])
                                            parts['SR5.Specialization'] = 2;

                                        this._addMatrixParts(parts, att);

                                        this._addGlobalParts(parts);

                                        return _dice.DiceSR.rollTest({
                                            event: options.event,
                                            actor: this,
                                            parts: parts,
                                            limit: limit ? limit.value : undefined,
                                            title: ''.concat(title, ' Test'),
                                        });
                                    }

                                    var dialogData = {
                                        attribute: skill.attribute,
                                        attributes: _helpers.Helpers.filter(
                                            this.data.data.attributes,
                                            function (_ref12) {
                                                var _ref13 = (0, _slicedToArray2['default'])(
                                                        _ref12,
                                                        2
                                                    ),
                                                    value = _ref13[1];

                                                return value.value > 0;
                                            }
                                        ),
                                        limit: att.limit,
                                        limits: this.data.data.limits,
                                    };
                                    var cancel = true;
                                    var spec = '';
                                    var buttons = {
                                        roll: {
                                            label: 'Normal',
                                            callback: function callback() {
                                                return (cancel = false);
                                            },
                                        },
                                    }; // add specializations to dialog as buttons

                                    if (
                                        (_skill$specs = skill.specs) === null ||
                                        _skill$specs === void 0
                                            ? void 0
                                            : _skill$specs.length
                                    ) {
                                        skill.specs.forEach(function (s) {
                                            return (buttons[s] = {
                                                label: s,
                                                callback: function callback() {
                                                    cancel = false;
                                                    spec = s;
                                                },
                                            });
                                        });
                                    }

                                    renderTemplate(
                                        'systems/shadowrun5e/templates/rolls/skill-roll.html',
                                        dialogData
                                    ).then(function (dlg) {
                                        new Dialog({
                                            title: ''.concat(title, ' Test'),
                                            content: dlg,
                                            buttons: buttons,
                                            close: (function () {
                                                var _close4 = (0, _asyncToGenerator2['default'])(
                                                    /*#__PURE__*/ _regenerator['default'].mark(
                                                        function _callee9(html) {
                                                            var newAtt, newLimit;
                                                            return _regenerator['default'].wrap(
                                                                function _callee9$(_context9) {
                                                                    while (1) {
                                                                        switch (
                                                                            (_context9.prev =
                                                                                _context9.next)
                                                                        ) {
                                                                            case 0:
                                                                                if (!cancel) {
                                                                                    _context9.next = 2;
                                                                                    break;
                                                                                }

                                                                                return _context9.abrupt(
                                                                                    'return'
                                                                                );

                                                                            case 2:
                                                                                newAtt = html
                                                                                    .find(
                                                                                        '[name="attribute"]'
                                                                                    )
                                                                                    .val();
                                                                                newLimit = html
                                                                                    .find(
                                                                                        '[name="attribute.limit"]'
                                                                                    )
                                                                                    .val();
                                                                                att =
                                                                                    _this5.data.data
                                                                                        .attributes[
                                                                                        newAtt
                                                                                    ];
                                                                                title += ' + '.concat(
                                                                                    game.i18n.localize(
                                                                                        CONFIG.SR5
                                                                                            .attributes[
                                                                                            newAtt
                                                                                        ]
                                                                                    )
                                                                                );
                                                                                limit =
                                                                                    _this5.data.data
                                                                                        .limits[
                                                                                        newLimit
                                                                                    ];
                                                                                parts[att.label] =
                                                                                    att.value;
                                                                                if (
                                                                                    skill.value ===
                                                                                    0
                                                                                )
                                                                                    parts[
                                                                                        'SR5.Defaulting'
                                                                                    ] = -1;
                                                                                if (spec)
                                                                                    parts[
                                                                                        'SR5.Specialization'
                                                                                    ] = 2; // let count = (skill.value > 0 ? skill.value : -1) + att.value;

                                                                                _this5._addMatrixParts(
                                                                                    parts,
                                                                                    att
                                                                                );

                                                                                _this5._addGlobalParts(
                                                                                    parts
                                                                                );

                                                                                return _context9.abrupt(
                                                                                    'return',
                                                                                    _dice.DiceSR.rollTest(
                                                                                        {
                                                                                            event:
                                                                                                options.event,
                                                                                            actor: _this5,
                                                                                            parts: parts,
                                                                                            limit: limit
                                                                                                ? limit.value
                                                                                                : undefined,
                                                                                            title: ''.concat(
                                                                                                title,
                                                                                                ' Test'
                                                                                            ),
                                                                                        }
                                                                                    )
                                                                                );

                                                                            case 13:
                                                                            case 'end':
                                                                                return _context9.stop();
                                                                        }
                                                                    }
                                                                },
                                                                _callee9
                                                            );
                                                        }
                                                    )
                                                );

                                                function close(_x10) {
                                                    return _close4.apply(this, arguments);
                                                }

                                                return close;
                                            })(),
                                        }).render(true);
                                    });
                                },
                            },
                            {
                                key: 'rollKnowledgeSkill',
                                value: function rollKnowledgeSkill(catId, skillId) {
                                    var options =
                                        arguments.length > 2 && arguments[2] !== undefined
                                            ? arguments[2]
                                            : {};
                                    var category = this.data.data.skills.knowledge[catId];
                                    var skill = duplicate(category.value[skillId]);
                                    skill.attribute = category.attribute;
                                    skill.label = skill.name;
                                    this.rollSkill(skill, options);
                                },
                            },
                            {
                                key: 'rollLanguageSkill',
                                value: function rollLanguageSkill(skillId) {
                                    var options =
                                        arguments.length > 1 && arguments[1] !== undefined
                                            ? arguments[1]
                                            : {};
                                    var skill = duplicate(
                                        this.data.data.skills.language.value[skillId]
                                    );
                                    skill.attribute = 'intuition';
                                    skill.label = skill.name;
                                    this.rollSkill(skill, options);
                                },
                            },
                            {
                                key: 'rollActiveSkill',
                                value: function rollActiveSkill(skillId) {
                                    var options =
                                        arguments.length > 1 && arguments[1] !== undefined
                                            ? arguments[1]
                                            : {};
                                    var skill = this.data.data.skills.active[skillId];
                                    skill.label = game.i18n.localize(
                                        CONFIG.SR5.activeSkills[skillId]
                                    );
                                    this.rollSkill(skill, options);
                                },
                            },
                            {
                                key: 'rollAttribute',
                                value: function rollAttribute(attId) {
                                    var _this6 = this;

                                    var options =
                                        arguments.length > 1 && arguments[1] !== undefined
                                            ? arguments[1]
                                            : {};
                                    var title = game.i18n.localize(CONFIG.SR5.attributes[attId]);
                                    var att = this.data.data.attributes[attId];
                                    var atts = this.data.data.attributes;
                                    var parts = {};
                                    parts[att.label] = att.value;
                                    var dialogData = {
                                        attrribute: att,
                                        attributes: atts,
                                    };
                                    var cancel = true;
                                    renderTemplate(
                                        'systems/shadowrun5e/templates/rolls/single-attribute.html',
                                        dialogData
                                    ).then(function (dlg) {
                                        new Dialog({
                                            title: ''.concat(title, ' Attribute Test'),
                                            content: dlg,
                                            buttons: {
                                                roll: {
                                                    label: 'Continue',
                                                    callback: function callback() {
                                                        return (cancel = false);
                                                    },
                                                },
                                            },
                                            default: 'roll',
                                            close: (function () {
                                                var _close5 = (0, _asyncToGenerator2['default'])(
                                                    /*#__PURE__*/ _regenerator['default'].mark(
                                                        function _callee10(html) {
                                                            var limit, att2Id, att2, att2IdLabel;
                                                            return _regenerator['default'].wrap(
                                                                function _callee10$(_context10) {
                                                                    while (1) {
                                                                        switch (
                                                                            (_context10.prev =
                                                                                _context10.next)
                                                                        ) {
                                                                            case 0:
                                                                                if (!cancel) {
                                                                                    _context10.next = 2;
                                                                                    break;
                                                                                }

                                                                                return _context10.abrupt(
                                                                                    'return'
                                                                                );

                                                                            case 2:
                                                                                limit = undefined;
                                                                                att2Id = html
                                                                                    .find(
                                                                                        '[name=attribute2]'
                                                                                    )
                                                                                    .val();
                                                                                att2 = null;

                                                                                if (
                                                                                    att2Id !==
                                                                                    'none'
                                                                                ) {
                                                                                    att2 =
                                                                                        atts[
                                                                                            att2Id
                                                                                        ];
                                                                                    parts[
                                                                                        att2.label
                                                                                    ] = att2.value;
                                                                                    att2IdLabel = game.i18n.localize(
                                                                                        CONFIG.SR5
                                                                                            .attributes[
                                                                                            att2Id
                                                                                        ]
                                                                                    );
                                                                                    title += ' + '.concat(
                                                                                        att2IdLabel
                                                                                    );
                                                                                } else if (
                                                                                    att2Id ===
                                                                                    'default'
                                                                                ) {
                                                                                    parts[
                                                                                        'SR5.Defaulting'
                                                                                    ] = -1;
                                                                                }

                                                                                _this6._addMatrixParts(
                                                                                    parts,
                                                                                    [att, att2]
                                                                                );

                                                                                _this6._addGlobalParts(
                                                                                    parts
                                                                                );

                                                                                return _context10.abrupt(
                                                                                    'return',
                                                                                    _dice.DiceSR.rollTest(
                                                                                        {
                                                                                            event:
                                                                                                options.event,
                                                                                            title: ''.concat(
                                                                                                title,
                                                                                                ' Test'
                                                                                            ),
                                                                                            actor: _this6,
                                                                                            parts: parts,
                                                                                            limit: limit,
                                                                                        }
                                                                                    )
                                                                                );

                                                                            case 9:
                                                                            case 'end':
                                                                                return _context10.stop();
                                                                        }
                                                                    }
                                                                },
                                                                _callee10
                                                            );
                                                        }
                                                    )
                                                );

                                                function close(_x11) {
                                                    return _close5.apply(this, arguments);
                                                }

                                                return close;
                                            })(),
                                        }).render(true);
                                    });
                                },
                            },
                            {
                                key: '_addMatrixParts',
                                value: function _addMatrixParts(parts, atts) {
                                    if (_helpers.Helpers.isMatrix(atts)) {
                                        var m = this.data.data.matrix;
                                        if (m.hot_sim) parts['SR5.HotSim'] = 2;
                                        if (m.running_silent) parts['SR5.RunningSilent'] = -2;
                                    }
                                },
                            },
                            {
                                key: '_addGlobalParts',
                                value: function _addGlobalParts(parts) {
                                    if (this.data.data.modifiers.global) {
                                        parts['SR5.Global'] = this.data.data.modifiers.global;
                                    }
                                },
                            },
                        ],
                        [
                            {
                                key: 'pushTheLimit',
                                value: (function () {
                                    var _pushTheLimit = (0, _asyncToGenerator2['default'])(
                                        /*#__PURE__*/ _regenerator['default'].mark(
                                            function _callee11(roll) {
                                                var title, msg, actor;
                                                return _regenerator['default'].wrap(
                                                    function _callee11$(_context11) {
                                                        while (1) {
                                                            switch (
                                                                (_context11.prev = _context11.next)
                                                            ) {
                                                                case 0:
                                                                    title = roll
                                                                        .find('.flavor-text')
                                                                        .text();
                                                                    msg = game.messages.get(
                                                                        roll.data().messageId
                                                                    );

                                                                    if (
                                                                        !(
                                                                            msg &&
                                                                            msg.data &&
                                                                            msg.data.speaker &&
                                                                            msg.data.speaker.actor
                                                                        )
                                                                    ) {
                                                                        _context11.next = 5;
                                                                        break;
                                                                    }

                                                                    actor = game.actors.get(
                                                                        msg.data.speaker.actor
                                                                    );
                                                                    return _context11.abrupt(
                                                                        'return',
                                                                        _dice.DiceSR.rollTest({
                                                                            event: {
                                                                                shiftKey: true,
                                                                                altKey: true,
                                                                            },
                                                                            title: ''.concat(
                                                                                title,
                                                                                ' - Push the Limit'
                                                                            ),
                                                                            actor: actor,
                                                                            wounds: false,
                                                                        })
                                                                    );

                                                                case 5:
                                                                case 'end':
                                                                    return _context11.stop();
                                                            }
                                                        }
                                                    },
                                                    _callee11
                                                );
                                            }
                                        )
                                    );

                                    function pushTheLimit(_x12) {
                                        return _pushTheLimit.apply(this, arguments);
                                    }

                                    return pushTheLimit;
                                })(),
                            },
                            {
                                key: 'secondChance',
                                value: (function () {
                                    var _secondChance = (0, _asyncToGenerator2['default'])(
                                        /*#__PURE__*/ _regenerator['default'].mark(
                                            function _callee12(roll) {
                                                var formula,
                                                    hits,
                                                    title,
                                                    re,
                                                    matches,
                                                    match,
                                                    pool,
                                                    msg,
                                                    actor,
                                                    parts;
                                                return _regenerator['default'].wrap(
                                                    function _callee12$(_context12) {
                                                        while (1) {
                                                            switch (
                                                                (_context12.prev = _context12.next)
                                                            ) {
                                                                case 0:
                                                                    formula = roll
                                                                        .find('.dice-formula')
                                                                        .text();
                                                                    hits = parseInt(
                                                                        roll
                                                                            .find('.dice-total')
                                                                            .text()
                                                                    );
                                                                    title = roll
                                                                        .find('.flavor-text')
                                                                        .text();
                                                                    re = /(\d+)d6/;
                                                                    matches = formula.match(re);

                                                                    if (!matches[1]) {
                                                                        _context12.next = 16;
                                                                        break;
                                                                    }

                                                                    match = matches[1];
                                                                    pool = parseInt(
                                                                        match.replace('d6', '')
                                                                    );

                                                                    if (
                                                                        !(
                                                                            !isNaN(pool) &&
                                                                            !isNaN(hits)
                                                                        )
                                                                    ) {
                                                                        _context12.next = 16;
                                                                        break;
                                                                    }

                                                                    msg = game.messages.get(
                                                                        roll.data().messageId
                                                                    );

                                                                    if (
                                                                        !(
                                                                            msg &&
                                                                            msg.data &&
                                                                            msg.data.speaker &&
                                                                            msg.data.speaker.actor
                                                                        )
                                                                    ) {
                                                                        _context12.next = 16;
                                                                        break;
                                                                    }

                                                                    actor = game.actors.get(
                                                                        msg.data.speaker.actor
                                                                    );
                                                                    parts = {};
                                                                    parts[
                                                                        'SR5.OriginalDicePool'
                                                                    ] = pool;
                                                                    parts['SR5.Successes'] = -hits;
                                                                    return _context12.abrupt(
                                                                        'return',
                                                                        _dice.DiceSR.rollTest({
                                                                            event: {
                                                                                shiftKey: true,
                                                                            },
                                                                            title: ''.concat(
                                                                                title,
                                                                                ' - Second Chance'
                                                                            ),
                                                                            parts: parts,
                                                                            wounds: false,
                                                                            actor: actor,
                                                                        }).then(function () {
                                                                            actor.update({
                                                                                'data.attributes.edge.value':
                                                                                    actor.data.data
                                                                                        .attributes
                                                                                        .edge
                                                                                        .value - 1,
                                                                            });
                                                                        })
                                                                    );

                                                                case 16:
                                                                case 'end':
                                                                    return _context12.stop();
                                                            }
                                                        }
                                                    },
                                                    _callee12
                                                );
                                            }
                                        )
                                    );

                                    function secondChance(_x13) {
                                        return _secondChance.apply(this, arguments);
                                    }

                                    return secondChance;
                                })(),
                            },
                        ]
                    );
                    return SR5Actor;
                })(Actor);

                exports.SR5Actor = SR5Actor;
            },
            {
                '../config.js': 11,
                '../dice.js': 13,
                '../helpers.js': 15,
                '@babel/runtime/helpers/asyncToGenerator': 27,
                '@babel/runtime/helpers/classCallCheck': 28,
                '@babel/runtime/helpers/createClass': 29,
                '@babel/runtime/helpers/defineProperty': 30,
                '@babel/runtime/helpers/get': 31,
                '@babel/runtime/helpers/getPrototypeOf': 32,
                '@babel/runtime/helpers/inherits': 33,
                '@babel/runtime/helpers/interopRequireDefault': 34,
                '@babel/runtime/helpers/possibleConstructorReturn': 39,
                '@babel/runtime/helpers/slicedToArray': 41,
                '@babel/runtime/regenerator': 46,
            },
        ],
        2: [
            function (require, module, exports) {
                'use strict';

                var _interopRequireDefault = require('@babel/runtime/helpers/interopRequireDefault');

                Object.defineProperty(exports, '__esModule', {
                    value: true,
                });
                exports.SR5ActorSheet = void 0;

                var _regenerator = _interopRequireDefault(require('@babel/runtime/regenerator'));

                var _asyncToGenerator2 = _interopRequireDefault(
                    require('@babel/runtime/helpers/asyncToGenerator')
                );

                var _slicedToArray2 = _interopRequireDefault(
                    require('@babel/runtime/helpers/slicedToArray')
                );

                var _classCallCheck2 = _interopRequireDefault(
                    require('@babel/runtime/helpers/classCallCheck')
                );

                var _createClass2 = _interopRequireDefault(
                    require('@babel/runtime/helpers/createClass')
                );

                var _get3 = _interopRequireDefault(require('@babel/runtime/helpers/get'));

                var _inherits2 = _interopRequireDefault(require('@babel/runtime/helpers/inherits'));

                var _possibleConstructorReturn2 = _interopRequireDefault(
                    require('@babel/runtime/helpers/possibleConstructorReturn')
                );

                var _getPrototypeOf2 = _interopRequireDefault(
                    require('@babel/runtime/helpers/getPrototypeOf')
                );

                var _helpers = require('../helpers.js');

                var _chummerImportForm = require('../apps/chummer-import-form.js');

                var _skillEdit = require('../apps/skill-edit.js');

                var _knowledgeSkillEdit = require('../apps/knowledge-skill-edit.js');

                var _languageSkillEdit = require('../apps/language-skill-edit.js');

                function _createForOfIteratorHelper(o, allowArrayLike) {
                    var it;
                    if (typeof Symbol === 'undefined' || o[Symbol.iterator] == null) {
                        if (
                            Array.isArray(o) ||
                            (it = _unsupportedIterableToArray(o)) ||
                            (allowArrayLike && o && typeof o.length === 'number')
                        ) {
                            if (it) o = it;
                            var i = 0;
                            var F = function F() {};
                            return {
                                s: F,
                                n: function n() {
                                    if (i >= o.length) return { done: true };
                                    return { done: false, value: o[i++] };
                                },
                                e: function e(_e) {
                                    throw _e;
                                },
                                f: F,
                            };
                        }
                        throw new TypeError(
                            'Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.'
                        );
                    }
                    var normalCompletion = true,
                        didErr = false,
                        err;
                    return {
                        s: function s() {
                            it = o[Symbol.iterator]();
                        },
                        n: function n() {
                            var step = it.next();
                            normalCompletion = step.done;
                            return step;
                        },
                        e: function e(_e2) {
                            didErr = true;
                            err = _e2;
                        },
                        f: function f() {
                            try {
                                if (!normalCompletion && it['return'] != null) it['return']();
                            } finally {
                                if (didErr) throw err;
                            }
                        },
                    };
                }

                function _unsupportedIterableToArray(o, minLen) {
                    if (!o) return;
                    if (typeof o === 'string') return _arrayLikeToArray(o, minLen);
                    var n = Object.prototype.toString.call(o).slice(8, -1);
                    if (n === 'Object' && o.constructor) n = o.constructor.name;
                    if (n === 'Map' || n === 'Set') return Array.from(o);
                    if (n === 'Arguments' || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n))
                        return _arrayLikeToArray(o, minLen);
                }

                function _arrayLikeToArray(arr, len) {
                    if (len == null || len > arr.length) len = arr.length;
                    for (var i = 0, arr2 = new Array(len); i < len; i++) {
                        arr2[i] = arr[i];
                    }
                    return arr2;
                }

                function _createSuper(Derived) {
                    var hasNativeReflectConstruct = _isNativeReflectConstruct();
                    return function _createSuperInternal() {
                        var Super = (0, _getPrototypeOf2['default'])(Derived),
                            result;
                        if (hasNativeReflectConstruct) {
                            var NewTarget = (0, _getPrototypeOf2['default'])(this).constructor;
                            result = Reflect.construct(Super, arguments, NewTarget);
                        } else {
                            result = Super.apply(this, arguments);
                        }
                        return (0, _possibleConstructorReturn2['default'])(this, result);
                    };
                }

                function _isNativeReflectConstruct() {
                    if (typeof Reflect === 'undefined' || !Reflect.construct) return false;
                    if (Reflect.construct.sham) return false;
                    if (typeof Proxy === 'function') return true;
                    try {
                        Date.prototype.toString.call(Reflect.construct(Date, [], function () {}));
                        return true;
                    } catch (e) {
                        return false;
                    }
                }

                /**
                 * Extend the basic ActorSheet with some very simple modifications
                 */
                var SR5ActorSheet = /*#__PURE__*/ (function (_ActorSheet) {
                    (0, _inherits2['default'])(SR5ActorSheet, _ActorSheet);

                    var _super = _createSuper(SR5ActorSheet);

                    function SR5ActorSheet() {
                        var _this;

                        (0, _classCallCheck2['default'])(this, SR5ActorSheet);

                        for (
                            var _len = arguments.length, args = new Array(_len), _key = 0;
                            _key < _len;
                            _key++
                        ) {
                            args[_key] = arguments[_key];
                        }

                        _this = _super.call.apply(_super, [this].concat(args));
                        /**
                         * Keep track of the currently active sheet tab
                         * @type {string}
                         */

                        _this._shownUntrainedSkills = true;
                        _this._shownDesc = [];
                        _this._filters = {
                            skills: '',
                        };
                        return _this;
                    }
                    /* -------------------------------------------- */

                    /**
                     * Extend and override the default options used by the 5e Actor Sheet
                     * @returns {Object}
                     */

                    (0, _createClass2['default'])(
                        SR5ActorSheet,
                        [
                            {
                                key: 'getData',

                                /* -------------------------------------------- */

                                /**
                                 * Prepare data for rendering the Actor sheet
                                 * The prepared data object contains both the actor data as well as additional sheet options
                                 */
                                value: function getData() {
                                    var data = (0, _get3['default'])(
                                        (0, _getPrototypeOf2['default'])(SR5ActorSheet.prototype),
                                        'getData',
                                        this
                                    ).call(this); // do some calculations

                                    var limits = data.data.limits;
                                    if (limits.physical.mod === 0) delete limits.physical.mod;
                                    if (limits.social.mod === 0) delete limits.social.mod;
                                    if (limits.mental.mod === 0) delete limits.mental.mod;
                                    var movement = data.data.movement;
                                    if (movement.walk.mult === 1 || movement.walk.mult === 0)
                                        delete movement.walk.mult;
                                    if (movement.run.mult === 2 || movement.run.mult === 0)
                                        delete movement.run.mult;
                                    var track = data.data.track;
                                    if (track.physical.mod === 0) delete track.physical.mod;
                                    if (track.stun && track.stun.mod === 0) delete track.stun.mod;
                                    var attrs = data.data.attributes;

                                    for (
                                        var _i = 0, _Object$entries = Object.entries(attrs);
                                        _i < _Object$entries.length;
                                        _i++
                                    ) {
                                        var _Object$entries$_i = (0, _slicedToArray2['default'])(
                                                _Object$entries[_i],
                                                2
                                            ),
                                            label = _Object$entries$_i[0],
                                            att = _Object$entries$_i[1];

                                        if (!att.hidden) {
                                            if (att.mod === 0) delete att.mod;
                                        }
                                    }

                                    var matrix = data.data.matrix;
                                    if (matrix.attack.mod === 0) delete matrix.attack.mod;
                                    if (matrix.sleaze.mod === 0) delete matrix.sleaze.mod;
                                    if (matrix.data_processing.mod === 0)
                                        delete matrix.data_processing.mod;
                                    if (matrix.firewall.mod === 0) delete matrix.firewall.mod;
                                    var magic = data.data.magic;
                                    if (magic.drain && magic.drain.mod === 0)
                                        delete magic.drain.mod;
                                    var mods = data.data.modifiers;

                                    for (
                                        var _i2 = 0, _Object$entries2 = Object.entries(mods);
                                        _i2 < _Object$entries2.length;
                                        _i2++
                                    ) {
                                        var _Object$entries2$_i = (0, _slicedToArray2['default'])(
                                                _Object$entries2[_i2],
                                                2
                                            ),
                                            key = _Object$entries2$_i[0],
                                            value = _Object$entries2$_i[1];

                                        if (value === 0) mods[key] = '';
                                    }

                                    this._prepareItems(data);

                                    this._prepareSkills(data);

                                    data.config = CONFIG.SR5;
                                    data.awakened = data.data.special === 'magic';
                                    data.emerged = data.data.special === 'resonance';
                                    data.filters = this._filters;
                                    return data;
                                },
                            },
                            {
                                key: '_isSkillMagic',
                                value: function _isSkillMagic(id, skill) {
                                    return (
                                        skill.attribute === 'magic' ||
                                        id === 'astral_combat' ||
                                        id === 'assensing'
                                    );
                                },
                            },
                            {
                                key: '_doesSkillContainText',
                                value: function _doesSkillContainText(key, skill, text) {
                                    var _skill$specs;

                                    var searchString = ''
                                        .concat(key, ' ')
                                        .concat(game.i18n.localize(skill.label), ' ')
                                        .concat(
                                            skill === null || skill === void 0
                                                ? void 0
                                                : (_skill$specs = skill.specs) === null ||
                                                  _skill$specs === void 0
                                                ? void 0
                                                : _skill$specs.join(' ')
                                        );
                                    return (
                                        searchString.toLowerCase().search(text.toLowerCase()) > -1
                                    );
                                },
                            },
                            {
                                key: '_prepareSkills',
                                value: function _prepareSkills(data) {
                                    var activeSkills = {};

                                    for (
                                        var _i3 = 0,
                                            _Object$entries3 = Object.entries(
                                                data.data.skills.active
                                            );
                                        _i3 < _Object$entries3.length;
                                        _i3++
                                    ) {
                                        var _Object$entries3$_i = (0, _slicedToArray2['default'])(
                                                _Object$entries3[_i3],
                                                2
                                            ),
                                            key = _Object$entries3$_i[0],
                                            skill = _Object$entries3$_i[1];

                                        // if filter isn't empty, we are doing custom filtering
                                        if (this._filters.skills !== '') {
                                            if (
                                                this._doesSkillContainText(
                                                    key,
                                                    skill,
                                                    this._filters.skills
                                                )
                                            ) {
                                                activeSkills[key] = skill;
                                            } // general check if we aren't filtering
                                        } else if (
                                            (skill.value > 0 || this._shownUntrainedSkills) &&
                                            !(
                                                this._isSkillMagic(key, skill) &&
                                                data.data.special !== 'magic'
                                            ) &&
                                            !(
                                                skill.attribute === 'resonance' &&
                                                data.data.special !== 'resonance'
                                            )
                                        ) {
                                            activeSkills[key] = skill;
                                        }
                                    }

                                    _helpers.Helpers.orderKeys(activeSkills);

                                    data.data.skills.active = activeSkills;
                                },
                            },
                            {
                                key: '_prepareItems',
                                value: function _prepareItems(data) {
                                    var inventory = {
                                        weapon: {
                                            label: game.i18n.localize('weapon'),
                                            items: [],
                                            dataset: {
                                                type: 'weapon',
                                            },
                                        },
                                        armor: {
                                            label: game.i18n.localize('armor'),
                                            items: [],
                                            dataset: {
                                                type: 'armor',
                                            },
                                        },
                                        device: {
                                            label: game.i18n.localize('device'),
                                            items: [],
                                            dataset: {
                                                type: 'device',
                                            },
                                        },
                                        equipment: {
                                            label: game.i18n.localize('equipment'),
                                            items: [],
                                            dataset: {
                                                type: 'equipment',
                                            },
                                        },
                                        cyberware: {
                                            label: game.i18n.localize('cyberware'),
                                            items: [],
                                            dataset: {
                                                type: 'cyberware',
                                            },
                                        },
                                    };
                                    var spellbook = {
                                        combat: {
                                            label: 'Combat',
                                            items: [],
                                            dataset: {
                                                type: 'combat',
                                            },
                                        },
                                        detection: {
                                            label: 'Detection',
                                            items: [],
                                            dataset: {
                                                type: 'detection',
                                            },
                                        },
                                        health: {
                                            label: 'Health',
                                            items: [],
                                            dataset: {
                                                type: 'health',
                                            },
                                        },
                                        illusion: {
                                            label: 'Illusion',
                                            items: [],
                                            dataset: {
                                                type: 'illusion',
                                            },
                                        },
                                        manipulation: {
                                            label: 'Manipulation',
                                            items: [],
                                            dataset: {
                                                type: 'manipulation',
                                            },
                                        },
                                    };

                                    var _data$items$reduce = data.items.reduce(
                                            function (arr, item) {
                                                item.img = item.img || DEFAULT_TOKEN;
                                                item.isStack = item.data.quantity
                                                    ? item.data.quantity > 1
                                                    : false;
                                                if (item.type === 'spell') arr[1].push(item);
                                                else if (item.type === 'quality') arr[2].push(item);
                                                else if (item.type === 'adept_power')
                                                    arr[3].push(item);
                                                else if (item.type === 'critter_power')
                                                    arr[4].push(item);
                                                else if (item.type === 'action') arr[5].push(item);
                                                else if (item.type === 'complex_form')
                                                    arr[6].push(item);
                                                else if (item.type === 'lifestyle')
                                                    arr[7].push(item);
                                                else if (item.type === 'contact') arr[8].push(item);
                                                else if (item.type === 'sin') arr[9].push(item);
                                                else if (Object.keys(inventory).includes(item.type))
                                                    arr[0].push(item);
                                                return arr;
                                            },
                                            [[], [], [], [], [], [], [], [], [], []]
                                        ),
                                        _data$items$reduce2 = (0, _slicedToArray2['default'])(
                                            _data$items$reduce,
                                            10
                                        ),
                                        items = _data$items$reduce2[0],
                                        spells = _data$items$reduce2[1],
                                        qualities = _data$items$reduce2[2],
                                        adept_powers = _data$items$reduce2[3],
                                        critter_powers = _data$items$reduce2[4],
                                        actions = _data$items$reduce2[5],
                                        complex_forms = _data$items$reduce2[6],
                                        lifestyles = _data$items$reduce2[7],
                                        contacts = _data$items$reduce2[8],
                                        sins = _data$items$reduce2[9];

                                    var sortByName = function sortByName(i1, i2) {
                                        if (i1.name > i2.name) return 1;
                                        if (i1.name < i2.name) return -1;
                                        return 0;
                                    };

                                    actions.sort(sortByName);
                                    adept_powers.sort(sortByName);
                                    complex_forms.sort(sortByName);
                                    items.sort(sortByName);
                                    spells.sort(sortByName);
                                    complex_forms.sort(sortByName);
                                    contacts.sort(sortByName);
                                    lifestyles.sort(sortByName);
                                    sins.sort(sortByName);
                                    items.forEach(function (item) {
                                        inventory[item.type].items.push(item);
                                    });
                                    data.inventory = Object.values(inventory);
                                    data.magic = {
                                        spellbook: spells,
                                        powers: adept_powers,
                                    };
                                    data.actions = actions;
                                    data.complex_forms = complex_forms;
                                    data.lifestyles = lifestyles;
                                    data.contacts = contacts;
                                    data.sins = sins;
                                    qualities.sort(function (a, b) {
                                        if (
                                            a.data.type === 'positive' &&
                                            b.data.type === 'negative'
                                        )
                                            return -1;
                                        if (
                                            a.data.type === 'negative' &&
                                            b.data.type === 'positive'
                                        )
                                            return 1;
                                        return a.name < b.name ? -1 : 1;
                                    });
                                    data.qualities = qualities;
                                },
                                /* -------------------------------------------- */

                                /**
                                 * Activate event listeners using the prepared sheet HTML
                                 * @param html {HTML}   The prepared HTML object ready to be rendered into the DOM
                                 */
                            },
                            {
                                key: 'activateListeners',
                                value: function activateListeners(html) {
                                    var _this2 = this;

                                    (0, _get3['default'])(
                                        (0, _getPrototypeOf2['default'])(SR5ActorSheet.prototype),
                                        'activateListeners',
                                        this
                                    ).call(this, html);
                                    html.find('.hidden').hide();
                                    html.find('.skill-header').click(function (event) {
                                        event.preventDefault();
                                        _this2._shownUntrainedSkills = !_this2._shownUntrainedSkills;

                                        _this2._render(true);
                                    });
                                    html.find('.has-desc').click(function (event) {
                                        event.preventDefault();
                                        var item = $(event.currentTarget).parents('.item');
                                        var iid = $(item).data().item;
                                        var field = item.next();
                                        field.toggle();

                                        if (iid) {
                                            if (field.is(':visible')) _this2._shownDesc.push(iid);
                                            else
                                                _this2._shownDesc = _this2._shownDesc.filter(
                                                    function (val) {
                                                        return val !== iid;
                                                    }
                                                );
                                        }
                                    });
                                    html.find('#filter-skills').on(
                                        'input',
                                        this._onFilterSkills.bind(this)
                                    );
                                    html.find('.track-roll').click(this._onRollTrack.bind(this));
                                    html.find('.attribute-roll').click(
                                        this._onRollAttribute.bind(this)
                                    );
                                    html.find('.skill-roll').click(
                                        this._onRollActiveSkill.bind(this)
                                    );
                                    html.find('.defense-roll').click(
                                        this._onRollDefense.bind(this)
                                    );
                                    html.find('.attribute-only-roll').click(
                                        this._onRollAttributesOnly.bind(this)
                                    );
                                    html.find('.soak-roll').click(this._onRollSoak.bind(this));
                                    html.find('.drain-roll').click(this._onRollDrain.bind(this));
                                    html.find('.fade-roll').click(this._onRollFade.bind(this));
                                    html.find('.item-roll').click(this._onRollItem.bind(this));
                                    html.find('.item-equip-toggle').click(
                                        this._onEquipItem.bind(this)
                                    );
                                    html.find('.item-qty').change(this._onChangeQty.bind(this));
                                    html.find('.item-rtg').change(this._onChangeRtg.bind(this));
                                    html.find('.item-create').click(this._onItemCreate.bind(this));
                                    html.find('.matrix-roll').click(
                                        this._onRollMatrixAttribute.bind(this)
                                    );
                                    html.find('.basic-roll').click(this._onRollPrompt.bind(this));
                                    html.find('.armor-roll').click(this._onRollArmor.bind(this));
                                    html.find('.add-knowledge').click(
                                        this._onAddKnowledgeSkill.bind(this)
                                    );
                                    html.find('.knowledge-skill').click(
                                        this._onRollKnowledgeSkill.bind(this)
                                    );
                                    html.find('.remove-knowledge').click(
                                        this._onRemoveKnowledgeSkill.bind(this)
                                    );
                                    html.find('.add-language').click(
                                        this._onAddLanguageSkill.bind(this)
                                    );
                                    html.find('.language-skill').click(
                                        this._onRollLanguageSkill.bind(this)
                                    );
                                    html.find('.remove-language').click(
                                        this._onRemoveLanguageSkill.bind(this)
                                    );
                                    html.find('.import-character').click(
                                        this._onShowImportCharacter.bind(this)
                                    );
                                    html.find('.reload-ammo').click(this._onReloadAmmo.bind(this));
                                    html.find('.skill-edit').click(
                                        this._onShowEditSkill.bind(this)
                                    );
                                    html.find('.knowledge-skill-edit').click(
                                        this._onShowEditKnowledgeSkill.bind(this)
                                    );
                                    html.find('.language-skill-edit').click(
                                        this._onShowEditLanguageSkill.bind(this)
                                    );
                                    html.find('.matrix-att-selector').change(
                                        /*#__PURE__*/ (function () {
                                            var _ref = (0, _asyncToGenerator2['default'])(
                                                /*#__PURE__*/ _regenerator['default'].mark(
                                                    function _callee(event) {
                                                        var iid,
                                                            item,
                                                            att,
                                                            deviceAtt,
                                                            oldVal,
                                                            data,
                                                            i,
                                                            tmp,
                                                            key;
                                                        return _regenerator['default'].wrap(
                                                            function _callee$(_context) {
                                                                while (1) {
                                                                    switch (
                                                                        (_context.prev =
                                                                            _context.next)
                                                                    ) {
                                                                        case 0:
                                                                            iid =
                                                                                _this2.actor.data
                                                                                    .data.matrix
                                                                                    .device;
                                                                            item = _this2.actor.getOwnedItem(
                                                                                iid
                                                                            );
                                                                            if (!item)
                                                                                console.error(
                                                                                    'could not find item'
                                                                                ); // grab matrix attribute (sleaze, attack, etc.)

                                                                            att =
                                                                                event.currentTarget
                                                                                    .dataset.att; // grab device attribute (att1, att2, ...)

                                                                            deviceAtt =
                                                                                event.currentTarget
                                                                                    .value; // get current matrix attribute on the device

                                                                            oldVal =
                                                                                item.data.data.atts[
                                                                                    deviceAtt
                                                                                ].att;
                                                                            data = {
                                                                                _id: iid,
                                                                            }; // go through atts on device, setup matrix attributes on it

                                                                            for (
                                                                                i = 1;
                                                                                i <= 4;
                                                                                i++
                                                                            ) {
                                                                                tmp = 'att'.concat(
                                                                                    i
                                                                                );
                                                                                key = 'data.atts.att'.concat(
                                                                                    i,
                                                                                    '.att'
                                                                                );

                                                                                if (
                                                                                    tmp ===
                                                                                    deviceAtt
                                                                                ) {
                                                                                    data[key] = att;
                                                                                } else if (
                                                                                    item.data.data
                                                                                        .atts[
                                                                                        'att'.concat(
                                                                                            i
                                                                                        )
                                                                                    ].att === att
                                                                                ) {
                                                                                    data[
                                                                                        key
                                                                                    ] = oldVal;
                                                                                }
                                                                            }

                                                                            _context.next = 10;
                                                                            return _this2.actor.updateOwnedItem(
                                                                                data
                                                                            );

                                                                        case 10:
                                                                        case 'end':
                                                                            return _context.stop();
                                                                    }
                                                                }
                                                            },
                                                            _callee
                                                        );
                                                    }
                                                )
                                            );

                                            return function (_x) {
                                                return _ref.apply(this, arguments);
                                            };
                                        })()
                                    ); // Update Inventory Item

                                    html.find('.item-edit').click(function (event) {
                                        event.preventDefault();
                                        var iid = event.currentTarget.closest('.item').dataset
                                            .itemId;

                                        var item = _this2.actor.getOwnedItem(iid);

                                        item.sheet.render(true);
                                    }); // Delete Inventory Item

                                    html.find('.item-delete').click(function (event) {
                                        event.preventDefault();
                                        var iid = event.currentTarget.closest('.item').dataset
                                            .itemId;
                                        var el = $(event.currentTarget).parents('.item');

                                        _this2.actor.deleteOwnedItem(iid);

                                        el.slideUp(200, function () {
                                            return _this2.render(false);
                                        });
                                    }); // Drag inventory item

                                    var handler = function handler(ev) {
                                        return _this2._onDragItemStart(ev);
                                    };

                                    html.find('.item').each(function (i, item) {
                                        if (item.dataset && item.dataset.itemId) {
                                            item.setAttribute('draggable', true);
                                            item.addEventListener('dragstart', handler, false);
                                        }
                                    });
                                },
                            },
                            {
                                key: '_onFilterSkills',
                                value: (function () {
                                    var _onFilterSkills2 = (0, _asyncToGenerator2['default'])(
                                        /*#__PURE__*/ _regenerator['default'].mark(
                                            function _callee2(event) {
                                                return _regenerator['default'].wrap(
                                                    function _callee2$(_context2) {
                                                        while (1) {
                                                            switch (
                                                                (_context2.prev = _context2.next)
                                                            ) {
                                                                case 0:
                                                                    this._filters.skills =
                                                                        event.currentTarget.value;
                                                                    this.render();

                                                                case 2:
                                                                case 'end':
                                                                    return _context2.stop();
                                                            }
                                                        }
                                                    },
                                                    _callee2,
                                                    this
                                                );
                                            }
                                        )
                                    );

                                    function _onFilterSkills(_x2) {
                                        return _onFilterSkills2.apply(this, arguments);
                                    }

                                    return _onFilterSkills;
                                })(),
                            },
                            {
                                key: '_onReloadAmmo',
                                value: (function () {
                                    var _onReloadAmmo2 = (0, _asyncToGenerator2['default'])(
                                        /*#__PURE__*/ _regenerator['default'].mark(
                                            function _callee3(event) {
                                                var iid, item;
                                                return _regenerator['default'].wrap(
                                                    function _callee3$(_context3) {
                                                        while (1) {
                                                            switch (
                                                                (_context3.prev = _context3.next)
                                                            ) {
                                                                case 0:
                                                                    event.preventDefault();
                                                                    iid = event.currentTarget.closest(
                                                                        '.item'
                                                                    ).dataset.itemId;
                                                                    item = this.actor.getOwnedItem(
                                                                        iid
                                                                    );

                                                                    if (!item) {
                                                                        _context3.next = 5;
                                                                        break;
                                                                    }

                                                                    return _context3.abrupt(
                                                                        'return',
                                                                        item.reloadAmmo()
                                                                    );

                                                                case 5:
                                                                case 'end':
                                                                    return _context3.stop();
                                                            }
                                                        }
                                                    },
                                                    _callee3,
                                                    this
                                                );
                                            }
                                        )
                                    );

                                    function _onReloadAmmo(_x3) {
                                        return _onReloadAmmo2.apply(this, arguments);
                                    }

                                    return _onReloadAmmo;
                                })(),
                            },
                            {
                                key: '_onItemCreate',
                                value: function _onItemCreate(event) {
                                    event.preventDefault();
                                    var header = event.currentTarget;
                                    var type = header.dataset.type;
                                    var itemData = {
                                        name: 'New '.concat(_helpers.Helpers.label(type)),
                                        type: type,
                                        data: duplicate(header.dataset),
                                    };
                                    delete itemData.data['type'];
                                    return this.actor.createOwnedItem(itemData);
                                },
                            },
                            {
                                key: '_onAddLanguageSkill',
                                value: (function () {
                                    var _onAddLanguageSkill2 = (0, _asyncToGenerator2['default'])(
                                        /*#__PURE__*/ _regenerator['default'].mark(
                                            function _callee4(event) {
                                                return _regenerator['default'].wrap(
                                                    function _callee4$(_context4) {
                                                        while (1) {
                                                            switch (
                                                                (_context4.prev = _context4.next)
                                                            ) {
                                                                case 0:
                                                                    event.preventDefault();
                                                                    this.actor.addLanguageSkill({
                                                                        name: '',
                                                                    });

                                                                case 2:
                                                                case 'end':
                                                                    return _context4.stop();
                                                            }
                                                        }
                                                    },
                                                    _callee4,
                                                    this
                                                );
                                            }
                                        )
                                    );

                                    function _onAddLanguageSkill(_x4) {
                                        return _onAddLanguageSkill2.apply(this, arguments);
                                    }

                                    return _onAddLanguageSkill;
                                })(),
                            },
                            {
                                key: '_onRemoveLanguageSkill',
                                value: (function () {
                                    var _onRemoveLanguageSkill2 = (0,
                                    _asyncToGenerator2['default'])(
                                        /*#__PURE__*/ _regenerator['default'].mark(
                                            function _callee5(event) {
                                                var skillId;
                                                return _regenerator['default'].wrap(
                                                    function _callee5$(_context5) {
                                                        while (1) {
                                                            switch (
                                                                (_context5.prev = _context5.next)
                                                            ) {
                                                                case 0:
                                                                    event.preventDefault();
                                                                    skillId =
                                                                        event.currentTarget.dataset
                                                                            .skill;
                                                                    this.actor.removeLanguageSkill(
                                                                        skillId
                                                                    );

                                                                case 3:
                                                                case 'end':
                                                                    return _context5.stop();
                                                            }
                                                        }
                                                    },
                                                    _callee5,
                                                    this
                                                );
                                            }
                                        )
                                    );

                                    function _onRemoveLanguageSkill(_x5) {
                                        return _onRemoveLanguageSkill2.apply(this, arguments);
                                    }

                                    return _onRemoveLanguageSkill;
                                })(),
                            },
                            {
                                key: '_onAddKnowledgeSkill',
                                value: (function () {
                                    var _onAddKnowledgeSkill2 = (0, _asyncToGenerator2['default'])(
                                        /*#__PURE__*/ _regenerator['default'].mark(
                                            function _callee6(event) {
                                                var category;
                                                return _regenerator['default'].wrap(
                                                    function _callee6$(_context6) {
                                                        while (1) {
                                                            switch (
                                                                (_context6.prev = _context6.next)
                                                            ) {
                                                                case 0:
                                                                    event.preventDefault();
                                                                    category =
                                                                        event.currentTarget.dataset
                                                                            .category;
                                                                    this.actor.addKnowledgeSkill(
                                                                        category
                                                                    );

                                                                case 3:
                                                                case 'end':
                                                                    return _context6.stop();
                                                            }
                                                        }
                                                    },
                                                    _callee6,
                                                    this
                                                );
                                            }
                                        )
                                    );

                                    function _onAddKnowledgeSkill(_x6) {
                                        return _onAddKnowledgeSkill2.apply(this, arguments);
                                    }

                                    return _onAddKnowledgeSkill;
                                })(),
                            },
                            {
                                key: '_onRemoveKnowledgeSkill',
                                value: (function () {
                                    var _onRemoveKnowledgeSkill2 = (0,
                                    _asyncToGenerator2['default'])(
                                        /*#__PURE__*/ _regenerator['default'].mark(
                                            function _callee7(event) {
                                                var skillId, category;
                                                return _regenerator['default'].wrap(
                                                    function _callee7$(_context7) {
                                                        while (1) {
                                                            switch (
                                                                (_context7.prev = _context7.next)
                                                            ) {
                                                                case 0:
                                                                    event.preventDefault();
                                                                    skillId =
                                                                        event.currentTarget.dataset
                                                                            .skill;
                                                                    category =
                                                                        event.currentTarget.dataset
                                                                            .category;
                                                                    this.actor.removeKnowledgeSkill(
                                                                        skillId,
                                                                        category
                                                                    );

                                                                case 4:
                                                                case 'end':
                                                                    return _context7.stop();
                                                            }
                                                        }
                                                    },
                                                    _callee7,
                                                    this
                                                );
                                            }
                                        )
                                    );

                                    function _onRemoveKnowledgeSkill(_x7) {
                                        return _onRemoveKnowledgeSkill2.apply(this, arguments);
                                    }

                                    return _onRemoveKnowledgeSkill;
                                })(),
                            },
                            {
                                key: '_onChangeRtg',
                                value: (function () {
                                    var _onChangeRtg2 = (0, _asyncToGenerator2['default'])(
                                        /*#__PURE__*/ _regenerator['default'].mark(
                                            function _callee8(event) {
                                                var iid, item, rtg;
                                                return _regenerator['default'].wrap(
                                                    function _callee8$(_context8) {
                                                        while (1) {
                                                            switch (
                                                                (_context8.prev = _context8.next)
                                                            ) {
                                                                case 0:
                                                                    iid = event.currentTarget.closest(
                                                                        '.item'
                                                                    ).dataset.itemId;
                                                                    item = this.actor.getOwnedItem(
                                                                        iid
                                                                    );
                                                                    rtg = parseInt(
                                                                        event.currentTarget.value
                                                                    );

                                                                    if (item && rtg) {
                                                                        item.update({
                                                                            'data.technology.rating': rtg,
                                                                        });
                                                                    }

                                                                case 4:
                                                                case 'end':
                                                                    return _context8.stop();
                                                            }
                                                        }
                                                    },
                                                    _callee8,
                                                    this
                                                );
                                            }
                                        )
                                    );

                                    function _onChangeRtg(_x8) {
                                        return _onChangeRtg2.apply(this, arguments);
                                    }

                                    return _onChangeRtg;
                                })(),
                            },
                            {
                                key: '_onChangeQty',
                                value: (function () {
                                    var _onChangeQty2 = (0, _asyncToGenerator2['default'])(
                                        /*#__PURE__*/ _regenerator['default'].mark(
                                            function _callee9(event) {
                                                var iid, item, qty;
                                                return _regenerator['default'].wrap(
                                                    function _callee9$(_context9) {
                                                        while (1) {
                                                            switch (
                                                                (_context9.prev = _context9.next)
                                                            ) {
                                                                case 0:
                                                                    iid = event.currentTarget.closest(
                                                                        '.item'
                                                                    ).dataset.itemId;
                                                                    item = this.actor.getOwnedItem(
                                                                        iid
                                                                    );
                                                                    qty = parseInt(
                                                                        event.currentTarget.value
                                                                    );

                                                                    if (item && qty) {
                                                                        item.data.data.technology.quantity = qty;
                                                                        item.update({
                                                                            'data.technology.quantity': qty,
                                                                        });
                                                                    }

                                                                case 4:
                                                                case 'end':
                                                                    return _context9.stop();
                                                            }
                                                        }
                                                    },
                                                    _callee9,
                                                    this
                                                );
                                            }
                                        )
                                    );

                                    function _onChangeQty(_x9) {
                                        return _onChangeQty2.apply(this, arguments);
                                    }

                                    return _onChangeQty;
                                })(),
                            },
                            {
                                key: '_onEquipItem',
                                value: (function () {
                                    var _onEquipItem2 = (0, _asyncToGenerator2['default'])(
                                        /*#__PURE__*/ _regenerator['default'].mark(
                                            function _callee10(event) {
                                                var iid,
                                                    item,
                                                    itemData,
                                                    newItems,
                                                    _iterator,
                                                    _step,
                                                    ite;

                                                return _regenerator['default'].wrap(
                                                    function _callee10$(_context10) {
                                                        while (1) {
                                                            switch (
                                                                (_context10.prev = _context10.next)
                                                            ) {
                                                                case 0:
                                                                    event.preventDefault();
                                                                    iid = event.currentTarget.closest(
                                                                        '.item'
                                                                    ).dataset.itemId;
                                                                    item = this.actor.getOwnedItem(
                                                                        iid
                                                                    );

                                                                    if (!item) {
                                                                        _context10.next = 10;
                                                                        break;
                                                                    }

                                                                    itemData = item.data.data;
                                                                    newItems = [];

                                                                    if (item.type === 'device') {
                                                                        // turn off all other devices than the one that is being equipped
                                                                        // if clicking the equipped, toggle it
                                                                        _iterator = _createForOfIteratorHelper(
                                                                            this.actor.items.filter(
                                                                                function (i) {
                                                                                    return (
                                                                                        i.type ===
                                                                                        'device'
                                                                                    );
                                                                                }
                                                                            )
                                                                        );

                                                                        try {
                                                                            for (
                                                                                _iterator.s();
                                                                                !(_step = _iterator.n())
                                                                                    .done;

                                                                            ) {
                                                                                ite = _step.value;
                                                                                newItems.push({
                                                                                    _id: ite._id,
                                                                                    'data.technology.equipped':
                                                                                        ite._id ===
                                                                                        iid
                                                                                            ? !itemData
                                                                                                  .technology
                                                                                                  .equipped
                                                                                            : false,
                                                                                });
                                                                            }
                                                                        } catch (err) {
                                                                            _iterator.e(err);
                                                                        } finally {
                                                                            _iterator.f();
                                                                        }
                                                                    } else {
                                                                        newItems.push({
                                                                            _id: iid,
                                                                            'data.technology.equipped': !itemData
                                                                                .technology
                                                                                .equipped,
                                                                        });
                                                                    }

                                                                    _context10.next = 9;
                                                                    return this.actor.updateEmbeddedEntity(
                                                                        'OwnedItem',
                                                                        newItems
                                                                    );

                                                                case 9:
                                                                    this.actor.render();

                                                                case 10:
                                                                case 'end':
                                                                    return _context10.stop();
                                                            }
                                                        }
                                                    },
                                                    _callee10,
                                                    this
                                                );
                                            }
                                        )
                                    );

                                    function _onEquipItem(_x10) {
                                        return _onEquipItem2.apply(this, arguments);
                                    }

                                    return _onEquipItem;
                                })(),
                            },
                            {
                                key: '_onRollTrack',
                                value: (function () {
                                    var _onRollTrack2 = (0, _asyncToGenerator2['default'])(
                                        /*#__PURE__*/ _regenerator['default'].mark(
                                            function _callee11(event) {
                                                var track;
                                                return _regenerator['default'].wrap(
                                                    function _callee11$(_context11) {
                                                        while (1) {
                                                            switch (
                                                                (_context11.prev = _context11.next)
                                                            ) {
                                                                case 0:
                                                                    event.preventDefault();
                                                                    track = event.currentTarget.closest(
                                                                        '.attribute'
                                                                    ).dataset.track;
                                                                    this.actor.rollNaturalRecovery(
                                                                        track,
                                                                        event
                                                                    );

                                                                case 3:
                                                                case 'end':
                                                                    return _context11.stop();
                                                            }
                                                        }
                                                    },
                                                    _callee11,
                                                    this
                                                );
                                            }
                                        )
                                    );

                                    function _onRollTrack(_x11) {
                                        return _onRollTrack2.apply(this, arguments);
                                    }

                                    return _onRollTrack;
                                })(),
                            },
                            {
                                key: '_onRollPrompt',
                                value: (function () {
                                    var _onRollPrompt2 = (0, _asyncToGenerator2['default'])(
                                        /*#__PURE__*/ _regenerator['default'].mark(
                                            function _callee12(event) {
                                                return _regenerator['default'].wrap(
                                                    function _callee12$(_context12) {
                                                        while (1) {
                                                            switch (
                                                                (_context12.prev = _context12.next)
                                                            ) {
                                                                case 0:
                                                                    event.preventDefault();
                                                                    this.actor.promptRoll({
                                                                        event: event,
                                                                    });

                                                                case 2:
                                                                case 'end':
                                                                    return _context12.stop();
                                                            }
                                                        }
                                                    },
                                                    _callee12,
                                                    this
                                                );
                                            }
                                        )
                                    );

                                    function _onRollPrompt(_x12) {
                                        return _onRollPrompt2.apply(this, arguments);
                                    }

                                    return _onRollPrompt;
                                })(),
                            },
                            {
                                key: '_onRollItem',
                                value: (function () {
                                    var _onRollItem2 = (0, _asyncToGenerator2['default'])(
                                        /*#__PURE__*/ _regenerator['default'].mark(
                                            function _callee13(event) {
                                                var iid, item;
                                                return _regenerator['default'].wrap(
                                                    function _callee13$(_context13) {
                                                        while (1) {
                                                            switch (
                                                                (_context13.prev = _context13.next)
                                                            ) {
                                                                case 0:
                                                                    event.preventDefault();
                                                                    iid = event.currentTarget.closest(
                                                                        '.item'
                                                                    ).dataset.itemId;
                                                                    item = this.actor.getOwnedItem(
                                                                        iid
                                                                    );
                                                                    item.roll(event);

                                                                case 4:
                                                                case 'end':
                                                                    return _context13.stop();
                                                            }
                                                        }
                                                    },
                                                    _callee13,
                                                    this
                                                );
                                            }
                                        )
                                    );

                                    function _onRollItem(_x13) {
                                        return _onRollItem2.apply(this, arguments);
                                    }

                                    return _onRollItem;
                                })(),
                            },
                            {
                                key: '_onRollFade',
                                value: (function () {
                                    var _onRollFade2 = (0, _asyncToGenerator2['default'])(
                                        /*#__PURE__*/ _regenerator['default'].mark(
                                            function _callee14(event) {
                                                return _regenerator['default'].wrap(
                                                    function _callee14$(_context14) {
                                                        while (1) {
                                                            switch (
                                                                (_context14.prev = _context14.next)
                                                            ) {
                                                                case 0:
                                                                    event.preventDefault();
                                                                    this.actor.rollFade({
                                                                        event: event,
                                                                    });

                                                                case 2:
                                                                case 'end':
                                                                    return _context14.stop();
                                                            }
                                                        }
                                                    },
                                                    _callee14,
                                                    this
                                                );
                                            }
                                        )
                                    );

                                    function _onRollFade(_x14) {
                                        return _onRollFade2.apply(this, arguments);
                                    }

                                    return _onRollFade;
                                })(),
                            },
                            {
                                key: '_onRollDrain',
                                value: (function () {
                                    var _onRollDrain2 = (0, _asyncToGenerator2['default'])(
                                        /*#__PURE__*/ _regenerator['default'].mark(
                                            function _callee15(event) {
                                                return _regenerator['default'].wrap(
                                                    function _callee15$(_context15) {
                                                        while (1) {
                                                            switch (
                                                                (_context15.prev = _context15.next)
                                                            ) {
                                                                case 0:
                                                                    event.preventDefault();
                                                                    this.actor.rollDrain({
                                                                        event: event,
                                                                    });

                                                                case 2:
                                                                case 'end':
                                                                    return _context15.stop();
                                                            }
                                                        }
                                                    },
                                                    _callee15,
                                                    this
                                                );
                                            }
                                        )
                                    );

                                    function _onRollDrain(_x15) {
                                        return _onRollDrain2.apply(this, arguments);
                                    }

                                    return _onRollDrain;
                                })(),
                            },
                            {
                                key: '_onRollArmor',
                                value: (function () {
                                    var _onRollArmor2 = (0, _asyncToGenerator2['default'])(
                                        /*#__PURE__*/ _regenerator['default'].mark(
                                            function _callee16(event) {
                                                return _regenerator['default'].wrap(
                                                    function _callee16$(_context16) {
                                                        while (1) {
                                                            switch (
                                                                (_context16.prev = _context16.next)
                                                            ) {
                                                                case 0:
                                                                    event.preventDefault();
                                                                    this.actor.rollArmor({
                                                                        event: event,
                                                                    });

                                                                case 2:
                                                                case 'end':
                                                                    return _context16.stop();
                                                            }
                                                        }
                                                    },
                                                    _callee16,
                                                    this
                                                );
                                            }
                                        )
                                    );

                                    function _onRollArmor(_x16) {
                                        return _onRollArmor2.apply(this, arguments);
                                    }

                                    return _onRollArmor;
                                })(),
                            },
                            {
                                key: '_onRollDefense',
                                value: (function () {
                                    var _onRollDefense2 = (0, _asyncToGenerator2['default'])(
                                        /*#__PURE__*/ _regenerator['default'].mark(
                                            function _callee17(event) {
                                                return _regenerator['default'].wrap(
                                                    function _callee17$(_context17) {
                                                        while (1) {
                                                            switch (
                                                                (_context17.prev = _context17.next)
                                                            ) {
                                                                case 0:
                                                                    event.preventDefault();
                                                                    this.actor.rollDefense({
                                                                        event: event,
                                                                    });

                                                                case 2:
                                                                case 'end':
                                                                    return _context17.stop();
                                                            }
                                                        }
                                                    },
                                                    _callee17,
                                                    this
                                                );
                                            }
                                        )
                                    );

                                    function _onRollDefense(_x17) {
                                        return _onRollDefense2.apply(this, arguments);
                                    }

                                    return _onRollDefense;
                                })(),
                            },
                            {
                                key: '_onRollMatrixAttribute',
                                value: (function () {
                                    var _onRollMatrixAttribute2 = (0,
                                    _asyncToGenerator2['default'])(
                                        /*#__PURE__*/ _regenerator['default'].mark(
                                            function _callee18(event) {
                                                var attr;
                                                return _regenerator['default'].wrap(
                                                    function _callee18$(_context18) {
                                                        while (1) {
                                                            switch (
                                                                (_context18.prev = _context18.next)
                                                            ) {
                                                                case 0:
                                                                    event.preventDefault();
                                                                    attr =
                                                                        event.currentTarget.dataset
                                                                            .attribute;
                                                                    this.actor.rollMatrixAttribute(
                                                                        attr,
                                                                        {
                                                                            event: event,
                                                                        }
                                                                    );

                                                                case 3:
                                                                case 'end':
                                                                    return _context18.stop();
                                                            }
                                                        }
                                                    },
                                                    _callee18,
                                                    this
                                                );
                                            }
                                        )
                                    );

                                    function _onRollMatrixAttribute(_x18) {
                                        return _onRollMatrixAttribute2.apply(this, arguments);
                                    }

                                    return _onRollMatrixAttribute;
                                })(),
                            },
                            {
                                key: '_onRollSoak',
                                value: (function () {
                                    var _onRollSoak2 = (0, _asyncToGenerator2['default'])(
                                        /*#__PURE__*/ _regenerator['default'].mark(
                                            function _callee19(event) {
                                                return _regenerator['default'].wrap(
                                                    function _callee19$(_context19) {
                                                        while (1) {
                                                            switch (
                                                                (_context19.prev = _context19.next)
                                                            ) {
                                                                case 0:
                                                                    event.preventDefault();
                                                                    this.actor.rollSoak({
                                                                        event: event,
                                                                    });

                                                                case 2:
                                                                case 'end':
                                                                    return _context19.stop();
                                                            }
                                                        }
                                                    },
                                                    _callee19,
                                                    this
                                                );
                                            }
                                        )
                                    );

                                    function _onRollSoak(_x19) {
                                        return _onRollSoak2.apply(this, arguments);
                                    }

                                    return _onRollSoak;
                                })(),
                            },
                            {
                                key: '_onRollAttributesOnly',
                                value: (function () {
                                    var _onRollAttributesOnly2 = (0, _asyncToGenerator2['default'])(
                                        /*#__PURE__*/ _regenerator['default'].mark(
                                            function _callee20(event) {
                                                var roll;
                                                return _regenerator['default'].wrap(
                                                    function _callee20$(_context20) {
                                                        while (1) {
                                                            switch (
                                                                (_context20.prev = _context20.next)
                                                            ) {
                                                                case 0:
                                                                    event.preventDefault();
                                                                    roll =
                                                                        event.currentTarget.dataset
                                                                            .roll;
                                                                    this.actor.rollAttributesTest(
                                                                        roll,
                                                                        {
                                                                            event: event,
                                                                        }
                                                                    );

                                                                case 3:
                                                                case 'end':
                                                                    return _context20.stop();
                                                            }
                                                        }
                                                    },
                                                    _callee20,
                                                    this
                                                );
                                            }
                                        )
                                    );

                                    function _onRollAttributesOnly(_x20) {
                                        return _onRollAttributesOnly2.apply(this, arguments);
                                    }

                                    return _onRollAttributesOnly;
                                })(),
                            },
                            {
                                key: '_onRollKnowledgeSkill',
                                value: (function () {
                                    var _onRollKnowledgeSkill2 = (0, _asyncToGenerator2['default'])(
                                        /*#__PURE__*/ _regenerator['default'].mark(
                                            function _callee21(event) {
                                                var skill, category;
                                                return _regenerator['default'].wrap(
                                                    function _callee21$(_context21) {
                                                        while (1) {
                                                            switch (
                                                                (_context21.prev = _context21.next)
                                                            ) {
                                                                case 0:
                                                                    event.preventDefault();
                                                                    skill =
                                                                        event.currentTarget.dataset
                                                                            .skill;
                                                                    category =
                                                                        event.currentTarget.dataset
                                                                            .category;
                                                                    this.actor.rollKnowledgeSkill(
                                                                        category,
                                                                        skill,
                                                                        {
                                                                            event: event,
                                                                        }
                                                                    );

                                                                case 4:
                                                                case 'end':
                                                                    return _context21.stop();
                                                            }
                                                        }
                                                    },
                                                    _callee21,
                                                    this
                                                );
                                            }
                                        )
                                    );

                                    function _onRollKnowledgeSkill(_x21) {
                                        return _onRollKnowledgeSkill2.apply(this, arguments);
                                    }

                                    return _onRollKnowledgeSkill;
                                })(),
                            },
                            {
                                key: '_onRollLanguageSkill',
                                value: (function () {
                                    var _onRollLanguageSkill2 = (0, _asyncToGenerator2['default'])(
                                        /*#__PURE__*/ _regenerator['default'].mark(
                                            function _callee22(event) {
                                                var skill;
                                                return _regenerator['default'].wrap(
                                                    function _callee22$(_context22) {
                                                        while (1) {
                                                            switch (
                                                                (_context22.prev = _context22.next)
                                                            ) {
                                                                case 0:
                                                                    event.preventDefault();
                                                                    skill =
                                                                        event.currentTarget.dataset
                                                                            .skill;
                                                                    this.actor.rollLanguageSkill(
                                                                        skill,
                                                                        {
                                                                            event: event,
                                                                        }
                                                                    );

                                                                case 3:
                                                                case 'end':
                                                                    return _context22.stop();
                                                            }
                                                        }
                                                    },
                                                    _callee22,
                                                    this
                                                );
                                            }
                                        )
                                    );

                                    function _onRollLanguageSkill(_x22) {
                                        return _onRollLanguageSkill2.apply(this, arguments);
                                    }

                                    return _onRollLanguageSkill;
                                })(),
                            },
                            {
                                key: '_onRollActiveSkill',
                                value: (function () {
                                    var _onRollActiveSkill2 = (0, _asyncToGenerator2['default'])(
                                        /*#__PURE__*/ _regenerator['default'].mark(
                                            function _callee23(event) {
                                                var skill;
                                                return _regenerator['default'].wrap(
                                                    function _callee23$(_context23) {
                                                        while (1) {
                                                            switch (
                                                                (_context23.prev = _context23.next)
                                                            ) {
                                                                case 0:
                                                                    event.preventDefault();
                                                                    skill =
                                                                        event.currentTarget.dataset
                                                                            .skill;
                                                                    this.actor.rollActiveSkill(
                                                                        skill,
                                                                        {
                                                                            event: event,
                                                                        }
                                                                    );

                                                                case 3:
                                                                case 'end':
                                                                    return _context23.stop();
                                                            }
                                                        }
                                                    },
                                                    _callee23,
                                                    this
                                                );
                                            }
                                        )
                                    );

                                    function _onRollActiveSkill(_x23) {
                                        return _onRollActiveSkill2.apply(this, arguments);
                                    }

                                    return _onRollActiveSkill;
                                })(),
                            },
                            {
                                key: '_onRollAttribute',
                                value: (function () {
                                    var _onRollAttribute2 = (0, _asyncToGenerator2['default'])(
                                        /*#__PURE__*/ _regenerator['default'].mark(
                                            function _callee24(event) {
                                                var attr;
                                                return _regenerator['default'].wrap(
                                                    function _callee24$(_context24) {
                                                        while (1) {
                                                            switch (
                                                                (_context24.prev = _context24.next)
                                                            ) {
                                                                case 0:
                                                                    event.preventDefault();
                                                                    attr =
                                                                        event.currentTarget.dataset
                                                                            .attribute;
                                                                    this.actor.rollAttribute(attr, {
                                                                        event: event,
                                                                    });

                                                                case 3:
                                                                case 'end':
                                                                    return _context24.stop();
                                                            }
                                                        }
                                                    },
                                                    _callee24,
                                                    this
                                                );
                                            }
                                        )
                                    );

                                    function _onRollAttribute(_x24) {
                                        return _onRollAttribute2.apply(this, arguments);
                                    }

                                    return _onRollAttribute;
                                })(),
                                /**
                                 * @private
                                 */
                            },
                            {
                                key: '_findActiveList',
                                value: function _findActiveList() {
                                    return this.element.find('.tab.active .scroll-area');
                                },
                                /**
                                 * @private
                                 */
                            },
                            {
                                key: '_render',
                                value: (function () {
                                    var _render2 = (0, _asyncToGenerator2['default'])(
                                        /*#__PURE__*/ _regenerator['default'].mark(
                                            function _callee25() {
                                                var _get2;

                                                var focus,
                                                    _len2,
                                                    args,
                                                    _key2,
                                                    element,
                                                    _args25 = arguments;

                                                return _regenerator['default'].wrap(
                                                    function _callee25$(_context25) {
                                                        while (1) {
                                                            switch (
                                                                (_context25.prev = _context25.next)
                                                            ) {
                                                                case 0:
                                                                    focus = this.element.find(
                                                                        ':focus'
                                                                    );
                                                                    focus = focus.length
                                                                        ? focus[0]
                                                                        : null;

                                                                    this._saveScrollPositions();

                                                                    for (
                                                                        _len2 = _args25.length,
                                                                            args = new Array(_len2),
                                                                            _key2 = 0;
                                                                        _key2 < _len2;
                                                                        _key2++
                                                                    ) {
                                                                        args[_key2] =
                                                                            _args25[_key2];
                                                                    }

                                                                    _context25.next = 6;
                                                                    return (_get2 = (0,
                                                                    _get3['default'])(
                                                                        (0,
                                                                        _getPrototypeOf2[
                                                                            'default'
                                                                        ])(SR5ActorSheet.prototype),
                                                                        '_render',
                                                                        this
                                                                    )).call.apply(
                                                                        _get2,
                                                                        [this].concat(args)
                                                                    );

                                                                case 6:
                                                                    this._restoreScrollPositions();

                                                                    if (focus && focus.name) {
                                                                        element = this.form[
                                                                            focus.name
                                                                        ];

                                                                        if (element) {
                                                                            element.focus(); // set the selection range on the focus formed from before (keeps track of cursor in input)

                                                                            element.setSelectionRange &&
                                                                                element.setSelectionRange(
                                                                                    focus.selectionStart,
                                                                                    focus.selectionEnd
                                                                                );
                                                                        }
                                                                    }

                                                                case 8:
                                                                case 'end':
                                                                    return _context25.stop();
                                                            }
                                                        }
                                                    },
                                                    _callee25,
                                                    this
                                                );
                                            }
                                        )
                                    );

                                    function _render() {
                                        return _render2.apply(this, arguments);
                                    }

                                    return _render;
                                })(),
                                /**
                                 * @private
                                 */
                            },
                            {
                                key: '_restoreScrollPositions',
                                value: function _restoreScrollPositions() {
                                    var activeList = this._findActiveList();

                                    if (activeList.length && this._scroll != null) {
                                        activeList.prop('scrollTop', this._scroll);
                                    }
                                },
                                /**
                                 * @private
                                 */
                            },
                            {
                                key: '_saveScrollPositions',
                                value: function _saveScrollPositions() {
                                    var activeList = this._findActiveList();

                                    if (activeList.length) {
                                        this._scroll = activeList.prop('scrollTop');
                                    }
                                },
                            },
                            {
                                key: '_onShowEditKnowledgeSkill',
                                value: function _onShowEditKnowledgeSkill(event) {
                                    event.preventDefault();
                                    var skill = event.currentTarget.dataset.skill;
                                    var category = event.currentTarget.dataset.category;
                                    new _knowledgeSkillEdit.KnowledgeSkillEditForm(
                                        this.actor,
                                        skill,
                                        category,
                                        {
                                            event: event,
                                        }
                                    ).render(true);
                                },
                            },
                            {
                                key: '_onShowEditLanguageSkill',
                                value: function _onShowEditLanguageSkill(event) {
                                    event.preventDefault();
                                    var skill = event.currentTarget.dataset.skill;
                                    new _languageSkillEdit.LanguageSkillEditForm(
                                        this.actor,
                                        skill,
                                        {
                                            event: event,
                                        }
                                    ).render(true);
                                },
                            },
                            {
                                key: '_onShowEditSkill',
                                value: function _onShowEditSkill(event) {
                                    event.preventDefault();
                                    var skill = event.currentTarget.dataset.skill;
                                    new _skillEdit.SkillEditForm(this.actor, skill, {
                                        event: event,
                                    }).render(true);
                                },
                            },
                            {
                                key: '_onShowImportCharacter',
                                value: function _onShowImportCharacter(event) {
                                    event.preventDefault();
                                    var options = {
                                        name: 'chummer-import',
                                        title: 'Chummer Import',
                                    };
                                    new _chummerImportForm.ChummerImportForm(
                                        this.actor,
                                        options
                                    ).render(true);
                                },
                            },
                        ],
                        [
                            {
                                key: 'defaultOptions',
                                get: function get() {
                                    return mergeObject(
                                        (0, _get3['default'])(
                                            (0, _getPrototypeOf2['default'])(SR5ActorSheet),
                                            'defaultOptions',
                                            this
                                        ),
                                        {
                                            classes: ['sr5', 'sheet', 'actor'],
                                            template:
                                                'systems/shadowrun5e/templates/actor/character.html',
                                            width: 880,
                                            height: 690,
                                            tabs: [
                                                {
                                                    navSelector: '.tabs',
                                                    contentSelector: '.sheetbody',
                                                    initial: 'skills',
                                                },
                                            ],
                                        }
                                    );
                                },
                            },
                        ]
                    );
                    return SR5ActorSheet;
                })(ActorSheet);

                exports.SR5ActorSheet = SR5ActorSheet;
            },
            {
                '../apps/chummer-import-form.js': 3,
                '../apps/knowledge-skill-edit.js': 5,
                '../apps/language-skill-edit.js': 6,
                '../apps/skill-edit.js': 7,
                '../helpers.js': 15,
                '@babel/runtime/helpers/asyncToGenerator': 27,
                '@babel/runtime/helpers/classCallCheck': 28,
                '@babel/runtime/helpers/createClass': 29,
                '@babel/runtime/helpers/get': 31,
                '@babel/runtime/helpers/getPrototypeOf': 32,
                '@babel/runtime/helpers/inherits': 33,
                '@babel/runtime/helpers/interopRequireDefault': 34,
                '@babel/runtime/helpers/possibleConstructorReturn': 39,
                '@babel/runtime/helpers/slicedToArray': 41,
                '@babel/runtime/regenerator': 46,
            },
        ],
        3: [
            function (require, module, exports) {
                'use strict';

                var _interopRequireDefault = require('@babel/runtime/helpers/interopRequireDefault');

                Object.defineProperty(exports, '__esModule', {
                    value: true,
                });
                exports.ChummerImportForm = void 0;

                var _regenerator = _interopRequireDefault(require('@babel/runtime/regenerator'));

                var _asyncToGenerator2 = _interopRequireDefault(
                    require('@babel/runtime/helpers/asyncToGenerator')
                );

                var _classCallCheck2 = _interopRequireDefault(
                    require('@babel/runtime/helpers/classCallCheck')
                );

                var _createClass2 = _interopRequireDefault(
                    require('@babel/runtime/helpers/createClass')
                );

                var _get2 = _interopRequireDefault(require('@babel/runtime/helpers/get'));

                var _inherits2 = _interopRequireDefault(require('@babel/runtime/helpers/inherits'));

                var _possibleConstructorReturn2 = _interopRequireDefault(
                    require('@babel/runtime/helpers/possibleConstructorReturn')
                );

                var _getPrototypeOf2 = _interopRequireDefault(
                    require('@babel/runtime/helpers/getPrototypeOf')
                );

                function _createSuper(Derived) {
                    var hasNativeReflectConstruct = _isNativeReflectConstruct();
                    return function _createSuperInternal() {
                        var Super = (0, _getPrototypeOf2['default'])(Derived),
                            result;
                        if (hasNativeReflectConstruct) {
                            var NewTarget = (0, _getPrototypeOf2['default'])(this).constructor;
                            result = Reflect.construct(Super, arguments, NewTarget);
                        } else {
                            result = Super.apply(this, arguments);
                        }
                        return (0, _possibleConstructorReturn2['default'])(this, result);
                    };
                }

                function _isNativeReflectConstruct() {
                    if (typeof Reflect === 'undefined' || !Reflect.construct) return false;
                    if (Reflect.construct.sham) return false;
                    if (typeof Proxy === 'function') return true;
                    try {
                        Date.prototype.toString.call(Reflect.construct(Date, [], function () {}));
                        return true;
                    } catch (e) {
                        return false;
                    }
                }

                var ChummerImportForm = /*#__PURE__*/ (function (_FormApplication) {
                    (0, _inherits2['default'])(ChummerImportForm, _FormApplication);

                    var _super = _createSuper(ChummerImportForm);

                    function ChummerImportForm() {
                        (0, _classCallCheck2['default'])(this, ChummerImportForm);
                        return _super.apply(this, arguments);
                    }

                    (0, _createClass2['default'])(
                        ChummerImportForm,
                        [
                            {
                                key: 'getData',
                                value: function getData() {
                                    return {};
                                },
                            },
                            {
                                key: 'activateListeners',
                                value: function activateListeners(html) {
                                    var _this = this;

                                    html.find('.submit-chummer-import').click(
                                        /*#__PURE__*/ (function () {
                                            var _ref = (0, _asyncToGenerator2['default'])(
                                                /*#__PURE__*/ _regenerator['default'].mark(
                                                    function _callee(event) {
                                                        var chummerfile,
                                                            weapons,
                                                            armor,
                                                            cyberware,
                                                            equipment,
                                                            qualities,
                                                            powers,
                                                            spells,
                                                            parseAtt,
                                                            parseDamage,
                                                            getValues,
                                                            getArray,
                                                            updateData,
                                                            update,
                                                            items,
                                                            error,
                                                            c,
                                                            attr,
                                                            atts,
                                                            skills,
                                                            i,
                                                            s,
                                                            group,
                                                            skill,
                                                            id,
                                                            category,
                                                            skillCategory,
                                                            cat,
                                                            name,
                                                            _qualities,
                                                            _weapons,
                                                            armors,
                                                            cyberwares,
                                                            _powers,
                                                            gears,
                                                            licenses,
                                                            _spells;

                                                        return _regenerator['default'].wrap(
                                                            function _callee$(_context) {
                                                                while (1) {
                                                                    switch (
                                                                        (_context.prev =
                                                                            _context.next)
                                                                    ) {
                                                                        case 0:
                                                                            event.preventDefault();
                                                                            chummerfile = JSON.parse(
                                                                                $(
                                                                                    '.chummer-text'
                                                                                ).val()
                                                                            );
                                                                            weapons = $(
                                                                                '.weapons'
                                                                            ).is(':checked');
                                                                            armor = $('.armor').is(
                                                                                ':checked'
                                                                            );
                                                                            cyberware = $(
                                                                                '.cyberware'
                                                                            ).is(':checked');
                                                                            equipment = $(
                                                                                '.gear'
                                                                            ).is(':checked');
                                                                            qualities = $(
                                                                                '.qualities'
                                                                            ).is(':checked');
                                                                            powers = $(
                                                                                '.powers'
                                                                            ).is(':checked');
                                                                            spells = $(
                                                                                '.spells'
                                                                            ).is(':checked');
                                                                            console.log(
                                                                                chummerfile
                                                                            );

                                                                            parseAtt = function parseAtt(
                                                                                att
                                                                            ) {
                                                                                if (
                                                                                    att.toLowerCase() ===
                                                                                    'bod'
                                                                                ) {
                                                                                    return 'body';
                                                                                }

                                                                                if (
                                                                                    att.toLowerCase() ===
                                                                                    'agi'
                                                                                ) {
                                                                                    return 'agility';
                                                                                }

                                                                                if (
                                                                                    att.toLowerCase() ===
                                                                                    'rea'
                                                                                ) {
                                                                                    return 'reaction';
                                                                                }

                                                                                if (
                                                                                    att.toLowerCase() ===
                                                                                    'str'
                                                                                ) {
                                                                                    return 'strength';
                                                                                }

                                                                                if (
                                                                                    att.toLowerCase() ===
                                                                                    'cha'
                                                                                ) {
                                                                                    return 'charisma';
                                                                                }

                                                                                if (
                                                                                    att.toLowerCase() ===
                                                                                    'int'
                                                                                ) {
                                                                                    return 'intuition';
                                                                                }

                                                                                if (
                                                                                    att.toLowerCase() ===
                                                                                    'log'
                                                                                ) {
                                                                                    return 'logic';
                                                                                }

                                                                                if (
                                                                                    att.toLowerCase() ===
                                                                                    'wil'
                                                                                ) {
                                                                                    return 'willpower';
                                                                                }

                                                                                if (
                                                                                    att.toLowerCase() ===
                                                                                    'edg'
                                                                                ) {
                                                                                    return 'edge';
                                                                                }

                                                                                if (
                                                                                    att.toLowerCase() ===
                                                                                    'mag'
                                                                                ) {
                                                                                    return 'magic';
                                                                                }

                                                                                if (
                                                                                    att.toLowerCase() ===
                                                                                    'res'
                                                                                ) {
                                                                                    return 'resonance';
                                                                                }
                                                                            };

                                                                            parseDamage = function parseDamage(
                                                                                val
                                                                            ) {
                                                                                var damage = {
                                                                                    damage: 0,
                                                                                    type:
                                                                                        'physical',
                                                                                    radius: 0,
                                                                                    dropoff: 0,
                                                                                };
                                                                                var split = val.split(
                                                                                    ','
                                                                                );

                                                                                if (
                                                                                    split.length > 0
                                                                                ) {
                                                                                    var l = split[0].match(
                                                                                        /(\d+)(\w+)/
                                                                                    );
                                                                                    if (l && l[1])
                                                                                        damage.damage = parseInt(
                                                                                            l[1]
                                                                                        );
                                                                                    if (l && l[2])
                                                                                        damage.type =
                                                                                            l[2] ===
                                                                                            'P'
                                                                                                ? 'physical'
                                                                                                : 'stun';
                                                                                }

                                                                                for (
                                                                                    var i = 1;
                                                                                    i <
                                                                                    split.length;
                                                                                    i++
                                                                                ) {
                                                                                    var _l = split[
                                                                                        i
                                                                                    ].match(
                                                                                        /(-?\d+)(.*)/
                                                                                    );

                                                                                    if (
                                                                                        _l &&
                                                                                        _l[2]
                                                                                    ) {
                                                                                        if (
                                                                                            _l[2]
                                                                                                .toLowerCase()
                                                                                                .includes(
                                                                                                    '/m'
                                                                                                )
                                                                                        )
                                                                                            damage.dropoff = parseInt(
                                                                                                _l[1]
                                                                                            );
                                                                                        else
                                                                                            damage.radius = parseInt(
                                                                                                _l[1]
                                                                                            );
                                                                                    }
                                                                                }

                                                                                return damage;
                                                                            };

                                                                            getValues = function getValues(
                                                                                val
                                                                            ) {
                                                                                var l = val.match(
                                                                                    /([0-9]+)(?:([0-9]+))*/g
                                                                                );
                                                                                return l || ['0'];
                                                                            };

                                                                            getArray = function getArray(
                                                                                value
                                                                            ) {
                                                                                return Array.isArray(
                                                                                    value
                                                                                )
                                                                                    ? value
                                                                                    : [value];
                                                                            };

                                                                            updateData = duplicate(
                                                                                _this.object.data
                                                                            );
                                                                            update =
                                                                                updateData.data;
                                                                            items = [];
                                                                            error = ''; // character info stuff, also techno/magic and essence

                                                                            if (
                                                                                chummerfile.characters &&
                                                                                chummerfile
                                                                                    .characters
                                                                                    .character
                                                                            ) {
                                                                                c =
                                                                                    chummerfile
                                                                                        .characters
                                                                                        .character;

                                                                                try {
                                                                                    if (
                                                                                        c.playername
                                                                                    ) {
                                                                                        update.player_name =
                                                                                            c.playername;
                                                                                    }

                                                                                    if (c.alias) {
                                                                                        update.name =
                                                                                            c.alias;
                                                                                        updateData.name =
                                                                                            c.alias;
                                                                                    }

                                                                                    if (
                                                                                        c.metatype
                                                                                    ) {
                                                                                        update.metatype =
                                                                                            c.metatype;
                                                                                    }

                                                                                    if (c.sex) {
                                                                                        update.sex =
                                                                                            c.sex;
                                                                                    }

                                                                                    if (c.age) {
                                                                                        update.age =
                                                                                            c.age;
                                                                                    }

                                                                                    if (c.height) {
                                                                                        update.height =
                                                                                            c.height;
                                                                                    }

                                                                                    if (c.weight) {
                                                                                        update.weight =
                                                                                            c.weight;
                                                                                    }

                                                                                    if (
                                                                                        c.calculatedstreetcred
                                                                                    ) {
                                                                                        update.street_cred =
                                                                                            c.calculatedstreetcred;
                                                                                    }

                                                                                    if (
                                                                                        c.calculatednotoriety
                                                                                    ) {
                                                                                        update.notoriety =
                                                                                            c.calculatednotoriety;
                                                                                    }

                                                                                    if (
                                                                                        c.calculatedpublicawareness
                                                                                    ) {
                                                                                        update.public_awareness =
                                                                                            c.calculatedpublicawareness;
                                                                                    }

                                                                                    if (c.karma) {
                                                                                        update.karma.value =
                                                                                            c.karma;
                                                                                    }

                                                                                    if (
                                                                                        c.totalkarma
                                                                                    ) {
                                                                                        update.karma.max =
                                                                                            c.totalkarma;
                                                                                    }

                                                                                    if (
                                                                                        c.technomancer &&
                                                                                        c.technomancer.toLowerCase() ===
                                                                                            'true'
                                                                                    ) {
                                                                                        update.special =
                                                                                            'resonance';
                                                                                    }

                                                                                    if (
                                                                                        (c.magician &&
                                                                                            c.magician.toLowerCase() ===
                                                                                                'true') ||
                                                                                        (c.adept &&
                                                                                            c.adept.toLowerCase() ===
                                                                                                'true')
                                                                                    ) {
                                                                                        update.special =
                                                                                            'magic';
                                                                                        attr = [];

                                                                                        if (
                                                                                            c.tradition &&
                                                                                            c
                                                                                                .tradition
                                                                                                .drainattribute &&
                                                                                            c
                                                                                                .tradition
                                                                                                .drainattribute
                                                                                                .attr
                                                                                        ) {
                                                                                            attr =
                                                                                                c
                                                                                                    .tradition
                                                                                                    .drainattribute
                                                                                                    .attr;
                                                                                        } else if (
                                                                                            c.tradition &&
                                                                                            c
                                                                                                .tradition
                                                                                                .drainattributes
                                                                                        ) {
                                                                                            attr = c.tradition.drainattributes
                                                                                                .split(
                                                                                                    '+'
                                                                                                )
                                                                                                .map(
                                                                                                    function (
                                                                                                        item
                                                                                                    ) {
                                                                                                        return item.trim();
                                                                                                    }
                                                                                                );
                                                                                        }

                                                                                        attr.forEach(
                                                                                            function (
                                                                                                att
                                                                                            ) {
                                                                                                att = parseAtt(
                                                                                                    att
                                                                                                );
                                                                                                if (
                                                                                                    att !==
                                                                                                    'willpower'
                                                                                                )
                                                                                                    update.magic.attribute = att;
                                                                                            }
                                                                                        );
                                                                                    }

                                                                                    if (
                                                                                        c.totaless
                                                                                    ) {
                                                                                        update.attributes.essence.value =
                                                                                            c.totaless;
                                                                                    }

                                                                                    if (c.nuyen) {
                                                                                        update.nuyen = parseInt(
                                                                                            c.nuyen.replace(
                                                                                                ',',
                                                                                                ''
                                                                                            )
                                                                                        );
                                                                                    }
                                                                                } catch (e) {
                                                                                    error += 'Error with character info: '.concat(
                                                                                        e,
                                                                                        '. '
                                                                                    );
                                                                                } // update attributes

                                                                                atts =
                                                                                    chummerfile
                                                                                        .characters
                                                                                        .character
                                                                                        .attributes[1]
                                                                                        .attribute;
                                                                                atts.forEach(
                                                                                    function (att) {
                                                                                        try {
                                                                                            var newAtt = parseAtt(
                                                                                                att.name
                                                                                            );
                                                                                            if (
                                                                                                newAtt
                                                                                            )
                                                                                                update.attributes[
                                                                                                    newAtt
                                                                                                ].base = parseInt(
                                                                                                    att.total
                                                                                                );
                                                                                        } catch (e) {
                                                                                            error += 'Error with attributes: '.concat(
                                                                                                e,
                                                                                                '. '
                                                                                            );
                                                                                        }
                                                                                    }
                                                                                ); // initiative stuff

                                                                                try {
                                                                                    if (
                                                                                        c.initbonus
                                                                                    ) {
                                                                                        // not sure if this one is correct
                                                                                        update.mods.initiative =
                                                                                            c.initbonus;
                                                                                    }

                                                                                    if (
                                                                                        c.initdice
                                                                                    ) {
                                                                                        update.mods.initiative_dice =
                                                                                            c.initdice -
                                                                                            1;
                                                                                    }
                                                                                } catch (e) {
                                                                                    error += 'Error with initiative: '.concat(
                                                                                        e,
                                                                                        '. '
                                                                                    );
                                                                                } // skills...

                                                                                skills =
                                                                                    c.skills.skill;

                                                                                for (
                                                                                    i = 0;
                                                                                    i <
                                                                                    skills.length;
                                                                                    i++
                                                                                ) {
                                                                                    try {
                                                                                        s =
                                                                                            skills[
                                                                                                i
                                                                                            ];

                                                                                        if (
                                                                                            s.rating >
                                                                                                0 &&
                                                                                            s.islanguage
                                                                                        ) {
                                                                                            group =
                                                                                                'active';
                                                                                            skill = null;
                                                                                            id = randomID(
                                                                                                16
                                                                                            );

                                                                                            if (
                                                                                                s.islanguage &&
                                                                                                s.islanguage.toLowerCase() ===
                                                                                                    'true'
                                                                                            ) {
                                                                                                skill = {};
                                                                                                update.skills.language.value[
                                                                                                    id
                                                                                                ] = skill;
                                                                                                group =
                                                                                                    'language';
                                                                                            } else if (
                                                                                                s.knowledge &&
                                                                                                s.knowledge.toLowerCase() ===
                                                                                                    'true'
                                                                                            ) {
                                                                                                category =
                                                                                                    s.skillcategory_english;
                                                                                                console.log(
                                                                                                    category
                                                                                                );
                                                                                                skill = {};
                                                                                                skillCategory = void 0;

                                                                                                if (
                                                                                                    category
                                                                                                ) {
                                                                                                    console.log(
                                                                                                        'found category',
                                                                                                        category
                                                                                                    );
                                                                                                    cat = category.toLowerCase();
                                                                                                    if (
                                                                                                        cat ===
                                                                                                        'street'
                                                                                                    )
                                                                                                        skillCategory =
                                                                                                            update
                                                                                                                .skills
                                                                                                                .knowledge
                                                                                                                .street
                                                                                                                .value;
                                                                                                    if (
                                                                                                        cat ===
                                                                                                        'academic'
                                                                                                    )
                                                                                                        skillCategory =
                                                                                                            update
                                                                                                                .skills
                                                                                                                .knowledge
                                                                                                                .academic
                                                                                                                .value;
                                                                                                    if (
                                                                                                        cat ===
                                                                                                        'professional'
                                                                                                    )
                                                                                                        skillCategory =
                                                                                                            update
                                                                                                                .skills
                                                                                                                .knowledge
                                                                                                                .professional
                                                                                                                .value;
                                                                                                    if (
                                                                                                        cat ===
                                                                                                        'interests'
                                                                                                    )
                                                                                                        skillCategory =
                                                                                                            update
                                                                                                                .skills
                                                                                                                .knowledge
                                                                                                                .interests
                                                                                                                .value;
                                                                                                    if (
                                                                                                        skillCategory
                                                                                                    )
                                                                                                        skillCategory[
                                                                                                            id
                                                                                                        ] = skill;
                                                                                                } else {
                                                                                                    if (
                                                                                                        s.attribute.toLowerCase() ===
                                                                                                        'int'
                                                                                                    ) {
                                                                                                        update.skills.knowledge.street.value[
                                                                                                            id
                                                                                                        ] = skill;
                                                                                                    }

                                                                                                    if (
                                                                                                        s.attribute.toLowerCase() ===
                                                                                                        'log'
                                                                                                    ) {
                                                                                                        update.skills.knowledge.professional.value[
                                                                                                            id
                                                                                                        ] = skill;
                                                                                                    }
                                                                                                }

                                                                                                group =
                                                                                                    'knowledge';
                                                                                            } else {
                                                                                                name = s.name
                                                                                                    .toLowerCase()
                                                                                                    .trim()
                                                                                                    .replace(
                                                                                                        /\s/g,
                                                                                                        '_'
                                                                                                    )
                                                                                                    .replace(
                                                                                                        /-/g,
                                                                                                        '_'
                                                                                                    );
                                                                                                if (
                                                                                                    name.includes(
                                                                                                        'exotic'
                                                                                                    ) &&
                                                                                                    name.includes(
                                                                                                        '_weapon'
                                                                                                    )
                                                                                                )
                                                                                                    name = name.replace(
                                                                                                        '_weapon',
                                                                                                        ''
                                                                                                    );
                                                                                                skill =
                                                                                                    update
                                                                                                        .skills
                                                                                                        .active[
                                                                                                        name
                                                                                                    ];
                                                                                            }

                                                                                            if (
                                                                                                !skill
                                                                                            )
                                                                                                console.error(
                                                                                                    "Couldn't parse skill ".concat(
                                                                                                        s.name
                                                                                                    )
                                                                                                );

                                                                                            if (
                                                                                                skill
                                                                                            ) {
                                                                                                if (
                                                                                                    group !==
                                                                                                    'active'
                                                                                                )
                                                                                                    skill.name =
                                                                                                        s.name;
                                                                                                skill.base = parseInt(
                                                                                                    s.rating
                                                                                                );

                                                                                                if (
                                                                                                    s.skillspecializations
                                                                                                ) {
                                                                                                    skill.specs = getArray(
                                                                                                        s
                                                                                                            .skillspecializations
                                                                                                            .skillspecialization
                                                                                                            .name
                                                                                                    );
                                                                                                }
                                                                                            }
                                                                                        }
                                                                                    } catch (e) {
                                                                                        console.error(
                                                                                            e
                                                                                        );
                                                                                    }
                                                                                } // qualities

                                                                                if (
                                                                                    qualities &&
                                                                                    c.qualities &&
                                                                                    c.qualities
                                                                                        .quality
                                                                                ) {
                                                                                    _qualities = getArray(
                                                                                        c.qualities
                                                                                            .quality
                                                                                    );

                                                                                    _qualities.forEach(
                                                                                        function (
                                                                                            q
                                                                                        ) {
                                                                                            try {
                                                                                                var data = {};
                                                                                                data.type = q.qualitytype.toLowerCase();
                                                                                                if (
                                                                                                    q.description
                                                                                                )
                                                                                                    data.description = {
                                                                                                        value: TextEditor.enrichHTML(
                                                                                                            q.description
                                                                                                        ),
                                                                                                    };
                                                                                                var itemData = {
                                                                                                    name:
                                                                                                        q.name,
                                                                                                    type:
                                                                                                        'quality',
                                                                                                    data: data,
                                                                                                };
                                                                                                items.push(
                                                                                                    itemData
                                                                                                );
                                                                                            } catch (e) {
                                                                                                console.error(
                                                                                                    e
                                                                                                );
                                                                                            }
                                                                                        }
                                                                                    );
                                                                                } // weapons

                                                                                if (
                                                                                    weapons &&
                                                                                    c.weapons !=
                                                                                        null &&
                                                                                    c.weapons
                                                                                        .weapon !=
                                                                                        null
                                                                                ) {
                                                                                    _weapons = getArray(
                                                                                        c.weapons
                                                                                            .weapon
                                                                                    );

                                                                                    _weapons.forEach(
                                                                                        function (
                                                                                            w
                                                                                        ) {
                                                                                            try {
                                                                                                var data = {};
                                                                                                var action = {};
                                                                                                var damage = {};
                                                                                                action.damage = damage;
                                                                                                data.action = action;

                                                                                                if (
                                                                                                    w.description
                                                                                                ) {
                                                                                                    data.description = {
                                                                                                        value: TextEditor.enrichHTML(
                                                                                                            w.description
                                                                                                        ),
                                                                                                    };
                                                                                                }

                                                                                                damage.ap = {
                                                                                                    base: parseInt(
                                                                                                        getValues(
                                                                                                            w.ap
                                                                                                        )[0]
                                                                                                    ),
                                                                                                };
                                                                                                action.type =
                                                                                                    'varies';
                                                                                                if (
                                                                                                    w.skill
                                                                                                )
                                                                                                    action.skill = w.skill
                                                                                                        .toLowerCase()
                                                                                                        .replace(
                                                                                                            /\s/g,
                                                                                                            '_'
                                                                                                        );
                                                                                                else if (
                                                                                                    w.category &&
                                                                                                    w.category
                                                                                                        .toLowerCase()
                                                                                                        .includes(
                                                                                                            'exotic'
                                                                                                        )
                                                                                                )
                                                                                                    action.skill = w.category
                                                                                                        .toLowerCase()
                                                                                                        .replace(
                                                                                                            ' weapons',
                                                                                                            ''
                                                                                                        )
                                                                                                        .replace(
                                                                                                            /\s/g,
                                                                                                            '_'
                                                                                                        );
                                                                                                if (
                                                                                                    action.skill.includes(
                                                                                                        'exotic'
                                                                                                    )
                                                                                                )
                                                                                                    action.skill = action.skill.replace(
                                                                                                        '_weapon',
                                                                                                        ''
                                                                                                    );
                                                                                                action.attribute =
                                                                                                    'agility';
                                                                                                action.limit = {
                                                                                                    base: parseInt(
                                                                                                        getValues(
                                                                                                            w.accuracy
                                                                                                        )[0]
                                                                                                    ),
                                                                                                };
                                                                                                action.opposed = {
                                                                                                    type:
                                                                                                        'defense',
                                                                                                };

                                                                                                if (
                                                                                                    w.type.toLowerCase() ===
                                                                                                    'melee'
                                                                                                ) {
                                                                                                    action.type =
                                                                                                        'complex';
                                                                                                    data.category =
                                                                                                        'melee';
                                                                                                    var melee = {};
                                                                                                    data.melee = melee;
                                                                                                    melee.reach = parseInt(
                                                                                                        w.reach
                                                                                                    );
                                                                                                } else if (
                                                                                                    w.type.toLowerCase() ===
                                                                                                    'ranged'
                                                                                                ) {
                                                                                                    data.category =
                                                                                                        'range';
                                                                                                    if (
                                                                                                        w.skill
                                                                                                            .toLowerCase()
                                                                                                            .includes(
                                                                                                                'throw'
                                                                                                            )
                                                                                                    )
                                                                                                        data.category =
                                                                                                            'thrown'; // TODO clean this up

                                                                                                    var range = {};
                                                                                                    data.range = range;
                                                                                                    range.rc = {
                                                                                                        base: parseInt(
                                                                                                            getValues(
                                                                                                                w.rc
                                                                                                            )[0]
                                                                                                        ),
                                                                                                    };

                                                                                                    if (
                                                                                                        w.mode
                                                                                                    ) {
                                                                                                        // HeroLab export doesn't have mode
                                                                                                        var lower = w.mode.toLowerCase();
                                                                                                        range.modes = {
                                                                                                            single_shot: lower.includes(
                                                                                                                'ss'
                                                                                                            ),
                                                                                                            semi_auto: lower.includes(
                                                                                                                'sa'
                                                                                                            ),
                                                                                                            burst_fire: lower.includes(
                                                                                                                'bf'
                                                                                                            ),
                                                                                                            full_auto: lower.includes(
                                                                                                                'fa'
                                                                                                            ),
                                                                                                        };
                                                                                                    }

                                                                                                    if (
                                                                                                        w.clips !=
                                                                                                            null &&
                                                                                                        w
                                                                                                            .clips
                                                                                                            .clip !=
                                                                                                            null
                                                                                                    ) {
                                                                                                        // HeroLab export doesn't have clips
                                                                                                        var clips = Array.isArray(
                                                                                                            w
                                                                                                                .clips
                                                                                                                .clip
                                                                                                        )
                                                                                                            ? w
                                                                                                                  .clips
                                                                                                                  .clip
                                                                                                            : [
                                                                                                                  w
                                                                                                                      .clips
                                                                                                                      .clip,
                                                                                                              ];
                                                                                                        clips.forEach(
                                                                                                            function (
                                                                                                                clip
                                                                                                            ) {
                                                                                                                console.log(
                                                                                                                    clip
                                                                                                                );
                                                                                                            }
                                                                                                        );
                                                                                                    }

                                                                                                    if (
                                                                                                        w.ranges &&
                                                                                                        w
                                                                                                            .ranges[
                                                                                                            'short'
                                                                                                        ] &&
                                                                                                        w
                                                                                                            .ranges
                                                                                                            .medium &&
                                                                                                        w
                                                                                                            .ranges[
                                                                                                            'long'
                                                                                                        ] &&
                                                                                                        w
                                                                                                            .ranges
                                                                                                            .extreme
                                                                                                    ) {
                                                                                                        console.log(
                                                                                                            w.ranges
                                                                                                        );
                                                                                                        range.ranges = {
                                                                                                            short: parseInt(
                                                                                                                w.ranges[
                                                                                                                    'short'
                                                                                                                ].split(
                                                                                                                    '-'
                                                                                                                )[1]
                                                                                                            ),
                                                                                                            medium: parseInt(
                                                                                                                w.ranges.medium.split(
                                                                                                                    '-'
                                                                                                                )[1]
                                                                                                            ),
                                                                                                            long: parseInt(
                                                                                                                w.ranges[
                                                                                                                    'long'
                                                                                                                ].split(
                                                                                                                    '-'
                                                                                                                )[1]
                                                                                                            ),
                                                                                                            extreme: parseInt(
                                                                                                                w.ranges.extreme.split(
                                                                                                                    '-'
                                                                                                                )[1]
                                                                                                            ),
                                                                                                        };
                                                                                                    }

                                                                                                    if (
                                                                                                        w.accessories &&
                                                                                                        w
                                                                                                            .accessories
                                                                                                            .accessory
                                                                                                    ) {
                                                                                                        range.mods = [];
                                                                                                        var accessories = getArray(
                                                                                                            w
                                                                                                                .accessories
                                                                                                                .accessory
                                                                                                        );
                                                                                                        accessories.forEach(
                                                                                                            function (
                                                                                                                a
                                                                                                            ) {
                                                                                                                if (
                                                                                                                    a
                                                                                                                ) {
                                                                                                                    range.mods.push(
                                                                                                                        {
                                                                                                                            name:
                                                                                                                                a.name,
                                                                                                                        }
                                                                                                                    );
                                                                                                                }
                                                                                                            }
                                                                                                        );
                                                                                                    }
                                                                                                } else if (
                                                                                                    w.type.toLowerCase() ===
                                                                                                    'thrown'
                                                                                                ) {
                                                                                                    data.category =
                                                                                                        'thrown';
                                                                                                }

                                                                                                {
                                                                                                    // TODO handle raw damage if present
                                                                                                    var d = parseDamage(
                                                                                                        w.damage_english
                                                                                                    );
                                                                                                    damage.base =
                                                                                                        d.damage;
                                                                                                    damage.type =
                                                                                                        d.type;

                                                                                                    if (
                                                                                                        d.dropoff ||
                                                                                                        d.radius
                                                                                                    ) {
                                                                                                        var thrown = {};
                                                                                                        data.thrown = thrown;
                                                                                                        thrown.blast = {
                                                                                                            radius:
                                                                                                                d.radius,
                                                                                                            dropoff:
                                                                                                                d.dropoff,
                                                                                                        };
                                                                                                    }
                                                                                                }
                                                                                                var itemData = {
                                                                                                    name:
                                                                                                        w.name,
                                                                                                    type:
                                                                                                        'weapon',
                                                                                                    data: data,
                                                                                                };
                                                                                                items.push(
                                                                                                    itemData
                                                                                                );
                                                                                            } catch (e) {
                                                                                                console.error(
                                                                                                    e
                                                                                                );
                                                                                            }
                                                                                        }
                                                                                    );
                                                                                } // armors

                                                                                if (
                                                                                    armor &&
                                                                                    c.armors &&
                                                                                    c.armors.armor
                                                                                ) {
                                                                                    armors = getArray(
                                                                                        c.armors
                                                                                            .armor
                                                                                    );
                                                                                    armors.forEach(
                                                                                        function (
                                                                                            a
                                                                                        ) {
                                                                                            try {
                                                                                                var data = {};
                                                                                                var _armor = {};
                                                                                                data.armor = _armor;
                                                                                                var desc =
                                                                                                    '';
                                                                                                _armor.mod = a.armor.includes(
                                                                                                    '+'
                                                                                                );
                                                                                                _armor.value = parseInt(
                                                                                                    a.armor.replace(
                                                                                                        '+',
                                                                                                        ''
                                                                                                    )
                                                                                                );
                                                                                                if (
                                                                                                    a.description
                                                                                                )
                                                                                                    desc =
                                                                                                        a.description;
                                                                                                console.log(
                                                                                                    a
                                                                                                );

                                                                                                if (
                                                                                                    a.armormods &&
                                                                                                    a
                                                                                                        .armormods
                                                                                                        .armormod
                                                                                                ) {
                                                                                                    _armor.fire = 0;
                                                                                                    _armor.electricity = 0;
                                                                                                    _armor.cold = 0;
                                                                                                    _armor.acid = 0;
                                                                                                    _armor.radiation = 0;
                                                                                                    var modDesc = [];
                                                                                                    var mods = getArray(
                                                                                                        a
                                                                                                            .armormods
                                                                                                            .armormod
                                                                                                    );
                                                                                                    mods.forEach(
                                                                                                        function (
                                                                                                            mod
                                                                                                        ) {
                                                                                                            if (
                                                                                                                mod.name
                                                                                                                    .toLowerCase()
                                                                                                                    .includes(
                                                                                                                        'fire resistance'
                                                                                                                    )
                                                                                                            ) {
                                                                                                                _armor.fire += parseInt(
                                                                                                                    mod.rating
                                                                                                                );
                                                                                                            } else if (
                                                                                                                mod.name
                                                                                                                    .toLowerCase()
                                                                                                                    .includes(
                                                                                                                        'nonconductivity'
                                                                                                                    )
                                                                                                            ) {
                                                                                                                _armor.electricity += parseInt(
                                                                                                                    mod.rating
                                                                                                                );
                                                                                                            } else if (
                                                                                                                mod.name
                                                                                                                    .toLowerCase()
                                                                                                                    .includes(
                                                                                                                        'insulation'
                                                                                                                    )
                                                                                                            ) {
                                                                                                                _armor.cold += parseInt(
                                                                                                                    mod.rating
                                                                                                                );
                                                                                                            } else if (
                                                                                                                mod.name
                                                                                                                    .toLowerCase()
                                                                                                                    .includes(
                                                                                                                        'radiation shielding'
                                                                                                                    )
                                                                                                            ) {
                                                                                                                _armor.radiation += parseInt(
                                                                                                                    mod.rating
                                                                                                                );
                                                                                                            }

                                                                                                            if (
                                                                                                                mod.rating !==
                                                                                                                ''
                                                                                                            ) {
                                                                                                                modDesc.push(
                                                                                                                    ''
                                                                                                                        .concat(
                                                                                                                            mod.name,
                                                                                                                            ' R'
                                                                                                                        )
                                                                                                                        .concat(
                                                                                                                            mod.rating
                                                                                                                        )
                                                                                                                );
                                                                                                            } else {
                                                                                                                modDesc.push(
                                                                                                                    mod.name
                                                                                                                );
                                                                                                            }
                                                                                                        }
                                                                                                    );

                                                                                                    if (
                                                                                                        modDesc.length >
                                                                                                        0
                                                                                                    ) {
                                                                                                        // add desc to beginning
                                                                                                        desc = ''
                                                                                                            .concat(
                                                                                                                modDesc.join(
                                                                                                                    ','
                                                                                                                ),
                                                                                                                '\n\n'
                                                                                                            )
                                                                                                            .concat(
                                                                                                                desc
                                                                                                            );
                                                                                                    }
                                                                                                }

                                                                                                if (
                                                                                                    a.equipped.toLowerCase() ===
                                                                                                    'true'
                                                                                                ) {
                                                                                                    data.technology = {
                                                                                                        equipped: true,
                                                                                                    };
                                                                                                }

                                                                                                data.description = {
                                                                                                    value: TextEditor.enrichHTML(
                                                                                                        desc
                                                                                                    ),
                                                                                                };
                                                                                                var itemData = {
                                                                                                    name:
                                                                                                        a.name,
                                                                                                    type:
                                                                                                        'armor',
                                                                                                    data: data,
                                                                                                };
                                                                                                items.push(
                                                                                                    itemData
                                                                                                );
                                                                                            } catch (e) {
                                                                                                console.error(
                                                                                                    e
                                                                                                );
                                                                                            }
                                                                                        }
                                                                                    );
                                                                                } // cyberware

                                                                                if (
                                                                                    cyberware &&
                                                                                    c.cyberwares &&
                                                                                    c.cyberwares
                                                                                        .cyberware
                                                                                ) {
                                                                                    cyberwares = getArray(
                                                                                        c.cyberwares
                                                                                            .cyberware
                                                                                    );
                                                                                    cyberwares.forEach(
                                                                                        function (
                                                                                            cy
                                                                                        ) {
                                                                                            try {
                                                                                                var data = {};
                                                                                                data.description = {
                                                                                                    rating:
                                                                                                        cy.rating,
                                                                                                    value:
                                                                                                        cy.description,
                                                                                                };
                                                                                                data.technology = {
                                                                                                    equipped: true,
                                                                                                };
                                                                                                data.essence =
                                                                                                    cy.ess;
                                                                                                data.grade =
                                                                                                    cy.grade;
                                                                                                var itemData = {
                                                                                                    name:
                                                                                                        cy.name,
                                                                                                    type:
                                                                                                        'cyberware',
                                                                                                    data: data,
                                                                                                };
                                                                                                items.push(
                                                                                                    itemData
                                                                                                );
                                                                                            } catch (e) {
                                                                                                console.error(
                                                                                                    e
                                                                                                );
                                                                                            }
                                                                                        }
                                                                                    );
                                                                                } // powers

                                                                                if (
                                                                                    powers &&
                                                                                    c.powers &&
                                                                                    c.powers.power
                                                                                ) {
                                                                                    _powers = getArray(
                                                                                        c.powers
                                                                                            .power
                                                                                    );

                                                                                    _powers.forEach(
                                                                                        function (
                                                                                            p
                                                                                        ) {
                                                                                            var data = {};
                                                                                            if (
                                                                                                p.description
                                                                                            )
                                                                                                data.description = {
                                                                                                    value: TextEditor.enrichHTML(
                                                                                                        p.description
                                                                                                    ),
                                                                                                };
                                                                                            data.level = parseInt(
                                                                                                p.rating
                                                                                            );
                                                                                            p.pp = parseInt(
                                                                                                p.totalpoints
                                                                                            );
                                                                                            var itemData = {
                                                                                                name:
                                                                                                    p.name,
                                                                                                type:
                                                                                                    'adept_power',
                                                                                                data: data,
                                                                                            };
                                                                                            items.push(
                                                                                                itemData
                                                                                            );
                                                                                        }
                                                                                    );
                                                                                } // gear

                                                                                if (
                                                                                    equipment &&
                                                                                    c.gears &&
                                                                                    c.gears.gear
                                                                                ) {
                                                                                    gears = getArray(
                                                                                        c.gears.gear
                                                                                    );
                                                                                    licenses = [];
                                                                                    gears.forEach(
                                                                                        function (
                                                                                            g
                                                                                        ) {
                                                                                            try {
                                                                                                var data = {};
                                                                                                var _name =
                                                                                                    g.name;
                                                                                                if (
                                                                                                    g.extra
                                                                                                )
                                                                                                    _name += ' ('.concat(
                                                                                                        g.extra,
                                                                                                        ')'
                                                                                                    );
                                                                                                data.technology = {
                                                                                                    rating:
                                                                                                        g.rating,
                                                                                                    quantity:
                                                                                                        g.qty,
                                                                                                };
                                                                                                data.description = {
                                                                                                    value:
                                                                                                        g.description,
                                                                                                };
                                                                                                var itemData = {
                                                                                                    name: _name,
                                                                                                    type:
                                                                                                        'equipment',
                                                                                                    data: data,
                                                                                                };
                                                                                                items.push(
                                                                                                    itemData
                                                                                                );
                                                                                            } catch (e) {
                                                                                                console.error(
                                                                                                    e
                                                                                                );
                                                                                            }
                                                                                        }
                                                                                    );
                                                                                } // spells

                                                                                if (
                                                                                    spells &&
                                                                                    c.spells &&
                                                                                    c.spells.spell
                                                                                ) {
                                                                                    _spells = getArray(
                                                                                        c.spells
                                                                                            .spell
                                                                                    );

                                                                                    _spells.forEach(
                                                                                        function (
                                                                                            s
                                                                                        ) {
                                                                                            try {
                                                                                                if (
                                                                                                    s.alchemy.toLowerCase() !==
                                                                                                    'true'
                                                                                                ) {
                                                                                                    var action = {};
                                                                                                    var data = {};
                                                                                                    data.action = action;
                                                                                                    data.category = s.category
                                                                                                        .toLowerCase()
                                                                                                        .replace(
                                                                                                            /\s/g,
                                                                                                            '_'
                                                                                                        );
                                                                                                    data.name =
                                                                                                        s.name;
                                                                                                    data.type =
                                                                                                        s.type ===
                                                                                                        'M'
                                                                                                            ? 'mana'
                                                                                                            : 'physical';
                                                                                                    data.range =
                                                                                                        s.range ===
                                                                                                        'T'
                                                                                                            ? 'touch'
                                                                                                            : s.range
                                                                                                                  .toLowerCase()
                                                                                                                  .replace(
                                                                                                                      /\s/g,
                                                                                                                      '_'
                                                                                                                  )
                                                                                                                  .replace(
                                                                                                                      '(',
                                                                                                                      ''
                                                                                                                  )
                                                                                                                  .replace(
                                                                                                                      ')',
                                                                                                                      ''
                                                                                                                  );
                                                                                                    data.drain = parseInt(
                                                                                                        s.dv.replace(
                                                                                                            'F',
                                                                                                            ''
                                                                                                        )
                                                                                                    );
                                                                                                    var description =
                                                                                                        '';
                                                                                                    if (
                                                                                                        s.descriptors
                                                                                                    )
                                                                                                        description =
                                                                                                            s.descriptors;
                                                                                                    if (
                                                                                                        s.description
                                                                                                    )
                                                                                                        description += '\n'.concat(
                                                                                                            s.description
                                                                                                        );
                                                                                                    data.description = {};
                                                                                                    data.description.value = TextEditor.enrichHTML(
                                                                                                        description
                                                                                                    );
                                                                                                    if (
                                                                                                        s.duration.toLowerCase() ===
                                                                                                        's'
                                                                                                    )
                                                                                                        data.duration =
                                                                                                            'sustained';
                                                                                                    else if (
                                                                                                        s.duration.toLowerCase() ===
                                                                                                        'i'
                                                                                                    )
                                                                                                        data.duration =
                                                                                                            'instant';
                                                                                                    else if (
                                                                                                        s.duration.toLowerCase() ===
                                                                                                        'p'
                                                                                                    )
                                                                                                        data.duration =
                                                                                                            'permanent';
                                                                                                    action.type =
                                                                                                        'varies';
                                                                                                    action.skill =
                                                                                                        'spellcasting';
                                                                                                    action.attribute =
                                                                                                        'magic';

                                                                                                    if (
                                                                                                        s.descriptors
                                                                                                    ) {
                                                                                                        var desc = s.descriptors.toLowerCase();

                                                                                                        if (
                                                                                                            s.category.toLowerCase() ===
                                                                                                            'combat'
                                                                                                        ) {
                                                                                                            data.combat = {};

                                                                                                            if (
                                                                                                                desc.includes(
                                                                                                                    'direct'
                                                                                                                )
                                                                                                            ) {
                                                                                                                data.combat.type =
                                                                                                                    'indirect';
                                                                                                                action.opposed = {
                                                                                                                    type:
                                                                                                                        'defense',
                                                                                                                };
                                                                                                            } else {
                                                                                                                data.combat.type =
                                                                                                                    'direct';

                                                                                                                if (
                                                                                                                    data.type ===
                                                                                                                    'mana'
                                                                                                                ) {
                                                                                                                    action.opposed = {
                                                                                                                        type:
                                                                                                                            'custom',
                                                                                                                        attribute:
                                                                                                                            'willpower',
                                                                                                                    };
                                                                                                                } else if (
                                                                                                                    data.type ===
                                                                                                                    'physical'
                                                                                                                ) {
                                                                                                                    action.opposed = {
                                                                                                                        type:
                                                                                                                            'custom',
                                                                                                                        attribute:
                                                                                                                            'body',
                                                                                                                    };
                                                                                                                }
                                                                                                            }
                                                                                                        }

                                                                                                        if (
                                                                                                            s.category.toLowerCase() ===
                                                                                                            'detection'
                                                                                                        ) {
                                                                                                            data.detection = {};
                                                                                                            var split = desc.split(
                                                                                                                ','
                                                                                                            );
                                                                                                            split.forEach(
                                                                                                                function (
                                                                                                                    token
                                                                                                                ) {
                                                                                                                    token =
                                                                                                                        token ||
                                                                                                                        '';
                                                                                                                    token = token.replace(
                                                                                                                        ' detection spell',
                                                                                                                        ''
                                                                                                                    );
                                                                                                                    if (
                                                                                                                        !token
                                                                                                                    )
                                                                                                                        return;
                                                                                                                    if (
                                                                                                                        token.includes(
                                                                                                                            'area'
                                                                                                                        )
                                                                                                                    )
                                                                                                                        return;
                                                                                                                    if (
                                                                                                                        token.includes(
                                                                                                                            'passive'
                                                                                                                        )
                                                                                                                    )
                                                                                                                        data.detection.passive = true;
                                                                                                                    else if (
                                                                                                                        token.includes(
                                                                                                                            'active'
                                                                                                                        )
                                                                                                                    )
                                                                                                                        data.detection.passive = false;
                                                                                                                    else if (
                                                                                                                        token
                                                                                                                    )
                                                                                                                        data.detection.type = token.toLowerCase();
                                                                                                                }
                                                                                                            );

                                                                                                            if (
                                                                                                                !data
                                                                                                                    .detection
                                                                                                                    .passive
                                                                                                            ) {
                                                                                                                action.opposed = {
                                                                                                                    type:
                                                                                                                        'custom',
                                                                                                                    attribute:
                                                                                                                        'willpower',
                                                                                                                    attribute2:
                                                                                                                        'logic',
                                                                                                                };
                                                                                                            }
                                                                                                        }

                                                                                                        if (
                                                                                                            s.category.toLowerCase() ===
                                                                                                            'illusion'
                                                                                                        ) {
                                                                                                            data.illusion = {};

                                                                                                            var _split = desc.split(
                                                                                                                ','
                                                                                                            );

                                                                                                            _split.forEach(
                                                                                                                function (
                                                                                                                    token
                                                                                                                ) {
                                                                                                                    token =
                                                                                                                        token ||
                                                                                                                        '';
                                                                                                                    token = token.replace(
                                                                                                                        ' illusion spell',
                                                                                                                        ''
                                                                                                                    );
                                                                                                                    if (
                                                                                                                        !token
                                                                                                                    )
                                                                                                                        return;
                                                                                                                    if (
                                                                                                                        token.includes(
                                                                                                                            'area'
                                                                                                                        )
                                                                                                                    )
                                                                                                                        return;
                                                                                                                    if (
                                                                                                                        token.includes(
                                                                                                                            'sense'
                                                                                                                        )
                                                                                                                    )
                                                                                                                        data.illusion.sense = token.toLowerCase();
                                                                                                                    else if (
                                                                                                                        token
                                                                                                                    )
                                                                                                                        data.illusion.type = token.toLowerCase();
                                                                                                                }
                                                                                                            );

                                                                                                            if (
                                                                                                                data.type ===
                                                                                                                'mana'
                                                                                                            ) {
                                                                                                                action.opposed = {
                                                                                                                    type:
                                                                                                                        'custom',
                                                                                                                    attribute:
                                                                                                                        'willpower',
                                                                                                                    attribute2:
                                                                                                                        'logic',
                                                                                                                };
                                                                                                            } else {
                                                                                                                action.opposed = {
                                                                                                                    type:
                                                                                                                        'custom',
                                                                                                                    attribute:
                                                                                                                        'intuition',
                                                                                                                    attribute2:
                                                                                                                        'logic',
                                                                                                                };
                                                                                                            }
                                                                                                        }

                                                                                                        if (
                                                                                                            s.category.toLowerCase() ===
                                                                                                            'manipulation'
                                                                                                        ) {
                                                                                                            data.manipulation = {};
                                                                                                            if (
                                                                                                                desc.includes(
                                                                                                                    'environmental'
                                                                                                                )
                                                                                                            )
                                                                                                                data.manipulation.environmental = true;
                                                                                                            if (
                                                                                                                desc.includes(
                                                                                                                    'physical'
                                                                                                                )
                                                                                                            )
                                                                                                                data.manipulation.physical = true;
                                                                                                            if (
                                                                                                                desc.includes(
                                                                                                                    'mental'
                                                                                                                )
                                                                                                            )
                                                                                                                data.manipulation.mental = true; // TODO figure out how to parse damaging

                                                                                                            if (
                                                                                                                data
                                                                                                                    .manipulation
                                                                                                                    .mental
                                                                                                            ) {
                                                                                                                action.opposed = {
                                                                                                                    type:
                                                                                                                        'custom',
                                                                                                                    attribute:
                                                                                                                        'willpower',
                                                                                                                    attribute2:
                                                                                                                        'logic',
                                                                                                                };
                                                                                                            }

                                                                                                            if (
                                                                                                                data
                                                                                                                    .manipulation
                                                                                                                    .physical
                                                                                                            ) {
                                                                                                                action.opposed = {
                                                                                                                    type:
                                                                                                                        'custom',
                                                                                                                    attribute:
                                                                                                                        'body',
                                                                                                                    attribute2:
                                                                                                                        'strength',
                                                                                                                };
                                                                                                            }
                                                                                                        }
                                                                                                    }

                                                                                                    var itemData = {
                                                                                                        name:
                                                                                                            s.name,
                                                                                                        type:
                                                                                                            'spell',
                                                                                                        data: data,
                                                                                                    };
                                                                                                    items.push(
                                                                                                        itemData
                                                                                                    );
                                                                                                }
                                                                                            } catch (e) {
                                                                                                console.error(
                                                                                                    e
                                                                                                );
                                                                                            }
                                                                                        }
                                                                                    );
                                                                                }
                                                                            }

                                                                            _context.next = 21;
                                                                            return _this.object.update(
                                                                                updateData
                                                                            );

                                                                        case 21:
                                                                            _context.next = 23;
                                                                            return _this.object.createEmbeddedEntity(
                                                                                'OwnedItem',
                                                                                items
                                                                            );

                                                                        case 23:
                                                                            ui.notifications.info(
                                                                                'Complete! Check everything. Notably: Ranged weapon mods and ammo; Strength based weapon damage; Specializations on all spells, powers, and weapons;'
                                                                            );

                                                                            _this.close();

                                                                        case 25:
                                                                        case 'end':
                                                                            return _context.stop();
                                                                    }
                                                                }
                                                            },
                                                            _callee
                                                        );
                                                    }
                                                )
                                            );

                                            return function (_x) {
                                                return _ref.apply(this, arguments);
                                            };
                                        })()
                                    );
                                },
                            },
                        ],
                        [
                            {
                                key: 'defaultOptions',
                                get: function get() {
                                    var options = (0, _get2['default'])(
                                        (0, _getPrototypeOf2['default'])(ChummerImportForm),
                                        'defaultOptions',
                                        this
                                    );
                                    options.id = 'chummer-import';
                                    options.classes = ['shadowrun5e'];
                                    options.title = 'Chummer/Hero Lab Import';
                                    options.template =
                                        'systems/shadowrun5e/templates/apps/import.html';
                                    options.width = 600;
                                    options.height = 'auto';
                                    return options;
                                },
                            },
                        ]
                    );
                    return ChummerImportForm;
                })(FormApplication);

                exports.ChummerImportForm = ChummerImportForm;
            },
            {
                '@babel/runtime/helpers/asyncToGenerator': 27,
                '@babel/runtime/helpers/classCallCheck': 28,
                '@babel/runtime/helpers/createClass': 29,
                '@babel/runtime/helpers/get': 31,
                '@babel/runtime/helpers/getPrototypeOf': 32,
                '@babel/runtime/helpers/inherits': 33,
                '@babel/runtime/helpers/interopRequireDefault': 34,
                '@babel/runtime/helpers/possibleConstructorReturn': 39,
                '@babel/runtime/regenerator': 46,
            },
        ],
        4: [
            function (require, module, exports) {
                'use strict';

                var _interopRequireDefault = require('@babel/runtime/helpers/interopRequireDefault');

                Object.defineProperty(exports, '__esModule', {
                    value: true,
                });
                exports.OverwatchScoreTracker = void 0;

                var _classCallCheck2 = _interopRequireDefault(
                    require('@babel/runtime/helpers/classCallCheck')
                );

                var _createClass2 = _interopRequireDefault(
                    require('@babel/runtime/helpers/createClass')
                );

                var _get2 = _interopRequireDefault(require('@babel/runtime/helpers/get'));

                var _inherits2 = _interopRequireDefault(require('@babel/runtime/helpers/inherits'));

                var _possibleConstructorReturn2 = _interopRequireDefault(
                    require('@babel/runtime/helpers/possibleConstructorReturn')
                );

                var _getPrototypeOf2 = _interopRequireDefault(
                    require('@babel/runtime/helpers/getPrototypeOf')
                );

                var _defineProperty2 = _interopRequireDefault(
                    require('@babel/runtime/helpers/defineProperty')
                );

                function _createSuper(Derived) {
                    var hasNativeReflectConstruct = _isNativeReflectConstruct();
                    return function _createSuperInternal() {
                        var Super = (0, _getPrototypeOf2['default'])(Derived),
                            result;
                        if (hasNativeReflectConstruct) {
                            var NewTarget = (0, _getPrototypeOf2['default'])(this).constructor;
                            result = Reflect.construct(Super, arguments, NewTarget);
                        } else {
                            result = Super.apply(this, arguments);
                        }
                        return (0, _possibleConstructorReturn2['default'])(this, result);
                    };
                }

                function _isNativeReflectConstruct() {
                    if (typeof Reflect === 'undefined' || !Reflect.construct) return false;
                    if (Reflect.construct.sham) return false;
                    if (typeof Proxy === 'function') return true;
                    try {
                        Date.prototype.toString.call(Reflect.construct(Date, [], function () {}));
                        return true;
                    } catch (e) {
                        return false;
                    }
                }

                /**
                 * A GM-Tool to keep track of all players overwatch scores
                 */
                var OverwatchScoreTracker = /*#__PURE__*/ (function (_Application) {
                    (0, _inherits2['default'])(OverwatchScoreTracker, _Application);

                    var _super = _createSuper(OverwatchScoreTracker);

                    function OverwatchScoreTracker() {
                        (0, _classCallCheck2['default'])(this, OverwatchScoreTracker);
                        return _super.apply(this, arguments);
                    }

                    (0, _createClass2['default'])(
                        OverwatchScoreTracker,
                        [
                            {
                                key: 'getData',
                                value: function getData() {
                                    // get list of actors that belong to users
                                    var actors = game.users.reduce(function (acc, user) {
                                        if (!user.isGM && user.character) {
                                            acc.push(user.character.data);
                                        }

                                        return acc;
                                    }, []);
                                    return {
                                        actors: actors,
                                    };
                                },
                            },
                            {
                                key: 'activateListeners',
                                value: function activateListeners(html) {
                                    html.find('.overwatch-score-reset').on(
                                        'click',
                                        this._resetOverwatchScore.bind(this)
                                    );
                                    html.find('.overwatch-score-add').on(
                                        'click',
                                        this._addOverwatchScore.bind(this)
                                    );
                                    html.find('.overwatch-score-input').on(
                                        'change',
                                        this._setOverwatchScore.bind(this)
                                    );
                                    html.find('.overwatch-score-roll-15-minutes').on(
                                        'click',
                                        this._rollFor15Minutes.bind(this)
                                    );
                                }, // returns the actor that this event is acting on
                            },
                            {
                                key: '_getActorFromEvent',
                                value: function _getActorFromEvent(event) {
                                    var id = event.currentTarget.closest('.item').dataset.actorId;
                                    if (id)
                                        return game.actors.find(function (a) {
                                            return a._id === id;
                                        });
                                },
                            },
                            {
                                key: '_setOverwatchScore',
                                value: function _setOverwatchScore(event) {
                                    var _this = this;

                                    var actor = this._getActorFromEvent(event);

                                    var amount = event.currentTarget.value;

                                    if (amount && actor) {
                                        actor.setOverwatchScore(amount).then(function () {
                                            return _this.render();
                                        });
                                    }
                                },
                            },
                            {
                                key: '_addOverwatchScore',
                                value: function _addOverwatchScore(event) {
                                    var _this2 = this;

                                    var actor = this._getActorFromEvent(event);

                                    var amount = parseInt(event.currentTarget.dataset.amount);

                                    if (amount && actor) {
                                        var os = actor.getOverwatchScore();
                                        actor.setOverwatchScore(os + amount).then(function () {
                                            return _this2.render();
                                        });
                                    }
                                },
                            },
                            {
                                key: '_resetOverwatchScore',
                                value: function _resetOverwatchScore(event) {
                                    var _this3 = this;

                                    event.preventDefault();

                                    var actor = this._getActorFromEvent(event);

                                    if (actor) {
                                        actor.setOverwatchScore(0).then(function () {
                                            return _this3.render();
                                        });
                                    }
                                },
                            },
                            {
                                key: '_rollFor15Minutes',
                                value: function _rollFor15Minutes(event) {
                                    var _this4 = this;

                                    event.preventDefault();

                                    var actor = this._getActorFromEvent(event);

                                    if (actor) {
                                        //  use static value so it can be modified in modules
                                        var roll = new Roll(
                                            OverwatchScoreTracker.MatrixOverwatchDiceCount
                                        );
                                        roll.roll(); // use GM Roll Mode so players don't see
                                        // const rollMode = CONFIG.Dice.rollModes.gmroll;
                                        // roll.toMessage({ rollMode });

                                        if (roll.total) {
                                            var os = actor.getOverwatchScore();
                                            actor
                                                .setOverwatchScore(os + roll.total)
                                                .then(function () {
                                                    return _this4.render();
                                                });
                                        }
                                    }
                                },
                            },
                        ],
                        [
                            {
                                key: 'defaultOptions',
                                get: function get() {
                                    var options = (0, _get2['default'])(
                                        (0, _getPrototypeOf2['default'])(OverwatchScoreTracker),
                                        'defaultOptions',
                                        this
                                    );
                                    options.id = 'overwatch-score-tracker';
                                    options.classes = ['sr5'];
                                    options.title = game.i18n.localize(
                                        'SR5.OverwatchScoreTrackerTitle'
                                    );
                                    options.template =
                                        'systems/shadowrun5e/templates/apps/gmtools/overwatch-score-tracker.html';
                                    options.width = 450;
                                    options.height = 'auto';
                                    options.resizable = true;
                                    return options;
                                },
                            },
                        ]
                    );
                    return OverwatchScoreTracker;
                })(Application);

                exports.OverwatchScoreTracker = OverwatchScoreTracker;
                (0, _defineProperty2['default'])(
                    OverwatchScoreTracker,
                    'MatrixOverwatchDiceCount',
                    '2d6'
                );
            },
            {
                '@babel/runtime/helpers/classCallCheck': 28,
                '@babel/runtime/helpers/createClass': 29,
                '@babel/runtime/helpers/defineProperty': 30,
                '@babel/runtime/helpers/get': 31,
                '@babel/runtime/helpers/getPrototypeOf': 32,
                '@babel/runtime/helpers/inherits': 33,
                '@babel/runtime/helpers/interopRequireDefault': 34,
                '@babel/runtime/helpers/possibleConstructorReturn': 39,
            },
        ],
        5: [
            function (require, module, exports) {
                'use strict';

                var _interopRequireDefault = require('@babel/runtime/helpers/interopRequireDefault');

                Object.defineProperty(exports, '__esModule', {
                    value: true,
                });
                exports.KnowledgeSkillEditForm = void 0;

                var _classCallCheck2 = _interopRequireDefault(
                    require('@babel/runtime/helpers/classCallCheck')
                );

                var _createClass2 = _interopRequireDefault(
                    require('@babel/runtime/helpers/createClass')
                );

                var _inherits2 = _interopRequireDefault(require('@babel/runtime/helpers/inherits'));

                var _possibleConstructorReturn2 = _interopRequireDefault(
                    require('@babel/runtime/helpers/possibleConstructorReturn')
                );

                var _getPrototypeOf2 = _interopRequireDefault(
                    require('@babel/runtime/helpers/getPrototypeOf')
                );

                var _languageSkillEdit = require('./language-skill-edit.js');

                function _createSuper(Derived) {
                    var hasNativeReflectConstruct = _isNativeReflectConstruct();
                    return function _createSuperInternal() {
                        var Super = (0, _getPrototypeOf2['default'])(Derived),
                            result;
                        if (hasNativeReflectConstruct) {
                            var NewTarget = (0, _getPrototypeOf2['default'])(this).constructor;
                            result = Reflect.construct(Super, arguments, NewTarget);
                        } else {
                            result = Super.apply(this, arguments);
                        }
                        return (0, _possibleConstructorReturn2['default'])(this, result);
                    };
                }

                function _isNativeReflectConstruct() {
                    if (typeof Reflect === 'undefined' || !Reflect.construct) return false;
                    if (Reflect.construct.sham) return false;
                    if (typeof Proxy === 'function') return true;
                    try {
                        Date.prototype.toString.call(Reflect.construct(Date, [], function () {}));
                        return true;
                    } catch (e) {
                        return false;
                    }
                }

                var KnowledgeSkillEditForm = /*#__PURE__*/ (function (_LanguageSkillEditFor) {
                    (0, _inherits2['default'])(KnowledgeSkillEditForm, _LanguageSkillEditFor);

                    var _super = _createSuper(KnowledgeSkillEditForm);

                    (0, _createClass2['default'])(KnowledgeSkillEditForm, [
                        {
                            key: '_updateString',
                            value: function _updateString() {
                                return 'data.skills.knowledge.'
                                    .concat(this.category, '.value.')
                                    .concat(this.skillId);
                            },
                        },
                    ]);

                    function KnowledgeSkillEditForm(actor, skillId, category, options) {
                        var _this;

                        (0, _classCallCheck2['default'])(this, KnowledgeSkillEditForm);
                        _this = _super.call(this, actor, skillId, options);
                        _this.category = category;
                        return _this;
                    }

                    return KnowledgeSkillEditForm;
                })(_languageSkillEdit.LanguageSkillEditForm);

                exports.KnowledgeSkillEditForm = KnowledgeSkillEditForm;
            },
            {
                './language-skill-edit.js': 6,
                '@babel/runtime/helpers/classCallCheck': 28,
                '@babel/runtime/helpers/createClass': 29,
                '@babel/runtime/helpers/getPrototypeOf': 32,
                '@babel/runtime/helpers/inherits': 33,
                '@babel/runtime/helpers/interopRequireDefault': 34,
                '@babel/runtime/helpers/possibleConstructorReturn': 39,
            },
        ],
        6: [
            function (require, module, exports) {
                'use strict';

                var _interopRequireDefault = require('@babel/runtime/helpers/interopRequireDefault');

                Object.defineProperty(exports, '__esModule', {
                    value: true,
                });
                exports.LanguageSkillEditForm = void 0;

                var _defineProperty2 = _interopRequireDefault(
                    require('@babel/runtime/helpers/defineProperty')
                );

                var _classCallCheck2 = _interopRequireDefault(
                    require('@babel/runtime/helpers/classCallCheck')
                );

                var _createClass2 = _interopRequireDefault(
                    require('@babel/runtime/helpers/createClass')
                );

                var _get2 = _interopRequireDefault(require('@babel/runtime/helpers/get'));

                var _inherits2 = _interopRequireDefault(require('@babel/runtime/helpers/inherits'));

                var _possibleConstructorReturn2 = _interopRequireDefault(
                    require('@babel/runtime/helpers/possibleConstructorReturn')
                );

                var _getPrototypeOf2 = _interopRequireDefault(
                    require('@babel/runtime/helpers/getPrototypeOf')
                );

                var _skillEdit = require('./skill-edit.js');

                function ownKeys(object, enumerableOnly) {
                    var keys = Object.keys(object);
                    if (Object.getOwnPropertySymbols) {
                        var symbols = Object.getOwnPropertySymbols(object);
                        if (enumerableOnly)
                            symbols = symbols.filter(function (sym) {
                                return Object.getOwnPropertyDescriptor(object, sym).enumerable;
                            });
                        keys.push.apply(keys, symbols);
                    }
                    return keys;
                }

                function _objectSpread(target) {
                    for (var i = 1; i < arguments.length; i++) {
                        var source = arguments[i] != null ? arguments[i] : {};
                        if (i % 2) {
                            ownKeys(Object(source), true).forEach(function (key) {
                                (0, _defineProperty2['default'])(target, key, source[key]);
                            });
                        } else if (Object.getOwnPropertyDescriptors) {
                            Object.defineProperties(
                                target,
                                Object.getOwnPropertyDescriptors(source)
                            );
                        } else {
                            ownKeys(Object(source)).forEach(function (key) {
                                Object.defineProperty(
                                    target,
                                    key,
                                    Object.getOwnPropertyDescriptor(source, key)
                                );
                            });
                        }
                    }
                    return target;
                }

                function _createSuper(Derived) {
                    var hasNativeReflectConstruct = _isNativeReflectConstruct();
                    return function _createSuperInternal() {
                        var Super = (0, _getPrototypeOf2['default'])(Derived),
                            result;
                        if (hasNativeReflectConstruct) {
                            var NewTarget = (0, _getPrototypeOf2['default'])(this).constructor;
                            result = Reflect.construct(Super, arguments, NewTarget);
                        } else {
                            result = Super.apply(this, arguments);
                        }
                        return (0, _possibleConstructorReturn2['default'])(this, result);
                    };
                }

                function _isNativeReflectConstruct() {
                    if (typeof Reflect === 'undefined' || !Reflect.construct) return false;
                    if (Reflect.construct.sham) return false;
                    if (typeof Proxy === 'function') return true;
                    try {
                        Date.prototype.toString.call(Reflect.construct(Date, [], function () {}));
                        return true;
                    } catch (e) {
                        return false;
                    }
                }

                var LanguageSkillEditForm = /*#__PURE__*/ (function (_SkillEditForm) {
                    (0, _inherits2['default'])(LanguageSkillEditForm, _SkillEditForm);

                    var _super = _createSuper(LanguageSkillEditForm);

                    function LanguageSkillEditForm() {
                        (0, _classCallCheck2['default'])(this, LanguageSkillEditForm);
                        return _super.apply(this, arguments);
                    }

                    (0, _createClass2['default'])(LanguageSkillEditForm, [
                        {
                            key: '_updateString',
                            value: function _updateString() {
                                return 'data.skills.language.value.'.concat(this.skillId);
                            },
                        },
                        {
                            key: 'getData',
                            value: function getData() {
                                return mergeObject(
                                    (0, _get2['default'])(
                                        (0, _getPrototypeOf2['default'])(
                                            LanguageSkillEditForm.prototype
                                        ),
                                        'getData',
                                        this
                                    ).call(this),
                                    {
                                        editable_name: true,
                                    }
                                );
                            },
                            /** @override */
                        },
                        {
                            key: '_onUpdateObject',
                            value: function _onUpdateObject(event, formData, updateData) {
                                (0, _get2['default'])(
                                    (0, _getPrototypeOf2['default'])(
                                        LanguageSkillEditForm.prototype
                                    ),
                                    '_onUpdateObject',
                                    this
                                ).call(this, event, formData, updateData);
                                var name = formData['data.name'];
                                var currentData = updateData[this._updateString()] || {};
                                updateData[this._updateString()] = _objectSpread(
                                    _objectSpread({}, currentData),
                                    {},
                                    {
                                        name: name,
                                    }
                                );
                            },
                        },
                        {
                            key: 'title',
                            get: function get() {
                                return 'Edit Skill - '.concat(
                                    game.i18n.localize(this.getData().data.name)
                                );
                            },
                        },
                    ]);
                    return LanguageSkillEditForm;
                })(_skillEdit.SkillEditForm);

                exports.LanguageSkillEditForm = LanguageSkillEditForm;
            },
            {
                './skill-edit.js': 7,
                '@babel/runtime/helpers/classCallCheck': 28,
                '@babel/runtime/helpers/createClass': 29,
                '@babel/runtime/helpers/defineProperty': 30,
                '@babel/runtime/helpers/get': 31,
                '@babel/runtime/helpers/getPrototypeOf': 32,
                '@babel/runtime/helpers/inherits': 33,
                '@babel/runtime/helpers/interopRequireDefault': 34,
                '@babel/runtime/helpers/possibleConstructorReturn': 39,
            },
        ],
        7: [
            function (require, module, exports) {
                'use strict';

                var _interopRequireDefault = require('@babel/runtime/helpers/interopRequireDefault');

                Object.defineProperty(exports, '__esModule', {
                    value: true,
                });
                exports.SkillEditForm = void 0;

                var _toConsumableArray2 = _interopRequireDefault(
                    require('@babel/runtime/helpers/toConsumableArray')
                );

                var _regenerator = _interopRequireDefault(require('@babel/runtime/regenerator'));

                var _asyncToGenerator2 = _interopRequireDefault(
                    require('@babel/runtime/helpers/asyncToGenerator')
                );

                var _defineProperty2 = _interopRequireDefault(
                    require('@babel/runtime/helpers/defineProperty')
                );

                var _slicedToArray2 = _interopRequireDefault(
                    require('@babel/runtime/helpers/slicedToArray')
                );

                var _classCallCheck2 = _interopRequireDefault(
                    require('@babel/runtime/helpers/classCallCheck')
                );

                var _createClass2 = _interopRequireDefault(
                    require('@babel/runtime/helpers/createClass')
                );

                var _get2 = _interopRequireDefault(require('@babel/runtime/helpers/get'));

                var _inherits2 = _interopRequireDefault(require('@babel/runtime/helpers/inherits'));

                var _possibleConstructorReturn2 = _interopRequireDefault(
                    require('@babel/runtime/helpers/possibleConstructorReturn')
                );

                var _getPrototypeOf2 = _interopRequireDefault(
                    require('@babel/runtime/helpers/getPrototypeOf')
                );

                function ownKeys(object, enumerableOnly) {
                    var keys = Object.keys(object);
                    if (Object.getOwnPropertySymbols) {
                        var symbols = Object.getOwnPropertySymbols(object);
                        if (enumerableOnly)
                            symbols = symbols.filter(function (sym) {
                                return Object.getOwnPropertyDescriptor(object, sym).enumerable;
                            });
                        keys.push.apply(keys, symbols);
                    }
                    return keys;
                }

                function _objectSpread(target) {
                    for (var i = 1; i < arguments.length; i++) {
                        var source = arguments[i] != null ? arguments[i] : {};
                        if (i % 2) {
                            ownKeys(Object(source), true).forEach(function (key) {
                                (0, _defineProperty2['default'])(target, key, source[key]);
                            });
                        } else if (Object.getOwnPropertyDescriptors) {
                            Object.defineProperties(
                                target,
                                Object.getOwnPropertyDescriptors(source)
                            );
                        } else {
                            ownKeys(Object(source)).forEach(function (key) {
                                Object.defineProperty(
                                    target,
                                    key,
                                    Object.getOwnPropertyDescriptor(source, key)
                                );
                            });
                        }
                    }
                    return target;
                }

                function _createSuper(Derived) {
                    var hasNativeReflectConstruct = _isNativeReflectConstruct();
                    return function _createSuperInternal() {
                        var Super = (0, _getPrototypeOf2['default'])(Derived),
                            result;
                        if (hasNativeReflectConstruct) {
                            var NewTarget = (0, _getPrototypeOf2['default'])(this).constructor;
                            result = Reflect.construct(Super, arguments, NewTarget);
                        } else {
                            result = Super.apply(this, arguments);
                        }
                        return (0, _possibleConstructorReturn2['default'])(this, result);
                    };
                }

                function _isNativeReflectConstruct() {
                    if (typeof Reflect === 'undefined' || !Reflect.construct) return false;
                    if (Reflect.construct.sham) return false;
                    if (typeof Proxy === 'function') return true;
                    try {
                        Date.prototype.toString.call(Reflect.construct(Date, [], function () {}));
                        return true;
                    } catch (e) {
                        return false;
                    }
                }

                var SkillEditForm = /*#__PURE__*/ (function (_BaseEntitySheet) {
                    (0, _inherits2['default'])(SkillEditForm, _BaseEntitySheet);

                    var _super = _createSuper(SkillEditForm);

                    function SkillEditForm(actor, skillId, options) {
                        var _this;

                        (0, _classCallCheck2['default'])(this, SkillEditForm);
                        _this = _super.call(this, actor, options);
                        _this.skillId = skillId;
                        return _this;
                    }

                    (0, _createClass2['default'])(
                        SkillEditForm,
                        [
                            {
                                key: '_updateString',
                                value: function _updateString() {
                                    return 'data.skills.active.'.concat(this.skillId);
                                },
                            },
                            {
                                key: '_onUpdateObject',
                                value: function _onUpdateObject(event, formData, updateData) {
                                    var base = formData['data.base'];
                                    var regex = /data\.specs\.(\d+)/;
                                    var specs = Object.entries(formData).reduce(function (
                                        running,
                                        _ref
                                    ) {
                                        var _ref2 = (0, _slicedToArray2['default'])(_ref, 2),
                                            key = _ref2[0],
                                            val = _ref2[1];

                                        var found = key.match(regex);

                                        if (found && found[0]) {
                                            running.push(val);
                                        }

                                        return running;
                                    },
                                    []);
                                    var currentData = updateData[this._updateString()] || {};
                                    updateData[this._updateString()] = _objectSpread(
                                        _objectSpread({}, currentData),
                                        {},
                                        {
                                            base: base,
                                            specs: specs,
                                        }
                                    );
                                },
                                /** @override */
                            },
                            {
                                key: '_updateObject',
                                value: (function () {
                                    var _updateObject2 = (0, _asyncToGenerator2['default'])(
                                        /*#__PURE__*/ _regenerator['default'].mark(function _callee(
                                            event,
                                            formData
                                        ) {
                                            var updateData;
                                            return _regenerator['default'].wrap(
                                                function _callee$(_context) {
                                                    while (1) {
                                                        switch ((_context.prev = _context.next)) {
                                                            case 0:
                                                                updateData = {};

                                                                this._onUpdateObject(
                                                                    event,
                                                                    formData,
                                                                    updateData
                                                                );

                                                                this.entity.update(updateData);

                                                            case 3:
                                                            case 'end':
                                                                return _context.stop();
                                                        }
                                                    }
                                                },
                                                _callee,
                                                this
                                            );
                                        })
                                    );

                                    function _updateObject(_x, _x2) {
                                        return _updateObject2.apply(this, arguments);
                                    }

                                    return _updateObject;
                                })(),
                            },
                            {
                                key: 'activateListeners',
                                value: function activateListeners(html) {
                                    (0, _get2['default'])(
                                        (0, _getPrototypeOf2['default'])(SkillEditForm.prototype),
                                        'activateListeners',
                                        this
                                    ).call(this, html);
                                    html.find('.add-spec').click(this._addNewSpec.bind(this));
                                    html.find('.remove-spec').click(this._removeSpec.bind(this));
                                },
                            },
                            {
                                key: '_addNewSpec',
                                value: function _addNewSpec(event) {
                                    event.preventDefault();
                                    var updateData = {}; // add a blank line to specs

                                    var specializations = this.getData().data.specs;
                                    updateData[
                                        ''.concat(this._updateString(), '.specs')
                                    ] = [].concat(
                                        (0, _toConsumableArray2['default'])(specializations),
                                        ['']
                                    );
                                    this.entity.update(updateData);
                                },
                            },
                            {
                                key: '_removeSpec',
                                value: function _removeSpec(event) {
                                    event.preventDefault();
                                    var updateData = {};
                                    var specs = this.getData().data.specs;
                                    var index = event.currentTarget.dataset.spec;

                                    if (index >= 0) {
                                        specs.splice(index, 1);
                                        updateData[
                                            ''.concat(this._updateString(), '.specs')
                                        ] = specs;
                                        this.entity.update(updateData);
                                    }
                                },
                            },
                            {
                                key: 'getData',
                                value: function getData() {
                                    var actor = (0, _get2['default'])(
                                        (0, _getPrototypeOf2['default'])(SkillEditForm.prototype),
                                        'getData',
                                        this
                                    ).call(this).entity;
                                    var skill = getProperty(actor, this._updateString());
                                    console.log(skill);
                                    return {
                                        data: skill,
                                    };
                                },
                            },
                            {
                                key: 'title',
                                get: function get() {
                                    return 'Edit Skill - '.concat(
                                        game.i18n.localize(this.getData().data.label)
                                    );
                                },
                            },
                        ],
                        [
                            {
                                key: 'defaultOptions',
                                get: function get() {
                                    var options = (0, _get2['default'])(
                                        (0, _getPrototypeOf2['default'])(SkillEditForm),
                                        'defaultOptions',
                                        this
                                    );
                                    return mergeObject(options, {
                                        id: 'skill-editor',
                                        classes: ['sr5', 'sheet', 'skill-edit-window'],
                                        template:
                                            'systems/shadowrun5e/templates/apps/skill-edit.html',
                                        width: 300,
                                        submitOnClose: true,
                                        submitOnChange: true,
                                        closeOnSubmit: false,
                                        resizable: true,
                                    });
                                },
                            },
                        ]
                    );
                    return SkillEditForm;
                })(BaseEntitySheet);

                exports.SkillEditForm = SkillEditForm;
            },
            {
                '@babel/runtime/helpers/asyncToGenerator': 27,
                '@babel/runtime/helpers/classCallCheck': 28,
                '@babel/runtime/helpers/createClass': 29,
                '@babel/runtime/helpers/defineProperty': 30,
                '@babel/runtime/helpers/get': 31,
                '@babel/runtime/helpers/getPrototypeOf': 32,
                '@babel/runtime/helpers/inherits': 33,
                '@babel/runtime/helpers/interopRequireDefault': 34,
                '@babel/runtime/helpers/possibleConstructorReturn': 39,
                '@babel/runtime/helpers/slicedToArray': 41,
                '@babel/runtime/helpers/toConsumableArray': 43,
                '@babel/runtime/regenerator': 46,
            },
        ],
        8: [
            function (require, module, exports) {
                'use strict';
                Object.defineProperty(exports, '__esModule', { value: true });
                exports.measureDistance = void 0;
                /**
                 * Measure the distance between two pixel coordinates
                 * See BaseGrid.measureDistance for more details
                 *
                 * @param {Object} p0           The origin coordinate {x, y}
                 * @param {Object} p1           The destination coordinate {x, y}
                 * @param {boolean} gridSpaces  Enforce grid distance (if true) vs. direct point-to-point (if false)
                 * @return {number}             The distance between p1 and p0
                 */
                exports.measureDistance = function (p0, p1, { gridSpaces = true } = {}) {
                    if (!gridSpaces) {
                        // BaseGrid exists... fix in foundry types
                        // @ts-ignore
                        return BaseGrid.prototype.measureDistance.bind(this)(p0, p1, {
                            gridSpaces,
                        });
                    }
                    const gs = canvas.dimensions.size;
                    const ray = new Ray(p0, p1);
                    const nx = Math.abs(Math.ceil(ray.dx / gs));
                    const ny = Math.abs(Math.ceil(ray.dy / gs));
                    // Get the number of straight and diagonal moves
                    const nDiagonal = Math.min(nx, ny);
                    const nStraight = Math.abs(ny - nx);
                    const diagonalRule = game.settings.get('shadowrun5e', 'diagonalMovement');
                    if (diagonalRule === '1-2-1') {
                        const nd10 = Math.floor(nDiagonal / 2);
                        const spaces = nd10 * 2 + (nDiagonal - nd10) + nStraight;
                        return spaces * canvas.dimensions.distance;
                    }
                    return (nStraight + nDiagonal) * canvas.scene.data.gridDistance;
                };
            },
            {},
        ],
        9: [
            function (require, module, exports) {
                'use strict';
                Object.defineProperty(exports, '__esModule', { value: true });
                exports.addChatMessageContextOptions = exports.highlightSuccessFailure = void 0;
                const entity_js_1 = require('./actor/entity.ts');
                exports.highlightSuccessFailure = (message, html) => {
                    if (!message) return;
                    if (!message.isContentVisible || !message.roll.parts.length) return;
                    const { roll } = message;
                    if (!roll.parts.length) return;
                    if (!roll.parts[0].rolls) return;
                    const khreg = /kh\d+/;
                    const match = roll.formula.match(khreg);
                    const limit = match ? +match[0].replace('kh', '') : 0;
                    const hits = roll.total;
                    const fails = roll.parts[0].rolls.reduce(
                        (fails, r) => (r.roll === 1 ? fails + 1 : fails),
                        0
                    );
                    const count = roll.parts[0].rolls.length;
                    const glitch = fails > count / 2.0;
                    if (limit && hits >= limit) {
                        html.find('.dice-total').addClass('limit-hit');
                    } else if (glitch) {
                        html.find('.dice-total').addClass('glitch');
                    }
                };
                exports.addChatMessageContextOptions = function (html, options) {
                    const canRoll = (li) => {
                        const msg = game.messages.get(li.data().messageId);
                        return !!(
                            li.find('.dice-roll').length &&
                            msg &&
                            (msg.user.id === game.user.id || game.user.isGM)
                        );
                    };
                    options.push(
                        {
                            name: 'Push the Limit',
                            callback: (li) => entity_js_1.SR5Actor.pushTheLimit(li),
                            condition: canRoll,
                            icon: '<i class="fas fa-meteor"></i>',
                        },
                        {
                            name: 'Second Chance',
                            callback: (li) => entity_js_1.SR5Actor.secondChance(li),
                            condition: canRoll,
                            icon: '<i class="fas fa-dice-d6"></i>',
                        }
                    );
                    return options;
                };
            },
            { './actor/entity.js': 1 },
        ],
        10: [
            function (require, module, exports) {
                'use strict';
                var __awaiter =
                    (this && this.__awaiter) ||
                    function (thisArg, _arguments, P, generator) {
                        function adopt(value) {
                            return value instanceof P
                                ? value
                                : new P(function (resolve) {
                                      resolve(value);
                                  });
                        }
                        return new (P || (P = Promise))(function (resolve, reject) {
                            function fulfilled(value) {
                                try {
                                    step(generator.next(value));
                                } catch (e) {
                                    reject(e);
                                }
                            }
                            function rejected(value) {
                                try {
                                    step(generator['throw'](value));
                                } catch (e) {
                                    reject(e);
                                }
                            }
                            function step(result) {
                                result.done
                                    ? resolve(result.value)
                                    : adopt(result.value).then(fulfilled, rejected);
                            }
                            step((generator = generator.apply(thisArg, _arguments || [])).next());
                        });
                    };
                Object.defineProperty(exports, '__esModule', { value: true });
                exports.shadowrunCombatUpdate = exports.preCombatUpdate = void 0;
                exports.preCombatUpdate = function (combat, changes, options) {
                    return __awaiter(this, void 0, void 0, function* () {
                        // triggers when combat round changes
                        if (changes.round && combat.round && changes.round > combat.round) {
                            let initPassEnd = true;
                            for (const c of combat.combatants) {
                                let init = Number(c.initiative);
                                init -= 10;
                                if (init > 0) initPassEnd = false;
                            }
                            if (!initPassEnd) {
                                changes.round = combat.round;
                            }
                            // if we are gm, call function normally
                            // if not gm, send a socket message for the gm to update the combatants
                            // for new initative passes or reroll
                            if (game.user.isGM) {
                                yield exports.shadowrunCombatUpdate(changes, options);
                            } else {
                                // @ts-ignore
                                game.socket.emit('system.shadowrun5e', {
                                    gmCombatUpdate: {
                                        changes,
                                        options,
                                    },
                                });
                            }
                        }
                    });
                };
                exports.shadowrunCombatUpdate = (changes, options) =>
                    __awaiter(void 0, void 0, void 0, function* () {
                        const { combat } = game;
                        // subtact 10 from all initiative, we just went into the next initiative pass
                        const removedCombatants =
                            combat.getFlag('shadowrun5e', 'removedCombatants') || [];
                        const combatants = [];
                        for (const c of combat.combatants) {
                            let init = Number(c.initiative);
                            init -= 10;
                            if (init <= 0) removedCombatants.push(Object.assign({}, c));
                            else {
                                // @ts-ignore
                                combatants.push({ _id: c._id, initiative: init });
                            }
                        }
                        yield combat.deleteEmbeddedEntity(
                            'Combatant',
                            removedCombatants.map((c) => c._id),
                            {}
                        );
                        yield combat.updateEmbeddedEntity('Combatant', combatants, {});
                        if (combatants.length === 0) {
                            const messages = [];
                            const messageOptions = options.messageOptions || {};
                            let sound = true;
                            for (const c of removedCombatants) {
                                const actorData = c.actor ? c.actor.data : {};
                                // @ts-ignore
                                const formula = combat._getInitiativeFormula(c);
                                const roll = new Roll(formula, actorData).roll();
                                c.initiative = roll.total;
                                const rollMode =
                                    messageOptions.rollMode || c.token.hidden || c.hidden
                                        ? 'gmroll'
                                        : 'roll';
                                const messageData = mergeObject(
                                    {
                                        speaker: {
                                            scene: canvas.scene._id,
                                            actor: c.actor ? c.actor._id : null,
                                            token: c.token._id,
                                            alias: c.token.name,
                                        },
                                        flavor: `${c.token.name} rolls for Initiative!`,
                                    },
                                    messageOptions
                                );
                                roll.toMessage(messageData, {
                                    rollMode,
                                    create: false,
                                }).then((chatData) => {
                                    // only make the sound once
                                    if (sound) sound = false;
                                    else chatData.sound = null;
                                    // @ts-ignore
                                    messages.push(chatData);
                                });
                            }
                            yield combat.createEmbeddedEntity('Combatant', removedCombatants, {});
                            yield ChatMessage.create(messages);
                            yield combat.unsetFlag('shadowrun5e', 'removedCombatants');
                            // @ts-ignore
                            yield combat.resetAll();
                            yield combat.rollAll();
                            yield combat.update({ turn: 0 });
                        } else if (removedCombatants.length) {
                            yield combat.setFlag(
                                'shadowrun5e',
                                'removedCombatants',
                                removedCombatants
                            );
                            yield combat.update({ turn: 0 });
                        }
                    });
            },
            {},
        ],
        11: [
            function (require, module, exports) {
                'use strict';

                Object.defineProperty(exports, '__esModule', {
                    value: true,
                });
                exports.SR5 = void 0;
                var SR5 = {};
                exports.SR5 = SR5;
                SR5['attributes'] = {
                    body: 'SR5.AttrBody',
                    agility: 'SR5.AttrAgility',
                    reaction: 'SR5.AttrReaction',
                    strength: 'SR5.AttrStrength',
                    willpower: 'SR5.AttrWillpower',
                    logic: 'SR5.AttrLogic',
                    intuition: 'SR5.AttrIntuition',
                    charisma: 'SR5.AttrCharisma',
                    magic: 'SR5.AttrMagic',
                    resonance: 'SR5.AttrResonance',
                    edge: 'SR5.AttrEdge',
                    essence: 'SR5.AttrEssence',
                    attack: 'SR5.MatrixAttrAttack',
                    sleaze: 'SR5.MatrixAttrSleaze',
                    data_processing: 'SR5.MatrixAttrDataProc',
                    firewall: 'SR5.MatrixAttrFirewall',
                };
                SR5['limits'] = {
                    physical: 'SR5.LimitPhysical',
                    social: 'SR5.LimitSocial',
                    mental: 'SR5.LimitMental',
                    attack: 'SR5.MatrixAttrAttack',
                    sleaze: 'SR5.MatrixAttrSleaze',
                    data_processing: 'SR5.MatrixAttrDataProc',
                    firewall: 'SR5.MatrixAttrFirewall',
                };
                SR5['specialTypes'] = {
                    mundane: 'SR5.Mundane',
                    magic: 'SR5.Awakened',
                    resonance: 'SR5.Emerged',
                };
                SR5['damageTypes'] = {
                    physical: 'SR5.DmgTypePhysical',
                    stun: 'SR5.DmgTypeStun',
                    matrix: 'SR5.DmgTypeMatrix',
                };
                SR5['elementTypes'] = {
                    fire: 'SR5.ElementFire',
                    cold: 'SR5.ElementCold',
                    acid: 'SR5.ElementAcid',
                    electricity: 'SR5.ElementElectricity',
                    radiation: 'SR5.ElementRadiation',
                };
                SR5['spellCategories'] = {
                    combat: 'SR5.SpellCatCombat',
                    detection: 'SR5.SpellCatDetection',
                    health: 'SR5.SpellCatHealth',
                    illusion: 'SR5.SpellCatIllusion',
                    manipulation: 'SR5.SpellCatManipulation',
                };
                SR5['spellTypes'] = {
                    physical: 'SR5.SpellTypePhysical',
                    mana: 'SR5.SpellTypeMana',
                };
                SR5['spellRanges'] = {
                    touch: 'SR5.SpellRangeTouch',
                    los: 'SR5.SpellRangeLos',
                    los_a: 'SR5.SpellRangeLosA',
                };
                SR5['combatSpellTypes'] = {
                    direct: 'SR5.SpellCombatDirect',
                    indirect: 'SR5.SpellCombatIndirect',
                };
                SR5['detectionSpellTypes'] = {
                    directional: 'SR5.SpellDetectionDirectional',
                    psychic: 'SR5.SpellDetectionPsychic',
                    area: 'SR5.SpellDetectionArea',
                };
                SR5['illusionSpellTypes'] = {
                    obvious: 'SR5.SpellIllusionObvious',
                    realistic: 'SR5.SpellIllusionRealistic',
                };
                SR5['illusionSpellSenses'] = {
                    'single-sense': 'SR5.SpellIllusionSingleSense',
                    'multi-sense': 'SR5.SpellIllusionMultiSense',
                };
                SR5['attributeRolls'] = {
                    composure: 'SR5.RollComposure',
                    lift_carry: 'SR5.RollLiftCarry',
                    judge_intentions: 'SR5.RollJudgeIntentions',
                    memory: 'SR5.RollMemory',
                };
                SR5['matrixTargets'] = {
                    persona: 'SR5.TargetPersona',
                    device: 'SR5.TargetDevice',
                    file: 'SR5.TargetFile',
                    self: 'SR5.TargetSelf',
                    sprite: 'SR5.TargetSprite',
                    other: 'SR5.TargetOther',
                };
                SR5['durations'] = {
                    instant: 'SR5.DurationInstant',
                    sustained: 'SR5.DurationSustained',
                    permanent: 'SR5.DurationPermanent',
                };
                SR5['weaponCategories'] = {
                    range: 'SR5.WeaponCatRange',
                    melee: 'SR5.WeaponCatMelee',
                    thrown: 'SR5.WeaponCatThrown',
                };
                SR5['qualityTypes'] = {
                    positive: 'SR5.QualityTypePositive',
                    negative: 'SR5.QualityTypeNegative',
                };
                SR5['deviceCategories'] = {
                    commlink: 'SR5.DeviceCatCommlink',
                    cyberdeck: 'SR5.DeviceCatCyberdeck',
                };
                SR5['cyberwareGrades'] = {
                    standard: 'SR5.CyberwareGradeStandard',
                    alpha: 'SR5.CyberwareGradeAlpha',
                    beta: 'SR5.CyberwareGradeBeta',
                    delta: 'SR5.CyberwareGradeDelta',
                    used: 'SR5.CyberwareGradeUsed',
                };
                SR5['knowledgeSkillCategories'] = {
                    street: 'SR5.KnowledgeSkillStreet',
                    academic: 'SR5.KnowledgeSkillAcademic',
                    professional: 'SR5.KnowledgeSkillProfessional',
                    interests: 'SR5.KnowledgeSkillInterests',
                };
                SR5['activeSkills'] = {
                    archery: 'SR5.SkillArchery',
                    automatics: 'SR5.SkillAutomatics',
                    blades: 'SR5.SkillBlades',
                    clubs: 'SR5.SkillClubs',
                    exotic_melee: 'SR5.SkillExoticMelee',
                    exotic_range: 'SR5.SkillExoticRange',
                    heavy_weapons: 'SR5.SkillHeavyWeapons',
                    longarms: 'SR5.SkillLongarms',
                    pistols: 'SR5.SkillPistols',
                    throwing_weapons: 'SR5.SkillThrowingWeapons',
                    unarmed_combat: 'SR5.SkillUnarmedCombat',
                    disguise: 'SR5.SkillDisguise',
                    diving: 'SR5.SkillDiving',
                    escape_artist: 'SR5.SkillEscapeArtist',
                    free_fall: 'SR5.SkillFreeFall',
                    gymnastics: 'SR5.SkillGymnastics',
                    palming: 'SR5.SkillPalming',
                    perception: 'SR5.SkillPerception',
                    running: 'SR5.SkillRunning',
                    sneaking: 'SR5.SkillSneaking',
                    survival: 'SR5.SkillSurvival',
                    swimming: 'SR5.SkillSwimming',
                    tracking: 'SR5.SkillTracking',
                    con: 'SR5.SkillCon',
                    etiquette: 'SR5.SkillEtiquette',
                    impersonation: 'SR5.SkillImpersonation',
                    instruction: 'SR5.SkillInstruction',
                    intimidation: 'SR5.SkillIntimidation',
                    leadership: 'SR5.SkillLeadership',
                    negotiation: 'SR5.SkillNegotiation',
                    performance: 'SR5.SkillPerformance',
                    alchemy: 'SR5.SkillAlchemy',
                    arcana: 'SR5.SkillArcana',
                    artificing: 'SR5.SkillArtificing',
                    assensing: 'SR5.SkillAssensing',
                    astral_combat: 'SR5.SkillAstralCombat',
                    banishing: 'SR5.SkillBanishing',
                    binding: 'SR5.SkillBinding',
                    counterspelling: 'SR5.SkillCounterspelling',
                    disenchanting: 'SR5.SkillDisenchanting',
                    ritual_spellcasting: 'SR5.SkillRitualSpellcasting',
                    spellcasting: 'SR5.SkillSpellcasting',
                    summoning: 'SR5.SkillSummoning',
                    compiling: 'SR5.SkillCompiling',
                    decompiling: 'SR5.SkillDecompiling',
                    registering: 'SR5.SkillRegistering',
                    aeronautics_mechanic: 'SR5.SkillAeronauticsMechanic',
                    automotive_mechanic: 'SR5.SkillAutomotiveMechanic',
                    industrial_mechanic: 'SR5.SkillIndustrialMechanic',
                    nautical_mechanic: 'SR5.SkillNauticalMechanic',
                    animal_handling: 'SR5.SkillAnimalHandling',
                    armorer: 'SR5.SkillArmorer',
                    artisan: 'SR5.SkillArtisan',
                    biotechnology: 'SR5.SkillBiotechnology',
                    chemistry: 'SR5.SkillChemistry',
                    computer: 'SR5.SkillComputer',
                    cybercombat: 'SR5.SkillCybercombat',
                    cybertechnology: 'SR5.SkillCybertechnology',
                    demolitions: 'SR5.SkillDemolitions',
                    electronic_warfare: 'SR5.SkillElectronicWarfare',
                    first_aid: 'SR5.SkillFirstAid',
                    forgery: 'SR5.SkillForgery',
                    hacking: 'SR5.SkillHacking',
                    hardware: 'SR5.SkillHardware',
                    locksmith: 'SR5.SkillLocksmith',
                    medicine: 'SR5.SkillMedicine',
                    navigation: 'SR5.SkillNavigation',
                    software: 'SR5.SkillSoftware',
                    gunnery: 'SR5.SkillGunnery',
                    pilot_aerospace: 'SR5.SkillPilotAerospace',
                    pilot_aircraft: 'SR5.SkillPilotAircraft',
                    pilot_walker: 'SR5.SkillPilotWalker',
                    pilot_ground_craft: 'SR5.SkillPilotGroundCraft',
                    pilot_water_craft: 'SR5.SkillPilotWaterCraft',
                    pilot_exotic_vehicle: 'SR5.SkillPilotExoticVehicle',
                };
                SR5['actionTypes'] = {
                    none: 'SR5.ActionTypeNone',
                    free: 'SR5.ActionTypeFree',
                    simple: 'SR5.ActionTypeSimple',
                    complex: 'SR5.ActionTypeComplex',
                    varies: 'SR5.ActionTypeVaries',
                };
                SR5['matrixAttributes'] = {
                    attack: 'SR5.MatrixAttrAttack',
                    sleaze: 'SR5.MatrixAttrSleaze',
                    data_processing: 'SR5.MatrixAttrDataProc',
                    firewall: 'SR5.MatrixAttrFirewall',
                };
                SR5['initiativeCategories'] = {
                    meatspace: 'SR5.InitCatMeatspace',
                    astral: 'SR5.InitCatAstral',
                    matrix: 'SR5.InitCatMatrix',
                };
                SR5['modificationTypes'] = {
                    weapon: 'SR5.Weapon',
                    armor: 'SR5.Armor',
                };
                SR5['mountPoints'] = {
                    barrel: 'SR5.Barrel',
                    stock: 'SR5.Stock',
                    top: 'SR5.Top',
                    side: 'SR5.Side',
                    internal: 'SR5.Internal',
                };
                SR5['lifestyleTypes'] = {
                    street: 'SR5.LifestyleStreet',
                    squatter: 'SR5.LifestyleSquatter',
                    low: 'SR5.LifestyleLow',
                    medium: 'SR5.LifestyleMiddle',
                    high: 'SR5.LifestyleHigh',
                    luxory: 'SR5.LifestyleLuxory',
                    other: 'SR5.LifestyleOther',
                };
                SR5['kbmod'] = {
                    STANDARD: 'shiftKey',
                    EDGE: 'altKey',
                    SPEC: 'ctrlKey',
                };
            },
            {},
        ],
        12: [
            function (require, module, exports) {
                'use strict';
                Object.defineProperty(exports, '__esModule', { value: true });
                exports.SR5 = void 0;
                exports.SR5 = {};
                exports.SR5['attributes'] = {
                    body: 'SR5.AttrBody',
                    agility: 'SR5.AttrAgility',
                    reaction: 'SR5.AttrReaction',
                    strength: 'SR5.AttrStrength',
                    willpower: 'SR5.AttrWillpower',
                    logic: 'SR5.AttrLogic',
                    intuition: 'SR5.AttrIntuition',
                    charisma: 'SR5.AttrCharisma',
                    magic: 'SR5.AttrMagic',
                    resonance: 'SR5.AttrResonance',
                    edge: 'SR5.AttrEdge',
                    essence: 'SR5.AttrEssence',
                    attack: 'SR5.MatrixAttrAttack',
                    sleaze: 'SR5.MatrixAttrSleaze',
                    data_processing: 'SR5.MatrixAttrDataProc',
                    firewall: 'SR5.MatrixAttrFirewall',
                };
                exports.SR5['limits'] = {
                    physical: 'SR5.LimitPhysical',
                    social: 'SR5.LimitSocial',
                    mental: 'SR5.LimitMental',
                    attack: 'SR5.MatrixAttrAttack',
                    sleaze: 'SR5.MatrixAttrSleaze',
                    data_processing: 'SR5.MatrixAttrDataProc',
                    firewall: 'SR5.MatrixAttrFirewall',
                };
                exports.SR5['specialTypes'] = {
                    mundane: 'SR5.Mundane',
                    magic: 'SR5.Awakened',
                    resonance: 'SR5.Emerged',
                };
                exports.SR5['damageTypes'] = {
                    physical: 'SR5.DmgTypePhysical',
                    stun: 'SR5.DmgTypeStun',
                    matrix: 'SR5.DmgTypeMatrix',
                };
                exports.SR5['elementTypes'] = {
                    fire: 'SR5.ElementFire',
                    cold: 'SR5.ElementCold',
                    acid: 'SR5.ElementAcid',
                    electricity: 'SR5.ElementElectricity',
                    radiation: 'SR5.ElementRadiation',
                };
                exports.SR5['spellCategories'] = {
                    combat: 'SR5.SpellCatCombat',
                    detection: 'SR5.SpellCatDetection',
                    health: 'SR5.SpellCatHealth',
                    illusion: 'SR5.SpellCatIllusion',
                    manipulation: 'SR5.SpellCatManipulation',
                };
                exports.SR5['spellTypes'] = {
                    physical: 'SR5.SpellTypePhysical',
                    mana: 'SR5.SpellTypeMana',
                };
                exports.SR5['spellRanges'] = {
                    touch: 'SR5.SpellRangeTouch',
                    los: 'SR5.SpellRangeLos',
                    los_a: 'SR5.SpellRangeLosA',
                };
                exports.SR5['combatSpellTypes'] = {
                    direct: 'SR5.SpellCombatDirect',
                    indirect: 'SR5.SpellCombatIndirect',
                };
                exports.SR5['detectionSpellTypes'] = {
                    directional: 'SR5.SpellDetectionDirectional',
                    psychic: 'SR5.SpellDetectionPsychic',
                    area: 'SR5.SpellDetectionArea',
                };
                exports.SR5['illusionSpellTypes'] = {
                    obvious: 'SR5.SpellIllusionObvious',
                    realistic: 'SR5.SpellIllusionRealistic',
                };
                exports.SR5['illusionSpellSenses'] = {
                    'single-sense': 'SR5.SpellIllusionSingleSense',
                    'multi-sense': 'SR5.SpellIllusionMultiSense',
                };
                exports.SR5['attributeRolls'] = {
                    composure: 'SR5.RollComposure',
                    lift_carry: 'SR5.RollLiftCarry',
                    judge_intentions: 'SR5.RollJudgeIntentions',
                    memory: 'SR5.RollMemory',
                };
                exports.SR5['matrixTargets'] = {
                    persona: 'SR5.TargetPersona',
                    device: 'SR5.TargetDevice',
                    file: 'SR5.TargetFile',
                    self: 'SR5.TargetSelf',
                    sprite: 'SR5.TargetSprite',
                    other: 'SR5.TargetOther',
                };
                exports.SR5['durations'] = {
                    instant: 'SR5.DurationInstant',
                    sustained: 'SR5.DurationSustained',
                    permanent: 'SR5.DurationPermanent',
                };
                exports.SR5['weaponCategories'] = {
                    range: 'SR5.WeaponCatRange',
                    melee: 'SR5.WeaponCatMelee',
                    thrown: 'SR5.WeaponCatThrown',
                };
                exports.SR5['qualityTypes'] = {
                    positive: 'SR5.QualityTypePositive',
                    negative: 'SR5.QualityTypeNegative',
                };
                exports.SR5['deviceCategories'] = {
                    commlink: 'SR5.DeviceCatCommlink',
                    cyberdeck: 'SR5.DeviceCatCyberdeck',
                };
                exports.SR5['cyberwareGrades'] = {
                    standard: 'SR5.CyberwareGradeStandard',
                    alpha: 'SR5.CyberwareGradeAlpha',
                    beta: 'SR5.CyberwareGradeBeta',
                    delta: 'SR5.CyberwareGradeDelta',
                    used: 'SR5.CyberwareGradeUsed',
                };
                exports.SR5['knowledgeSkillCategories'] = {
                    street: 'SR5.KnowledgeSkillStreet',
                    academic: 'SR5.KnowledgeSkillAcademic',
                    professional: 'SR5.KnowledgeSkillProfessional',
                    interests: 'SR5.KnowledgeSkillInterests',
                };
                exports.SR5['activeSkills'] = {
                    archery: 'SR5.SkillArchery',
                    automatics: 'SR5.SkillAutomatics',
                    blades: 'SR5.SkillBlades',
                    clubs: 'SR5.SkillClubs',
                    exotic_melee: 'SR5.SkillExoticMelee',
                    exotic_range: 'SR5.SkillExoticRange',
                    heavy_weapons: 'SR5.SkillHeavyWeapons',
                    longarms: 'SR5.SkillLongarms',
                    pistols: 'SR5.SkillPistols',
                    throwing_weapons: 'SR5.SkillThrowingWeapons',
                    unarmed_combat: 'SR5.SkillUnarmedCombat',
                    disguise: 'SR5.SkillDisguise',
                    diving: 'SR5.SkillDiving',
                    escape_artist: 'SR5.SkillEscapeArtist',
                    free_fall: 'SR5.SkillFreeFall',
                    gymnastics: 'SR5.SkillGymnastics',
                    palming: 'SR5.SkillPalming',
                    perception: 'SR5.SkillPerception',
                    running: 'SR5.SkillRunning',
                    sneaking: 'SR5.SkillSneaking',
                    survival: 'SR5.SkillSurvival',
                    swimming: 'SR5.SkillSwimming',
                    tracking: 'SR5.SkillTracking',
                    con: 'SR5.SkillCon',
                    etiquette: 'SR5.SkillEtiquette',
                    impersonation: 'SR5.SkillImpersonation',
                    instruction: 'SR5.SkillInstruction',
                    intimidation: 'SR5.SkillIntimidation',
                    leadership: 'SR5.SkillLeadership',
                    negotiation: 'SR5.SkillNegotiation',
                    performance: 'SR5.SkillPerformance',
                    alchemy: 'SR5.SkillAlchemy',
                    arcana: 'SR5.SkillArcana',
                    artificing: 'SR5.SkillArtificing',
                    assensing: 'SR5.SkillAssensing',
                    astral_combat: 'SR5.SkillAstralCombat',
                    banishing: 'SR5.SkillBanishing',
                    binding: 'SR5.SkillBinding',
                    counterspelling: 'SR5.SkillCounterspelling',
                    disenchanting: 'SR5.SkillDisenchanting',
                    ritual_spellcasting: 'SR5.SkillRitualSpellcasting',
                    spellcasting: 'SR5.SkillSpellcasting',
                    summoning: 'SR5.SkillSummoning',
                    compiling: 'SR5.SkillCompiling',
                    decompiling: 'SR5.SkillDecompiling',
                    registering: 'SR5.SkillRegistering',
                    aeronautics_mechanic: 'SR5.SkillAeronauticsMechanic',
                    automotive_mechanic: 'SR5.SkillAutomotiveMechanic',
                    industrial_mechanic: 'SR5.SkillIndustrialMechanic',
                    nautical_mechanic: 'SR5.SkillNauticalMechanic',
                    animal_handling: 'SR5.SkillAnimalHandling',
                    armorer: 'SR5.SkillArmorer',
                    artisan: 'SR5.SkillArtisan',
                    biotechnology: 'SR5.SkillBiotechnology',
                    chemistry: 'SR5.SkillChemistry',
                    computer: 'SR5.SkillComputer',
                    cybercombat: 'SR5.SkillCybercombat',
                    cybertechnology: 'SR5.SkillCybertechnology',
                    demolitions: 'SR5.SkillDemolitions',
                    electronic_warfare: 'SR5.SkillElectronicWarfare',
                    first_aid: 'SR5.SkillFirstAid',
                    forgery: 'SR5.SkillForgery',
                    hacking: 'SR5.SkillHacking',
                    hardware: 'SR5.SkillHardware',
                    locksmith: 'SR5.SkillLocksmith',
                    medicine: 'SR5.SkillMedicine',
                    navigation: 'SR5.SkillNavigation',
                    software: 'SR5.SkillSoftware',
                    gunnery: 'SR5.SkillGunnery',
                    pilot_aerospace: 'SR5.SkillPilotAerospace',
                    pilot_aircraft: 'SR5.SkillPilotAircraft',
                    pilot_walker: 'SR5.SkillPilotWalker',
                    pilot_ground_craft: 'SR5.SkillPilotGroundCraft',
                    pilot_water_craft: 'SR5.SkillPilotWaterCraft',
                    pilot_exotic_vehicle: 'SR5.SkillPilotExoticVehicle',
                };
                exports.SR5['actionTypes'] = {
                    none: 'SR5.ActionTypeNone',
                    free: 'SR5.ActionTypeFree',
                    simple: 'SR5.ActionTypeSimple',
                    complex: 'SR5.ActionTypeComplex',
                    varies: 'SR5.ActionTypeVaries',
                };
                exports.SR5['matrixAttributes'] = {
                    attack: 'SR5.MatrixAttrAttack',
                    sleaze: 'SR5.MatrixAttrSleaze',
                    data_processing: 'SR5.MatrixAttrDataProc',
                    firewall: 'SR5.MatrixAttrFirewall',
                };
                exports.SR5['initiativeCategories'] = {
                    meatspace: 'SR5.InitCatMeatspace',
                    astral: 'SR5.InitCatAstral',
                    matrix: 'SR5.InitCatMatrix',
                };
                exports.SR5['modificationTypes'] = {
                    weapon: 'SR5.Weapon',
                    armor: 'SR5.Armor',
                };
                exports.SR5['mountPoints'] = {
                    barrel: 'SR5.Barrel',
                    stock: 'SR5.Stock',
                    top: 'SR5.Top',
                    side: 'SR5.Side',
                    internal: 'SR5.Internal',
                };
                exports.SR5['lifestyleTypes'] = {
                    street: 'SR5.LifestyleStreet',
                    squatter: 'SR5.LifestyleSquatter',
                    low: 'SR5.LifestyleLow',
                    medium: 'SR5.LifestyleMiddle',
                    high: 'SR5.LifestyleHigh',
                    luxory: 'SR5.LifestyleLuxory',
                    other: 'SR5.LifestyleOther',
                };
                exports.SR5['kbmod'] = {
                    STANDARD: 'shiftKey',
                    EDGE: 'altKey',
                    SPEC: 'ctrlKey',
                };
            },
            {},
        ],
        13: [
            function (require, module, exports) {
                'use strict';

                var _interopRequireDefault = require('@babel/runtime/helpers/interopRequireDefault');

                Object.defineProperty(exports, '__esModule', {
                    value: true,
                });
                exports.DiceSR = void 0;

                var _regenerator = _interopRequireDefault(require('@babel/runtime/regenerator'));

                var _classCallCheck2 = _interopRequireDefault(
                    require('@babel/runtime/helpers/classCallCheck')
                );

                var _createClass2 = _interopRequireDefault(
                    require('@babel/runtime/helpers/createClass')
                );

                var _config = require('./config.js');

                var _helpers = require('./helpers');

                var __awaiter =
                    (void 0 && (void 0).__awaiter) ||
                    function (thisArg, _arguments, P, generator) {
                        function adopt(value) {
                            return value instanceof P
                                ? value
                                : new P(function (resolve) {
                                      resolve(value);
                                  });
                        }

                        return new (P || (P = Promise))(function (resolve, reject) {
                            function fulfilled(value) {
                                try {
                                    step(generator.next(value));
                                } catch (e) {
                                    reject(e);
                                }
                            }

                            function rejected(value) {
                                try {
                                    step(generator['throw'](value));
                                } catch (e) {
                                    reject(e);
                                }
                            }

                            function step(result) {
                                result.done
                                    ? resolve(result.value)
                                    : adopt(result.value).then(fulfilled, rejected);
                            }

                            step((generator = generator.apply(thisArg, _arguments || [])).next());
                        });
                    };

                var DiceSR = /*#__PURE__*/ (function () {
                    function DiceSR() {
                        (0, _classCallCheck2['default'])(this, DiceSR);
                    }

                    (0, _createClass2['default'])(DiceSR, null, [
                        {
                            key: 'basicRoll',
                            value: function basicRoll(_ref) {
                                var count = _ref.count,
                                    limit = _ref.limit,
                                    explode = _ref.explode,
                                    title = _ref.title,
                                    actor = _ref.actor;
                                return __awaiter(
                                    this,
                                    void 0,
                                    void 0,
                                    /*#__PURE__*/ _regenerator['default'].mark(function _callee() {
                                        var formula, roll, rollMode;
                                        return _regenerator['default'].wrap(function _callee$(
                                            _context
                                        ) {
                                            while (1) {
                                                switch ((_context.prev = _context.next)) {
                                                    case 0:
                                                        if (!(count <= 0)) {
                                                            _context.next = 3;
                                                            break;
                                                        }

                                                        // @ts-ignore
                                                        ui.notifications.error(
                                                            game.i18n.localize('SR5.RollOneDie')
                                                        );
                                                        return _context.abrupt('return');

                                                    case 3:
                                                        formula = ''.concat(count, 'd6');

                                                        if (explode) {
                                                            formula += 'x6';
                                                        }

                                                        if (limit) {
                                                            formula += 'kh'.concat(limit);
                                                        }

                                                        formula += 'cs>=5';
                                                        roll = new Roll(formula);
                                                        rollMode = game.settings.get(
                                                            'core',
                                                            'rollMode'
                                                        );
                                                        roll.toMessage({
                                                            speaker: ChatMessage.getSpeaker({
                                                                actor: actor,
                                                            }),
                                                            flavor: title,
                                                            rollMode: rollMode,
                                                        });
                                                        return _context.abrupt('return', roll);

                                                    case 11:
                                                    case 'end':
                                                        return _context.stop();
                                                }
                                            }
                                        },
                                        _callee);
                                    })
                                );
                            },
                            /**
                             *
                             * @param event {MouseEvent} - mouse event that caused this
                             * @param actor {Sr5Actor} - actor this roll is associated with
                             * @param parts {Object} - object where keys should be the 'name' that can be translated/is translated and value should be the numerical values to add to dice pool
                             * @param limit {Number} - Limit to apply to the roll, leave empty for no limit
                             * @param extended {Boolean} - if this is an extended test (automatically sets the dropdown in the dialog)
                             * @param dialogOptions {Object} - Options to provide to the dialog window
                             * @param dialogOptions.environmental {Number} - value of Environmental Modifiers
                             * @param dialogOptions.prompt {Boolean} - if this is prompting the user to enter the dice pool of the roll (enables the Dice Pool box)
                             * @param after {Function} - Function to run after each roll. Needed to capture rolls of extended tests, otherwise Promise will work
                             * @param base {Number} - base value to use for the dice pool, default to 0 (parts are preferred method)
                             * @param title {String} - title to display for the roll
                             * @param wounds {Boolean} - if wounds should be applied, defaults to true
                             * @returns {Promise<Roll>|Promise<*>}
                             */
                        },
                        {
                            key: 'rollTest',
                            value: function rollTest(_ref2) {
                                var _this = this;

                                var event = _ref2.event,
                                    actor = _ref2.actor,
                                    _ref2$parts = _ref2.parts,
                                    parts = _ref2$parts === void 0 ? {} : _ref2$parts,
                                    limit = _ref2.limit,
                                    extended = _ref2.extended,
                                    dialogOptions = _ref2.dialogOptions,
                                    after = _ref2.after,
                                    _ref2$base = _ref2.base,
                                    base = _ref2$base === void 0 ? 0 : _ref2$base,
                                    _ref2$title = _ref2.title,
                                    title = _ref2$title === void 0 ? 'Roll' : _ref2$title,
                                    _ref2$wounds = _ref2.wounds,
                                    wounds = _ref2$wounds === void 0 ? true : _ref2$wounds;

                                // if we aren't for soaking some damage
                                if (
                                    actor &&
                                    !(
                                        title.includes('Soak') ||
                                        title.includes('Drain') ||
                                        title.includes('Fade')
                                    )
                                ) {
                                    if (wounds) wounds = actor.data.data.wounds.value;
                                }

                                if (!game.settings.get('shadowrun5e', 'applyLimits')) {
                                    limit = undefined;
                                }

                                var dice_pool = base;
                                var edgeAttMax = actor ? actor.data.data.attributes.edge.max : 0;

                                if (event && event[_config.SR5['kbmod'].EDGE]) {
                                    parts['SR5.Edge'] = +edgeAttMax;
                                    actor === null || actor === void 0
                                        ? void 0
                                        : actor.update({
                                              'data.attributes.edge.value':
                                                  actor.data.data.attributes.edge.value - 1,
                                          });
                                } // add mods to dice pool

                                dice_pool += Object.values(parts).reduce(function (prev, cur) {
                                    return prev + cur;
                                }, 0);

                                if (event && event[_config.SR5['kbmod'].STANDARD]) {
                                    var _edge = parts['SR5.Edge'] !== undefined || undefined;

                                    return this.basicRoll({
                                        count: dice_pool,
                                        explode: _edge,
                                        limit: _edge ? undefined : limit,
                                        title: title,
                                        actor: actor,
                                    });
                                }

                                var dialogData = {
                                    options: dialogOptions,
                                    extended: extended,
                                    dice_pool: dice_pool,
                                    base: base,
                                    parts: parts,
                                    limit: limit,
                                    wounds: wounds,
                                };
                                var template =
                                    'systems/shadowrun5e/templates/rolls/roll-dialog.html';
                                var edge = false;
                                var cancel = true;
                                return new Promise(function (resolve) {
                                    renderTemplate(template, dialogData).then(function (dlg) {
                                        new Dialog({
                                            title: title,
                                            content: dlg,
                                            buttons: {
                                                roll: {
                                                    label: 'Roll',
                                                    icon: '<i class="fas fa-dice-six"></i>',
                                                    callback: function callback() {
                                                        return (cancel = false);
                                                    },
                                                },
                                                edge: {
                                                    label: 'Push the Limit (+'.concat(
                                                        edgeAttMax,
                                                        ')'
                                                    ),
                                                    icon: '<i class="fas fa-bomb"></i>',
                                                    callback: function callback() {
                                                        edge = true;
                                                        cancel = false;
                                                    },
                                                },
                                            },
                                            default: 'roll',
                                            close: function close(html) {
                                                if (cancel) return; // get the actual dice_pool from the difference of initial parts and value in the dialog

                                                var dicePool = _helpers.Helpers.parseInput(
                                                    $(html).find('[name="dice_pool"]').val()
                                                );

                                                +_helpers.Helpers.parseInput(
                                                    $(html).find('[name="dp_mod"]').val()
                                                );
                                                +_helpers.Helpers.parseInput(
                                                    $(html).find('[name="wounds"]').val()
                                                );
                                                -_helpers.Helpers.parseInput(
                                                    $(html)
                                                        .find('[name="options.environmental"]')
                                                        .val()
                                                );

                                                var limit = _helpers.Helpers.parseInput(
                                                    $(html).find('[name="limit"]').val()
                                                );

                                                var extended =
                                                    _helpers.Helpers.parseInput(
                                                        $(html).find('[name="extended"]').val()
                                                    ) !== 0;

                                                if (edge && actor) {
                                                    dicePool += actor.data.data.attributes.edge.max;
                                                    actor.update({
                                                        'data.attributes.edge.value':
                                                            actor.data.data.attributes.edge.value -
                                                            1,
                                                    });
                                                }

                                                var r = _this.basicRoll({
                                                    count: dicePool,
                                                    explode: edge,
                                                    limit: edge ? undefined : limit,
                                                    title: title,
                                                    actor: actor,
                                                });

                                                if (extended && r) {
                                                    var currentExtended =
                                                        parts['SR5.Extended'] || 0;
                                                    parts['SR5.Extended'] = currentExtended - 1; // add a bit of a delay to roll again

                                                    setTimeout(function () {
                                                        return DiceSR.rollTest({
                                                            event: event,
                                                            base: base,
                                                            parts: parts,
                                                            actor: actor,
                                                            limit: limit,
                                                            title: title,
                                                            extended: extended,
                                                            dialogOptions: dialogOptions,
                                                            wounds: wounds,
                                                            after: after,
                                                        });
                                                    }, 400);
                                                }

                                                resolve(r);
                                                if (after && r)
                                                    r.then(function (roll) {
                                                        return after(roll);
                                                    });
                                            },
                                        }).render(true);
                                    });
                                });
                            },
                        },
                    ]);
                    return DiceSR;
                })();

                exports.DiceSR = DiceSR;
            },
            {
                './config.js': 11,
                './helpers': 16,
                '@babel/runtime/helpers/classCallCheck': 28,
                '@babel/runtime/helpers/createClass': 29,
                '@babel/runtime/helpers/interopRequireDefault': 34,
                '@babel/runtime/regenerator': 46,
            },
        ],
        14: [
            function (require, module, exports) {
                'use strict';
                var __awaiter =
                    (this && this.__awaiter) ||
                    function (thisArg, _arguments, P, generator) {
                        function adopt(value) {
                            return value instanceof P
                                ? value
                                : new P(function (resolve) {
                                      resolve(value);
                                  });
                        }
                        return new (P || (P = Promise))(function (resolve, reject) {
                            function fulfilled(value) {
                                try {
                                    step(generator.next(value));
                                } catch (e) {
                                    reject(e);
                                }
                            }
                            function rejected(value) {
                                try {
                                    step(generator['throw'](value));
                                } catch (e) {
                                    reject(e);
                                }
                            }
                            function step(result) {
                                result.done
                                    ? resolve(result.value)
                                    : adopt(result.value).then(fulfilled, rejected);
                            }
                            step((generator = generator.apply(thisArg, _arguments || [])).next());
                        });
                    };
                Object.defineProperty(exports, '__esModule', { value: true });
                exports.DiceSR = void 0;
                const config_js_1 = require('./config.js');
                const helpers_1 = require('./helpers');
                class DiceSR {
                    static basicRoll({ count, limit, explode, title, actor }) {
                        return __awaiter(this, void 0, void 0, function* () {
                            if (count <= 0) {
                                // @ts-ignore
                                ui.notifications.error(game.i18n.localize('SR5.RollOneDie'));
                                return;
                            }
                            let formula = `${count}d6`;
                            if (explode) {
                                formula += 'x6';
                            }
                            if (limit) {
                                formula += `kh${limit}`;
                            }
                            formula += 'cs>=5';
                            let roll = new Roll(formula);
                            let rollMode = game.settings.get('core', 'rollMode');
                            roll.toMessage({
                                speaker: ChatMessage.getSpeaker({ actor: actor }),
                                flavor: title,
                                rollMode: rollMode,
                            });
                            return roll;
                        });
                    }
                    /**
                     *
                     * @param event {MouseEvent} - mouse event that caused this
                     * @param actor {Sr5Actor} - actor this roll is associated with
                     * @param parts {Object} - object where keys should be the 'name' that can be translated/is translated and value should be the numerical values to add to dice pool
                     * @param limit {Number} - Limit to apply to the roll, leave empty for no limit
                     * @param extended {Boolean} - if this is an extended test (automatically sets the dropdown in the dialog)
                     * @param dialogOptions {Object} - Options to provide to the dialog window
                     * @param dialogOptions.environmental {Number} - value of Environmental Modifiers
                     * @param dialogOptions.prompt {Boolean} - if this is prompting the user to enter the dice pool of the roll (enables the Dice Pool box)
                     * @param after {Function} - Function to run after each roll. Needed to capture rolls of extended tests, otherwise Promise will work
                     * @param base {Number} - base value to use for the dice pool, default to 0 (parts are preferred method)
                     * @param title {String} - title to display for the roll
                     * @param wounds {Boolean} - if wounds should be applied, defaults to true
                     * @returns {Promise<Roll>|Promise<*>}
                     */
                    static rollTest({
                        event,
                        actor,
                        parts = {},
                        limit,
                        extended,
                        dialogOptions,
                        after,
                        base = 0,
                        title = 'Roll',
                        wounds = true,
                    }) {
                        // if we aren't for soaking some damage
                        if (
                            actor &&
                            !(
                                title.includes('Soak') ||
                                title.includes('Drain') ||
                                title.includes('Fade')
                            )
                        ) {
                            if (wounds) wounds = actor.data.data.wounds.value;
                        }
                        if (!game.settings.get('shadowrun5e', 'applyLimits')) {
                            limit = undefined;
                        }
                        let dice_pool = base;
                        const edgeAttMax = actor ? actor.data.data.attributes.edge.max : 0;
                        if (event && event[config_js_1.SR5['kbmod'].EDGE]) {
                            parts['SR5.Edge'] = +edgeAttMax;
                            actor === null || actor === void 0
                                ? void 0
                                : actor.update({
                                      'data.attributes.edge.value':
                                          actor.data.data.attributes.edge.value - 1,
                                  });
                        }
                        // add mods to dice pool
                        dice_pool += Object.values(parts).reduce((prev, cur) => prev + cur, 0);
                        if (event && event[config_js_1.SR5['kbmod'].STANDARD]) {
                            const edge = parts['SR5.Edge'] !== undefined || undefined;
                            return this.basicRoll({
                                count: dice_pool,
                                explode: edge,
                                limit: edge ? undefined : limit,
                                title,
                                actor,
                            });
                        }
                        let dialogData = {
                            options: dialogOptions,
                            extended,
                            dice_pool,
                            base,
                            parts,
                            limit,
                            wounds,
                        };
                        let template = 'systems/shadowrun5e/templates/rolls/roll-dialog.html';
                        let edge = false;
                        let cancel = true;
                        return new Promise((resolve) => {
                            renderTemplate(template, dialogData).then((dlg) => {
                                new Dialog({
                                    title: title,
                                    content: dlg,
                                    buttons: {
                                        roll: {
                                            label: 'Roll',
                                            icon: '<i class="fas fa-dice-six"></i>',
                                            callback: () => (cancel = false),
                                        },
                                        edge: {
                                            label: `Push the Limit (+${edgeAttMax})`,
                                            icon: '<i class="fas fa-bomb"></i>',
                                            callback: () => {
                                                edge = true;
                                                cancel = false;
                                            },
                                        },
                                    },
                                    default: 'roll',
                                    close: (html) => {
                                        if (cancel) return;
                                        // get the actual dice_pool from the difference of initial parts and value in the dialog
                                        let dicePool = helpers_1.Helpers.parseInput(
                                            $(html).find('[name="dice_pool"]').val()
                                        );
                                        +helpers_1.Helpers.parseInput(
                                            $(html).find('[name="dp_mod"]').val()
                                        );
                                        +helpers_1.Helpers.parseInput(
                                            $(html).find('[name="wounds"]').val()
                                        );
                                        -helpers_1.Helpers.parseInput(
                                            $(html).find('[name="options.environmental"]').val()
                                        );
                                        const limit = helpers_1.Helpers.parseInput(
                                            $(html).find('[name="limit"]').val()
                                        );
                                        const extended =
                                            helpers_1.Helpers.parseInput(
                                                $(html).find('[name="extended"]').val()
                                            ) !== 0;
                                        if (edge && actor) {
                                            dicePool += actor.data.data.attributes.edge.max;
                                            actor.update({
                                                'data.attributes.edge.value':
                                                    actor.data.data.attributes.edge.value - 1,
                                            });
                                        }
                                        const r = this.basicRoll({
                                            count: dicePool,
                                            explode: edge,
                                            limit: edge ? undefined : limit,
                                            title,
                                            actor,
                                        });
                                        if (extended && r) {
                                            const currentExtended = parts['SR5.Extended'] || 0;
                                            parts['SR5.Extended'] = currentExtended - 1;
                                            // add a bit of a delay to roll again
                                            setTimeout(
                                                () =>
                                                    DiceSR.rollTest({
                                                        event,
                                                        base,
                                                        parts,
                                                        actor,
                                                        limit,
                                                        title,
                                                        extended,
                                                        dialogOptions,
                                                        wounds,
                                                        after,
                                                    }),
                                                400
                                            );
                                        }
                                        resolve(r);
                                        if (after && r) r.then((roll) => after(roll));
                                    },
                                }).render(true);
                            });
                        });
                    }
                }
                exports.DiceSR = DiceSR;
            },
            { './config.js': 11, './helpers': 16 },
        ],
        15: [
            function (require, module, exports) {
                'use strict';

                var _interopRequireDefault = require('@babel/runtime/helpers/interopRequireDefault');

                Object.defineProperty(exports, '__esModule', {
                    value: true,
                });
                exports.Helpers = void 0;

                var _slicedToArray2 = _interopRequireDefault(
                    require('@babel/runtime/helpers/slicedToArray')
                );

                var _typeof2 = _interopRequireDefault(require('@babel/runtime/helpers/typeof'));

                var _classCallCheck2 = _interopRequireDefault(
                    require('@babel/runtime/helpers/classCallCheck')
                );

                var _createClass2 = _interopRequireDefault(
                    require('@babel/runtime/helpers/createClass')
                );

                var Helpers = /*#__PURE__*/ (function () {
                    function Helpers() {
                        (0, _classCallCheck2['default'])(this, Helpers);
                    }

                    (0, _createClass2['default'])(Helpers, null, [
                        {
                            key: 'totalMods',
                            value: function totalMods(mods) {
                                var reducer = function reducer(acc, cur) {
                                    return acc + cur;
                                };

                                if (!mods) return 0;
                                if (Array.isArray(mods)) return mods.reduce(reducer, 0); // assume object of key/values

                                return Object.values(mods).reduce(reducer, 0);
                            },
                        },
                        {
                            key: 'isMatrix',
                            value: function isMatrix(atts) {
                                var _this = this;

                                if (!atts) return false;
                                if (typeof atts === 'boolean' && atts) return true;
                                var matrixAtts = [
                                    'firewall',
                                    'data_processing',
                                    'sleaze',
                                    'attack',
                                ];
                                var matrixLabels = matrixAtts.map(function (s) {
                                    return _this.label(s);
                                });
                                if (!Array.isArray(atts)) atts = [atts];
                                atts = atts.filter(function (att) {
                                    return att;
                                });
                                atts.forEach(function (att) {
                                    if (typeof att === 'string' && matrixAtts.includes(att))
                                        return true;
                                    if (
                                        (0, _typeof2['default'])(att) === 'object' &&
                                        matrixLabels.includes(att.label)
                                    )
                                        return true;
                                });
                                return false;
                            },
                        },
                        {
                            key: 'parseInput',
                            value: function parseInput(val) {
                                if (typeof val === 'number') return val;

                                if (typeof val === 'string') {
                                    var ret = +val;
                                    if (!isNaN(ret)) return ret;
                                    return 0;
                                }

                                if (Array.isArray(val)) {
                                    var str = val.join('');

                                    var _ret = +str;

                                    if (!isNaN(_ret)) return _ret;
                                    return 0;
                                }

                                return 0;
                            },
                        },
                        {
                            key: 'setupCustomCheckbox',
                            value: function setupCustomCheckbox(app, html) {
                                var setContent = function setContent(el) {
                                    var checkbox = $(el).children('input[type=checkbox]');
                                    var checkmark = $(el).children('.checkmark');

                                    if ($(checkbox).prop('checked')) {
                                        $(checkmark).addClass('fa-check-circle');
                                        $(checkmark).removeClass('fa-circle');
                                    } else {
                                        $(checkmark).addClass('fa-circle');
                                        $(checkmark).removeClass('fa-check-circle');
                                    }
                                };

                                html.find('label.checkbox').each(function () {
                                    setContent(this);
                                });
                                html.find('label.checkbox').click(function (event) {
                                    return setContent(event.currentTarget);
                                });
                                html.find('.submit-checkbox').change(function (event) {
                                    return app._onSubmit(event);
                                });
                            },
                        },
                        {
                            key: 'mapRoundsToDefenseMod',
                            value: function mapRoundsToDefenseMod(rounds) {
                                if (rounds === 1) return 0;
                                if (rounds === 3) return -2;
                                if (rounds === 6) return -5;
                                if (rounds === 10) return -9;
                                return 0;
                            },
                        },
                        {
                            key: 'mapRoundsToDefenseDesc',
                            value: function mapRoundsToDefenseDesc(rounds) {
                                if (rounds === 1) return 'No Mod';
                                if (rounds === 3) return '-2 Mod';
                                if (rounds === 6) return '-5 Mod';
                                if (rounds === 10) return '-9 Mod';
                                if (rounds === 20) return 'Duck or Cover';
                                return 'unknown';
                            },
                        },
                        {
                            key: 'label',
                            value: function label(str) {
                                var frags = str.split('_');

                                for (var i = 0; i < frags.length; i++) {
                                    frags[i] = frags[i].charAt(0).toUpperCase() + frags[i].slice(1);
                                }

                                frags.forEach(function (frag, idx) {
                                    if (frag === 'Processing') frags[idx] = 'Proc.';
                                    if (frag === 'Mechanic') frags[idx] = 'Mech.';
                                });
                                return frags.join(' ');
                            },
                        },
                        {
                            key: 'orderKeys',
                            value: function orderKeys(obj) {
                                var keys = Object.keys(obj).sort(function keyOrder(k1, k2) {
                                    if (k1 < k2) return -1;
                                    if (k1 > k2) return +1;
                                    return 0;
                                });
                                var i;
                                var after = {};

                                for (i = 0; i < keys.length; i++) {
                                    after[keys[i]] = obj[keys[i]];
                                    delete obj[keys[i]];
                                }

                                for (i = 0; i < keys.length; i++) {
                                    obj[keys[i]] = after[keys[i]];
                                }

                                return obj;
                            },
                        },
                        {
                            key: 'setNestedValue',
                            value: function setNestedValue(obj, prop, val) {
                                console.log(obj);
                                console.log(prop);
                                console.log(val);
                                var props = prop.split('.');
                                props.forEach(function (p) {
                                    return (obj = p in obj ? obj[p] : null);
                                });

                                if (obj) {
                                    console.log('setting '.concat(obj, ' to ').concat(val));
                                    obj = val;
                                }
                            },
                        },
                        {
                            key: 'hasModifiers',
                            value: function hasModifiers(event) {
                                return (
                                    event &&
                                    (event.shiftKey ||
                                        event.altKey ||
                                        event.ctrlKey ||
                                        event.metaKey)
                                );
                            },
                        },
                        {
                            key: 'filter',
                            value: function filter(obj, comp) {
                                var retObj = {};

                                if ((0, _typeof2['default'])(obj) === 'object' && obj !== null) {
                                    Object.entries(obj).forEach(function (_ref) {
                                        var _ref2 = (0, _slicedToArray2['default'])(_ref, 2),
                                            key = _ref2[0],
                                            value = _ref2[1];

                                        if (comp([key, value])) retObj[key] = value;
                                    });
                                }

                                return retObj;
                            },
                        },
                        {
                            key: 'addLabels',
                            value: function addLabels(obj, label) {
                                if ((0, _typeof2['default'])(obj) === 'object' && obj !== null) {
                                    if (
                                        !obj.hasOwnProperty('label') &&
                                        obj.hasOwnProperty('value') &&
                                        label !== ''
                                    ) {
                                        obj.label = label;
                                    }

                                    Object.entries(obj)
                                        .filter(function (_ref3) {
                                            var _ref4 = (0, _slicedToArray2['default'])(_ref3, 2),
                                                value = _ref4[1];

                                            return (0, _typeof2['default'])(value) === 'object';
                                        })
                                        .forEach(function (_ref5) {
                                            var _ref6 = (0, _slicedToArray2['default'])(_ref5, 2),
                                                key = _ref6[0],
                                                value = _ref6[1];

                                            return Helpers.addLabels(value, key);
                                        });
                                }
                            },
                        },
                    ]);
                    return Helpers;
                })();

                exports.Helpers = Helpers;
            },
            {
                '@babel/runtime/helpers/classCallCheck': 28,
                '@babel/runtime/helpers/createClass': 29,
                '@babel/runtime/helpers/interopRequireDefault': 34,
                '@babel/runtime/helpers/slicedToArray': 41,
                '@babel/runtime/helpers/typeof': 44,
            },
        ],
        16: [
            function (require, module, exports) {
                'use strict';
                Object.defineProperty(exports, '__esModule', { value: true });
                exports.Helpers = void 0;
                class Helpers {
                    static totalMods(mods) {
                        const reducer = (acc, cur) => acc + cur;
                        if (!mods) return 0;
                        if (Array.isArray(mods)) return mods.reduce(reducer, 0);
                        // assume object of key/values
                        return Object.values(mods).reduce(reducer, 0);
                    }
                    static isMatrix(atts) {
                        if (!atts) return false;
                        if (typeof atts === 'boolean' && atts) return true;
                        const matrixAtts = ['firewall', 'data_processing', 'sleaze', 'attack'];
                        const matrixLabels = matrixAtts.map((s) => this.label(s));
                        if (!Array.isArray(atts)) atts = [atts];
                        atts = atts.filter((att) => att);
                        atts.forEach((att) => {
                            if (typeof att === 'string' && matrixAtts.includes(att)) return true;
                            if (typeof att === 'object' && matrixLabels.includes(att.label))
                                return true;
                        });
                        return false;
                    }
                    static parseInput(val) {
                        if (typeof val === 'number') return val;
                        if (typeof val === 'string') {
                            const ret = +val;
                            if (!isNaN(ret)) return ret;
                            return 0;
                        }
                        if (Array.isArray(val)) {
                            const str = val.join('');
                            const ret = +str;
                            if (!isNaN(ret)) return ret;
                            return 0;
                        }
                        return 0;
                    }
                    static setupCustomCheckbox(app, html) {
                        const setContent = (el) => {
                            const checkbox = $(el).children('input[type=checkbox]');
                            const checkmark = $(el).children('.checkmark');
                            if ($(checkbox).prop('checked')) {
                                $(checkmark).addClass('fa-check-circle');
                                $(checkmark).removeClass('fa-circle');
                            } else {
                                $(checkmark).addClass('fa-circle');
                                $(checkmark).removeClass('fa-check-circle');
                            }
                        };
                        html.find('label.checkbox').each(function () {
                            setContent(this);
                        });
                        html.find('label.checkbox').click((event) =>
                            setContent(event.currentTarget)
                        );
                        html.find('.submit-checkbox').change((event) => app._onSubmit(event));
                    }
                    static mapRoundsToDefenseMod(rounds) {
                        if (rounds === 1) return 0;
                        if (rounds === 3) return -2;
                        if (rounds === 6) return -5;
                        if (rounds === 10) return -9;
                        return 0;
                    }
                    static mapRoundsToDefenseDesc(rounds) {
                        if (rounds === 1) return 'No Mod';
                        if (rounds === 3) return '-2 Mod';
                        if (rounds === 6) return '-5 Mod';
                        if (rounds === 10) return '-9 Mod';
                        if (rounds === 20) return 'Duck or Cover';
                        return 'unknown';
                    }
                    static label(str) {
                        const frags = str.split('_');
                        for (let i = 0; i < frags.length; i++) {
                            frags[i] = frags[i].charAt(0).toUpperCase() + frags[i].slice(1);
                        }
                        frags.forEach((frag, idx) => {
                            if (frag === 'Processing') frags[idx] = 'Proc.';
                            if (frag === 'Mechanic') frags[idx] = 'Mech.';
                        });
                        return frags.join(' ');
                    }
                    static orderKeys(obj) {
                        const keys = Object.keys(obj).sort(function keyOrder(k1, k2) {
                            if (k1 < k2) return -1;
                            if (k1 > k2) return +1;
                            return 0;
                        });
                        let i;
                        const after = {};
                        for (i = 0; i < keys.length; i++) {
                            after[keys[i]] = obj[keys[i]];
                            delete obj[keys[i]];
                        }
                        for (i = 0; i < keys.length; i++) {
                            obj[keys[i]] = after[keys[i]];
                        }
                        return obj;
                    }
                    static setNestedValue(obj, prop, val) {
                        console.log(obj);
                        console.log(prop);
                        console.log(val);
                        const props = prop.split('.');
                        props.forEach((p) => (obj = p in obj ? obj[p] : null));
                        if (obj) {
                            console.log(`setting ${obj} to ${val}`);
                            obj = val;
                        }
                    }
                    static hasModifiers(event) {
                        return (
                            event &&
                            (event.shiftKey || event.altKey || event.ctrlKey || event.metaKey)
                        );
                    }
                    static filter(obj, comp) {
                        const retObj = {};
                        if (typeof obj === 'object' && obj !== null) {
                            Object.entries(obj).forEach(([key, value]) => {
                                if (comp([key, value])) retObj[key] = value;
                            });
                        }
                        return retObj;
                    }
                    static addLabels(obj, label) {
                        if (typeof obj === 'object' && obj !== null) {
                            if (
                                !obj.hasOwnProperty('label') &&
                                obj.hasOwnProperty('value') &&
                                label !== ''
                            ) {
                                obj.label = label;
                            }
                            Object.entries(obj)
                                .filter(([, value]) => typeof value === 'object')
                                .forEach(([key, value]) => Helpers.addLabels(value, key));
                        }
                    }
                }
                exports.Helpers = Helpers;
            },
            {},
        ],
        17: [
            function (require, module, exports) {
                'use strict';
                var __awaiter =
                    (this && this.__awaiter) ||
                    function (thisArg, _arguments, P, generator) {
                        function adopt(value) {
                            return value instanceof P
                                ? value
                                : new P(function (resolve) {
                                      resolve(value);
                                  });
                        }
                        return new (P || (P = Promise))(function (resolve, reject) {
                            function fulfilled(value) {
                                try {
                                    step(generator.next(value));
                                } catch (e) {
                                    reject(e);
                                }
                            }
                            function rejected(value) {
                                try {
                                    step(generator['throw'](value));
                                } catch (e) {
                                    reject(e);
                                }
                            }
                            function step(result) {
                                result.done
                                    ? resolve(result.value)
                                    : adopt(result.value).then(fulfilled, rejected);
                            }
                            step((generator = generator.apply(thisArg, _arguments || [])).next());
                        });
                    };
                Object.defineProperty(exports, '__esModule', { value: true });
                exports.SR5Item = void 0;
                const dice_js_1 = require('../dice.js');
                const helpers_js_1 = require('../helpers.js');
                class SR5Item extends Item {
                    update(data, options) {
                        const _super = Object.create(null, {
                            update: { get: () => super.update },
                        });
                        return __awaiter(this, void 0, void 0, function* () {
                            const ret = _super.update.call(this, data, options);
                            ret.then(() => {
                                if (this.actor) {
                                    this.actor.render();
                                }
                            });
                            return ret;
                        });
                    }
                    get hasOpposedRoll() {
                        return !!(this.data.data.action && this.data.data.action.opposed.type);
                    }
                    get hasRoll() {
                        return !!(this.data.data.action && this.data.data.action.type !== '');
                    }
                    prepareData() {
                        super.prepareData();
                        const labels = {};
                        const item = this.data;
                        if (item.type === 'sin') {
                            if (typeof item.data.licenses === 'object') {
                                item.data.licenses = Object.values(item.data.licenses);
                            }
                        }
                        const equippedMods = this.getEquippedMods();
                        const equippedAmmo = this.getEquippedAmmo();
                        const { technology, range, action } = item.data;
                        if (
                            technology === null || technology === void 0
                                ? void 0
                                : technology.conceal
                        ) {
                            technology.conceal.mod = {};
                            equippedMods.forEach((mod) => {
                                if (
                                    (technology === null || technology === void 0
                                        ? void 0
                                        : technology.conceal) &&
                                    mod.data.data.technology.conceal.value
                                ) {
                                    technology.conceal.mod[mod.name] =
                                        mod.data.data.technology.conceal.value;
                                }
                            });
                            technology.conceal.value =
                                technology.conceal.base +
                                helpers_js_1.Helpers.totalMods(technology.conceal.mod);
                        }
                        if (action) {
                            action.alt_mod = 0;
                            action.limit.mod = {};
                            action.damage.mod = {};
                            action.damage.ap.mod = {};
                            action.dice_pool_mod = {};
                            // handle overrides from mods
                            equippedMods.forEach((mod) => {
                                if (mod.data.data.accuracy)
                                    action.limit.mod[mod.name] = mod.data.data.accuracy;
                                if (mod.data.data.dice_pool)
                                    action.dice_pool_mod[mod.name] = mod.data.data.dice_pool;
                            });
                            if (equippedAmmo) {
                                // add mods to damage from ammo
                                action.damage.mod[`SR5.Ammo ${equippedAmmo.name}`] =
                                    equippedAmmo.data.data.damage;
                                // add mods to ap from ammo
                                action.damage.ap.mod[`SR5.Ammo ${equippedAmmo.name}`] =
                                    equippedAmmo.data.data.ap;
                                // override element
                                if (equippedAmmo.data.data.element) {
                                    action.damage.element.value = equippedAmmo.data.data.element;
                                } else {
                                    action.damage.element.value = action.damage.element.base;
                                }
                                // override damage type
                                if (equippedAmmo.data.data.damageType) {
                                    action.damage.type.value = equippedAmmo.data.data.damageType;
                                } else {
                                    action.damage.type.value = action.damage.type.base;
                                }
                            } else {
                                // set value if we don't have item overrides
                                action.damage.element.value = action.damage.element.base;
                                action.damage.type.value = action.damage.type.base;
                            }
                            // once all damage mods have been accounted for, sum base and mod to value
                            action.damage.value =
                                action.damage.base +
                                helpers_js_1.Helpers.totalMods(action.damage.mod);
                            action.damage.ap.value =
                                action.damage.ap.base +
                                helpers_js_1.Helpers.totalMods(action.damage.ap.mod);
                            action.limit.value =
                                action.limit.base +
                                helpers_js_1.Helpers.totalMods(action.limit.mod);
                            if (this.actor) {
                                if (action.damage.attribute) {
                                    action.damage.value += this.actor.data.data.attributes[
                                        action.damage.attribute
                                    ].value;
                                }
                                if (action.limit.attribute) {
                                    action.limit.value += this.actor.data.data.limits[
                                        action.limit.attribute
                                    ].value;
                                }
                            }
                        }
                        if (range) {
                            if (range.rc) {
                                range.rc.mod = {};
                                equippedMods.forEach((mod) => {
                                    if (mod.data.data.rc) range.rc.mod[mod.name] = mod.data.data.rc;
                                    // handle overrides from ammo
                                });
                                if (range.rc)
                                    range.rc.value =
                                        range.rc.base +
                                        helpers_js_1.Helpers.totalMods(range.rc.mod);
                            }
                        }
                        if (item.data.condition_monitor) {
                            item.data.condition_monitor.max =
                                8 + Math.ceil(item.data.technology.rating / 2);
                        }
                        this.labels = labels;
                        item['properties'] = this.getChatData().properties;
                    }
                    roll(event) {
                        return __awaiter(this, void 0, void 0, function* () {
                            if (helpers_js_1.Helpers.hasModifiers(event)) {
                                return this.rollTest(event);
                            }
                            // we won't work if we don't have an actor
                            if (!this.actor) return;
                            const { token } = this.actor;
                            const templateData = {
                                actor: this.actor,
                                tokenId: token ? `${token.scene._id}.${token.id}` : null,
                                item: this.data,
                                type: this.data.type,
                                data: this.getChatData(),
                                hasRoll: this.hasRoll,
                                hasOpposedRoll: this.hasOpposedRoll,
                                labels: this.labels,
                            };
                            const templateType = 'item';
                            const template = `systems/shadowrun5e/templates/rolls/${templateType}-card.html`;
                            const html = yield renderTemplate(template, templateData);
                            const chatData = {
                                user: game.user._id,
                                type: CONST.CHAT_MESSAGE_TYPES.OTHER,
                                content: html,
                                speaker: {
                                    actor: this.actor._id,
                                    token: this.actor.token,
                                    alias: this.actor.name,
                                },
                            };
                            const rollMode = game.settings.get('core', 'rollMode');
                            if (['gmroll', 'blindroll'].includes(rollMode))
                                chatData['whisper'] = ChatMessage.getWhisperIDs('GM');
                            if (rollMode === 'blindroll') chatData['blind'] = true;
                            return ChatMessage.create(chatData, { displaySheet: false });
                        });
                    }
                    getChatData(htmlOptions) {
                        const data = duplicate(this.data.data);
                        const { labels } = this;
                        if (!data.description) data.description = {};
                        data.description.value = TextEditor.enrichHTML(
                            data.description.value,
                            htmlOptions
                        );
                        const props = [];
                        this[`_${this.data.type}ChatData`](data, labels, props);
                        data.properties = props.filter((p) => !!p);
                        return data;
                    }
                    _ammoChatData(data, labels, props) {}
                    _modificationChatData(data, labels, props) {}
                    _actionChatData(data, labels, props) {
                        if (data.action) {
                            if (data.action.limit.value)
                                props.push(`Limit ${data.action.limit.value}`);
                            if (data.action.type)
                                props.push(
                                    `${helpers_js_1.Helpers.label(data.action.type)} Action`
                                );
                            if (data.action.skill) {
                                labels.roll = `${helpers_js_1.Helpers.label(
                                    data.action.skill
                                )}+${helpers_js_1.Helpers.label(data.action.attribute)}`;
                            } else if (data.action.attribute2) {
                                labels.roll = `${helpers_js_1.Helpers.label(
                                    data.action.attribute
                                )}+${helpers_js_1.Helpers.label(data.action.attribute2)}`;
                            }
                            if (data.action.damage.type.value) {
                                const { damage } = data.action;
                                if (damage.value)
                                    props.push(
                                        `DV ${damage.value}${
                                            damage.type.value
                                                ? damage.type.value.toUpperCase().charAt(0)
                                                : ''
                                        }`
                                    );
                                if (damage.ap && damage.ap.value)
                                    props.push(`AP ${damage.ap.value}`);
                                if (damage.element.value)
                                    props.push(helpers_js_1.Helpers.label(damage.element.value));
                            }
                            if (data.action.opposed.type) {
                                const { opposed } = data.action;
                                if (opposed.type !== 'custom')
                                    labels.opposedRoll = `vs. ${helpers_js_1.Helpers.label(
                                        opposed.type
                                    )}`;
                                else if (opposed.skill)
                                    labels.opposedRoll = `vs. ${helpers_js_1.Helpers.label(
                                        opposed.skill
                                    )}+${helpers_js_1.Helpers.label(opposed.attribute)}`;
                                else if (opposed.attribute2)
                                    labels.opposedRoll = `vs. ${helpers_js_1.Helpers.label(
                                        opposed.attribute
                                    )}+${helpers_js_1.Helpers.label(opposed.attribute2)}`;
                                else if (opposed.attribute)
                                    labels.opposedRoll = `vs. ${helpers_js_1.Helpers.label(
                                        opposed.attribute
                                    )}`;
                                if (opposed.description)
                                    props.push(`Opposed Desc: ${opposed.desc}`);
                            }
                        }
                    }
                    _sinChatData(data, labels, props) {
                        props.push(`Rating ${data.technology.rating}`);
                        data.licenses.forEach((license) => {
                            props.push(`${license.name} R${license.rtg}`);
                        });
                    }
                    _contactChatData(data, labels, props) {
                        props.push(data.type);
                        props.push(`Connection ${data.connection}`);
                        props.push(`Loyalty ${data.loyalty}`);
                    }
                    _lifestyleChatData(data, labels, props) {
                        props.push(helpers_js_1.Helpers.label(data.type));
                        if (data.cost) props.push(`¥${data.cost}`);
                        if (data.comforts) props.push(`Comforts ${data.comforts}`);
                        if (data.security) props.push(`Security ${data.security}`);
                        if (data.neighborhood) props.push(`Neighborhood ${data.neighborhood}`);
                        if (data.guests) props.push(`Guests ${data.guests}`);
                    }
                    _adept_powerChatData(data, labels, props) {
                        this._actionChatData(data, labels, props);
                        props.push(`PP ${data.pp}`);
                        props.push(helpers_js_1.Helpers.label(data.type));
                        if (data.type === 'active') {
                            props.push(`${helpers_js_1.Helpers.label(data.action.type)} Action`);
                        }
                    }
                    _armorChatData(data, labels, props) {
                        if (data.armor) {
                            if (data.armor.value)
                                props.push(`Armor ${data.armor.mod ? '+' : ''}${data.armor.value}`);
                            if (data.armor.acid) props.push(`Acid ${data.armor.acid}`);
                            if (data.armor.cold) props.push(`Cold ${data.armor.cold}`);
                            if (data.armor.fire) props.push(`Fire ${data.armor.fire}`);
                            if (data.armor.electricity)
                                props.push(`Electricity ${data.armor.electricity}`);
                            if (data.armor.radiation)
                                props.push(`Radiation ${data.armor.radiation}`);
                        }
                    }
                    _complex_formChatData(data, labels, props) {
                        this._actionChatData(data, labels, props);
                        props.push(
                            helpers_js_1.Helpers.label(data.target),
                            helpers_js_1.Helpers.label(data.duration)
                        );
                        const { fade } = data;
                        if (fade > 0) props.push(`Fade L+${fade}`);
                        else if (fade < 0) props.push(`Fade L${fade}`);
                        else props.push('Fade L');
                    }
                    _cyberwareChatData(data, labels, props) {
                        this._actionChatData(data, labels, props);
                        this._armorChatData(data, labels, props);
                        if (data.essence) props.push(`Ess ${data.essence}`);
                    }
                    _deviceChatData(data, labels, props) {
                        if (data.technology && data.technology.rating)
                            props.push(`Rating ${data.technology.rating}`);
                        if (data.category === 'cyberdeck') {
                            for (const attN of Object.values(data.atts)) {
                                props.push(`${helpers_js_1.Helpers.label(attN.att)} ${attN.value}`);
                            }
                        }
                    }
                    _equipmentChatData(data, labels, props) {
                        if (data.technology && data.technology.rating)
                            props.push(`Rating ${data.technology.rating}`);
                    }
                    _qualityChatData(data, labels, props) {
                        this._actionChatData(data, labels, props);
                        props.push(helpers_js_1.Helpers.label(data.type));
                    }
                    _spellChatData(data, labels, props) {
                        this._actionChatData(data, labels, props);
                        props.push(
                            helpers_js_1.Helpers.label(data.range),
                            helpers_js_1.Helpers.label(data.duration),
                            helpers_js_1.Helpers.label(data.type),
                            helpers_js_1.Helpers.label(data.category)
                        );
                        const { drain } = data;
                        if (drain > 0) props.push(`Drain F+${drain}`);
                        else if (drain < 0) props.push(`Drain F${drain}`);
                        else props.push('Drain F');
                        if (data.category === 'combat') {
                            props.push(helpers_js_1.Helpers.label(data.combat.type));
                        } else if (data.category === 'health') {
                        } else if (data.category === 'illusion') {
                            props.push(data.illusion.type);
                            props.push(data.illusion.sense);
                        } else if (data.category === 'manipulation') {
                            if (data.manipulation.damaging) props.push('Damaging');
                            if (data.manipulation.mental) props.push('Mental');
                            if (data.manipulation.environmental) props.push('Environmental');
                            if (data.manipulation.physical) props.push('Physical');
                        } else if (data.category === 'detection') {
                            props.push(data.illusion.passive ? 'Passive' : 'Active');
                            props.push(data.illusion.type);
                            if (data.illusion.extended) props.push('Extended');
                        }
                        labels.roll = 'Cast';
                    }
                    _weaponChatData(data, labels, props) {
                        var _a, _b, _c;
                        this._actionChatData(data, labels, props);
                        const equippedAmmo = this.getEquippedAmmo();
                        if (
                            equippedAmmo &&
                            data.ammo &&
                            ((_a = data.ammo.current) === null || _a === void 0 ? void 0 : _a.max)
                        ) {
                            if (equippedAmmo) {
                                const { current, spare_clips } = data.ammo;
                                if (equippedAmmo.name)
                                    props.push(
                                        `${equippedAmmo.name} (${current.value}/${current.max})`
                                    );
                                if (equippedAmmo.data.data.blast.radius)
                                    props.push(
                                        `${game.i18n.localize('SR5.BlastRadius')} ${
                                            equippedAmmo.data.data.blast.radius
                                        }m`
                                    );
                                if (equippedAmmo.data.data.blast.dropoff)
                                    props.push(
                                        `${game.i18n.localize('SR5.DropOff')} ${
                                            equippedAmmo.data.data.blast.dropoff
                                        }/m`
                                    );
                                if (spare_clips && spare_clips.max)
                                    props.push(
                                        `${game.i18n.localize('SR5.SpareClips')} (${
                                            spare_clips.value
                                        }/${spare_clips.max})`
                                    );
                            }
                        }
                        if (
                            (_c =
                                (_b = data.technology) === null || _b === void 0
                                    ? void 0
                                    : _b.conceal) === null || _c === void 0
                                ? void 0
                                : _c.value
                        ) {
                            props.push(
                                `${game.i18n.localize('SR5.Conceal')} ${
                                    data.technology.conceal.value
                                }`
                            );
                        }
                        if (data.category === 'range') {
                            if (data.range.rc) props.push(`RC ${data.range.rc.value}`);
                            if (data.range.modes)
                                props.push(
                                    Array.from(Object.entries(data.range.modes))
                                        .filter(([key, val]) => val && !key.includes('-'))
                                        .map(([key]) => helpers_js_1.Helpers.label(key))
                                        .join('/')
                                );
                            if (data.range.ranges)
                                props.push(Array.from(Object.values(data.range.ranges)).join('/'));
                        } else if (data.category === 'melee') {
                            if (data.melee.reach)
                                props.push(
                                    `${game.i18n.localize('SR5.Reach')} ${data.melee.reach}`
                                );
                        } else if (data.category === 'thrown') {
                            if (data.thrown.ranges) {
                                const mult =
                                    data.thrown.ranges.attribute && this.actor
                                        ? this.actor.data.data.attributes[
                                              data.thrown.ranges.attribute
                                          ].value
                                        : 1;
                                const ranges = [
                                    data.thrown.ranges.short,
                                    data.thrown.ranges.medium,
                                    data.thrown.ranges.long,
                                    data.thrown.ranges.extreme,
                                ];
                                props.push(ranges.map((v) => v * mult).join('/'));
                            }
                            const { blast } = data.thrown;
                            if (blast.value)
                                props.push(
                                    `${game.i18n.localize('SR5.BlastRadius')} ${blast.radius}m`
                                );
                            if (blast.dropoff)
                                props.push(
                                    `${game.i18n.localize('SR5.DropOff')} ${blast.dropoff}/m`
                                );
                        }
                    }
                    getEquippedAmmo() {
                        return (this.items || []).filter((item) => {
                            var _a, _b;
                            return (
                                item.type === 'ammo' &&
                                ((_b =
                                    (_a = item.data.data) === null || _a === void 0
                                        ? void 0
                                        : _a.technology) === null || _b === void 0
                                    ? void 0
                                    : _b.equipped)
                            );
                        })[0];
                    }
                    getEquippedMods() {
                        return (this.items || []).filter((item) => {
                            var _a, _b;
                            return (
                                item.type === 'modification' &&
                                item.data.data.type === 'weapon' &&
                                ((_b =
                                    (_a = item.data.data) === null || _a === void 0
                                        ? void 0
                                        : _a.technology) === null || _b === void 0
                                    ? void 0
                                    : _b.equipped)
                            );
                        });
                    }
                    equipWeaponMod(iid) {
                        return __awaiter(this, void 0, void 0, function* () {
                            const mod = this.getOwnedItem(iid);
                            if (mod) {
                                const dupData = duplicate(mod.data);
                                dupData.data.technology.equipped = !dupData.data.technology
                                    .equipped;
                                yield this.updateOwnedItem(dupData);
                            }
                        });
                    }
                    useAmmo(fireMode) {
                        return __awaiter(this, void 0, void 0, function* () {
                            const dupData = duplicate(this.data);
                            const { ammo } = dupData.data;
                            if (ammo) {
                                ammo.current.value = Math.max(0, ammo.current.value - fireMode);
                                return this.update(dupData);
                            }
                        });
                    }
                    reloadAmmo() {
                        return __awaiter(this, void 0, void 0, function* () {
                            const data = duplicate(this.data);
                            const { ammo } = data.data;
                            const diff = ammo.current.max - ammo.current.value;
                            ammo.current.value = ammo.current.max;
                            if (ammo.spare_clips) {
                                ammo.spare_clips.value = Math.max(0, ammo.spare_clips.value - 1);
                            }
                            yield this.update(data);
                            const newAmmunition = (this.items || [])
                                .filter((i) => i.data.type === 'ammo')
                                .reduce((acc, item) => {
                                    const { technology } = item.data.data;
                                    if (technology.equipped) {
                                        const qty = technology.quantity;
                                        technology.quantity = Math.max(0, qty - diff);
                                        acc.push(item.data);
                                    }
                                    return acc;
                                }, []);
                            if (newAmmunition.length) yield this.updateOwnedItem(newAmmunition);
                        });
                    }
                    equipAmmo(iid) {
                        var _a;
                        return __awaiter(this, void 0, void 0, function* () {
                            // only allow ammo that was just clicked to be equipped
                            const ammo =
                                (_a = this.items) === null || _a === void 0
                                    ? void 0
                                    : _a
                                          .filter((item) => item.type === 'ammo')
                                          .map((item) => {
                                              const i = this.getOwnedItem(item._id);
                                              if (i) {
                                                  i.data.data.technology.equipped =
                                                      iid === item._id;
                                                  return i.data;
                                              }
                                          });
                            yield this.updateOwnedItem(ammo);
                        });
                    }
                    addNewLicense() {
                        const data = duplicate(this.data);
                        const { licenses } = data.data;
                        if (typeof licenses === 'object') {
                            data.data.licenses = Object.values(licenses);
                        }
                        data.data.licenses.push({
                            name: '',
                            rtg: '',
                            description: '',
                        });
                        this.update(data);
                    }
                    removeLicense(index) {
                        const data = duplicate(this.data);
                        const { licenses } = data.data;
                        licenses.splice(index, 1);
                        this.update(data);
                    }
                    rollOpposedTest(target, ev) {
                        const itemData = this.data.data;
                        const options = {
                            event: ev,
                            incomingAttack: { fireMode: 0 },
                            fireModeDefense: 0,
                            cover: false,
                            incomingAction: {},
                        };
                        if (this.getFlag('shadowrun5e', 'attack')) {
                            options.incomingAttack = this.getFlag('shadowrun5e', 'attack');
                            if (options.incomingAttack.fireMode)
                                options.fireModeDefense = helpers_js_1.Helpers.mapRoundsToDefenseMod(
                                    options.incomingAttack.fireMode
                                );
                            options.cover = true;
                        }
                        options.incomingAction = this.getFlag('shadowrun5e', 'action');
                        const { opposed } = itemData.action;
                        if (opposed.type === 'defense') target.rollDefense(options);
                        else if (opposed.type === 'soak') target.rollSoak(options);
                        else if (opposed.type === 'armor') target.rollSoak(options);
                        else {
                            if (opposed.skill && opposed.attribute)
                                target.rollSkill(
                                    opposed.skill,
                                    Object.assign(Object.assign({}, options), {
                                        attribute: opposed.attribute,
                                    })
                                );
                            if (opposed.attribute && opposed.attribute2)
                                target.rollTwoAttributes(
                                    [opposed.attribute, opposed.attribute2],
                                    options
                                );
                            else if (opposed.attribute)
                                target.rollSingleAttribute(opposed.attribute, options);
                        }
                    }
                    rollTest(ev) {
                        const itemData = this.data.data;
                        if (!this.actor) return console.error('COULD NOT FIND ACTOR');
                        const actorData = this.actor.data.data;
                        const skill = actorData.skills.active[itemData.action.skill];
                        const attribute = actorData.attributes[itemData.action.attribute];
                        const attribute2 = actorData.attributes[itemData.action.attribute2];
                        let limit = itemData.action.limit.value;
                        // TODO remove these (by making them not used, not just delete)
                        const mod =
                            parseInt(itemData.action.mod || 0) +
                            parseInt(itemData.action.alt_mod || 0);
                        // only check if attribute2 is set if skill is not set
                        const parts = duplicate(itemData.action.dice_pool_mod);
                        if (attribute) parts[attribute.label] = attribute.value;
                        if (skill) parts[skill.label] = skill.value;
                        else if (attribute2) parts[attribute2.label] = attribute2.value;
                        // TODO change item to allow selecting specialization type
                        if (itemData.action.spec) parts['SR5.Specialization'] = 2;
                        if (mod) parts['SR5.ItemMod'] = mod;
                        let title = this.data.name;
                        if (this.data.type === 'weapon' && itemData.category === 'range') {
                            const fireModes = {};
                            {
                                const { modes } = itemData.range;
                                if (modes.single_shot) {
                                    fireModes['1'] = 'SS';
                                }
                                if (modes.semi_auto) {
                                    fireModes['1'] = 'SA';
                                    fireModes['3'] = 'SB';
                                }
                                if (modes.burst_fire) {
                                    fireModes['3'] = `${modes.semi_auto ? 'SB/' : ''}BF`;
                                    fireModes['6'] = 'LB';
                                }
                                if (modes.full_auto) {
                                    fireModes['6'] = `${modes.burst_fire ? 'LB/' : ''}FA(s)`;
                                    fireModes['10'] = 'FA(c)';
                                    fireModes['20'] = game.i18n.localize('SR5.Suppressing');
                                }
                            }
                            const attack = this.getFlag('shadowrun5e', 'attack') || {
                                fireMode: 0,
                            };
                            const { fireMode } = attack;
                            const rc =
                                parseInt(itemData.range.rc.value) +
                                parseInt(actorData.recoil_compensation);
                            const dialogData = {
                                fireModes,
                                fireMode,
                                rc,
                                ammo: itemData.range.ammo,
                            };
                            return renderTemplate(
                                'systems/shadowrun5e/templates/rolls/range-weapon-roll.html',
                                dialogData
                            ).then((dlg) => {
                                const buttons = {};
                                const { ranges } = itemData.range;
                                let environmental = true;
                                let cancel = true;
                                buttons['short'] = {
                                    label: `Short (${ranges.short})`,
                                    callback: () => (cancel = false),
                                };
                                buttons['medium'] = {
                                    label: `Medium (${ranges.medium})`,
                                    callback: () => {
                                        environmental = 1;
                                        cancel = false;
                                    },
                                };
                                buttons['long'] = {
                                    label: `Long (${ranges.long})`,
                                    callback: () => {
                                        environmental = 3;
                                        cancel = false;
                                    },
                                };
                                buttons['extreme'] = {
                                    label: `Extreme (${ranges.extreme})`,
                                    callback: () => {
                                        environmental = 6;
                                        cancel = false;
                                    },
                                };
                                new Dialog({
                                    title,
                                    content: dlg,
                                    buttons,
                                    close: (html) => {
                                        if (cancel) return;
                                        const fireMode = helpers_js_1.Helpers.parseInput(
                                            $(html).find('[name="fireMode"]').val()
                                        );
                                        if (fireMode) {
                                            title += ` - Defender (${helpers_js_1.Helpers.mapRoundsToDefenseDesc(
                                                fireMode
                                            )})`;
                                        }
                                        // suppressing fire doesn't cause recoil
                                        if (fireMode > rc && fireMode !== 20) {
                                            parts['SR5.Recoil'] = rc - fireMode;
                                        }
                                        dice_js_1.DiceSR.rollTest({
                                            event: ev,
                                            parts,
                                            actor: this.actor || undefined,
                                            limit,
                                            title,
                                            dialogOptions: {
                                                environmental,
                                            },
                                        }).then((roll) => {
                                            if (roll) {
                                                this.useAmmo(fireMode).then(() => {
                                                    this.setFlag('shadowrun5e', 'attack', {
                                                        hits: roll.total,
                                                        fireMode,
                                                        damageType: this.data.data.action.damage
                                                            .type.value,
                                                        element: this.data.data.action.damage
                                                            .element.value,
                                                        damage: this.data.data.action.damage.value,
                                                        ap: this.data.data.action.damage.ap.value,
                                                    });
                                                });
                                            }
                                        });
                                    },
                                }).render(true);
                            });
                        }
                        if (this.data.type === 'spell') {
                            const dialogData = {
                                drain: itemData.drain >= 0 ? `+${itemData.drain}` : itemData.drain,
                                force: 2 - itemData.drain,
                            };
                            let reckless = false;
                            let cancel = true;
                            renderTemplate(
                                'systems/shadowrun5e/templates/rolls/roll-spell.html',
                                dialogData
                            ).then((dlg) => {
                                new Dialog({
                                    title: `${helpers_js_1.Helpers.label(this.data.name)} Force`,
                                    content: dlg,
                                    buttons: {
                                        roll: {
                                            label: 'Normal',
                                            callback: () => (cancel = false),
                                        },
                                        spec: {
                                            label: 'Reckless',
                                            callback: () => {
                                                reckless = true;
                                                cancel = false;
                                            },
                                        },
                                    },
                                    close: (html) => {
                                        if (cancel) return;
                                        const force = helpers_js_1.Helpers.parseInput(
                                            $(html).find('[name=force]').val()
                                        );
                                        limit = force;
                                        dice_js_1.DiceSR.rollTest({
                                            event: ev,
                                            dialogOptions: {
                                                environmental: true,
                                            },
                                            parts,
                                            actor: this.actor || undefined,
                                            limit,
                                            title,
                                        }).then((roll) =>
                                            __awaiter(this, void 0, void 0, function* () {
                                                var _a;
                                                if (this.data.data.category === 'combat' && roll) {
                                                    const damage = force;
                                                    const ap = -force;
                                                    this.setFlag('shadowrun5e', 'attack', {
                                                        hits: roll.total,
                                                        damageType: this.data.data.action.damage
                                                            .type,
                                                        element: this.data.data.action.damage
                                                            .element,
                                                        damage,
                                                        ap,
                                                    });
                                                }
                                                const drain = Math.max(
                                                    itemData.drain + force + (reckless ? 3 : 0),
                                                    2
                                                );
                                                (_a = this.actor) === null || _a === void 0
                                                    ? void 0
                                                    : _a.rollDrain({ event: ev }, drain);
                                            })
                                        );
                                    },
                                }).render(true);
                            });
                        } else if (this.data.type === 'complex_form') {
                            const dialogData = {
                                fade: itemData.fade >= 0 ? `+${itemData.fade}` : itemData.fade,
                                level: 2 - itemData.fade,
                            };
                            let cancel = true;
                            renderTemplate(
                                'systems/shadowrun5e/templates/rolls/roll-complex-form.html',
                                dialogData
                            ).then((dlg) => {
                                new Dialog({
                                    title: `${helpers_js_1.Helpers.label(this.data.name)} Level`,
                                    content: dlg,
                                    buttons: {
                                        roll: {
                                            label: 'Continue',
                                            icon: '<i class="fas fa-dice-six"></i>',
                                            callback: () => (cancel = false),
                                        },
                                    },
                                    close: (html) => {
                                        if (cancel) return;
                                        const level = helpers_js_1.Helpers.parseInput(
                                            $(html).find('[name=level]').val()
                                        );
                                        limit = level;
                                        dice_js_1.DiceSR.rollTest({
                                            event: ev,
                                            dialogOptions: {
                                                environmental: false,
                                            },
                                            parts,
                                            actor: this.actor,
                                            limit,
                                            title,
                                        }).then(() => {
                                            const fade = Math.max(itemData.fade + level, 2);
                                            this.actor.rollFade({ event: ev }, fade);
                                        });
                                    },
                                }).render(true);
                            });
                        } else {
                            return dice_js_1.DiceSR.rollTest({
                                event: ev,
                                parts,
                                dialogOptions: {
                                    environmental: true,
                                },
                                actor: this.actor,
                                limit,
                                title,
                            }).then((roll) => {
                                if (roll) {
                                    this.useAmmo(1).then(() => {
                                        this.setFlag('shadowrun5e', 'action', {
                                            hits: roll.total,
                                        });
                                    });
                                }
                            });
                        }
                    }
                    static chatListeners(html) {
                        html.on('click', '.card-buttons button', (ev) => {
                            ev.preventDefault();
                            const button = $(ev.currentTarget);
                            const messageId = button.parents('.message').data('messageId');
                            const senderId = game.messages.get(messageId).user._id;
                            const card = button.parents('.chat-card');
                            const action = button.data('action');
                            const opposedRoll = action === 'opposed-roll';
                            if (!opposedRoll && !game.user.isGM && game.user._id !== senderId)
                                return;
                            let actor;
                            const tokenKey = card.data('tokenId');
                            if (tokenKey) {
                                const [sceneId, tokenId] = tokenKey.split('.');
                                let token;
                                if (sceneId === canvas.scene._id)
                                    token = canvas.tokens.get(tokenId);
                                else {
                                    const scene = game.scenes.get(sceneId);
                                    if (!scene) return;
                                    // @ts-ignore
                                    const tokenData = scene.data.tokens.find(
                                        (t) => t.id === Number(tokenId)
                                    );
                                    if (tokenData) token = new Token(tokenData);
                                }
                                if (!token) return;
                                actor = Actor.fromToken(token);
                            } else actor = game.actors.get(card.data('actorId'));
                            if (!actor) return;
                            const itemId = card.data('itemId');
                            const item = actor.getOwnedItem(itemId);
                            if (action === 'roll') item.rollTest(ev);
                            if (opposedRoll) {
                                const targets = this._getChatCardTargets();
                                for (const t of targets) {
                                    item.rollOpposedTest(t, ev);
                                }
                            }
                        });
                        html.on('click', '.card-header', (ev) => {
                            ev.preventDefault();
                            $(ev.currentTarget).siblings('.card-content').toggle();
                        });
                        $(html).find('.card-content').hide();
                    }
                    static _getChatCardTargets() {
                        const { character } = game.user;
                        const { controlled } = canvas.tokens;
                        const targets = controlled.reduce(
                            (arr, t) => (t.actor ? arr.concat([t.actor]) : arr),
                            []
                        );
                        if (character && controlled.length === 0) targets.push(character);
                        if (!targets.length)
                            throw new Error(
                                `You must designate a specific Token as the roll target`
                            );
                        return targets;
                    }
                    /**
                     * Create an item in this item
                     * @param itemData
                     * @param options
                     */
                    createOwnedItem(itemData, options = {}) {
                        return __awaiter(this, void 0, void 0, function* () {
                            if (!Array.isArray(itemData)) itemData = [itemData];
                            // weapons accept items
                            if (this.type === 'weapon') {
                                const currentItems = duplicate(
                                    this.getFlag('shadowrun5e', 'embeddedItems') || []
                                );
                                itemData.forEach((item) => {
                                    item._id = randomID(16);
                                    if (item.type === 'ammo' || item.type === 'modification') {
                                        currentItems.push(item);
                                    }
                                });
                                yield this.setFlag('shadowrun5e', 'embeddedItems', currentItems);
                            }
                            yield this.prepareEmbeddedEntities();
                            yield this.prepareData();
                            yield this.render(false);
                            return true;
                        });
                    }
                    /**
                     * Prepare embeddedItems
                     */
                    prepareEmbeddedEntities() {
                        super.prepareEmbeddedEntities();
                        const items = this.getFlag('shadowrun5e', 'embeddedItems');
                        if (items) {
                            const existing = (this.items || []).reduce((object, i) => {
                                object[i.id] = i;
                                return object;
                            }, {});
                            this.items = items.map((i) => {
                                if (i._id in existing) {
                                    const a = existing[i._id];
                                    a.data = i;
                                    a.prepareData();
                                    return a;
                                } else {
                                    // dirty things done here
                                    // @ts-ignore
                                    return Item.createOwned(i, this);
                                }
                            });
                        }
                    }
                    getOwnedItem(itemId) {
                        const items = this.items;
                        if (!items) return;
                        return items.find((i) => i._id === itemId);
                    }
                    updateOwnedItem(changes) {
                        return __awaiter(this, void 0, void 0, function* () {
                            const items = duplicate(this.getFlag('shadowrun5e', 'embeddedItems'));
                            if (!items) return;
                            changes = Array.isArray(changes) ? changes : [changes];
                            if (!changes || changes.length === 0) return;
                            changes.forEach((itemChanges) => {
                                const index = items.findIndex((i) => i._id === itemChanges._id);
                                if (index === -1) return;
                                const item = items[index];
                                if (item) {
                                    itemChanges = expandObject(itemChanges);
                                    mergeObject(item, itemChanges);
                                    items[index] = item;
                                    // this.items[index].data = items[index];
                                }
                            });
                            yield this.setFlag('shadowrun5e', 'embeddedItems', items);
                            yield this.prepareEmbeddedEntities();
                            yield this.prepareData();
                            yield this.render(false);
                            return true;
                        });
                    }
                    updateEmbeddedEntity(embeddedName, updateData, options) {
                        return __awaiter(this, void 0, void 0, function* () {
                            this.updateOwnedItem(updateData);
                            return this;
                        });
                    }
                    /**
                     * Remove an owned item
                     * @param deleted
                     * @returns {Promise<boolean>}
                     */
                    deleteOwnedItem(deleted) {
                        return __awaiter(this, void 0, void 0, function* () {
                            const items = duplicate(this.getFlag('shadowrun5e', 'embeddedItems'));
                            if (!items) return;
                            const idx = items.findIndex(
                                (i) => i._id === deleted || Number(i._id) === deleted
                            );
                            if (idx === -1)
                                throw new Error(
                                    `Shadowrun5e | Couldn't find owned item ${deleted}`
                                );
                            items.splice(idx, 1);
                            yield this.setFlag('shadowrun5e', 'embeddedItems', items);
                            yield this.prepareEmbeddedEntities();
                            yield this.prepareData();
                            yield this.render(false);
                            return true;
                        });
                    }
                }
                exports.SR5Item = SR5Item;
            },
            { '../dice.js': 13, '../helpers.js': 15 },
        ],
        18: [
            function (require, module, exports) {
                'use strict';
                var __awaiter =
                    (this && this.__awaiter) ||
                    function (thisArg, _arguments, P, generator) {
                        function adopt(value) {
                            return value instanceof P
                                ? value
                                : new P(function (resolve) {
                                      resolve(value);
                                  });
                        }
                        return new (P || (P = Promise))(function (resolve, reject) {
                            function fulfilled(value) {
                                try {
                                    step(generator.next(value));
                                } catch (e) {
                                    reject(e);
                                }
                            }
                            function rejected(value) {
                                try {
                                    step(generator['throw'](value));
                                } catch (e) {
                                    reject(e);
                                }
                            }
                            function step(result) {
                                result.done
                                    ? resolve(result.value)
                                    : adopt(result.value).then(fulfilled, rejected);
                            }
                            step((generator = generator.apply(thisArg, _arguments || [])).next());
                        });
                    };
                Object.defineProperty(exports, '__esModule', { value: true });
                exports.SR5ItemSheet = void 0;
                const helpers_1 = require('../helpers');
                /**
                 * Extend the basic ItemSheet with some very simple modifications
                 */
                class SR5ItemSheet extends ItemSheet {
                    constructor(...args) {
                        super(...args);
                        this._shownDesc = [];
                    }
                    getEmbeddedItems() {
                        return this.item.items || [];
                    }
                    /**
                     * Extend and override the default options used by the Simple Item Sheet
                     * @returns {Object}
                     */
                    static get defaultOptions() {
                        return mergeObject(super.defaultOptions, {
                            classes: ['sr5', 'sheet', 'item'],
                            width: 650,
                            height: 450,
                            tabs: [{ navSelector: '.tabs', contentSelector: '.sheetbody' }],
                        });
                    }
                    get template() {
                        const path = 'systems/shadowrun5e/templates/item/';
                        return `${path}${this.item.data.type}.html`;
                    }
                    /* -------------------------------------------- */
                    /**
                     * Prepare data for rendering the Item sheet
                     * The prepared data object contains both the actor data as well as additional sheet options
                     */
                    getData() {
                        const data = super.getData();
                        const itemData = data.data;
                        if (itemData.action) {
                            try {
                                const { action } = itemData;
                                if (action.mod === 0) delete action.mod;
                                if (action.limit === 0) delete action.limit;
                                if (action.damage) {
                                    if (action.damage.mod === 0) delete action.damage.mod;
                                    if (action.damage.ap.mod === 0) delete action.damage.ap.mod;
                                }
                                if (action.limit) {
                                    if (action.limit.mod === 0) delete action.limit.mod;
                                }
                            } catch (e) {
                                console.error(e);
                            }
                        }
                        if (itemData.technology) {
                            try {
                                const tech = itemData.technology;
                                if (tech.rating === 0) delete tech.rating;
                                if (tech.quantity === 0) delete tech.quantity;
                                if (tech.cost === 0) delete tech.cost;
                            } catch (e) {
                                console.log(e);
                            }
                        }
                        data['config'] = CONFIG.SR5;
                        const items = this.getEmbeddedItems();
                        const [ammunition, weaponMods, armorMods] = items.reduce(
                            (parts, item) => {
                                if (item.type === 'ammo') parts[0].push(item.data);
                                if (
                                    item.type === 'modification' &&
                                    item.data.data.type === 'weapon'
                                )
                                    parts[1].push(item.data);
                                if (item.type === 'modification' && item.data.data.type === 'armor')
                                    parts[2].push(item.data);
                                return parts;
                            },
                            [[], [], []]
                        );
                        data['ammunition'] = ammunition;
                        data['weaponMods'] = weaponMods;
                        data['armorMods'] = armorMods;
                        return data;
                    }
                    /* -------------------------------------------- */
                    /**
                     * Activate event listeners using the prepared sheet HTML
                     * @param html {HTML}   The prepared HTML object ready to be rendered into the DOM
                     */
                    activateListeners(html) {
                        super.activateListeners(html);
                        if (this.item.type === 'weapon') {
                            this.form.ondragover = (event) => this._onDragOver(event);
                            this.form.ondrop = (event) => this._onDrop(event);
                        }
                        html.find('.add-new-ammo').click(this._onAddNewAmmo.bind(this));
                        html.find('.ammo-equip').click(this._onAmmoEquip.bind(this));
                        html.find('.ammo-delete').click(this._onAmmoRemove.bind(this));
                        html.find('.ammo-reload').click(this._onAmmoReload.bind(this));
                        html.find('.edit-item').click(this._onEditItem.bind(this));
                        html.find('.add-new-mod').click(this._onAddWeaponMod.bind(this));
                        html.find('.mod-equip').click(this._onWeaponModEquip.bind(this));
                        html.find('.mod-delete').click(this._onWeaponModRemove.bind(this));
                        html.find('.add-new-license').click(this._onAddLicense.bind(this));
                        html.find('.has-desc').click((event) => {
                            event.preventDefault();
                            const item = $(event.currentTarget).parents('.item');
                            const iid = $(item).data().item;
                            const field = item.next();
                            field.toggle();
                            if (iid) {
                                if (field.is(':visible')) this._shownDesc.push(iid);
                                else this._shownDesc = this._shownDesc.filter((val) => val !== iid);
                            }
                        });
                        html.find('.hidden').hide();
                    }
                    _onDragOver(event) {
                        event.preventDefault();
                        return false;
                    }
                    _onDrop(event) {
                        var _a;
                        return __awaiter(this, void 0, void 0, function* () {
                            event.preventDefault();
                            event.stopPropagation();
                            let data;
                            try {
                                data = JSON.parse(event.dataTransfer.getData('text/plain'));
                                if (data.type !== 'Item') {
                                    console.log('Shadowrun5e | Can only drop Items');
                                }
                            } catch (err) {
                                console.log('Shadowrun5e | drop error');
                            }
                            let item;
                            // Case 1 - Data explicitly provided
                            if (data.data) {
                                // TODO test
                                if (
                                    this.item.isOwned &&
                                    data.actorId ===
                                        ((_a = this.item.actor) === null || _a === void 0
                                            ? void 0
                                            : _a._id) &&
                                    data.data._id === this.item._id
                                ) {
                                    console.log('Shadowrun5e | Cant drop item on itself');
                                    // @ts-ignore
                                    ui.notifications.error('Are you trying to break the game??');
                                }
                                item = data;
                            } else if (data.pack) {
                                console.log(data);
                                // Case 2 - From a Compendium Pack
                                // TODO test
                                item = yield this._getItemFromCollection(data.pack, data.id);
                            } else {
                                // Case 3 - From a World Entity
                                item = game.items.get(data.id);
                            }
                            this.item.createOwnedItem(item.data);
                        });
                    }
                    _getItemFromCollection(collection, itemId) {
                        const pack = game.packs.find((p) => p.collection === collection);
                        return pack.getEntity(itemId);
                    }
                    _eventId(event) {
                        event.preventDefault();
                        return event.currentTarget.closest('.item').dataset.itemId;
                    }
                    _onEditItem(event) {
                        return __awaiter(this, void 0, void 0, function* () {
                            const item = this.item.getOwnedItem(this._eventId(event));
                            if (item) {
                                item.sheet.render(true);
                            }
                        });
                    }
                    _onAddLicense(event) {
                        return __awaiter(this, void 0, void 0, function* () {
                            event.preventDefault();
                            this.item.addNewLicense();
                        });
                    }
                    _onWeaponModRemove(event) {
                        return __awaiter(this, void 0, void 0, function* () {
                            this.item.deleteOwnedItem(this._eventId(event));
                        });
                    }
                    _onWeaponModEquip(event) {
                        return __awaiter(this, void 0, void 0, function* () {
                            this.item.equipWeaponMod(this._eventId(event));
                        });
                    }
                    _onAddWeaponMod(event) {
                        return __awaiter(this, void 0, void 0, function* () {
                            event.preventDefault();
                            const type = 'modification';
                            const itemData = {
                                name: `New ${helpers_1.Helpers.label(type)}`,
                                type: type,
                                data: duplicate(game.system.model.Item.modification),
                            };
                            itemData.data.type = 'weapon';
                            // @ts-ignore
                            const item = Item.createOwned(itemData, this.item);
                            this.item.createOwnedItem(item.data);
                        });
                    }
                    _onAmmoReload(event) {
                        return __awaiter(this, void 0, void 0, function* () {
                            event.preventDefault();
                            this.item.reloadAmmo();
                        });
                    }
                    _onAmmoRemove(event) {
                        return __awaiter(this, void 0, void 0, function* () {
                            this.item.deleteOwnedItem(this._eventId(event));
                        });
                    }
                    _onAmmoEquip(event) {
                        return __awaiter(this, void 0, void 0, function* () {
                            this.item.equipAmmo(this._eventId(event));
                        });
                    }
                    _onAddNewAmmo(event) {
                        event.preventDefault();
                        const type = 'ammo';
                        const itemData = {
                            name: `New ${helpers_1.Helpers.label(type)}`,
                            type: type,
                            data: duplicate(game.system.model.Item.ammo),
                        };
                        // @ts-ignore
                        const item = Item.createOwned(itemData, this.item);
                        this.item.createOwnedItem(item.data);
                    }
                    /**
                     * @private
                     */
                    _findActiveList() {
                        return $(this.element).find('.tab.active .scroll-area');
                    }
                    /**
                     * @private
                     */
                    _render(force = false, options = {}) {
                        const _super = Object.create(null, {
                            _render: { get: () => super._render },
                        });
                        return __awaiter(this, void 0, void 0, function* () {
                            this._saveScrollPositions();
                            yield _super._render.call(this, force, options);
                            this._restoreScrollPositions();
                        });
                    }
                    /**
                     * @private
                     */
                    _restoreScrollPositions() {
                        const activeList = this._findActiveList();
                        if (activeList.length && this._scroll != null) {
                            activeList.prop('scrollTop', this._scroll);
                        }
                    }
                    /**
                     * @private
                     */
                    _saveScrollPositions() {
                        const activeList = this._findActiveList();
                        if (activeList.length) {
                            this._scroll = activeList.prop('scrollTop');
                        }
                    }
                }
                exports.SR5ItemSheet = SR5ItemSheet;
            },
            { '../helpers': 16 },
        ],
        19: [
            function (require, module, exports) {
                'use strict';
                var __awaiter =
                    (this && this.__awaiter) ||
                    function (thisArg, _arguments, P, generator) {
                        function adopt(value) {
                            return value instanceof P
                                ? value
                                : new P(function (resolve) {
                                      resolve(value);
                                  });
                        }
                        return new (P || (P = Promise))(function (resolve, reject) {
                            function fulfilled(value) {
                                try {
                                    step(generator.next(value));
                                } catch (e) {
                                    reject(e);
                                }
                            }
                            function rejected(value) {
                                try {
                                    step(generator['throw'](value));
                                } catch (e) {
                                    reject(e);
                                }
                            }
                            function step(result) {
                                result.done
                                    ? resolve(result.value)
                                    : adopt(result.value).then(fulfilled, rejected);
                            }
                            step((generator = generator.apply(thisArg, _arguments || [])).next());
                        });
                    };
                Object.defineProperty(exports, '__esModule', { value: true });
                // Import Modules
                const sheet_1 = require('./item/sheet');
                const sheet_2 = require('./actor/sheet');
                const entity_1 = require('./actor/entity');
                const entity_2 = require('./item/entity');
                const config_1 = require('./config');
                const helpers_1 = require('./helpers');
                const settings_1 = require('./settings');
                const templates_1 = require('./templates');
                const dice_1 = require('./dice');
                const combat_1 = require('./combat');
                const canvas_1 = require('./canvas');
                const chat = require('./chat');
                const migrations = require('./migration');
                const OverwatchScoreTracker_1 = require('./apps/gmtools/OverwatchScoreTracker');
                /* -------------------------------------------- */
                /*  Foundry VTT Initialization                  */
                /* -------------------------------------------- */
                Hooks.once('init', function () {
                    console.log('Loading Shadowrun 5e System');
                    // Create a shadowrun5e namespace within the game global
                    game['shadowrun5e'] = {
                        SR5Actor: entity_1.SR5Actor,
                        DiceSR: dice_1.DiceSR,
                        SR5Item: entity_2.SR5Item,
                        rollItemMacro,
                    };
                    CONFIG.SR5 = config_1.SR5;
                    CONFIG.Actor.entityClass = entity_1.SR5Actor;
                    CONFIG.Item.entityClass = entity_2.SR5Item;
                    settings_1.registerSystemSettings();
                    // Register sheet application classes
                    Actors.unregisterSheet('core', ActorSheet);
                    Actors.registerSheet('shadowrun5e', sheet_2.SR5ActorSheet, {
                        makeDefault: true,
                    });
                    Items.unregisterSheet('core', ItemSheet);
                    Items.registerSheet('shadowrun5e', sheet_1.SR5ItemSheet, { makeDefault: true });
                    ['renderSR5ActorSheet', 'renderSR5ItemSheet'].forEach((s) => {
                        Hooks.on(s, (app, html, data) =>
                            helpers_1.Helpers.setupCustomCheckbox(app, html)
                        );
                    });
                    templates_1.preloadHandlebarsTemplates();
                    // CONFIG.debug.hooks = true;
                });
                Hooks.on('canvasInit', function () {
                    // this does actually exist. Fix in types?
                    // @ts-ignore
                    SquareGrid.prototype.measureDistance = canvas_1.measureDistance;
                });
                Hooks.on('ready', function () {
                    console.log(game.socket);
                    // this is correct, will need to be fixed in foundry types
                    // @ts-ignore
                    game.socket.on('system.shadowrun5e', (data) => {
                        if (game.user.isGM && data.gmCombatUpdate) {
                            combat_1.shadowrunCombatUpdate(
                                data.gmCombatUpdate.changes,
                                data.gmCombatUpdate.options
                            );
                        }
                        console.log(data);
                    });
                    // Determine whether a system migration is required and feasible
                    const currentVersion = game.settings.get(
                        'shadowrun5e',
                        'systemMigrationVersion'
                    );
                    // the latest version that requires migration
                    const NEEDS_MIGRATION_VERSION = '0.5.12';
                    let needMigration =
                        currentVersion === null ||
                        compareVersion(currentVersion, NEEDS_MIGRATION_VERSION) < 0;
                    // Perform the migration
                    if (needMigration && game.user.isGM) {
                        migrations.migrateWorld();
                    }
                });
                Hooks.on('preUpdateCombat', combat_1.preCombatUpdate);
                Hooks.on('renderChatMessage', (app, html, data) => {
                    if (!app.isRoll) entity_2.SR5Item.chatListeners(html);
                    if (app.isRoll) chat.highlightSuccessFailure(app, html);
                });
                Hooks.on('getChatLogEntryContext', chat.addChatMessageContextOptions);
                /* -------------------------------------------- */
                /*  Hotbar Macros                               */
                /* -------------------------------------------- */
                Hooks.on('hotbarDrop', (bar, data, slot) => {
                    if (data.type !== 'Item') return;
                    createItemMacro(data.data, slot);
                    return false;
                });
                Hooks.on('renderSceneControls', (controls, html) => {
                    html.find('[data-tool="overwatch-score-tracker"]').on('click', (event) => {
                        event.preventDefault();
                        new OverwatchScoreTracker_1.OverwatchScoreTracker().render(true);
                    });
                });
                Hooks.on('getSceneControlButtons', (controls) => {
                    if (game.user.isGM) {
                        const tokenControls = controls.find((c) => c.name === 'token');
                        tokenControls.tools.push({
                            name: 'overwatch-score-tracker',
                            title: 'CONTROLS.SR5.OverwatchScoreTracker',
                            icon: 'fas fa-network-wired',
                        });
                    }
                });
                // found at: https://helloacm.com/the-javascript-function-to-compare-version-number-strings/
                function compareVersion(v1, v2) {
                    if (typeof v1 !== 'string') return false;
                    if (typeof v2 !== 'string') return false;
                    v1 = v1.split('.');
                    v2 = v2.split('.');
                    const k = Math.min(v1.length, v2.length);
                    for (let i = 0; i < k; ++i) {
                        v1[i] = parseInt(v1[i], 10);
                        v2[i] = parseInt(v2[i], 10);
                        if (v1[i] > v2[i]) return 1;
                        if (v1[i] < v2[i]) return -1;
                    }
                    return v1.length === v2.length ? 0 : v1.length < v2.length ? -1 : 1;
                }
                /**
                 * Create a Macro from an Item drop.
                 * Get an existing item macro if one exists, otherwise create a new one.
                 * @param {Object} item     The item data
                 * @param {number} slot     The hotbar slot to use
                 * @returns {Promise}
                 */
                function createItemMacro(item, slot) {
                    return __awaiter(this, void 0, void 0, function* () {
                        const command = `game.shadowrun5e.rollItemMacro("${item.name}");`;
                        let macro = game.macros.entities.find((m) => m.name === item.name);
                        if (!macro) {
                            macro = yield Macro.create(
                                {
                                    name: item.name,
                                    type: 'script',
                                    img: item.img,
                                    command: command,
                                    flags: { 'shadowrun5e.itemMacro': true },
                                },
                                { displaySheet: false }
                            );
                        }
                        if (macro) game.user.assignHotbarMacro(macro, slot);
                    });
                }
                /**
                 * Create a Macro from an Item drop.
                 * Get an existing item macro if one exists, otherwise create a new one.
                 * @param {string} itemName
                 * @return {Promise}
                 */
                function rollItemMacro(itemName) {
                    const speaker = ChatMessage.getSpeaker();
                    let actor;
                    if (speaker.token) actor = game.actors.tokens[speaker.token];
                    if (!actor) actor = game.actors.get(speaker.actor);
                    const item = actor ? actor.items.find((i) => i.name === itemName) : null;
                    if (!item) {
                        // @ts-ignore
                        return ui.notifications.warn(
                            `Your controlled Actor does not have an item named ${itemName}`
                        );
                    }
                    return item.roll();
                }
                Handlebars.registerHelper('localizeOb', function (strId, obj) {
                    if (obj) strId = obj[strId];
                    return game.i18n.localize(strId);
                });
                Handlebars.registerHelper('toHeaderCase', function (str) {
                    if (str) return helpers_1.Helpers.label(str);
                    return '';
                });
                Handlebars.registerHelper('concat', function (strs, c = ',') {
                    if (Array.isArray(strs)) {
                        return strs.join(c);
                    }
                    return strs;
                });
                Handlebars.registerHelper('hasprop', function (obj, prop, options) {
                    if (obj.hasOwnProperty(prop)) {
                        return options.fn(this);
                    } else return options.inverse(this);
                });
                Handlebars.registerHelper('ifin', function (val, arr, options) {
                    if (arr.includes(val)) return options.fn(this);
                    else return options.inverse(this);
                });
                // if greater than
                Handlebars.registerHelper('ifgt', function (v1, v2, options) {
                    if (v1 > v2) return options.fn(this);
                    else return options.inverse(this);
                });
                // if not equal
                Handlebars.registerHelper('ifne', function (v1, v2, options) {
                    if (v1 !== v2) return options.fn(this);
                    else return options.inverse(this);
                });
                // if equal
                Handlebars.registerHelper('ife', function (v1, v2, options) {
                    if (v1 === v2) return options.fn(this);
                    else return options.inverse(this);
                });
                Handlebars.registerHelper('sum', function (v1, v2) {
                    return v1 + v2;
                });
                Handlebars.registerHelper('damageAbbreviation', function (damage) {
                    if (damage === 'physical') return 'P';
                    if (damage === 'stun') return 'S';
                    if (damage === 'matrix') return 'M';
                    return '';
                });
            },
            {
                './actor/entity': 1,
                './actor/sheet': 2,
                './apps/gmtools/OverwatchScoreTracker': 4,
                './canvas': 8,
                './chat': 9,
                './combat': 10,
                './config': 12,
                './dice': 14,
                './helpers': 16,
                './item/entity': 17,
                './item/sheet': 18,
                './migration': 20,
                './settings': 21,
                './templates': 22,
            },
        ],
        20: [
            function (require, module, exports) {
                'use strict';
                var __awaiter =
                    (this && this.__awaiter) ||
                    function (thisArg, _arguments, P, generator) {
                        function adopt(value) {
                            return value instanceof P
                                ? value
                                : new P(function (resolve) {
                                      resolve(value);
                                  });
                        }
                        return new (P || (P = Promise))(function (resolve, reject) {
                            function fulfilled(value) {
                                try {
                                    step(generator.next(value));
                                } catch (e) {
                                    reject(e);
                                }
                            }
                            function rejected(value) {
                                try {
                                    step(generator['throw'](value));
                                } catch (e) {
                                    reject(e);
                                }
                            }
                            function step(result) {
                                result.done
                                    ? resolve(result.value)
                                    : adopt(result.value).then(fulfilled, rejected);
                            }
                            step((generator = generator.apply(thisArg, _arguments || [])).next());
                        });
                    };
                Object.defineProperty(exports, '__esModule', { value: true });
                exports.migrateSceneData = exports.migrateItemData = exports.migrateActorData = exports.migrateCompendium = exports.migrateWorld = void 0;
                /**
                 * Perform a system migration for the entire World, applying migrations for Actors, Items, and Compendium packs
                 * @return {Promise}      A Promise which resolves once the migration is completed
                 */
                exports.migrateWorld = function () {
                    return __awaiter(this, void 0, void 0, function* () {
                        // @ts-ignore
                        ui.notifications.info(
                            `Applying Shadowrun 5e System Migration for version ${game.system.data.version}. Please be patient and do not close your game or shut down your server.`,
                            { permanent: true }
                        );
                        // Migrate World Items
                        for (const i of game.items.entities) {
                            try {
                                const updateData = exports.migrateItemData(i.data);
                                if (!isObjectEmpty(updateData)) {
                                    expandObject(updateData);
                                    console.log(`Migrating Item entity ${i.name}`);
                                    yield i.update(updateData, { enforceTypes: false });
                                }
                            } catch (err) {
                                console.error(err);
                            }
                        }
                        // Migrate World Actors
                        for (const a of game.actors.entities) {
                            try {
                                const updateData = exports.migrateActorData(duplicate(a.data));
                                if (!isObjectEmpty(updateData)) {
                                    expandObject(updateData);
                                    delete updateData['items'];
                                    console.log(`Migrating Actor entity ${a.name}`);
                                    yield a.update(updateData, { enforceTypes: false });
                                    const items = getMigratedActorItems(a.data);
                                    console.log(items);
                                    yield a.updateOwnedItem(items);
                                }
                            } catch (err) {
                                console.error(err);
                            }
                        }
                        // Migrate Actor Override Tokens
                        for (const s of game.scenes.entities) {
                            try {
                                const updateData = exports.migrateSceneData(duplicate(s.data));
                                if (!isObjectEmpty(updateData)) {
                                    expandObject(updateData);
                                    console.log(`Migrating Scene entity ${s.name}`);
                                    yield s.update(updateData, { enforceTypes: false });
                                    console.log(updateData);
                                }
                            } catch (err) {
                                console.error(err);
                            }
                        }
                        // Migrate World Compendium Packs
                        const packs = game.packs.filter((p) => {
                            return (
                                p.metadata.package === 'world' &&
                                ['Actor', 'Item', 'Scene'].includes(p.metadata.entity)
                            );
                        });
                        for (const p of packs) {
                            yield exports.migrateCompendium(p);
                        }
                        // Set the migration as complete
                        game.settings.set(
                            'shadowrun5e',
                            'systemMigrationVersion',
                            game.system.data.version
                        );
                        // @ts-ignore
                        ui.notifications.info(
                            `Shadowrun5e System Migration to version ${game.system.data.version} completed!`,
                            { permanent: true }
                        );
                        console.log(
                            `Shadowrun5e System Migration to version ${game.system.data.version} completed!`
                        );
                    });
                };
                const getMigratedActorItems = (actor) => {
                    // Migrate Owned Items
                    if (!actor.items) return [];
                    return actor.items.reduce((acc, i) => {
                        // Migrate the Owned Item
                        const mi = exports.migrateItemData(i);
                        if (!isObjectEmpty(mi)) {
                            acc.push(mi);
                        }
                        return acc;
                    }, []);
                };
                /* -------------------------------------------- */
                /**
                 * Apply migration rules to all Entities within a single Compendium pack
                 * @param pack
                 * @return {Promise}
                 */
                exports.migrateCompendium = function (pack) {
                    return __awaiter(this, void 0, void 0, function* () {
                        const { entity } = pack.metadata;
                        if (!['Actor', 'Item', 'Scene'].includes(entity)) return;
                        // Begin by requesting server-side data model migration and get the migrated content
                        yield pack.migrate();
                        const content = yield pack.getContent();
                        // Iterate over compendium entries - applying fine-tuned migration functions
                        for (const ent of content) {
                            try {
                                let updateData;
                                if (entity === 'Item')
                                    updateData = exports.migrateItemData(ent.data);
                                else if (entity === 'Actor')
                                    updateData = exports.migrateActorData(ent.data);
                                else if (entity === 'Scene')
                                    updateData = exports.migrateSceneData(ent.data);
                                if (!isObjectEmpty(updateData) && updateData !== null) {
                                    expandObject(updateData);
                                    updateData._id = ent._id;
                                    yield pack.updateEntity(updateData);
                                    console.log(
                                        `Migrated ${entity} entity ${ent.name} in Compendium ${pack.collection}`
                                    );
                                }
                            } catch (err) {
                                console.error(err);
                            }
                        }
                        console.log(
                            `Migrated all ${entity} entities from Compendium ${pack.collection}`
                        );
                    });
                };
                /* -------------------------------------------- */
                /*  Entity Type Migration Helpers               */
                /* -------------------------------------------- */
                /**
                 * Migrate a single Actor entity to incorporate latest data model changes
                 * Return an Object of updateData to be applied
                 * @param {Actor} actor   The actor to Update
                 * @return {Object}       The updateData to apply
                 */
                exports.migrateActorData = function (actor) {
                    const updateData = {};
                    _migrateActorOverflow(actor, updateData);
                    _migrateActorSkills(actor, updateData);
                    let hasItemUpdates = false;
                    const items = actor.items.map((i) => {
                        // Migrate the Owned Item
                        let itemUpdate = exports.migrateItemData(i);
                        // Update the Owned Item
                        if (!isObjectEmpty(itemUpdate)) {
                            hasItemUpdates = true;
                            return mergeObject(i, itemUpdate, {
                                enforceTypes: false,
                                inplace: false,
                            });
                        } else return i;
                    });
                    if (hasItemUpdates) updateData['items'] = items;
                    if (!isObjectEmpty(updateData)) {
                        updateData['_id'] = actor._id;
                        updateData['id'] = actor._id;
                    }
                    return updateData;
                };
                /* -------------------------------------------- */
                /**
                 * Migrate a single Item entity to incorporate latest data model changes
                 * @param item
                 */
                exports.migrateItemData = function (item) {
                    const updateData = {};
                    _migrateItemsAmmo(item, updateData);
                    _migrateDamageTypeAndElement(item, updateData);
                    _migrateItemsAddActions(item, updateData);
                    _migrateItemsAddCapacity(item, updateData);
                    _migrateItemsConceal(item, updateData);
                    if (!isObjectEmpty(updateData)) {
                        updateData['_id'] = item._id;
                        updateData['id'] = item._id;
                    }
                    // Return the migrated update data
                    return updateData;
                };
                /* -------------------------------------------- */
                /**
                 * Migrate a single Scene entity to incorporate changes to the data model of it's actor data overrides
                 * Return an Object of updateData to be applied
                 * @param {Object} scene  The Scene data to Update
                 * @return {Object}       The updateData to apply
                 */
                exports.migrateSceneData = function (scene) {
                    const tokens = duplicate(scene.tokens);
                    return {
                        tokens: tokens.map((t) => {
                            if (!t.actorId || t.actorLink || !t.actorData.data) {
                                t.actorData = {};
                                return t;
                            }
                            const token = new Token(t);
                            if (!token.actor) {
                                t.actorId = null;
                                t.actorData = {};
                            } else if (!t.actorLink) {
                                const updateData = exports.migrateActorData(token.data.actorData);
                                t.actorData = mergeObject(token.data.actorData, updateData);
                            }
                            return t;
                        }),
                    };
                };
                const _migrateActorOverflow = function (actor, updateData) {
                    if (getProperty(actor.data, 'track.physical.overflow') === 0) {
                        updateData['data.track.physical.overflow.value'] = 0;
                        updateData['data.track.physical.overflow.max'] = 0;
                    }
                };
                const _migrateActorSkills = function (actor, updateData) {
                    const splitRegex = /[,\/|.]+/;
                    const reducer = (running, [key, val]) => {
                        if (!Array.isArray(val.specs) && val.specs) {
                            running[key] = {
                                specs: val.specs.split(splitRegex).filter((s) => s !== ''),
                            };
                        }
                        return running;
                    };
                    // TODO verify this works
                    updateData['data.skills.active'] = Object.entries(
                        actor.data.skills.active
                    ).reduce(reducer, {});
                    updateData['data.skills.knowledge.street.value'] = Object.entries(
                        actor.data.skills.knowledge.street.value
                    ).reduce(reducer, {});
                    updateData['data.skills.knowledge.professional.value'] = Object.entries(
                        actor.data.skills.knowledge.professional.value
                    ).reduce(reducer, {});
                    updateData['data.skills.knowledge.academic.value'] = Object.entries(
                        actor.data.skills.knowledge.academic.value
                    ).reduce(reducer, {});
                    updateData['data.skills.knowledge.interests.value'] = Object.entries(
                        actor.data.skills.knowledge.interests.value
                    ).reduce(reducer, {});
                    updateData['data.skills.language.value'] = Object.entries(
                        actor.data.skills.language.value
                    ).reduce(reducer, {});
                };
                const cleanItemData = function (itemData) {
                    const model = game.system.model.Item[itemData.type];
                    itemData.data = filterObject(itemData.data, model);
                };
                const _migrateDamageTypeAndElement = function (item, updateData) {
                    console.log('Migrating Damage and Elements');
                    if (item.data.action) {
                        const action = item.data.action;
                        if (typeof action.damage.type === 'string') {
                            updateData['data.action.damage.type.base'] =
                                item.data.action.damage.type;
                        }
                        if (typeof action.damage.element === 'string') {
                            updateData['data.action.damage.element.base'] =
                                item.data.action.damage.element;
                        }
                    }
                };
                const _migrateItemsAmmo = function (item, updateData) {
                    console.log('Migrating Ammo');
                    if (item.type === 'weapon') {
                        let currentAmmo = { value: 0, max: 0 };
                        if (
                            item.data.category === 'range' &&
                            item.data.range &&
                            item.data.range.ammo
                        ) {
                            // copy over ammo count
                            const oldAmmo = item.data.range.ammo;
                            currentAmmo.value = oldAmmo.value;
                            currentAmmo.max = oldAmmo.max;
                        }
                        updateData['data.ammo'] = {
                            spare_clips: {
                                value: 0,
                                max: 0,
                            },
                            current: {
                                value: currentAmmo.value,
                                max: currentAmmo.max,
                            },
                        };
                    }
                };
                const _migrateItemsConceal = (item, updateData) => {
                    var _a;
                    if (
                        ((_a = item.data.technology) === null || _a === void 0
                            ? void 0
                            : _a.concealability) !== undefined
                    ) {
                        updateData['data.technology.conceal'] = {
                            base: item.data.technology.concealability,
                        };
                    }
                };
                const _migrateItemsAddCapacity = function (item, updateData) {
                    if (['cyberware'].includes(item.type)) {
                        if (item.data.capacity === undefined) {
                            updateData.data.capacity = 0;
                        }
                    }
                };
                const _migrateItemsAddActions = function (item, updateData) {
                    if (['quality', 'cyberware'].includes(item.type)) {
                        if (item.data.action === undefined) {
                            const action = {
                                type: '',
                                category: '',
                                attribute: '',
                                attribute2: '',
                                skill: '',
                                spec: false,
                                mod: 0,
                                limit: {
                                    value: 0,
                                    attribute: '',
                                },
                                extended: false,
                                damage: {
                                    type: '',
                                    element: '',
                                    value: 0,
                                    ap: {
                                        value: 0,
                                    },
                                    attribute: '',
                                },
                                opposed: {
                                    type: '',
                                    attribute: '',
                                    attribute2: '',
                                    skill: '',
                                    mod: 0,
                                    description: '',
                                },
                            };
                            if (!updateData.data) updateData.data = {};
                            updateData.data.action = action;
                        }
                    }
                };
            },
            {},
        ],
        21: [
            function (require, module, exports) {
                'use strict';
                // game settings for shadowrun 5e
                Object.defineProperty(exports, '__esModule', { value: true });
                exports.registerSystemSettings = void 0;
                exports.registerSystemSettings = () => {
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
            },
            {},
        ],
        22: [
            function (require, module, exports) {
                'use strict';
                var __awaiter =
                    (this && this.__awaiter) ||
                    function (thisArg, _arguments, P, generator) {
                        function adopt(value) {
                            return value instanceof P
                                ? value
                                : new P(function (resolve) {
                                      resolve(value);
                                  });
                        }
                        return new (P || (P = Promise))(function (resolve, reject) {
                            function fulfilled(value) {
                                try {
                                    step(generator.next(value));
                                } catch (e) {
                                    reject(e);
                                }
                            }
                            function rejected(value) {
                                try {
                                    step(generator['throw'](value));
                                } catch (e) {
                                    reject(e);
                                }
                            }
                            function step(result) {
                                result.done
                                    ? resolve(result.value)
                                    : adopt(result.value).then(fulfilled, rejected);
                            }
                            step((generator = generator.apply(thisArg, _arguments || [])).next());
                        });
                    };
                Object.defineProperty(exports, '__esModule', { value: true });
                exports.preloadHandlebarsTemplates = void 0;
                exports.preloadHandlebarsTemplates = () =>
                    __awaiter(void 0, void 0, void 0, function* () {
                        const templatePaths = [
                            'systems/shadowrun5e/templates/actor/parts/actor-equipment.html',
                            'systems/shadowrun5e/templates/actor/parts/actor-spellbook.html',
                            'systems/shadowrun5e/templates/actor/parts/actor-skills.html',
                            'systems/shadowrun5e/templates/actor/parts/actor-matrix.html',
                            'systems/shadowrun5e/templates/actor/parts/actor-actions.html',
                            'systems/shadowrun5e/templates/actor/parts/actor-config.html',
                            'systems/shadowrun5e/templates/actor/parts/actor-bio.html',
                            'systems/shadowrun5e/templates/actor/parts/actor-social.html',
                            'systems/shadowrun5e/templates/item/parts/description.html',
                            'systems/shadowrun5e/templates/item/parts/technology.html',
                            'systems/shadowrun5e/templates/item/parts/header.html',
                            'systems/shadowrun5e/templates/item/parts/weapon-ammo-list.html',
                            'systems/shadowrun5e/templates/item/parts/weapon-mods-list.html',
                            'systems/shadowrun5e/templates/item/parts/action.html',
                            'systems/shadowrun5e/templates/item/parts/damage.html',
                            'systems/shadowrun5e/templates/item/parts/opposed.html',
                            'systems/shadowrun5e/templates/item/parts/spell.html',
                            'systems/shadowrun5e/templates/item/parts/complex_form.html',
                            'systems/shadowrun5e/templates/item/parts/weapon.html',
                            'systems/shadowrun5e/templates/item/parts/armor.html',
                            'systems/shadowrun5e/templates/item/parts/matrix.html',
                            'systems/shadowrun5e/templates/item/parts/sin.html',
                            'systems/shadowrun5e/templates/item/parts/contact.html',
                            'systems/shadowrun5e/templates/item/parts/lifestyle.html',
                            'systems/shadowrun5e/templates/item/parts/ammo.html',
                            'systems/shadowrun5e/templates/item/parts/modification.html',
                        ];
                        return loadTemplates(templatePaths);
                    });
            },
            {},
        ],
        23: [
            function (require, module, exports) {
                function _arrayLikeToArray(arr, len) {
                    if (len == null || len > arr.length) len = arr.length;

                    for (var i = 0, arr2 = new Array(len); i < len; i++) {
                        arr2[i] = arr[i];
                    }

                    return arr2;
                }

                module.exports = _arrayLikeToArray;
            },
            {},
        ],
        24: [
            function (require, module, exports) {
                function _arrayWithHoles(arr) {
                    if (Array.isArray(arr)) return arr;
                }

                module.exports = _arrayWithHoles;
            },
            {},
        ],
        25: [
            function (require, module, exports) {
                var arrayLikeToArray = require('./arrayLikeToArray');

                function _arrayWithoutHoles(arr) {
                    if (Array.isArray(arr)) return arrayLikeToArray(arr);
                }

                module.exports = _arrayWithoutHoles;
            },
            { './arrayLikeToArray': 23 },
        ],
        26: [
            function (require, module, exports) {
                function _assertThisInitialized(self) {
                    if (self === void 0) {
                        throw new ReferenceError(
                            "this hasn't been initialised - super() hasn't been called"
                        );
                    }

                    return self;
                }

                module.exports = _assertThisInitialized;
            },
            {},
        ],
        27: [
            function (require, module, exports) {
                function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) {
                    try {
                        var info = gen[key](arg);
                        var value = info.value;
                    } catch (error) {
                        reject(error);
                        return;
                    }

                    if (info.done) {
                        resolve(value);
                    } else {
                        Promise.resolve(value).then(_next, _throw);
                    }
                }

                function _asyncToGenerator(fn) {
                    return function () {
                        var self = this,
                            args = arguments;
                        return new Promise(function (resolve, reject) {
                            var gen = fn.apply(self, args);

                            function _next(value) {
                                asyncGeneratorStep(
                                    gen,
                                    resolve,
                                    reject,
                                    _next,
                                    _throw,
                                    'next',
                                    value
                                );
                            }

                            function _throw(err) {
                                asyncGeneratorStep(
                                    gen,
                                    resolve,
                                    reject,
                                    _next,
                                    _throw,
                                    'throw',
                                    err
                                );
                            }

                            _next(undefined);
                        });
                    };
                }

                module.exports = _asyncToGenerator;
            },
            {},
        ],
        28: [
            function (require, module, exports) {
                function _classCallCheck(instance, Constructor) {
                    if (!(instance instanceof Constructor)) {
                        throw new TypeError('Cannot call a class as a function');
                    }
                }

                module.exports = _classCallCheck;
            },
            {},
        ],
        29: [
            function (require, module, exports) {
                function _defineProperties(target, props) {
                    for (var i = 0; i < props.length; i++) {
                        var descriptor = props[i];
                        descriptor.enumerable = descriptor.enumerable || false;
                        descriptor.configurable = true;
                        if ('value' in descriptor) descriptor.writable = true;
                        Object.defineProperty(target, descriptor.key, descriptor);
                    }
                }

                function _createClass(Constructor, protoProps, staticProps) {
                    if (protoProps) _defineProperties(Constructor.prototype, protoProps);
                    if (staticProps) _defineProperties(Constructor, staticProps);
                    return Constructor;
                }

                module.exports = _createClass;
            },
            {},
        ],
        30: [
            function (require, module, exports) {
                function _defineProperty(obj, key, value) {
                    if (key in obj) {
                        Object.defineProperty(obj, key, {
                            value: value,
                            enumerable: true,
                            configurable: true,
                            writable: true,
                        });
                    } else {
                        obj[key] = value;
                    }

                    return obj;
                }

                module.exports = _defineProperty;
            },
            {},
        ],
        31: [
            function (require, module, exports) {
                var superPropBase = require('./superPropBase');

                function _get(target, property, receiver) {
                    if (typeof Reflect !== 'undefined' && Reflect.get) {
                        module.exports = _get = Reflect.get;
                    } else {
                        module.exports = _get = function _get(target, property, receiver) {
                            var base = superPropBase(target, property);
                            if (!base) return;
                            var desc = Object.getOwnPropertyDescriptor(base, property);

                            if (desc.get) {
                                return desc.get.call(receiver);
                            }

                            return desc.value;
                        };
                    }

                    return _get(target, property, receiver || target);
                }

                module.exports = _get;
            },
            { './superPropBase': 42 },
        ],
        32: [
            function (require, module, exports) {
                function _getPrototypeOf(o) {
                    module.exports = _getPrototypeOf = Object.setPrototypeOf
                        ? Object.getPrototypeOf
                        : function _getPrototypeOf(o) {
                              return o.__proto__ || Object.getPrototypeOf(o);
                          };
                    return _getPrototypeOf(o);
                }

                module.exports = _getPrototypeOf;
            },
            {},
        ],
        33: [
            function (require, module, exports) {
                var setPrototypeOf = require('./setPrototypeOf');

                function _inherits(subClass, superClass) {
                    if (typeof superClass !== 'function' && superClass !== null) {
                        throw new TypeError('Super expression must either be null or a function');
                    }

                    subClass.prototype = Object.create(superClass && superClass.prototype, {
                        constructor: {
                            value: subClass,
                            writable: true,
                            configurable: true,
                        },
                    });
                    if (superClass) setPrototypeOf(subClass, superClass);
                }

                module.exports = _inherits;
            },
            { './setPrototypeOf': 40 },
        ],
        34: [
            function (require, module, exports) {
                function _interopRequireDefault(obj) {
                    return obj && obj.__esModule
                        ? obj
                        : {
                              default: obj,
                          };
                }

                module.exports = _interopRequireDefault;
            },
            {},
        ],
        35: [
            function (require, module, exports) {
                function _iterableToArray(iter) {
                    if (typeof Symbol !== 'undefined' && Symbol.iterator in Object(iter))
                        return Array.from(iter);
                }

                module.exports = _iterableToArray;
            },
            {},
        ],
        36: [
            function (require, module, exports) {
                function _iterableToArrayLimit(arr, i) {
                    if (typeof Symbol === 'undefined' || !(Symbol.iterator in Object(arr))) return;
                    var _arr = [];
                    var _n = true;
                    var _d = false;
                    var _e = undefined;

                    try {
                        for (
                            var _i = arr[Symbol.iterator](), _s;
                            !(_n = (_s = _i.next()).done);
                            _n = true
                        ) {
                            _arr.push(_s.value);

                            if (i && _arr.length === i) break;
                        }
                    } catch (err) {
                        _d = true;
                        _e = err;
                    } finally {
                        try {
                            if (!_n && _i['return'] != null) _i['return']();
                        } finally {
                            if (_d) throw _e;
                        }
                    }

                    return _arr;
                }

                module.exports = _iterableToArrayLimit;
            },
            {},
        ],
        37: [
            function (require, module, exports) {
                function _nonIterableRest() {
                    throw new TypeError(
                        'Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.'
                    );
                }

                module.exports = _nonIterableRest;
            },
            {},
        ],
        38: [
            function (require, module, exports) {
                function _nonIterableSpread() {
                    throw new TypeError(
                        'Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.'
                    );
                }

                module.exports = _nonIterableSpread;
            },
            {},
        ],
        39: [
            function (require, module, exports) {
                var _typeof = require('../helpers/typeof');

                var assertThisInitialized = require('./assertThisInitialized');

                function _possibleConstructorReturn(self, call) {
                    if (call && (_typeof(call) === 'object' || typeof call === 'function')) {
                        return call;
                    }

                    return assertThisInitialized(self);
                }

                module.exports = _possibleConstructorReturn;
            },
            { '../helpers/typeof': 44, './assertThisInitialized': 26 },
        ],
        40: [
            function (require, module, exports) {
                function _setPrototypeOf(o, p) {
                    module.exports = _setPrototypeOf =
                        Object.setPrototypeOf ||
                        function _setPrototypeOf(o, p) {
                            o.__proto__ = p;
                            return o;
                        };

                    return _setPrototypeOf(o, p);
                }

                module.exports = _setPrototypeOf;
            },
            {},
        ],
        41: [
            function (require, module, exports) {
                var arrayWithHoles = require('./arrayWithHoles');

                var iterableToArrayLimit = require('./iterableToArrayLimit');

                var unsupportedIterableToArray = require('./unsupportedIterableToArray');

                var nonIterableRest = require('./nonIterableRest');

                function _slicedToArray(arr, i) {
                    return (
                        arrayWithHoles(arr) ||
                        iterableToArrayLimit(arr, i) ||
                        unsupportedIterableToArray(arr, i) ||
                        nonIterableRest()
                    );
                }

                module.exports = _slicedToArray;
            },
            {
                './arrayWithHoles': 24,
                './iterableToArrayLimit': 36,
                './nonIterableRest': 37,
                './unsupportedIterableToArray': 45,
            },
        ],
        42: [
            function (require, module, exports) {
                var getPrototypeOf = require('./getPrototypeOf');

                function _superPropBase(object, property) {
                    while (!Object.prototype.hasOwnProperty.call(object, property)) {
                        object = getPrototypeOf(object);
                        if (object === null) break;
                    }

                    return object;
                }

                module.exports = _superPropBase;
            },
            { './getPrototypeOf': 32 },
        ],
        43: [
            function (require, module, exports) {
                var arrayWithoutHoles = require('./arrayWithoutHoles');

                var iterableToArray = require('./iterableToArray');

                var unsupportedIterableToArray = require('./unsupportedIterableToArray');

                var nonIterableSpread = require('./nonIterableSpread');

                function _toConsumableArray(arr) {
                    return (
                        arrayWithoutHoles(arr) ||
                        iterableToArray(arr) ||
                        unsupportedIterableToArray(arr) ||
                        nonIterableSpread()
                    );
                }

                module.exports = _toConsumableArray;
            },
            {
                './arrayWithoutHoles': 25,
                './iterableToArray': 35,
                './nonIterableSpread': 38,
                './unsupportedIterableToArray': 45,
            },
        ],
        44: [
            function (require, module, exports) {
                function _typeof(obj) {
                    '@babel/helpers - typeof';

                    if (typeof Symbol === 'function' && typeof Symbol.iterator === 'symbol') {
                        module.exports = _typeof = function _typeof(obj) {
                            return typeof obj;
                        };
                    } else {
                        module.exports = _typeof = function _typeof(obj) {
                            return obj &&
                                typeof Symbol === 'function' &&
                                obj.constructor === Symbol &&
                                obj !== Symbol.prototype
                                ? 'symbol'
                                : typeof obj;
                        };
                    }

                    return _typeof(obj);
                }

                module.exports = _typeof;
            },
            {},
        ],
        45: [
            function (require, module, exports) {
                var arrayLikeToArray = require('./arrayLikeToArray');

                function _unsupportedIterableToArray(o, minLen) {
                    if (!o) return;
                    if (typeof o === 'string') return arrayLikeToArray(o, minLen);
                    var n = Object.prototype.toString.call(o).slice(8, -1);
                    if (n === 'Object' && o.constructor) n = o.constructor.name;
                    if (n === 'Map' || n === 'Set') return Array.from(o);
                    if (n === 'Arguments' || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n))
                        return arrayLikeToArray(o, minLen);
                }

                module.exports = _unsupportedIterableToArray;
            },
            { './arrayLikeToArray': 23 },
        ],
        46: [
            function (require, module, exports) {
                module.exports = require('regenerator-runtime');
            },
            { 'regenerator-runtime': 47 },
        ],
        47: [
            function (require, module, exports) {
                /**
                 * Copyright (c) 2014-present, Facebook, Inc.
                 *
                 * This source code is licensed under the MIT license found in the
                 * LICENSE file in the root directory of this source tree.
                 */

                var runtime = (function (exports) {
                    'use strict';

                    var Op = Object.prototype;
                    var hasOwn = Op.hasOwnProperty;
                    var undefined; // More compressible than void 0.
                    var $Symbol = typeof Symbol === 'function' ? Symbol : {};
                    var iteratorSymbol = $Symbol.iterator || '@@iterator';
                    var asyncIteratorSymbol = $Symbol.asyncIterator || '@@asyncIterator';
                    var toStringTagSymbol = $Symbol.toStringTag || '@@toStringTag';

                    function wrap(innerFn, outerFn, self, tryLocsList) {
                        // If outerFn provided and outerFn.prototype is a Generator, then outerFn.prototype instanceof Generator.
                        var protoGenerator =
                            outerFn && outerFn.prototype instanceof Generator ? outerFn : Generator;
                        var generator = Object.create(protoGenerator.prototype);
                        var context = new Context(tryLocsList || []);

                        // The ._invoke method unifies the implementations of the .next,
                        // .throw, and .return methods.
                        generator._invoke = makeInvokeMethod(innerFn, self, context);

                        return generator;
                    }
                    exports.wrap = wrap;

                    // Try/catch helper to minimize deoptimizations. Returns a completion
                    // record like context.tryEntries[i].completion. This interface could
                    // have been (and was previously) designed to take a closure to be
                    // invoked without arguments, but in all the cases we care about we
                    // already have an existing method we want to call, so there's no need
                    // to create a new function object. We can even get away with assuming
                    // the method takes exactly one argument, since that happens to be true
                    // in every case, so we don't have to touch the arguments object. The
                    // only additional allocation required is the completion record, which
                    // has a stable shape and so hopefully should be cheap to allocate.
                    function tryCatch(fn, obj, arg) {
                        try {
                            return { type: 'normal', arg: fn.call(obj, arg) };
                        } catch (err) {
                            return { type: 'throw', arg: err };
                        }
                    }

                    var GenStateSuspendedStart = 'suspendedStart';
                    var GenStateSuspendedYield = 'suspendedYield';
                    var GenStateExecuting = 'executing';
                    var GenStateCompleted = 'completed';

                    // Returning this object from the innerFn has the same effect as
                    // breaking out of the dispatch switch statement.
                    var ContinueSentinel = {};

                    // Dummy constructor functions that we use as the .constructor and
                    // .constructor.prototype properties for functions that return Generator
                    // objects. For full spec compliance, you may wish to configure your
                    // minifier not to mangle the names of these two functions.
                    function Generator() {}
                    function GeneratorFunction() {}
                    function GeneratorFunctionPrototype() {}

                    // This is a polyfill for %IteratorPrototype% for environments that
                    // don't natively support it.
                    var IteratorPrototype = {};
                    IteratorPrototype[iteratorSymbol] = function () {
                        return this;
                    };

                    var getProto = Object.getPrototypeOf;
                    var NativeIteratorPrototype = getProto && getProto(getProto(values([])));
                    if (
                        NativeIteratorPrototype &&
                        NativeIteratorPrototype !== Op &&
                        hasOwn.call(NativeIteratorPrototype, iteratorSymbol)
                    ) {
                        // This environment has a native %IteratorPrototype%; use it instead
                        // of the polyfill.
                        IteratorPrototype = NativeIteratorPrototype;
                    }

                    var Gp = (GeneratorFunctionPrototype.prototype = Generator.prototype = Object.create(
                        IteratorPrototype
                    ));
                    GeneratorFunction.prototype = Gp.constructor = GeneratorFunctionPrototype;
                    GeneratorFunctionPrototype.constructor = GeneratorFunction;
                    GeneratorFunctionPrototype[toStringTagSymbol] = GeneratorFunction.displayName =
                        'GeneratorFunction';

                    // Helper for defining the .next, .throw, and .return methods of the
                    // Iterator interface in terms of a single ._invoke method.
                    function defineIteratorMethods(prototype) {
                        ['next', 'throw', 'return'].forEach(function (method) {
                            prototype[method] = function (arg) {
                                return this._invoke(method, arg);
                            };
                        });
                    }

                    exports.isGeneratorFunction = function (genFun) {
                        var ctor = typeof genFun === 'function' && genFun.constructor;
                        return ctor
                            ? ctor === GeneratorFunction ||
                                  // For the native GeneratorFunction constructor, the best we can
                                  // do is to check its .name property.
                                  (ctor.displayName || ctor.name) === 'GeneratorFunction'
                            : false;
                    };

                    exports.mark = function (genFun) {
                        if (Object.setPrototypeOf) {
                            Object.setPrototypeOf(genFun, GeneratorFunctionPrototype);
                        } else {
                            genFun.__proto__ = GeneratorFunctionPrototype;
                            if (!(toStringTagSymbol in genFun)) {
                                genFun[toStringTagSymbol] = 'GeneratorFunction';
                            }
                        }
                        genFun.prototype = Object.create(Gp);
                        return genFun;
                    };

                    // Within the body of any async function, `await x` is transformed to
                    // `yield regeneratorRuntime.awrap(x)`, so that the runtime can test
                    // `hasOwn.call(value, "__await")` to determine if the yielded value is
                    // meant to be awaited.
                    exports.awrap = function (arg) {
                        return { __await: arg };
                    };

                    function AsyncIterator(generator, PromiseImpl) {
                        function invoke(method, arg, resolve, reject) {
                            var record = tryCatch(generator[method], generator, arg);
                            if (record.type === 'throw') {
                                reject(record.arg);
                            } else {
                                var result = record.arg;
                                var value = result.value;
                                if (
                                    value &&
                                    typeof value === 'object' &&
                                    hasOwn.call(value, '__await')
                                ) {
                                    return PromiseImpl.resolve(value.__await).then(
                                        function (value) {
                                            invoke('next', value, resolve, reject);
                                        },
                                        function (err) {
                                            invoke('throw', err, resolve, reject);
                                        }
                                    );
                                }

                                return PromiseImpl.resolve(value).then(
                                    function (unwrapped) {
                                        // When a yielded Promise is resolved, its final value becomes
                                        // the .value of the Promise<{value,done}> result for the
                                        // current iteration.
                                        result.value = unwrapped;
                                        resolve(result);
                                    },
                                    function (error) {
                                        // If a rejected Promise was yielded, throw the rejection back
                                        // into the async generator function so it can be handled there.
                                        return invoke('throw', error, resolve, reject);
                                    }
                                );
                            }
                        }

                        var previousPromise;

                        function enqueue(method, arg) {
                            function callInvokeWithMethodAndArg() {
                                return new PromiseImpl(function (resolve, reject) {
                                    invoke(method, arg, resolve, reject);
                                });
                            }

                            return (previousPromise =
                                // If enqueue has been called before, then we want to wait until
                                // all previous Promises have been resolved before calling invoke,
                                // so that results are always delivered in the correct order. If
                                // enqueue has not been called before, then it is important to
                                // call invoke immediately, without waiting on a callback to fire,
                                // so that the async generator function has the opportunity to do
                                // any necessary setup in a predictable way. This predictability
                                // is why the Promise constructor synchronously invokes its
                                // executor callback, and why async functions synchronously
                                // execute code before the first await. Since we implement simple
                                // async functions in terms of async generators, it is especially
                                // important to get this right, even though it requires care.
                                previousPromise
                                    ? previousPromise.then(
                                          callInvokeWithMethodAndArg,
                                          // Avoid propagating failures to Promises returned by later
                                          // invocations of the iterator.
                                          callInvokeWithMethodAndArg
                                      )
                                    : callInvokeWithMethodAndArg());
                        }

                        // Define the unified helper method that is used to implement .next,
                        // .throw, and .return (see defineIteratorMethods).
                        this._invoke = enqueue;
                    }

                    defineIteratorMethods(AsyncIterator.prototype);
                    AsyncIterator.prototype[asyncIteratorSymbol] = function () {
                        return this;
                    };
                    exports.AsyncIterator = AsyncIterator;

                    // Note that simple async functions are implemented on top of
                    // AsyncIterator objects; they just return a Promise for the value of
                    // the final result produced by the iterator.
                    exports.async = function (innerFn, outerFn, self, tryLocsList, PromiseImpl) {
                        if (PromiseImpl === void 0) PromiseImpl = Promise;

                        var iter = new AsyncIterator(
                            wrap(innerFn, outerFn, self, tryLocsList),
                            PromiseImpl
                        );

                        return exports.isGeneratorFunction(outerFn)
                            ? iter // If outerFn is a generator, return the full iterator.
                            : iter.next().then(function (result) {
                                  return result.done ? result.value : iter.next();
                              });
                    };

                    function makeInvokeMethod(innerFn, self, context) {
                        var state = GenStateSuspendedStart;

                        return function invoke(method, arg) {
                            if (state === GenStateExecuting) {
                                throw new Error('Generator is already running');
                            }

                            if (state === GenStateCompleted) {
                                if (method === 'throw') {
                                    throw arg;
                                }

                                // Be forgiving, per 25.3.3.3.3 of the spec:
                                // https://people.mozilla.org/~jorendorff/es6-draft.html#sec-generatorresume
                                return doneResult();
                            }

                            context.method = method;
                            context.arg = arg;

                            while (true) {
                                var delegate = context.delegate;
                                if (delegate) {
                                    var delegateResult = maybeInvokeDelegate(delegate, context);
                                    if (delegateResult) {
                                        if (delegateResult === ContinueSentinel) continue;
                                        return delegateResult;
                                    }
                                }

                                if (context.method === 'next') {
                                    // Setting context._sent for legacy support of Babel's
                                    // function.sent implementation.
                                    context.sent = context._sent = context.arg;
                                } else if (context.method === 'throw') {
                                    if (state === GenStateSuspendedStart) {
                                        state = GenStateCompleted;
                                        throw context.arg;
                                    }

                                    context.dispatchException(context.arg);
                                } else if (context.method === 'return') {
                                    context.abrupt('return', context.arg);
                                }

                                state = GenStateExecuting;

                                var record = tryCatch(innerFn, self, context);
                                if (record.type === 'normal') {
                                    // If an exception is thrown from innerFn, we leave state ===
                                    // GenStateExecuting and loop back for another invocation.
                                    state = context.done
                                        ? GenStateCompleted
                                        : GenStateSuspendedYield;

                                    if (record.arg === ContinueSentinel) {
                                        continue;
                                    }

                                    return {
                                        value: record.arg,
                                        done: context.done,
                                    };
                                } else if (record.type === 'throw') {
                                    state = GenStateCompleted;
                                    // Dispatch the exception by looping back around to the
                                    // context.dispatchException(context.arg) call above.
                                    context.method = 'throw';
                                    context.arg = record.arg;
                                }
                            }
                        };
                    }

                    // Call delegate.iterator[context.method](context.arg) and handle the
                    // result, either by returning a { value, done } result from the
                    // delegate iterator, or by modifying context.method and context.arg,
                    // setting context.delegate to null, and returning the ContinueSentinel.
                    function maybeInvokeDelegate(delegate, context) {
                        var method = delegate.iterator[context.method];
                        if (method === undefined) {
                            // A .throw or .return when the delegate iterator has no .throw
                            // method always terminates the yield* loop.
                            context.delegate = null;

                            if (context.method === 'throw') {
                                // Note: ["return"] must be used for ES3 parsing compatibility.
                                if (delegate.iterator['return']) {
                                    // If the delegate iterator has a return method, give it a
                                    // chance to clean up.
                                    context.method = 'return';
                                    context.arg = undefined;
                                    maybeInvokeDelegate(delegate, context);

                                    if (context.method === 'throw') {
                                        // If maybeInvokeDelegate(context) changed context.method from
                                        // "return" to "throw", let that override the TypeError below.
                                        return ContinueSentinel;
                                    }
                                }

                                context.method = 'throw';
                                context.arg = new TypeError(
                                    "The iterator does not provide a 'throw' method"
                                );
                            }

                            return ContinueSentinel;
                        }

                        var record = tryCatch(method, delegate.iterator, context.arg);

                        if (record.type === 'throw') {
                            context.method = 'throw';
                            context.arg = record.arg;
                            context.delegate = null;
                            return ContinueSentinel;
                        }

                        var info = record.arg;

                        if (!info) {
                            context.method = 'throw';
                            context.arg = new TypeError('iterator result is not an object');
                            context.delegate = null;
                            return ContinueSentinel;
                        }

                        if (info.done) {
                            // Assign the result of the finished delegate to the temporary
                            // variable specified by delegate.resultName (see delegateYield).
                            context[delegate.resultName] = info.value;

                            // Resume execution at the desired location (see delegateYield).
                            context.next = delegate.nextLoc;

                            // If context.method was "throw" but the delegate handled the
                            // exception, let the outer generator proceed normally. If
                            // context.method was "next", forget context.arg since it has been
                            // "consumed" by the delegate iterator. If context.method was
                            // "return", allow the original .return call to continue in the
                            // outer generator.
                            if (context.method !== 'return') {
                                context.method = 'next';
                                context.arg = undefined;
                            }
                        } else {
                            // Re-yield the result returned by the delegate method.
                            return info;
                        }

                        // The delegate iterator is finished, so forget it and continue with
                        // the outer generator.
                        context.delegate = null;
                        return ContinueSentinel;
                    }

                    // Define Generator.prototype.{next,throw,return} in terms of the
                    // unified ._invoke helper method.
                    defineIteratorMethods(Gp);

                    Gp[toStringTagSymbol] = 'Generator';

                    // A Generator should always return itself as the iterator object when the
                    // @@iterator function is called on it. Some browsers' implementations of the
                    // iterator prototype chain incorrectly implement this, causing the Generator
                    // object to not be returned from this call. This ensures that doesn't happen.
                    // See https://github.com/facebook/regenerator/issues/274 for more details.
                    Gp[iteratorSymbol] = function () {
                        return this;
                    };

                    Gp.toString = function () {
                        return '[object Generator]';
                    };

                    function pushTryEntry(locs) {
                        var entry = { tryLoc: locs[0] };

                        if (1 in locs) {
                            entry.catchLoc = locs[1];
                        }

                        if (2 in locs) {
                            entry.finallyLoc = locs[2];
                            entry.afterLoc = locs[3];
                        }

                        this.tryEntries.push(entry);
                    }

                    function resetTryEntry(entry) {
                        var record = entry.completion || {};
                        record.type = 'normal';
                        delete record.arg;
                        entry.completion = record;
                    }

                    function Context(tryLocsList) {
                        // The root entry object (effectively a try statement without a catch
                        // or a finally block) gives us a place to store values thrown from
                        // locations where there is no enclosing try statement.
                        this.tryEntries = [{ tryLoc: 'root' }];
                        tryLocsList.forEach(pushTryEntry, this);
                        this.reset(true);
                    }

                    exports.keys = function (object) {
                        var keys = [];
                        for (var key in object) {
                            keys.push(key);
                        }
                        keys.reverse();

                        // Rather than returning an object with a next method, we keep
                        // things simple and return the next function itself.
                        return function next() {
                            while (keys.length) {
                                var key = keys.pop();
                                if (key in object) {
                                    next.value = key;
                                    next.done = false;
                                    return next;
                                }
                            }

                            // To avoid creating an additional object, we just hang the .value
                            // and .done properties off the next function object itself. This
                            // also ensures that the minifier will not anonymize the function.
                            next.done = true;
                            return next;
                        };
                    };

                    function values(iterable) {
                        if (iterable) {
                            var iteratorMethod = iterable[iteratorSymbol];
                            if (iteratorMethod) {
                                return iteratorMethod.call(iterable);
                            }

                            if (typeof iterable.next === 'function') {
                                return iterable;
                            }

                            if (!isNaN(iterable.length)) {
                                var i = -1,
                                    next = function next() {
                                        while (++i < iterable.length) {
                                            if (hasOwn.call(iterable, i)) {
                                                next.value = iterable[i];
                                                next.done = false;
                                                return next;
                                            }
                                        }

                                        next.value = undefined;
                                        next.done = true;

                                        return next;
                                    };

                                return (next.next = next);
                            }
                        }

                        // Return an iterator with no values.
                        return { next: doneResult };
                    }
                    exports.values = values;

                    function doneResult() {
                        return { value: undefined, done: true };
                    }

                    Context.prototype = {
                        constructor: Context,

                        reset: function (skipTempReset) {
                            this.prev = 0;
                            this.next = 0;
                            // Resetting context._sent for legacy support of Babel's
                            // function.sent implementation.
                            this.sent = this._sent = undefined;
                            this.done = false;
                            this.delegate = null;

                            this.method = 'next';
                            this.arg = undefined;

                            this.tryEntries.forEach(resetTryEntry);

                            if (!skipTempReset) {
                                for (var name in this) {
                                    // Not sure about the optimal order of these conditions:
                                    if (
                                        name.charAt(0) === 't' &&
                                        hasOwn.call(this, name) &&
                                        !isNaN(+name.slice(1))
                                    ) {
                                        this[name] = undefined;
                                    }
                                }
                            }
                        },

                        stop: function () {
                            this.done = true;

                            var rootEntry = this.tryEntries[0];
                            var rootRecord = rootEntry.completion;
                            if (rootRecord.type === 'throw') {
                                throw rootRecord.arg;
                            }

                            return this.rval;
                        },

                        dispatchException: function (exception) {
                            if (this.done) {
                                throw exception;
                            }

                            var context = this;
                            function handle(loc, caught) {
                                record.type = 'throw';
                                record.arg = exception;
                                context.next = loc;

                                if (caught) {
                                    // If the dispatched exception was caught by a catch block,
                                    // then let that catch block handle the exception normally.
                                    context.method = 'next';
                                    context.arg = undefined;
                                }

                                return !!caught;
                            }

                            for (var i = this.tryEntries.length - 1; i >= 0; --i) {
                                var entry = this.tryEntries[i];
                                var record = entry.completion;

                                if (entry.tryLoc === 'root') {
                                    // Exception thrown outside of any try block that could handle
                                    // it, so set the completion value of the entire function to
                                    // throw the exception.
                                    return handle('end');
                                }

                                if (entry.tryLoc <= this.prev) {
                                    var hasCatch = hasOwn.call(entry, 'catchLoc');
                                    var hasFinally = hasOwn.call(entry, 'finallyLoc');

                                    if (hasCatch && hasFinally) {
                                        if (this.prev < entry.catchLoc) {
                                            return handle(entry.catchLoc, true);
                                        } else if (this.prev < entry.finallyLoc) {
                                            return handle(entry.finallyLoc);
                                        }
                                    } else if (hasCatch) {
                                        if (this.prev < entry.catchLoc) {
                                            return handle(entry.catchLoc, true);
                                        }
                                    } else if (hasFinally) {
                                        if (this.prev < entry.finallyLoc) {
                                            return handle(entry.finallyLoc);
                                        }
                                    } else {
                                        throw new Error('try statement without catch or finally');
                                    }
                                }
                            }
                        },

                        abrupt: function (type, arg) {
                            for (var i = this.tryEntries.length - 1; i >= 0; --i) {
                                var entry = this.tryEntries[i];
                                if (
                                    entry.tryLoc <= this.prev &&
                                    hasOwn.call(entry, 'finallyLoc') &&
                                    this.prev < entry.finallyLoc
                                ) {
                                    var finallyEntry = entry;
                                    break;
                                }
                            }

                            if (
                                finallyEntry &&
                                (type === 'break' || type === 'continue') &&
                                finallyEntry.tryLoc <= arg &&
                                arg <= finallyEntry.finallyLoc
                            ) {
                                // Ignore the finally entry if control is not jumping to a
                                // location outside the try/catch block.
                                finallyEntry = null;
                            }

                            var record = finallyEntry ? finallyEntry.completion : {};
                            record.type = type;
                            record.arg = arg;

                            if (finallyEntry) {
                                this.method = 'next';
                                this.next = finallyEntry.finallyLoc;
                                return ContinueSentinel;
                            }

                            return this.complete(record);
                        },

                        complete: function (record, afterLoc) {
                            if (record.type === 'throw') {
                                throw record.arg;
                            }

                            if (record.type === 'break' || record.type === 'continue') {
                                this.next = record.arg;
                            } else if (record.type === 'return') {
                                this.rval = this.arg = record.arg;
                                this.method = 'return';
                                this.next = 'end';
                            } else if (record.type === 'normal' && afterLoc) {
                                this.next = afterLoc;
                            }

                            return ContinueSentinel;
                        },

                        finish: function (finallyLoc) {
                            for (var i = this.tryEntries.length - 1; i >= 0; --i) {
                                var entry = this.tryEntries[i];
                                if (entry.finallyLoc === finallyLoc) {
                                    this.complete(entry.completion, entry.afterLoc);
                                    resetTryEntry(entry);
                                    return ContinueSentinel;
                                }
                            }
                        },

                        catch: function (tryLoc) {
                            for (var i = this.tryEntries.length - 1; i >= 0; --i) {
                                var entry = this.tryEntries[i];
                                if (entry.tryLoc === tryLoc) {
                                    var record = entry.completion;
                                    if (record.type === 'throw') {
                                        var thrown = record.arg;
                                        resetTryEntry(entry);
                                    }
                                    return thrown;
                                }
                            }

                            // The context.catch method must only be called with a location
                            // argument that corresponds to a known catch block.
                            throw new Error('illegal catch attempt');
                        },

                        delegateYield: function (iterable, resultName, nextLoc) {
                            this.delegate = {
                                iterator: values(iterable),
                                resultName: resultName,
                                nextLoc: nextLoc,
                            };

                            if (this.method === 'next') {
                                // Deliberately forget the last sent value so that we don't
                                // accidentally pass it on to the delegate.
                                this.arg = undefined;
                            }

                            return ContinueSentinel;
                        },
                    };

                    // Regardless of whether this script is executing as a CommonJS module
                    // or not, return the runtime object so that we can declare the variable
                    // regeneratorRuntime in the outer scope, which allows this module to be
                    // injected easily by `bin/regenerator --include-runtime script.js`.
                    return exports;
                })(
                    // If this script is executing as a CommonJS module, use module.exports
                    // as the regeneratorRuntime namespace. Otherwise create a new empty
                    // object. Either way, the resulting object will be used to initialize
                    // the regeneratorRuntime variable at the top of this file.
                    typeof module === 'object' ? module.exports : {}
                );

                try {
                    regeneratorRuntime = runtime;
                } catch (accidentalStrictMode) {
                    // This module should not be running in strict mode, so the above
                    // assignment should always work unless something is misconfigured. Just
                    // in case runtime.js accidentally runs in strict mode, we can escape
                    // strict mode using a global Function call. This could conceivably fail
                    // if a Content Security Policy forbids using Function, but in that case
                    // the proper solution is to fix the accidental strict mode problem. If
                    // you've misconfigured your bundler to force strict mode and applied a
                    // CSP to forbid Function, and you're not willing to fix either of those
                    // problems, please detail your unique predicament in a GitHub issue.
                    Function('r', 'regeneratorRuntime = r')(runtime);
                }
            },
            {},
        ],
    },
    {},
    [19]
);
