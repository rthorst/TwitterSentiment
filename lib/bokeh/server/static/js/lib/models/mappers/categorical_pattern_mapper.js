"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var categorical_mapper_1 = require("./categorical_mapper");
var mapper_1 = require("./mapper");
var p = require("../../core/properties");
var CategoricalPatternMapper = /** @class */ (function (_super) {
    tslib_1.__extends(CategoricalPatternMapper, _super);
    function CategoricalPatternMapper(attrs) {
        return _super.call(this, attrs) || this;
    }
    CategoricalPatternMapper.initClass = function () {
        this.prototype.type = "CategoricalPatternMapper";
        this.define({
            factors: [p.Array],
            patterns: [p.Array],
            start: [p.Number, 0],
            end: [p.Number],
            default_value: [p.HatchPatternType, " "],
        });
    };
    CategoricalPatternMapper.prototype.v_compute = function (xs) {
        var values = new Array(xs.length);
        categorical_mapper_1.cat_v_compute(xs, this.factors, this.patterns, values, this.start, this.end, this.default_value);
        return values;
    };
    return CategoricalPatternMapper;
}(mapper_1.Mapper));
exports.CategoricalPatternMapper = CategoricalPatternMapper;
CategoricalPatternMapper.initClass();
