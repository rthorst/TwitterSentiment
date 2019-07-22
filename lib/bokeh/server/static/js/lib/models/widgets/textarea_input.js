"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var text_input_1 = require("./text_input");
var input_widget_1 = require("./input_widget");
var dom_1 = require("../../core/dom");
var p = require("../../core/properties");
var TextAreaInputView = /** @class */ (function (_super) {
    tslib_1.__extends(TextAreaInputView, _super);
    function TextAreaInputView() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    TextAreaInputView.prototype.connect_signals = function () {
        var _this = this;
        _super.prototype.connect_signals.call(this);
        this.connect(this.model.properties.name.change, function () { return _this.input_el.name = _this.model.name || ""; });
        this.connect(this.model.properties.value.change, function () { return _this.input_el.value = _this.model.value; });
        this.connect(this.model.properties.disabled.change, function () { return _this.input_el.disabled = _this.model.disabled; });
        this.connect(this.model.properties.placeholder.change, function () { return _this.input_el.placeholder = _this.model.placeholder; });
        this.connect(this.model.properties.rows.change, function () { return _this.input_el.rows = _this.model.rows; });
        this.connect(this.model.properties.cols.change, function () { return _this.input_el.cols = _this.model.cols; });
        this.connect(this.model.properties.max_length.change, function () { return _this.input_el.maxLength = _this.model.max_length; });
    };
    TextAreaInputView.prototype.render = function () {
        var _this = this;
        _super.prototype.render.call(this);
        this.input_el = dom_1.textarea({
            class: "bk-input",
            name: this.model.name,
            disabled: this.model.disabled,
            placeholder: this.model.placeholder,
            cols: this.model.cols,
            rows: this.model.rows,
            maxLength: this.model.max_length,
        });
        this.input_el.textContent = this.model.value;
        this.input_el.addEventListener("change", function () { return _this.change_input(); });
        this.group_el.appendChild(this.input_el);
    };
    TextAreaInputView.prototype.change_input = function () {
        this.model.value = this.input_el.value;
        _super.prototype.change_input.call(this);
    };
    return TextAreaInputView;
}(input_widget_1.InputWidgetView));
exports.TextAreaInputView = TextAreaInputView;
var TextAreaInput = /** @class */ (function (_super) {
    tslib_1.__extends(TextAreaInput, _super);
    function TextAreaInput(attrs) {
        return _super.call(this, attrs) || this;
    }
    TextAreaInput.initClass = function () {
        this.prototype.type = "TextAreaInput";
        this.prototype.default_view = TextAreaInputView;
        this.define({
            cols: [p.Number, 20],
            rows: [p.Number, 2],
            max_length: [p.Number, 500],
        });
    };
    return TextAreaInput;
}(text_input_1.TextInput));
exports.TextAreaInput = TextAreaInput;
TextAreaInput.initClass();
