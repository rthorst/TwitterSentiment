"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var texture_1 = require("./texture");
var p = require("../../core/properties");
var ImageURLTexture = /** @class */ (function (_super) {
    tslib_1.__extends(ImageURLTexture, _super);
    function ImageURLTexture(attrs) {
        return _super.call(this, attrs) || this;
    }
    ImageURLTexture.initClass = function () {
        this.prototype.type = "ImageURLTexture";
        this.define({
            url: [p.String],
        });
    };
    ImageURLTexture.prototype.initialize = function () {
        _super.prototype.initialize.call(this);
        this.image = new Image();
        this.image.src = this.url;
    };
    ImageURLTexture.prototype.get_pattern = function (_color, _scale, _weight) {
        var _this = this;
        return function (ctx) {
            if (!_this.image.complete) {
                return null;
            }
            return ctx.createPattern(_this.image, _this.repetition);
        };
    };
    ImageURLTexture.prototype.onload = function (defer_func) {
        if (this.image.complete) {
            defer_func();
        }
        else {
            this.image.onload = function () {
                defer_func();
            };
        }
    };
    return ImageURLTexture;
}(texture_1.Texture));
exports.ImageURLTexture = ImageURLTexture;
ImageURLTexture.initClass();
