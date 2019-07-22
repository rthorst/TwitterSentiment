"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var button_group_1 = require("./button_group");
var dom_1 = require("../../core/dom");
var data_structures_1 = require("../../core/util/data_structures");
var p = require("../../core/properties");
var CheckboxButtonGroupView = /** @class */ (function (_super) {
    tslib_1.__extends(CheckboxButtonGroupView, _super);
    function CheckboxButtonGroupView() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Object.defineProperty(CheckboxButtonGroupView.prototype, "active", {
        get: function () {
            return new data_structures_1.Set(this.model.active);
        },
        enumerable: true,
        configurable: true
    });
    CheckboxButtonGroupView.prototype.change_active = function (i) {
        var active = this.active;
        active.toggle(i);
        this.model.active = active.values;
        if (this.model.callback != null)
            this.model.callback.execute(this.model);
    };
    CheckboxButtonGroupView.prototype._update_active = function () {
        var active = this.active;
        this._buttons.forEach(function (button, i) {
            dom_1.classes(button).toggle("bk-active", active.has(i));
        });
    };
    return CheckboxButtonGroupView;
}(button_group_1.ButtonGroupView));
exports.CheckboxButtonGroupView = CheckboxButtonGroupView;
var CheckboxButtonGroup = /** @class */ (function (_super) {
    tslib_1.__extends(CheckboxButtonGroup, _super);
    function CheckboxButtonGroup(attrs) {
        return _super.call(this, attrs) || this;
    }
    CheckboxButtonGroup.initClass = function () {
        this.prototype.type = "CheckboxButtonGroup";
        this.prototype.default_view = CheckboxButtonGroupView;
        this.define({
            active: [p.Array, []],
        });
    };
    return CheckboxButtonGroup;
}(button_group_1.ButtonGroup));
exports.CheckboxButtonGroup = CheckboxButtonGroup;
CheckboxButtonGroup.initClass();
