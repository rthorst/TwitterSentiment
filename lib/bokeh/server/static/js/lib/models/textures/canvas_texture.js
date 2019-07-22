"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var texture_1 = require("./texture");
var p = require("../../core/properties");
var string_1 = require("../../core/util/string");
var CanvasTexture = /** @class */ (function (_super) {
    tslib_1.__extends(CanvasTexture, _super);
    function CanvasTexture(attrs) {
        return _super.call(this, attrs) || this;
    }
    CanvasTexture.initClass = function () {
        this.prototype.type = "CanvasTexture";
        this.define({
            code: [p.String],
        });
    };
    Object.defineProperty(CanvasTexture.prototype, "func", {
        get: function () {
            var code = string_1.use_strict(this.code);
            return new Function("ctx", "color", "scale", "weight", "require", "exports", code);
        },
        enumerable: true,
        configurable: true
    });
    CanvasTexture.prototype.get_pattern = function (color, scale, weight) {
        var _this = this;
        return function (ctx) {
            var canvas = document.createElement('canvas');
            canvas.width = scale;
            canvas.height = scale;
            var pattern_ctx = canvas.getContext('2d');
            _this.func.call(_this, pattern_ctx, color, scale, weight, require, {});
            return ctx.createPattern(canvas, _this.repetition);
        };
    };
    return CanvasTexture;
}(texture_1.Texture));
exports.CanvasTexture = CanvasTexture;
CanvasTexture.initClass();
