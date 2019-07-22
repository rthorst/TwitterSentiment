"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var proj = require("../../core/util/projections");
var object_1 = require("../../core/util/object");
var renderer_1 = require("../renderers/renderer");
var AnnotationView = /** @class */ (function (_super) {
    tslib_1.__extends(AnnotationView, _super);
    function AnnotationView() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Object.defineProperty(AnnotationView.prototype, "panel", {
        get: function () {
            return this.layout;
        },
        enumerable: true,
        configurable: true
    });
    AnnotationView.prototype.get_size = function () {
        if (this.model.visible) {
            var _a = this._get_size(), width = _a.width, height = _a.height;
            return { width: Math.round(width), height: Math.round(height) };
        }
        else
            return { width: 0, height: 0 };
    };
    AnnotationView.prototype.connect_signals = function () {
        var _this = this;
        _super.prototype.connect_signals.call(this);
        var p = this.model.properties;
        this.on_change(p.visible, function () { return _this.plot_view.request_layout(); });
    };
    AnnotationView.prototype._get_size = function () {
        throw new Error("not implemented");
    };
    Object.defineProperty(AnnotationView.prototype, "ctx", {
        get: function () {
            return this.plot_view.canvas_view.ctx;
        },
        enumerable: true,
        configurable: true
    });
    AnnotationView.prototype.set_data = function (source) {
        var _a, _b;
        var data = this.model.materialize_dataspecs(source);
        object_1.extend(this, data);
        if (this.plot_model.use_map) {
            var self_1 = this;
            if (self_1._x != null)
                _a = proj.project_xy(self_1._x, self_1._y), self_1._x = _a[0], self_1._y = _a[1];
            if (self_1._xs != null)
                _b = proj.project_xsys(self_1._xs, self_1._ys), self_1._xs = _b[0], self_1._ys = _b[1];
        }
    };
    Object.defineProperty(AnnotationView.prototype, "needs_clip", {
        get: function () {
            return this.layout == null; // TODO: change this, when center layout is fully implemented
        },
        enumerable: true,
        configurable: true
    });
    AnnotationView.prototype.serializable_state = function () {
        var state = _super.prototype.serializable_state.call(this);
        return this.layout == null ? state : tslib_1.__assign({}, state, { bbox: this.layout.bbox.rect });
    };
    return AnnotationView;
}(renderer_1.RendererView));
exports.AnnotationView = AnnotationView;
var Annotation = /** @class */ (function (_super) {
    tslib_1.__extends(Annotation, _super);
    function Annotation(attrs) {
        return _super.call(this, attrs) || this;
    }
    Annotation.initClass = function () {
        this.prototype.type = 'Annotation';
        this.override({
            level: 'annotation',
        });
    };
    return Annotation;
}(renderer_1.Renderer));
exports.Annotation = Annotation;
Annotation.initClass();
