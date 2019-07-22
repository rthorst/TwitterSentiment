"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var input_group_1 = require("./input_group");
var dom_1 = require("../../core/dom");
var array_1 = require("../../core/util/array");
var data_structures_1 = require("../../core/util/data_structures");
var p = require("../../core/properties");
var CheckboxGroupView = /** @class */ (function (_super) {
    tslib_1.__extends(CheckboxGroupView, _super);
    function CheckboxGroupView() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    CheckboxGroupView.prototype.render = function () {
        var _this = this;
        _super.prototype.render.call(this);
        var group = dom_1.div({ class: ["bk-input-group", this.model.inline ? "bk-inline" : null] });
        this.el.appendChild(group);
        var _a = this.model, active = _a.active, labels = _a.labels;
        var _loop_1 = function (i) {
            var checkbox = dom_1.input({ type: "checkbox", value: "" + i });
            checkbox.addEventListener("change", function () { return _this.change_active(i); });
            if (this_1.model.disabled)
                checkbox.disabled = true;
            if (array_1.includes(active, i))
                checkbox.checked = true;
            var label_el = dom_1.label({}, checkbox, dom_1.span({}, labels[i]));
            group.appendChild(label_el);
        };
        var this_1 = this;
        for (var i = 0; i < labels.length; i++) {
            _loop_1(i);
        }
    };
    CheckboxGroupView.prototype.change_active = function (i) {
        var active = new data_structures_1.Set(this.model.active);
        active.toggle(i);
        this.model.active = active.values;
        if (this.model.callback != null)
            this.model.callback.execute(this.model);
    };
    return CheckboxGroupView;
}(input_group_1.InputGroupView));
exports.CheckboxGroupView = CheckboxGroupView;
var CheckboxGroup = /** @class */ (function (_super) {
    tslib_1.__extends(CheckboxGroup, _super);
    function CheckboxGroup(attrs) {
        return _super.call(this, attrs) || this;
    }
    CheckboxGroup.initClass = function () {
        this.prototype.type = "CheckboxGroup";
        this.prototype.default_view = CheckboxGroupView;
        this.define({
            active: [p.Array, []],
            labels: [p.Array, []],
            inline: [p.Boolean, false],
            callback: [p.Any],
        });
    };
    return CheckboxGroup;
}(input_group_1.InputGroup));
exports.CheckboxGroup = CheckboxGroup;
CheckboxGroup.initClass();
