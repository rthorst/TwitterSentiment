"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var signaling_1 = require("./signaling");
var types_1 = require("./util/types");
var string_1 = require("./util/string");
var View = /** @class */ (function (_super) {
    tslib_1.__extends(View, _super);
    function View(options) {
        var _this = _super.call(this) || this;
        _this.removed = new signaling_1.Signal0(_this, "removed");
        if (options.model != null)
            _this.model = options.model;
        else
            throw new Error("model of a view wasn't configured");
        _this._parent = options.parent;
        _this.id = options.id || string_1.uniqueId();
        _this.initialize();
        if (options.connect_signals !== false)
            _this.connect_signals();
        return _this;
    }
    View.prototype.initialize = function () { };
    View.prototype.remove = function () {
        this._parent = undefined;
        this.disconnect_signals();
        this.removed.emit();
    };
    View.prototype.toString = function () {
        return this.model.type + "View(" + this.id + ")";
    };
    View.prototype.serializable_state = function () {
        return { type: this.model.type };
    };
    Object.defineProperty(View.prototype, "parent", {
        get: function () {
            if (this._parent !== undefined)
                return this._parent;
            else
                throw new Error("parent of a view wasn't configured");
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(View.prototype, "is_root", {
        get: function () {
            return this.parent === null;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(View.prototype, "root", {
        get: function () {
            return this.is_root ? this : this.parent.root;
        },
        enumerable: true,
        configurable: true
    });
    View.prototype.assert_root = function () {
        if (!this.is_root)
            throw new Error(this.toString() + " is not a root layout");
    };
    View.prototype.connect_signals = function () { };
    View.prototype.disconnect_signals = function () {
        signaling_1.Signal.disconnectReceiver(this);
    };
    View.prototype.on_change = function (properties, fn) {
        for (var _i = 0, _a = types_1.isArray(properties) ? properties : [properties]; _i < _a.length; _i++) {
            var property = _a[_i];
            this.connect(property.change, fn);
        }
    };
    return View;
}(signaling_1.Signalable()));
exports.View = View;
