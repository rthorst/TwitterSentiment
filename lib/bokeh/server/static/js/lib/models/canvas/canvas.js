"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var has_props_1 = require("../../core/has_props");
var dom_view_1 = require("../../core/dom_view");
var logging_1 = require("../../core/logging");
var p = require("../../core/properties");
var dom_1 = require("../../core/dom");
var bbox_1 = require("../../core/util/bbox");
var compat_1 = require("../../core/util/compat");
var canvas_1 = require("../../core/util/canvas");
// fixes up a problem with some versions of IE11
// ref: http://stackoverflow.com/questions/22062313/imagedata-set-in-internetexplorer
if (compat_1.is_ie && typeof CanvasPixelArray !== "undefined") {
    CanvasPixelArray.prototype.set = function (arr) {
        for (var i = 0; i < this.length; i++) {
            this[i] = arr[i];
        }
    };
}
var canvas2svg = require("canvas2svg");
var CanvasView = /** @class */ (function (_super) {
    tslib_1.__extends(CanvasView, _super);
    function CanvasView() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Object.defineProperty(CanvasView.prototype, "ctx", {
        get: function () {
            return this._ctx;
        },
        enumerable: true,
        configurable: true
    });
    CanvasView.prototype.initialize = function () {
        _super.prototype.initialize.call(this);
        this.map_el = this.model.map ? this.el.appendChild(dom_1.div({ class: "bk-canvas-map" })) : null;
        var style = {
            position: "absolute",
            top: "0",
            left: "0",
            width: "100%",
            height: "100%",
        };
        switch (this.model.output_backend) {
            case "canvas":
            case "webgl": {
                this.canvas_el = this.el.appendChild(dom_1.canvas({ class: "bk-canvas", style: style }));
                var ctx = this.canvas_el.getContext('2d');
                if (ctx == null)
                    throw new Error("unable to obtain 2D rendering context");
                this._ctx = ctx;
                break;
            }
            case "svg": {
                var ctx = new canvas2svg();
                this._ctx = ctx;
                this.canvas_el = this.el.appendChild(ctx.getSvg());
                break;
            }
        }
        this.overlays_el = this.el.appendChild(dom_1.div({ class: "bk-canvas-overlays", style: style }));
        this.events_el = this.el.appendChild(dom_1.div({ class: "bk-canvas-events", style: style }));
        canvas_1.fixup_ctx(this._ctx);
        logging_1.logger.debug("CanvasView initialized");
    };
    CanvasView.prototype.get_canvas_element = function () {
        return this.canvas_el;
    };
    CanvasView.prototype.prepare_canvas = function (width, height) {
        // Ensure canvas has the correct size, taking HIDPI into account
        this.bbox = new bbox_1.BBox({ left: 0, top: 0, width: width, height: height });
        this.el.style.width = width + "px";
        this.el.style.height = height + "px";
        var pixel_ratio = canvas_1.get_scale_ratio(this.ctx, this.model.use_hidpi, this.model.output_backend);
        this.model.pixel_ratio = pixel_ratio;
        this.canvas_el.style.width = width + "px";
        this.canvas_el.style.height = height + "px";
        // XXX: io.export and canvas2svg don't like this
        // this.canvas_el.width = width*pixel_ratio
        // this.canvas_el.height = height*pixel_ratio
        this.canvas_el.setAttribute("width", "" + width * pixel_ratio);
        this.canvas_el.setAttribute("height", "" + height * pixel_ratio);
        logging_1.logger.debug("Rendering CanvasView with width: " + width + ", height: " + height + ", pixel ratio: " + pixel_ratio);
    };
    return CanvasView;
}(dom_view_1.DOMView));
exports.CanvasView = CanvasView;
var Canvas = /** @class */ (function (_super) {
    tslib_1.__extends(Canvas, _super);
    function Canvas(attrs) {
        return _super.call(this, attrs) || this;
    }
    Canvas.initClass = function () {
        this.prototype.type = "Canvas";
        this.prototype.default_view = CanvasView;
        this.internal({
            map: [p.Boolean, false],
            use_hidpi: [p.Boolean, true],
            pixel_ratio: [p.Number, 1],
            output_backend: [p.OutputBackend, "canvas"],
        });
    };
    return Canvas;
}(has_props_1.HasProps));
exports.Canvas = Canvas;
Canvas.initClass();
