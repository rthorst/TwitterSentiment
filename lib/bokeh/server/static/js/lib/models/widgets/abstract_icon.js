"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var model_1 = require("../../model");
var dom_view_1 = require("../../core/dom_view");
var AbstractIconView = /** @class */ (function (_super) {
    tslib_1.__extends(AbstractIconView, _super);
    function AbstractIconView() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return AbstractIconView;
}(dom_view_1.DOMView));
exports.AbstractIconView = AbstractIconView;
var AbstractIcon = /** @class */ (function (_super) {
    tslib_1.__extends(AbstractIcon, _super);
    function AbstractIcon(attrs) {
        return _super.call(this, attrs) || this;
    }
    AbstractIcon.initClass = function () {
        this.prototype.type = "AbstractIcon";
    };
    return AbstractIcon;
}(model_1.Model));
exports.AbstractIcon = AbstractIcon;
AbstractIcon.initClass();
