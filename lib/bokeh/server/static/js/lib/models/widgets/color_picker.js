"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var input_widget_1 = require("./input_widget");
var dom_1 = require("../../core/dom");
var p = require("../../core/properties");
var ColorPickerView = /** @class */ (function (_super) {
    tslib_1.__extends(ColorPickerView, _super);
    function ColorPickerView() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    ColorPickerView.prototype.connect_signals = function () {
        var _this = this;
        _super.prototype.connect_signals.call(this);
        this.connect(this.model.properties.name.change, function () { return _this.input_el.name = _this.model.name || ""; });
        this.connect(this.model.properties.color.change, function () { return _this.input_el.value = _this.model.color; });
        this.connect(this.model.properties.disabled.change, function () { return _this.input_el.disabled = _this.model.disabled; });
    };
    ColorPickerView.prototype.render = function () {
        var _this = this;
        _super.prototype.render.call(this);
        this.input_el = dom_1.input({
            type: "color",
            class: "bk-input",
            name: this.model.name,
            value: this.model.color,
            disabled: this.model.disabled,
        });
        this.input_el.addEventListener("change", function () { return _this.change_input(); });
        this.group_el.appendChild(this.input_el);
    };
    ColorPickerView.prototype.change_input = function () {
        this.model.color = this.input_el.value;
        _super.prototype.change_input.call(this);
    };
    return ColorPickerView;
}(input_widget_1.InputWidgetView));
exports.ColorPickerView = ColorPickerView;
var ColorPicker = /** @class */ (function (_super) {
    tslib_1.__extends(ColorPicker, _super);
    function ColorPicker(attrs) {
        return _super.call(this, attrs) || this;
    }
    ColorPicker.initClass = function () {
        this.prototype.type = "ColorPicker";
        this.prototype.default_view = ColorPickerView;
        this.define({
            color: [p.Color, "#000000"],
        });
    };
    return ColorPicker;
}(input_widget_1.InputWidget));
exports.ColorPicker = ColorPicker;
ColorPicker.initClass();
