"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var signaling_1 = require("./signaling");
var enums = require("./enums");
var array_1 = require("./util/array");
var arrayable_1 = require("./util/arrayable");
var color_1 = require("./util/color");
var types_1 = require("./util/types");
signaling_1.Signal; // XXX: silence TS, because `Signal` appears in declarations due to Signalable
function valueToString(value) {
    try {
        return JSON.stringify(value);
    }
    catch (_a) {
        return value.toString();
    }
}
function isSpec(obj) {
    return types_1.isPlainObject(obj) &&
        ((obj.value === undefined ? 0 : 1) +
            (obj.field === undefined ? 0 : 1) +
            (obj.expr === undefined ? 0 : 1) == 1); // garbage JS XOR
}
exports.isSpec = isSpec;
var Property = /** @class */ (function (_super) {
    tslib_1.__extends(Property, _super);
    function Property(obj, attr, default_value) {
        var _this = _super.call(this) || this;
        _this.obj = obj;
        _this.attr = attr;
        _this.default_value = default_value;
        _this.optional = false;
        _this.change = new signaling_1.Signal0(_this.obj, "change");
        _this._init();
        _this.connect(_this.change, function () { return _this._init(); });
        return _this;
    }
    Property.prototype.update = function () {
        this._init();
    };
    // ----- customizable policies
    Property.prototype.init = function () { };
    Property.prototype.transform = function (values) {
        return values;
    };
    Property.prototype.validate = function (value) {
        if (!this.valid(value))
            throw new Error(this.obj.type + "." + this.attr + " given invalid value: " + valueToString(value));
    };
    Property.prototype.valid = function (_value) {
        return true;
    };
    // ----- property accessors
    Property.prototype.value = function (do_spec_transform) {
        if (do_spec_transform === void 0) { do_spec_transform = true; }
        if (this.spec.value === undefined)
            throw new Error("attempted to retrieve property value for property without value specification");
        var ret = this.transform([this.spec.value])[0];
        if (this.spec.transform != null && do_spec_transform)
            ret = this.spec.transform.compute(ret);
        return ret;
    };
    // ----- private methods
    /*protected*/ Property.prototype._init = function () {
        var _a;
        var obj = this.obj;
        var attr = this.attr;
        var attr_value = obj.getv(attr);
        if (attr_value === undefined) {
            var default_value = this.default_value;
            if (default_value !== undefined)
                attr_value = default_value(obj);
            else
                attr_value = null;
            obj.setv((_a = {}, _a[attr] = attr_value, _a), { silent: true, defaults: true });
        }
        if (types_1.isArray(attr_value))
            this.spec = { value: attr_value };
        else if (isSpec(attr_value))
            this.spec = attr_value;
        else
            this.spec = { value: attr_value };
        //if (this.dataspec && this.spec.field != null && !isString(this.spec.field))
        //  throw new Error(`field value for property '${attr}' is not a string`)
        if (this.spec.value != null)
            this.validate(this.spec.value);
        this.init();
    };
    Property.prototype.toString = function () {
        /*${this.name}*/
        return "Prop(" + this.obj + "." + this.attr + ", spec: " + valueToString(this.spec) + ")";
    };
    return Property;
}(signaling_1.Signalable()));
exports.Property = Property;
//
// Primitive Properties
//
var Any = /** @class */ (function (_super) {
    tslib_1.__extends(Any, _super);
    function Any() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return Any;
}(Property));
exports.Any = Any;
var Array = /** @class */ (function (_super) {
    tslib_1.__extends(Array, _super);
    function Array() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Array.prototype.valid = function (value) {
        return types_1.isArray(value) || value instanceof Float64Array;
    };
    return Array;
}(Property));
exports.Array = Array;
var Boolean = /** @class */ (function (_super) {
    tslib_1.__extends(Boolean, _super);
    function Boolean() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Boolean.prototype.valid = function (value) {
        return types_1.isBoolean(value);
    };
    return Boolean;
}(Property));
exports.Boolean = Boolean;
var Color = /** @class */ (function (_super) {
    tslib_1.__extends(Color, _super);
    function Color() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Color.prototype.valid = function (value) {
        return types_1.isString(value) && color_1.is_color(value);
    };
    return Color;
}(Property));
exports.Color = Color;
var Instance = /** @class */ (function (_super) {
    tslib_1.__extends(Instance, _super);
    function Instance() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return Instance;
}(Property));
exports.Instance = Instance;
var Number = /** @class */ (function (_super) {
    tslib_1.__extends(Number, _super);
    function Number() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Number.prototype.valid = function (value) {
        return types_1.isNumber(value);
    };
    return Number;
}(Property));
exports.Number = Number;
var Int = /** @class */ (function (_super) {
    tslib_1.__extends(Int, _super);
    function Int() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Int.prototype.valid = function (value) {
        return types_1.isNumber(value) && (value | 0) == value;
    };
    return Int;
}(Number));
exports.Int = Int;
var Angle = /** @class */ (function (_super) {
    tslib_1.__extends(Angle, _super);
    function Angle() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return Angle;
}(Number));
exports.Angle = Angle;
var Percent = /** @class */ (function (_super) {
    tslib_1.__extends(Percent, _super);
    function Percent() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Percent.prototype.valid = function (value) {
        return types_1.isNumber(value) && 0 <= value && value <= 1.0;
    };
    return Percent;
}(Number));
exports.Percent = Percent;
var String = /** @class */ (function (_super) {
    tslib_1.__extends(String, _super);
    function String() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    String.prototype.valid = function (value) {
        return types_1.isString(value);
    };
    return String;
}(Property));
exports.String = String;
var FontSize = /** @class */ (function (_super) {
    tslib_1.__extends(FontSize, _super);
    function FontSize() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return FontSize;
}(String));
exports.FontSize = FontSize;
var Font = /** @class */ (function (_super) {
    tslib_1.__extends(Font, _super);
    function Font() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return Font;
}(String)); // TODO (bev) don't think this exists python side
exports.Font = Font;
//
// Enum properties
//
var EnumProperty = /** @class */ (function (_super) {
    tslib_1.__extends(EnumProperty, _super);
    function EnumProperty() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    EnumProperty.prototype.valid = function (value) {
        return types_1.isString(value) && array_1.includes(this.enum_values, value);
    };
    return EnumProperty;
}(Property));
exports.EnumProperty = EnumProperty;
function Enum(values) {
    return /** @class */ (function (_super) {
        tslib_1.__extends(class_1, _super);
        function class_1() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        Object.defineProperty(class_1.prototype, "enum_values", {
            get: function () {
                return values;
            },
            enumerable: true,
            configurable: true
        });
        return class_1;
    }(EnumProperty));
}
exports.Enum = Enum;
var Direction = /** @class */ (function (_super) {
    tslib_1.__extends(Direction, _super);
    function Direction() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Object.defineProperty(Direction.prototype, "enum_values", {
        get: function () {
            return enums.Direction;
        },
        enumerable: true,
        configurable: true
    });
    Direction.prototype.transform = function (values) {
        var result = new Uint8Array(values.length);
        for (var i = 0; i < values.length; i++) {
            switch (values[i]) {
                case "clock":
                    result[i] = 0;
                    break;
                case "anticlock":
                    result[i] = 1;
                    break;
            }
        }
        return result;
    };
    return Direction;
}(EnumProperty));
exports.Direction = Direction;
exports.Anchor = Enum(enums.Anchor);
exports.AngleUnits = Enum(enums.AngleUnits);
exports.BoxOrigin = Enum(enums.BoxOrigin);
exports.ButtonType = Enum(enums.ButtonType);
exports.Dimension = Enum(enums.Dimension);
exports.Dimensions = Enum(enums.Dimensions);
exports.Distribution = Enum(enums.Distribution);
exports.FontStyle = Enum(enums.FontStyle);
exports.HatchPatternType = Enum(enums.HatchPatternType);
exports.HTTPMethod = Enum(enums.HTTPMethod);
exports.HexTileOrientation = Enum(enums.HexTileOrientation);
exports.HoverMode = Enum(enums.HoverMode);
exports.LatLon = Enum(enums.LatLon);
exports.LegendClickPolicy = Enum(enums.LegendClickPolicy);
exports.LegendLocation = Enum(enums.LegendLocation);
exports.LineCap = Enum(enums.LineCap);
exports.LineJoin = Enum(enums.LineJoin);
exports.LinePolicy = Enum(enums.LinePolicy);
exports.Location = Enum(enums.Location);
exports.Logo = Enum(enums.Logo);
exports.MarkerType = Enum(enums.MarkerType);
exports.Orientation = Enum(enums.Orientation);
exports.OutputBackend = Enum(enums.OutputBackend);
exports.PaddingUnits = Enum(enums.PaddingUnits);
exports.Place = Enum(enums.Place);
exports.PointPolicy = Enum(enums.PointPolicy);
exports.RadiusDimension = Enum(enums.RadiusDimension);
exports.RenderLevel = Enum(enums.RenderLevel);
exports.RenderMode = Enum(enums.RenderMode);
exports.ResetPolicy = Enum(enums.ResetPolicy);
exports.RoundingFunction = Enum(enums.RoundingFunction);
exports.Side = Enum(enums.Side);
exports.SizingMode = Enum(enums.SizingMode);
exports.SliderCallbackPolicy = Enum(enums.SliderCallbackPolicy);
exports.Sort = Enum(enums.Sort);
exports.SpatialUnits = Enum(enums.SpatialUnits);
exports.StartEnd = Enum(enums.StartEnd);
exports.StepMode = Enum(enums.StepMode);
exports.TapBehavior = Enum(enums.TapBehavior);
exports.TextAlign = Enum(enums.TextAlign);
exports.TextBaseline = Enum(enums.TextBaseline);
exports.TextureRepetition = Enum(enums.TextureRepetition);
exports.TickLabelOrientation = Enum(enums.TickLabelOrientation);
exports.TooltipAttachment = Enum(enums.TooltipAttachment);
exports.UpdateMode = Enum(enums.UpdateMode);
exports.VerticalAlign = Enum(enums.VerticalAlign);
//
// DataSpec properties
//
var ScalarSpec = /** @class */ (function (_super) {
    tslib_1.__extends(ScalarSpec, _super);
    function ScalarSpec() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return ScalarSpec;
}(Property));
exports.ScalarSpec = ScalarSpec;
var VectorSpec = /** @class */ (function (_super) {
    tslib_1.__extends(VectorSpec, _super);
    function VectorSpec() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    VectorSpec.prototype.array = function (source) {
        var ret;
        if (this.spec.field != null) {
            ret = this.transform(source.get_column(this.spec.field));
            if (ret == null)
                throw new Error("attempted to retrieve property array for nonexistent field '" + this.spec.field + "'");
        }
        else if (this.spec.expr != null) {
            ret = this.transform(this.spec.expr.v_compute(source));
        }
        else {
            var length_1 = source.get_length();
            if (length_1 == null)
                length_1 = 1;
            var value = this.value(false); // don't apply any spec transform
            ret = array_1.repeat(value, length_1);
        }
        if (this.spec.transform != null)
            ret = this.spec.transform.v_compute(ret);
        return ret;
    };
    return VectorSpec;
}(Property));
exports.VectorSpec = VectorSpec;
var DataSpec = /** @class */ (function (_super) {
    tslib_1.__extends(DataSpec, _super);
    function DataSpec() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return DataSpec;
}(VectorSpec));
exports.DataSpec = DataSpec;
var UnitsSpec = /** @class */ (function (_super) {
    tslib_1.__extends(UnitsSpec, _super);
    function UnitsSpec() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    UnitsSpec.prototype.init = function () {
        if (this.spec.units == null)
            this.spec.units = this.default_units;
        var units = this.spec.units;
        if (!array_1.includes(this.valid_units, units))
            throw new Error("units must be one of " + this.valid_units.join(", ") + "; got: " + units);
    };
    Object.defineProperty(UnitsSpec.prototype, "units", {
        get: function () {
            return this.spec.units;
        },
        set: function (units) {
            this.spec.units = units;
        },
        enumerable: true,
        configurable: true
    });
    return UnitsSpec;
}(VectorSpec));
exports.UnitsSpec = UnitsSpec;
var AngleSpec = /** @class */ (function (_super) {
    tslib_1.__extends(AngleSpec, _super);
    function AngleSpec() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Object.defineProperty(AngleSpec.prototype, "default_units", {
        get: function () { return "rad"; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(AngleSpec.prototype, "valid_units", {
        get: function () { return enums.AngleUnits; },
        enumerable: true,
        configurable: true
    });
    AngleSpec.prototype.transform = function (values) {
        if (this.spec.units == "deg")
            values = arrayable_1.map(values, function (x) { return x * Math.PI / 180.0; });
        values = arrayable_1.map(values, function (x) { return -x; });
        return _super.prototype.transform.call(this, values);
    };
    return AngleSpec;
}(UnitsSpec));
exports.AngleSpec = AngleSpec;
var BooleanSpec = /** @class */ (function (_super) {
    tslib_1.__extends(BooleanSpec, _super);
    function BooleanSpec() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return BooleanSpec;
}(DataSpec));
exports.BooleanSpec = BooleanSpec;
var ColorSpec = /** @class */ (function (_super) {
    tslib_1.__extends(ColorSpec, _super);
    function ColorSpec() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return ColorSpec;
}(DataSpec));
exports.ColorSpec = ColorSpec;
var CoordinateSpec = /** @class */ (function (_super) {
    tslib_1.__extends(CoordinateSpec, _super);
    function CoordinateSpec() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return CoordinateSpec;
}(DataSpec));
exports.CoordinateSpec = CoordinateSpec;
var CoordinateSeqSpec = /** @class */ (function (_super) {
    tslib_1.__extends(CoordinateSeqSpec, _super);
    function CoordinateSeqSpec() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return CoordinateSeqSpec;
}(DataSpec));
exports.CoordinateSeqSpec = CoordinateSeqSpec;
var DistanceSpec = /** @class */ (function (_super) {
    tslib_1.__extends(DistanceSpec, _super);
    function DistanceSpec() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Object.defineProperty(DistanceSpec.prototype, "default_units", {
        get: function () { return "data"; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(DistanceSpec.prototype, "valid_units", {
        get: function () { return enums.SpatialUnits; },
        enumerable: true,
        configurable: true
    });
    return DistanceSpec;
}(UnitsSpec));
exports.DistanceSpec = DistanceSpec;
var FontSizeSpec = /** @class */ (function (_super) {
    tslib_1.__extends(FontSizeSpec, _super);
    function FontSizeSpec() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return FontSizeSpec;
}(DataSpec));
exports.FontSizeSpec = FontSizeSpec;
var MarkerSpec = /** @class */ (function (_super) {
    tslib_1.__extends(MarkerSpec, _super);
    function MarkerSpec() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return MarkerSpec;
}(DataSpec));
exports.MarkerSpec = MarkerSpec;
var NumberSpec = /** @class */ (function (_super) {
    tslib_1.__extends(NumberSpec, _super);
    function NumberSpec() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return NumberSpec;
}(DataSpec));
exports.NumberSpec = NumberSpec;
var StringSpec = /** @class */ (function (_super) {
    tslib_1.__extends(StringSpec, _super);
    function StringSpec() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return StringSpec;
}(DataSpec));
exports.StringSpec = StringSpec;
var NullStringSpec = /** @class */ (function (_super) {
    tslib_1.__extends(NullStringSpec, _super);
    function NullStringSpec() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return NullStringSpec;
}(DataSpec));
exports.NullStringSpec = NullStringSpec;
