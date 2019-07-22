"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var input_widget_1 = require("./input_widget");
var dom_1 = require("../../core/dom");
var p = require("../../core/properties");
var abs = Math.abs, floor = Math.floor, log10 = Math.log10;
function _get_sig_dig(num) {
    var x = abs(Number(String(num).replace(".", ""))); // remove decimal and make positive
    if (x == 0)
        return 0;
    while (x != 0 && (x % 10 == 0))
        x /= 10; // kill the 0s at the end of n
    return floor(log10(x)) + 1; // get number of digits
}
var SpinnerView = /** @class */ (function (_super) {
    tslib_1.__extends(SpinnerView, _super);
    function SpinnerView() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    SpinnerView.prototype.connect_signals = function () {
        var _this = this;
        _super.prototype.connect_signals.call(this);
        this.connect(this.model.properties.low.change, function () {
            var low = _this.model.low;
            if (low != null)
                _this.input_el.min = low.toFixed(16);
        });
        this.connect(this.model.properties.high.change, function () {
            var high = _this.model.high;
            if (high != null)
                _this.input_el.max = high.toFixed(16);
        });
        this.connect(this.model.properties.step.change, function () {
            var step = _this.model.step;
            _this.input_el.step = step.toFixed(16);
        });
        this.connect(this.model.properties.value.change, function () {
            var _a = _this.model, value = _a.value, step = _a.step;
            _this.input_el.value = value.toFixed(_get_sig_dig(step));
        });
        this.connect(this.model.properties.disabled.change, function () {
            _this.input_el.disabled = _this.model.disabled;
        });
    };
    SpinnerView.prototype.render = function () {
        var _this = this;
        _super.prototype.render.call(this);
        this.input_el = dom_1.input({
            type: "number",
            class: "bk-input",
            name: this.model.name,
            min: this.model.low,
            max: this.model.high,
            value: this.model.value,
            step: this.model.step,
            disabled: this.model.disabled,
        });
        this.input_el.addEventListener("change", function () { return _this.change_input(); });
        //this.input_el.addEventListener("input", () => this.change_input())
        this.group_el.appendChild(this.input_el);
    };
    SpinnerView.prototype.change_input = function () {
        var step = this.model.step;
        var new_value = Number(this.input_el.value);
        this.model.value = Number(new_value.toFixed(_get_sig_dig(step)));
        if (this.model.value != new_value) {
            // this is needed when the current value in the input is already at bounded value
            // and we enter a value outside these bounds. We emit a model change to update
            // the input text value.
            this.model.change.emit();
        }
        _super.prototype.change_input.call(this);
    };
    return SpinnerView;
}(input_widget_1.InputWidgetView));
exports.SpinnerView = SpinnerView;
var Spinner = /** @class */ (function (_super) {
    tslib_1.__extends(Spinner, _super);
    function Spinner(attrs) {
        return _super.call(this, attrs) || this;
    }
    Spinner.initClass = function () {
        this.prototype.type = "Spinner";
        this.prototype.default_view = SpinnerView;
        this.define({
            value: [p.Number, 0],
            low: [p.Number, null],
            high: [p.Number, null],
            step: [p.Number, 1],
        });
    };
    return Spinner;
}(input_widget_1.InputWidget));
exports.Spinner = Spinner;
Spinner.initClass();
