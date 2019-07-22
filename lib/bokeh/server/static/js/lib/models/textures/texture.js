"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var model_1 = require("../../model");
var p = require("../../core/properties");
var Texture = /** @class */ (function (_super) {
    tslib_1.__extends(Texture, _super);
    function Texture(attrs) {
        return _super.call(this, attrs) || this;
    }
    Texture.initClass = function () {
        this.prototype.type = "Texture";
        this.define({
            repetition: [p.TextureRepetition, "repeat"],
        });
    };
    Texture.prototype.onload = function (defer_func) {
        defer_func();
    };
    return Texture;
}(model_1.Model));
exports.Texture = Texture;
Texture.initClass();
