"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
function event(event_name) {
    return function (cls) {
        cls.prototype.event_name = event_name;
    };
}
var BokehEvent = /** @class */ (function () {
    function BokehEvent() {
    }
    BokehEvent.prototype.to_json = function () {
        var event_name = this.event_name;
        return { event_name: event_name, event_values: this._to_json() };
    };
    BokehEvent.prototype._to_json = function () {
        var origin = this.origin;
        return { model_id: origin != null ? origin.id : null };
    };
    return BokehEvent;
}());
exports.BokehEvent = BokehEvent;
var ButtonClick = /** @class */ (function (_super) {
    tslib_1.__extends(ButtonClick, _super);
    function ButtonClick() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    ButtonClick = tslib_1.__decorate([
        event("button_click")
    ], ButtonClick);
    return ButtonClick;
}(BokehEvent));
exports.ButtonClick = ButtonClick;
var MenuItemClick = /** @class */ (function (_super) {
    tslib_1.__extends(MenuItemClick, _super);
    function MenuItemClick(item) {
        var _this = _super.call(this) || this;
        _this.item = item;
        return _this;
    }
    MenuItemClick.prototype._to_json = function () {
        var item = this.item;
        return tslib_1.__assign({}, _super.prototype._to_json.call(this), { item: item });
    };
    MenuItemClick = tslib_1.__decorate([
        event("menu_item_click")
    ], MenuItemClick);
    return MenuItemClick;
}(BokehEvent));
exports.MenuItemClick = MenuItemClick;
// A UIEvent is an event originating on a canvas this includes.
// DOM events such as keystrokes as well as hammer events and LOD events.
var UIEvent = /** @class */ (function (_super) {
    tslib_1.__extends(UIEvent, _super);
    function UIEvent() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return UIEvent;
}(BokehEvent));
exports.UIEvent = UIEvent;
var LODStart = /** @class */ (function (_super) {
    tslib_1.__extends(LODStart, _super);
    function LODStart() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    LODStart = tslib_1.__decorate([
        event("lodstart")
    ], LODStart);
    return LODStart;
}(UIEvent));
exports.LODStart = LODStart;
var LODEnd = /** @class */ (function (_super) {
    tslib_1.__extends(LODEnd, _super);
    function LODEnd() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    LODEnd = tslib_1.__decorate([
        event("lodend")
    ], LODEnd);
    return LODEnd;
}(UIEvent));
exports.LODEnd = LODEnd;
var SelectionGeometry = /** @class */ (function (_super) {
    tslib_1.__extends(SelectionGeometry, _super);
    function SelectionGeometry(geometry, final) {
        var _this = _super.call(this) || this;
        _this.geometry = geometry;
        _this.final = final;
        return _this;
    }
    SelectionGeometry.prototype._to_json = function () {
        var _a = this, geometry = _a.geometry, final = _a.final;
        return tslib_1.__assign({}, _super.prototype._to_json.call(this), { geometry: geometry, final: final });
    };
    SelectionGeometry = tslib_1.__decorate([
        event("selectiongeometry")
    ], SelectionGeometry);
    return SelectionGeometry;
}(UIEvent));
exports.SelectionGeometry = SelectionGeometry;
var Reset = /** @class */ (function (_super) {
    tslib_1.__extends(Reset, _super);
    function Reset() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Reset = tslib_1.__decorate([
        event("reset")
    ], Reset);
    return Reset;
}(UIEvent));
exports.Reset = Reset;
var PointEvent = /** @class */ (function (_super) {
    tslib_1.__extends(PointEvent, _super);
    function PointEvent(sx, sy, x, y) {
        var _this = _super.call(this) || this;
        _this.sx = sx;
        _this.sy = sy;
        _this.x = x;
        _this.y = y;
        return _this;
    }
    PointEvent.prototype._to_json = function () {
        var _a = this, sx = _a.sx, sy = _a.sy, x = _a.x, y = _a.y;
        return tslib_1.__assign({}, _super.prototype._to_json.call(this), { sx: sx, sy: sy, x: x, y: y });
    };
    return PointEvent;
}(UIEvent));
exports.PointEvent = PointEvent;
var Pan = /** @class */ (function (_super) {
    tslib_1.__extends(Pan, _super);
    function Pan(sx, sy, x, y, delta_x, delta_y) {
        var _this = _super.call(this, sx, sy, x, y) || this;
        _this.sx = sx;
        _this.sy = sy;
        _this.x = x;
        _this.y = y;
        _this.delta_x = delta_x;
        _this.delta_y = delta_y;
        return _this;
    }
    Pan.prototype._to_json = function () {
        var _a = this, delta_x = _a.delta_x, delta_y = _a.delta_y /*, direction*/;
        return tslib_1.__assign({}, _super.prototype._to_json.call(this), { delta_x: delta_x, delta_y: delta_y /*, direction*/ });
    };
    Pan = tslib_1.__decorate([
        event("pan")
    ], Pan);
    return Pan;
}(PointEvent));
exports.Pan = Pan;
var Pinch = /** @class */ (function (_super) {
    tslib_1.__extends(Pinch, _super);
    function Pinch(sx, sy, x, y, scale) {
        var _this = _super.call(this, sx, sy, x, y) || this;
        _this.sx = sx;
        _this.sy = sy;
        _this.x = x;
        _this.y = y;
        _this.scale = scale;
        return _this;
    }
    Pinch.prototype._to_json = function () {
        var scale = this.scale;
        return tslib_1.__assign({}, _super.prototype._to_json.call(this), { scale: scale });
    };
    Pinch = tslib_1.__decorate([
        event("pinch")
    ], Pinch);
    return Pinch;
}(PointEvent));
exports.Pinch = Pinch;
var MouseWheel = /** @class */ (function (_super) {
    tslib_1.__extends(MouseWheel, _super);
    function MouseWheel(sx, sy, x, y, delta) {
        var _this = _super.call(this, sx, sy, x, y) || this;
        _this.sx = sx;
        _this.sy = sy;
        _this.x = x;
        _this.y = y;
        _this.delta = delta;
        return _this;
    }
    MouseWheel.prototype._to_json = function () {
        var delta = this.delta;
        return tslib_1.__assign({}, _super.prototype._to_json.call(this), { delta: delta });
    };
    MouseWheel = tslib_1.__decorate([
        event("wheel")
    ], MouseWheel);
    return MouseWheel;
}(PointEvent));
exports.MouseWheel = MouseWheel;
var MouseMove = /** @class */ (function (_super) {
    tslib_1.__extends(MouseMove, _super);
    function MouseMove() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    MouseMove = tslib_1.__decorate([
        event("mousemove")
    ], MouseMove);
    return MouseMove;
}(PointEvent));
exports.MouseMove = MouseMove;
var MouseEnter = /** @class */ (function (_super) {
    tslib_1.__extends(MouseEnter, _super);
    function MouseEnter() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    MouseEnter = tslib_1.__decorate([
        event("mouseenter")
    ], MouseEnter);
    return MouseEnter;
}(PointEvent));
exports.MouseEnter = MouseEnter;
var MouseLeave = /** @class */ (function (_super) {
    tslib_1.__extends(MouseLeave, _super);
    function MouseLeave() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    MouseLeave = tslib_1.__decorate([
        event("mouseleave")
    ], MouseLeave);
    return MouseLeave;
}(PointEvent));
exports.MouseLeave = MouseLeave;
var Tap = /** @class */ (function (_super) {
    tslib_1.__extends(Tap, _super);
    function Tap() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Tap = tslib_1.__decorate([
        event("tap")
    ], Tap);
    return Tap;
}(PointEvent));
exports.Tap = Tap;
var DoubleTap = /** @class */ (function (_super) {
    tslib_1.__extends(DoubleTap, _super);
    function DoubleTap() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    DoubleTap = tslib_1.__decorate([
        event("doubletap")
    ], DoubleTap);
    return DoubleTap;
}(PointEvent));
exports.DoubleTap = DoubleTap;
var Press = /** @class */ (function (_super) {
    tslib_1.__extends(Press, _super);
    function Press() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Press = tslib_1.__decorate([
        event("press")
    ], Press);
    return Press;
}(PointEvent));
exports.Press = Press;
var PanStart = /** @class */ (function (_super) {
    tslib_1.__extends(PanStart, _super);
    function PanStart() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    PanStart = tslib_1.__decorate([
        event("panstart")
    ], PanStart);
    return PanStart;
}(PointEvent));
exports.PanStart = PanStart;
var PanEnd = /** @class */ (function (_super) {
    tslib_1.__extends(PanEnd, _super);
    function PanEnd() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    PanEnd = tslib_1.__decorate([
        event("panend")
    ], PanEnd);
    return PanEnd;
}(PointEvent));
exports.PanEnd = PanEnd;
var PinchStart = /** @class */ (function (_super) {
    tslib_1.__extends(PinchStart, _super);
    function PinchStart() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    PinchStart = tslib_1.__decorate([
        event("pinchstart")
    ], PinchStart);
    return PinchStart;
}(PointEvent));
exports.PinchStart = PinchStart;
var PinchEnd = /** @class */ (function (_super) {
    tslib_1.__extends(PinchEnd, _super);
    function PinchEnd() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    PinchEnd = tslib_1.__decorate([
        event("pinchend")
    ], PinchEnd);
    return PinchEnd;
}(PointEvent));
exports.PinchEnd = PinchEnd;
