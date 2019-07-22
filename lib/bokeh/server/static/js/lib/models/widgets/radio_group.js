"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var dom_1 = require("../../core/dom");
var string_1 = require("../../core/util/string");
var p = require("../../core/properties");
var input_group_1 = require("./input_group");
var RadioGroupView = /** @class */ (function (_super) {
    tslib_1.__extends(RadioGroupView, _super);
    function RadioGroupView() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    RadioGroupView.prototype.render = function () {
        var _this = this;
        _super.prototype.render.call(this);
        var group = dom_1.div({ class: ["bk-input-group", this.model.inline ? "bk-inline" : null] });
        this.el.appendChild(group);
        var name = string_1.uniqueId();
        var _a = this.model, active = _a.active, labels = _a.labels;
        var _loop_1 = function (i) {
            var radio = dom_1.input({ type: "radio", name: name, value: "" + i });
            radio.addEventListener("change", function () { return _this.change_active(i); });
            if (this_1.model.disabled)
                radio.disabled = true;
            if (i == active)
                radio.checked = true;
            var label_el = dom_1.label({}, radio, dom_1.span({}, labels[i]));
            group.appendChild(label_el);
        };
        var this_1 = this;
        for (var i = 0; i < labels.length; i++) {
            _loop_1(i);
        }
    };
    RadioGroupView.prototype.change_active = function (i) {
        this.model.active = i;
        if (this.model.callback != null)
            this.model.callback.execute(this.model);
    };
    return RadioGroupView;
}(input_group_1.InputGroupView));
exports.RadioGroupView = RadioGroupView;
var RadioGroup = /** @class */ (function (_super) {
    tslib_1.__extends(RadioGroup, _super);
    function RadioGroup(attrs) {
        return _super.call(this, attrs) || this;
    }
    RadioGroup.initClass = function () {
        this.prototype.type = "RadioGroup";
        this.prototype.default_view = RadioGroupView;
        this.define({
            active: [p.Number,],
            labels: [p.Array, []],
            inline: [p.Boolean, false],
            callback: [p.Any],
        });
    };
    return RadioGroup;
}(input_group_1.InputGroup));
exports.RadioGroup = RadioGroup;
RadioGroup.initClass();
