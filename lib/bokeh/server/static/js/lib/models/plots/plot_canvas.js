"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var cartesian_frame_1 = require("../canvas/cartesian_frame");
var canvas_1 = require("../canvas/canvas");
var data_range1d_1 = require("../ranges/data_range1d");
var glyph_renderer_1 = require("../renderers/glyph_renderer");
var layout_dom_1 = require("../layouts/layout_dom");
var title_1 = require("../annotations/title");
var axis_1 = require("../axes/axis");
var toolbar_panel_1 = require("../annotations/toolbar_panel");
var bokeh_events_1 = require("../../core/bokeh_events");
var signaling_1 = require("../../core/signaling");
var build_views_1 = require("../../core/build_views");
var visuals_1 = require("../../core/visuals");
var logging_1 = require("../../core/logging");
var throttle_1 = require("../../core/util/throttle");
var types_1 = require("../../core/util/types");
var array_1 = require("../../core/util/array");
var object_1 = require("../../core/util/object");
var layout_1 = require("../../core/layout");
var alignments_1 = require("../../core/layout/alignments");
var side_panel_1 = require("../../core/layout/side_panel");
var grid_1 = require("../../core/layout/grid");
var bbox_1 = require("../../core/util/bbox");
var global_gl = null;
var PlotLayout = /** @class */ (function (_super) {
    tslib_1.__extends(PlotLayout, _super);
    function PlotLayout() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.min_border = { left: 0, top: 0, right: 0, bottom: 0 };
        return _this;
    }
    PlotLayout.prototype._measure = function (viewport) {
        var _this = this;
        viewport = new layout_1.Sizeable(viewport).bounded_to(this.sizing.size);
        var left_hint = this.left_panel.measure({ width: 0, height: viewport.height });
        var left = Math.max(left_hint.width, this.min_border.left);
        var right_hint = this.right_panel.measure({ width: 0, height: viewport.height });
        var right = Math.max(right_hint.width, this.min_border.right);
        var top_hint = this.top_panel.measure({ width: viewport.width, height: 0 });
        var top = Math.max(top_hint.height, this.min_border.top);
        var bottom_hint = this.bottom_panel.measure({ width: viewport.width, height: 0 });
        var bottom = Math.max(bottom_hint.height, this.min_border.bottom);
        var center_viewport = new layout_1.Sizeable(viewport).shrink_by({ left: left, right: right, top: top, bottom: bottom });
        var center = this.center_panel.measure(center_viewport);
        var width = left + center.width + right;
        var height = top + center.height + bottom;
        var align = (function () {
            var _a = _this.center_panel.sizing, width_policy = _a.width_policy, height_policy = _a.height_policy;
            return width_policy != "fixed" && height_policy != "fixed";
        })();
        return { width: width, height: height, inner: { left: left, right: right, top: top, bottom: bottom }, align: align };
    };
    PlotLayout.prototype._set_geometry = function (outer, inner) {
        _super.prototype._set_geometry.call(this, outer, inner);
        this.center_panel.set_geometry(inner);
        var left_hint = this.left_panel.measure({ width: 0, height: outer.height });
        var right_hint = this.right_panel.measure({ width: 0, height: outer.height });
        var top_hint = this.top_panel.measure({ width: outer.width, height: 0 });
        var bottom_hint = this.bottom_panel.measure({ width: outer.width, height: 0 });
        var left = inner.left, top = inner.top, right = inner.right, bottom = inner.bottom;
        this.top_panel.set_geometry(new bbox_1.BBox({ left: left, right: right, bottom: top, height: top_hint.height }));
        this.bottom_panel.set_geometry(new bbox_1.BBox({ left: left, right: right, top: bottom, height: bottom_hint.height }));
        this.left_panel.set_geometry(new bbox_1.BBox({ top: top, bottom: bottom, right: left, width: left_hint.width }));
        this.right_panel.set_geometry(new bbox_1.BBox({ top: top, bottom: bottom, left: right, width: right_hint.width }));
    };
    return PlotLayout;
}(layout_1.Layoutable));
exports.PlotLayout = PlotLayout;
var PlotView = /** @class */ (function (_super) {
    tslib_1.__extends(PlotView, _super);
    function PlotView() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this._outer_bbox = new bbox_1.BBox();
        _this._inner_bbox = new bbox_1.BBox();
        _this._needs_paint = true;
        _this._needs_layout = false;
        return _this;
    }
    Object.defineProperty(PlotView.prototype, "canvas_overlays", {
        get: function () {
            return this.canvas_view.overlays_el;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PlotView.prototype, "canvas_events", {
        get: function () {
            return this.canvas_view.events_el;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PlotView.prototype, "is_paused", {
        get: function () {
            return this._is_paused != null && this._is_paused !== 0;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PlotView.prototype, "child_models", {
        get: function () {
            return [];
        },
        enumerable: true,
        configurable: true
    });
    PlotView.prototype.pause = function () {
        if (this._is_paused == null)
            this._is_paused = 1;
        else
            this._is_paused += 1;
    };
    PlotView.prototype.unpause = function (no_render) {
        if (no_render === void 0) { no_render = false; }
        if (this._is_paused == null)
            throw new Error("wasn't paused");
        this._is_paused -= 1;
        if (this._is_paused == 0 && !no_render)
            this.request_paint();
    };
    // TODO: this needs to be removed
    PlotView.prototype.request_render = function () {
        this.request_paint();
    };
    PlotView.prototype.request_paint = function () {
        if (!this.is_paused)
            this.throttled_paint();
    };
    PlotView.prototype.request_layout = function () {
        this._needs_layout = true;
        this.request_paint();
    };
    PlotView.prototype.reset = function () {
        if (this.model.reset_policy == "standard") {
            this.clear_state();
            this.reset_range();
            this.reset_selection();
        }
        this.model.trigger_event(new bokeh_events_1.Reset());
    };
    PlotView.prototype.remove = function () {
        this.ui_event_bus.destroy();
        build_views_1.remove_views(this.renderer_views);
        build_views_1.remove_views(this.tool_views);
        this.canvas_view.remove();
        _super.prototype.remove.call(this);
    };
    PlotView.prototype.render = function () {
        _super.prototype.render.call(this);
        this.el.appendChild(this.canvas_view.el);
        this.canvas_view.render();
    };
    PlotView.prototype.initialize = function () {
        var _this = this;
        this.pause();
        _super.prototype.initialize.call(this);
        this.force_paint = new signaling_1.Signal0(this, "force_paint");
        this.state_changed = new signaling_1.Signal0(this, "state_changed");
        this.lod_started = false;
        this.visuals = new visuals_1.Visuals(this.model); // XXX
        this._initial_state_info = {
            selection: {},
            dimensions: { width: 0, height: 0 },
        };
        this.visibility_callbacks = [];
        this.state = { history: [], index: -1 };
        this.canvas = new canvas_1.Canvas({
            map: this.model.use_map || false,
            use_hidpi: this.model.hidpi,
            output_backend: this.model.output_backend,
        });
        this.frame = new cartesian_frame_1.CartesianFrame(this.model.x_scale, this.model.y_scale, this.model.x_range, this.model.y_range, this.model.extra_x_ranges, this.model.extra_y_ranges);
        this.canvas_view = new this.canvas.default_view({ model: this.canvas, parent: this });
        // If requested, try enabling webgl
        if (this.model.output_backend == "webgl")
            this.init_webgl();
        this.throttled_paint = throttle_1.throttle((function () { return _this.force_paint.emit(); }), 15); // TODO (bev) configurable
        // XXX: lazy value import to avoid touching window
        var UIEvents = require("../../core/ui_events").UIEvents;
        this.ui_event_bus = new UIEvents(this, this.model.toolbar, this.canvas_view.events_el);
        var _a = this.model, title_location = _a.title_location, title = _a.title;
        if (title_location != null && title != null) {
            this._title = title instanceof title_1.Title ? title : new title_1.Title({ text: title });
        }
        var _b = this.model, toolbar_location = _b.toolbar_location, toolbar = _b.toolbar;
        if (toolbar_location != null && toolbar != null) {
            this._toolbar = new toolbar_panel_1.ToolbarPanel({ toolbar: toolbar });
            toolbar.toolbar_location = toolbar_location;
        }
        this.renderer_views = {};
        this.tool_views = {};
        this.build_renderer_views();
        this.build_tool_views();
        this.update_dataranges();
        this.unpause(true);
        logging_1.logger.debug("PlotView initialized");
    };
    PlotView.prototype._width_policy = function () {
        return this.model.frame_width == null ? _super.prototype._width_policy.call(this) : "min";
    };
    PlotView.prototype._height_policy = function () {
        return this.model.frame_height == null ? _super.prototype._height_policy.call(this) : "min";
    };
    PlotView.prototype._update_layout = function () {
        var _this = this;
        this.layout = new PlotLayout();
        this.layout.set_sizing(this.box_sizing());
        var _a = this.model, frame_width = _a.frame_width, frame_height = _a.frame_height;
        this.layout.center_panel = this.frame;
        this.layout.center_panel.set_sizing(tslib_1.__assign({}, (frame_width != null ? { width_policy: "fixed", width: frame_width } : { width_policy: "fit" }), (frame_height != null ? { height_policy: "fixed", height: frame_height } : { height_policy: "fit" })));
        var above = array_1.copy(this.model.above);
        var below = array_1.copy(this.model.below);
        var left = array_1.copy(this.model.left);
        var right = array_1.copy(this.model.right);
        var get_side = function (side) {
            switch (side) {
                case "above": return above;
                case "below": return below;
                case "left": return left;
                case "right": return right;
            }
        };
        var _b = this.model, title_location = _b.title_location, title = _b.title;
        if (title_location != null && title != null) {
            get_side(title_location).push(this._title);
        }
        var _c = this.model, toolbar_location = _c.toolbar_location, toolbar = _c.toolbar;
        if (toolbar_location != null && toolbar != null) {
            var panels = get_side(toolbar_location);
            var push_toolbar = true;
            if (this.model.toolbar_sticky) {
                for (var i = 0; i < panels.length; i++) {
                    var panel = panels[i];
                    if (panel instanceof title_1.Title) {
                        if (toolbar_location == "above" || toolbar_location == "below")
                            panels[i] = [panel, this._toolbar];
                        else
                            panels[i] = [this._toolbar, panel];
                        push_toolbar = false;
                        break;
                    }
                }
            }
            if (push_toolbar)
                panels.push(this._toolbar);
        }
        var set_layout = function (side, model) {
            var view = _this.renderer_views[model.id];
            return view.layout = new side_panel_1.SidePanel(side, view);
        };
        var set_layouts = function (side, panels) {
            var horizontal = side == "above" || side == "below";
            var layouts = [];
            for (var _i = 0, panels_1 = panels; _i < panels_1.length; _i++) {
                var panel = panels_1[_i];
                if (types_1.isArray(panel)) {
                    var items = panel.map(function (subpanel) {
                        var _a;
                        var item = set_layout(side, subpanel);
                        if (subpanel instanceof toolbar_panel_1.ToolbarPanel) {
                            var dim = horizontal ? "width_policy" : "height_policy";
                            item.set_sizing(tslib_1.__assign({}, item.sizing, (_a = {}, _a[dim] = "min", _a)));
                        }
                        return item;
                    });
                    var layout = void 0;
                    if (horizontal) {
                        layout = new grid_1.Row(items);
                        layout.set_sizing({ width_policy: "max", height_policy: "min" });
                    }
                    else {
                        layout = new grid_1.Column(items);
                        layout.set_sizing({ width_policy: "min", height_policy: "max" });
                    }
                    layout.absolute = true;
                    layouts.push(layout);
                }
                else
                    layouts.push(set_layout(side, panel));
            }
            return layouts;
        };
        var min_border = this.model.min_border != null ? this.model.min_border : 0;
        this.layout.min_border = {
            left: this.model.min_border_left != null ? this.model.min_border_left : min_border,
            top: this.model.min_border_top != null ? this.model.min_border_top : min_border,
            right: this.model.min_border_right != null ? this.model.min_border_right : min_border,
            bottom: this.model.min_border_bottom != null ? this.model.min_border_bottom : min_border,
        };
        var top_panel = new alignments_1.VStack();
        var bottom_panel = new alignments_1.VStack();
        var left_panel = new alignments_1.HStack();
        var right_panel = new alignments_1.HStack();
        top_panel.children = array_1.reversed(set_layouts("above", above));
        bottom_panel.children = set_layouts("below", below);
        left_panel.children = array_1.reversed(set_layouts("left", left));
        right_panel.children = set_layouts("right", right);
        top_panel.set_sizing({ width_policy: "fit", height_policy: "min" /*, min_height: this.layout.min_border.top*/ });
        bottom_panel.set_sizing({ width_policy: "fit", height_policy: "min" /*, min_height: this.layout.min_width.bottom*/ });
        left_panel.set_sizing({ width_policy: "min", height_policy: "fit" /*, min_width: this.layout.min_width.left*/ });
        right_panel.set_sizing({ width_policy: "min", height_policy: "fit" /*, min_width: this.layout.min_width.right*/ });
        this.layout.top_panel = top_panel;
        this.layout.bottom_panel = bottom_panel;
        this.layout.left_panel = left_panel;
        this.layout.right_panel = right_panel;
    };
    Object.defineProperty(PlotView.prototype, "axis_views", {
        get: function () {
            var views = [];
            for (var id in this.renderer_views) {
                var child_view = this.renderer_views[id];
                if (child_view instanceof axis_1.AxisView)
                    views.push(child_view);
            }
            return views;
        },
        enumerable: true,
        configurable: true
    });
    PlotView.prototype.set_cursor = function (cursor) {
        if (cursor === void 0) { cursor = "default"; }
        this.canvas_view.el.style.cursor = cursor;
    };
    PlotView.prototype.set_toolbar_visibility = function (visible) {
        for (var _i = 0, _a = this.visibility_callbacks; _i < _a.length; _i++) {
            var callback = _a[_i];
            callback(visible);
        }
    };
    PlotView.prototype.init_webgl = function () {
        // We use a global invisible canvas and gl context. By having a global context,
        // we avoid the limitation of max 16 contexts that most browsers have.
        if (global_gl == null) {
            var canvas = document.createElement('canvas');
            var opts = { premultipliedAlpha: true };
            var ctx = canvas.getContext("webgl", opts) || canvas.getContext("experimental-webgl", opts);
            // If WebGL is available, we store a reference to the gl canvas on
            // the ctx object, because that's what gets passed everywhere.
            if (ctx != null)
                global_gl = { canvas: canvas, ctx: ctx };
        }
        if (global_gl != null)
            this.gl = global_gl;
        else
            logging_1.logger.warn('WebGL is not supported, falling back to 2D canvas.');
    };
    PlotView.prototype.prepare_webgl = function (ratio, frame_box) {
        // Prepare WebGL for a drawing pass
        if (this.gl != null) {
            var canvas = this.canvas_view.get_canvas_element();
            // Sync canvas size
            this.gl.canvas.width = canvas.width;
            this.gl.canvas.height = canvas.height;
            var gl = this.gl.ctx;
            // Clipping
            gl.enable(gl.SCISSOR_TEST);
            var sx = frame_box[0], sy = frame_box[1], w = frame_box[2], h = frame_box[3];
            var _a = this.canvas_view.bbox, xview = _a.xview, yview = _a.yview;
            var vx = xview.compute(sx);
            var vy = yview.compute(sy + h);
            gl.scissor(ratio * vx, ratio * vy, ratio * w, ratio * h); // lower left corner, width, height
            // Setup blending
            gl.enable(gl.BLEND);
            gl.blendFuncSeparate(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA, gl.ONE_MINUS_DST_ALPHA, gl.ONE); // premultipliedAlpha == true
        }
    };
    PlotView.prototype.clear_webgl = function () {
        if (this.gl != null) {
            // Prepare GL for drawing
            var gl = this.gl.ctx;
            gl.viewport(0, 0, this.gl.canvas.width, this.gl.canvas.height);
            gl.clearColor(0, 0, 0, 0);
            gl.clear(gl.COLOR_BUFFER_BIT || gl.DEPTH_BUFFER_BIT);
        }
    };
    PlotView.prototype.blit_webgl = function () {
        // This should be called when the ctx has no state except the HIDPI transform
        var ctx = this.canvas_view.ctx;
        if (this.gl != null) {
            // Blit gl canvas into the 2D canvas. To do 1-on-1 blitting, we need
            // to remove the hidpi transform, then blit, then restore.
            // ctx.globalCompositeOperation = "source-over"  -> OK; is the default
            logging_1.logger.debug('drawing with WebGL');
            ctx.restore();
            ctx.drawImage(this.gl.canvas, 0, 0);
            // Set back hidpi transform
            ctx.save();
            var ratio = this.canvas.pixel_ratio;
            ctx.scale(ratio, ratio);
            ctx.translate(0.5, 0.5);
        }
    };
    PlotView.prototype.update_dataranges = function () {
        // Update any DataRange1ds here
        var bounds = {};
        var log_bounds = {};
        var calculate_log_bounds = false;
        for (var _i = 0, _a = object_1.values(this.frame.x_ranges).concat(object_1.values(this.frame.y_ranges)); _i < _a.length; _i++) {
            var r_1 = _a[_i];
            if (r_1 instanceof data_range1d_1.DataRange1d) {
                if (r_1.scale_hint == "log")
                    calculate_log_bounds = true;
            }
        }
        for (var id in this.renderer_views) {
            var view = this.renderer_views[id];
            if (view instanceof glyph_renderer_1.GlyphRendererView) {
                var bds = view.glyph.bounds();
                if (bds != null)
                    bounds[id] = bds;
                if (calculate_log_bounds) {
                    var log_bds = view.glyph.log_bounds();
                    if (log_bds != null)
                        log_bounds[id] = log_bds;
                }
            }
        }
        var follow_enabled = false;
        var has_bounds = false;
        var _b = this.frame.bbox, width = _b.width, height = _b.height;
        var r;
        if (this.model.match_aspect !== false && width != 0 && height != 0)
            r = (1 / this.model.aspect_scale) * (width / height);
        for (var _c = 0, _d = object_1.values(this.frame.x_ranges); _c < _d.length; _c++) {
            var xr = _d[_c];
            if (xr instanceof data_range1d_1.DataRange1d) {
                var bounds_to_use = xr.scale_hint == "log" ? log_bounds : bounds;
                xr.update(bounds_to_use, 0, this.model.id, r);
                if (xr.follow) {
                    follow_enabled = true;
                }
            }
            if (xr.bounds != null)
                has_bounds = true;
        }
        for (var _e = 0, _f = object_1.values(this.frame.y_ranges); _e < _f.length; _e++) {
            var yr = _f[_e];
            if (yr instanceof data_range1d_1.DataRange1d) {
                var bounds_to_use = yr.scale_hint == "log" ? log_bounds : bounds;
                yr.update(bounds_to_use, 1, this.model.id, r);
                if (yr.follow) {
                    follow_enabled = true;
                }
            }
            if (yr.bounds != null)
                has_bounds = true;
        }
        if (follow_enabled && has_bounds) {
            logging_1.logger.warn('Follow enabled so bounds are unset.');
            for (var _g = 0, _h = object_1.values(this.frame.x_ranges); _g < _h.length; _g++) {
                var xr = _h[_g];
                xr.bounds = null;
            }
            for (var _j = 0, _k = object_1.values(this.frame.y_ranges); _j < _k.length; _j++) {
                var yr = _k[_j];
                yr.bounds = null;
            }
        }
        this.range_update_timestamp = Date.now();
    };
    PlotView.prototype.map_to_screen = function (x, y, x_name, y_name) {
        if (x_name === void 0) { x_name = "default"; }
        if (y_name === void 0) { y_name = "default"; }
        return this.frame.map_to_screen(x, y, x_name, y_name);
    };
    PlotView.prototype.push_state = function (type, new_info) {
        var _a = this.state, history = _a.history, index = _a.index;
        var prev_info = history[index] != null ? history[index].info : {};
        var info = tslib_1.__assign({}, this._initial_state_info, prev_info, new_info);
        this.state.history = this.state.history.slice(0, this.state.index + 1);
        this.state.history.push({ type: type, info: info });
        this.state.index = this.state.history.length - 1;
        this.state_changed.emit();
    };
    PlotView.prototype.clear_state = function () {
        this.state = { history: [], index: -1 };
        this.state_changed.emit();
    };
    PlotView.prototype.can_undo = function () {
        return this.state.index >= 0;
    };
    PlotView.prototype.can_redo = function () {
        return this.state.index < this.state.history.length - 1;
    };
    PlotView.prototype.undo = function () {
        if (this.can_undo()) {
            this.state.index -= 1;
            this._do_state_change(this.state.index);
            this.state_changed.emit();
        }
    };
    PlotView.prototype.redo = function () {
        if (this.can_redo()) {
            this.state.index += 1;
            this._do_state_change(this.state.index);
            this.state_changed.emit();
        }
    };
    PlotView.prototype._do_state_change = function (index) {
        var info = this.state.history[index] != null ? this.state.history[index].info : this._initial_state_info;
        if (info.range != null)
            this.update_range(info.range);
        if (info.selection != null)
            this.update_selection(info.selection);
    };
    PlotView.prototype.get_selection = function () {
        var selection = {};
        for (var _i = 0, _a = this.model.renderers; _i < _a.length; _i++) {
            var renderer = _a[_i];
            if (renderer instanceof glyph_renderer_1.GlyphRenderer) {
                var selected = renderer.data_source.selected;
                selection[renderer.id] = selected;
            }
        }
        return selection;
    };
    PlotView.prototype.update_selection = function (selection) {
        for (var _i = 0, _a = this.model.renderers; _i < _a.length; _i++) {
            var renderer = _a[_i];
            if (!(renderer instanceof glyph_renderer_1.GlyphRenderer))
                continue;
            var ds = renderer.data_source;
            if (selection != null) {
                if (selection[renderer.id] != null)
                    ds.selected.update(selection[renderer.id], true, false);
            }
            else
                ds.selection_manager.clear();
        }
    };
    PlotView.prototype.reset_selection = function () {
        this.update_selection(null);
    };
    PlotView.prototype._update_ranges_together = function (range_info_iter) {
        // Get weight needed to scale the diff of the range to honor interval limits
        var weight = 1.0;
        for (var _i = 0, range_info_iter_1 = range_info_iter; _i < range_info_iter_1.length; _i++) {
            var _a = range_info_iter_1[_i], rng = _a[0], range_info = _a[1];
            weight = Math.min(weight, this._get_weight_to_constrain_interval(rng, range_info));
        }
        // Apply shared weight to all ranges
        if (weight < 1) {
            for (var _b = 0, range_info_iter_2 = range_info_iter; _b < range_info_iter_2.length; _b++) {
                var _c = range_info_iter_2[_b], rng = _c[0], range_info = _c[1];
                range_info.start = weight * range_info.start + (1 - weight) * rng.start;
                range_info.end = weight * range_info.end + (1 - weight) * rng.end;
            }
        }
    };
    PlotView.prototype._update_ranges_individually = function (range_info_iter, is_panning, is_scrolling, maintain_focus) {
        var hit_bound = false;
        for (var _i = 0, range_info_iter_3 = range_info_iter; _i < range_info_iter_3.length; _i++) {
            var _a = range_info_iter_3[_i], rng = _a[0], range_info = _a[1];
            // Limit range interval first. Note that for scroll events,
            // the interval has already been limited for all ranges simultaneously
            if (!is_scrolling) {
                var weight = this._get_weight_to_constrain_interval(rng, range_info);
                if (weight < 1) {
                    range_info.start = weight * range_info.start + (1 - weight) * rng.start;
                    range_info.end = weight * range_info.end + (1 - weight) * rng.end;
                }
            }
            // Prevent range from going outside limits
            // Also ensure that range keeps the same delta when panning/scrolling
            if (rng.bounds != null && rng.bounds != "auto") { // check `auto` for type-checking purpose
                var _b = rng.bounds, min = _b[0], max = _b[1];
                var new_interval = Math.abs(range_info.end - range_info.start);
                if (rng.is_reversed) {
                    if (min != null) {
                        if (min >= range_info.end) {
                            hit_bound = true;
                            range_info.end = min;
                            if (is_panning || is_scrolling) {
                                range_info.start = min + new_interval;
                            }
                        }
                    }
                    if (max != null) {
                        if (max <= range_info.start) {
                            hit_bound = true;
                            range_info.start = max;
                            if (is_panning || is_scrolling) {
                                range_info.end = max - new_interval;
                            }
                        }
                    }
                }
                else {
                    if (min != null) {
                        if (min >= range_info.start) {
                            hit_bound = true;
                            range_info.start = min;
                            if (is_panning || is_scrolling) {
                                range_info.end = min + new_interval;
                            }
                        }
                    }
                    if (max != null) {
                        if (max <= range_info.end) {
                            hit_bound = true;
                            range_info.end = max;
                            if (is_panning || is_scrolling) {
                                range_info.start = max - new_interval;
                            }
                        }
                    }
                }
            }
        }
        // Cancel the event when hitting a bound while scrolling. This ensures that
        // the scroll-zoom tool maintains its focus position. Setting `maintain_focus`
        // to false results in a more "gliding" behavior, allowing one to
        // zoom out more smoothly, at the cost of losing the focus position.
        if (is_scrolling && hit_bound && maintain_focus)
            return;
        for (var _c = 0, range_info_iter_4 = range_info_iter; _c < range_info_iter_4.length; _c++) {
            var _d = range_info_iter_4[_c], rng = _d[0], range_info = _d[1];
            rng.have_updated_interactively = true;
            if (rng.start != range_info.start || rng.end != range_info.end)
                rng.setv(range_info);
        }
    };
    PlotView.prototype._get_weight_to_constrain_interval = function (rng, range_info) {
        // Get the weight by which a range-update can be applied
        // to still honor the interval limits (including the implicit
        // max interval imposed by the bounds)
        var min_interval = rng.min_interval;
        var max_interval = rng.max_interval;
        // Express bounds as a max_interval. By doing this, the application of
        // bounds and interval limits can be applied independent from each-other.
        if (rng.bounds != null && rng.bounds != "auto") { // check `auto` for type-checking purpose
            var _a = rng.bounds, min = _a[0], max = _a[1];
            if (min != null && max != null) {
                var max_interval2 = Math.abs(max - min);
                max_interval = max_interval != null ? Math.min(max_interval, max_interval2) : max_interval2;
            }
        }
        var weight = 1.0;
        if (min_interval != null || max_interval != null) {
            var old_interval = Math.abs(rng.end - rng.start);
            var new_interval = Math.abs(range_info.end - range_info.start);
            if (min_interval > 0 && new_interval < min_interval) {
                weight = (old_interval - min_interval) / (old_interval - new_interval);
            }
            if (max_interval > 0 && new_interval > max_interval) {
                weight = (max_interval - old_interval) / (new_interval - old_interval);
            }
            weight = Math.max(0.0, Math.min(1.0, weight));
        }
        return weight;
    };
    PlotView.prototype.update_range = function (range_info, is_panning, is_scrolling, maintain_focus) {
        if (is_panning === void 0) { is_panning = false; }
        if (is_scrolling === void 0) { is_scrolling = false; }
        if (maintain_focus === void 0) { maintain_focus = true; }
        this.pause();
        var _a = this.frame, x_ranges = _a.x_ranges, y_ranges = _a.y_ranges;
        if (range_info == null) {
            for (var name_1 in x_ranges) {
                var rng = x_ranges[name_1];
                rng.reset();
            }
            for (var name_2 in y_ranges) {
                var rng = y_ranges[name_2];
                rng.reset();
            }
            this.update_dataranges();
        }
        else {
            var range_info_iter = [];
            for (var name_3 in x_ranges) {
                var rng = x_ranges[name_3];
                range_info_iter.push([rng, range_info.xrs[name_3]]);
            }
            for (var name_4 in y_ranges) {
                var rng = y_ranges[name_4];
                range_info_iter.push([rng, range_info.yrs[name_4]]);
            }
            if (is_scrolling) {
                this._update_ranges_together(range_info_iter); // apply interval bounds while keeping aspect
            }
            this._update_ranges_individually(range_info_iter, is_panning, is_scrolling, maintain_focus);
        }
        this.unpause();
    };
    PlotView.prototype.reset_range = function () {
        this.update_range(null);
    };
    PlotView.prototype._invalidate_layout = function () {
        var _this = this;
        var needs_layout = function () {
            for (var _i = 0, _a = _this.model.side_panels; _i < _a.length; _i++) {
                var panel = _a[_i];
                var view = _this.renderer_views[panel.id];
                if (view.layout.has_size_changed())
                    return true;
            }
            return false;
        };
        if (needs_layout())
            this.root.compute_layout();
    };
    PlotView.prototype.build_renderer_views = function () {
        var _a, _b, _c, _d, _e, _f, _g;
        this.computed_renderers = [];
        (_a = this.computed_renderers).push.apply(_a, this.model.above);
        (_b = this.computed_renderers).push.apply(_b, this.model.below);
        (_c = this.computed_renderers).push.apply(_c, this.model.left);
        (_d = this.computed_renderers).push.apply(_d, this.model.right);
        (_e = this.computed_renderers).push.apply(_e, this.model.center);
        (_f = this.computed_renderers).push.apply(_f, this.model.renderers);
        if (this._title != null)
            this.computed_renderers.push(this._title);
        if (this._toolbar != null)
            this.computed_renderers.push(this._toolbar);
        for (var _i = 0, _h = this.model.toolbar.tools; _i < _h.length; _i++) {
            var tool = _h[_i];
            if (tool.overlay != null)
                this.computed_renderers.push(tool.overlay);
            (_g = this.computed_renderers).push.apply(_g, tool.synthetic_renderers);
        }
        build_views_1.build_views(this.renderer_views, this.computed_renderers, { parent: this });
    };
    PlotView.prototype.get_renderer_views = function () {
        var _this = this;
        return this.computed_renderers.map(function (r) { return _this.renderer_views[r.id]; });
    };
    PlotView.prototype.build_tool_views = function () {
        var _this = this;
        var tool_models = this.model.toolbar.tools;
        var new_tool_views = build_views_1.build_views(this.tool_views, tool_models, { parent: this });
        new_tool_views.map(function (tool_view) { return _this.ui_event_bus.register_tool(tool_view); });
    };
    PlotView.prototype.connect_signals = function () {
        var _this = this;
        _super.prototype.connect_signals.call(this);
        this.connect(this.force_paint, function () { return _this.repaint(); });
        var _a = this.frame, x_ranges = _a.x_ranges, y_ranges = _a.y_ranges;
        for (var name_5 in x_ranges) {
            var rng = x_ranges[name_5];
            this.connect(rng.change, function () { _this._needs_layout = true; _this.request_paint(); });
        }
        for (var name_6 in y_ranges) {
            var rng = y_ranges[name_6];
            this.connect(rng.change, function () { _this._needs_layout = true; _this.request_paint(); });
        }
        this.connect(this.model.properties.renderers.change, function () { return _this.build_renderer_views(); });
        this.connect(this.model.toolbar.properties.tools.change, function () { _this.build_renderer_views(); _this.build_tool_views(); });
        this.connect(this.model.change, function () { return _this.request_paint(); });
        this.connect(this.model.reset, function () { return _this.reset(); });
    };
    PlotView.prototype.set_initial_range = function () {
        // check for good values for ranges before setting initial range
        var good_vals = true;
        var _a = this.frame, x_ranges = _a.x_ranges, y_ranges = _a.y_ranges;
        var xrs = {};
        var yrs = {};
        for (var name_7 in x_ranges) {
            var _b = x_ranges[name_7], start = _b.start, end = _b.end;
            if (start == null || end == null || types_1.isStrictNaN(start + end)) {
                good_vals = false;
                break;
            }
            xrs[name_7] = { start: start, end: end };
        }
        if (good_vals) {
            for (var name_8 in y_ranges) {
                var _c = y_ranges[name_8], start = _c.start, end = _c.end;
                if (start == null || end == null || types_1.isStrictNaN(start + end)) {
                    good_vals = false;
                    break;
                }
                yrs[name_8] = { start: start, end: end };
            }
        }
        if (good_vals) {
            this._initial_state_info.range = { xrs: xrs, yrs: yrs };
            logging_1.logger.debug("initial ranges set");
        }
        else
            logging_1.logger.warn('could not set initial ranges');
    };
    PlotView.prototype.has_finished = function () {
        if (!_super.prototype.has_finished.call(this))
            return false;
        for (var id in this.renderer_views) {
            var view = this.renderer_views[id];
            if (!view.has_finished())
                return false;
        }
        return true;
    };
    PlotView.prototype.after_layout = function () {
        _super.prototype.after_layout.call(this);
        this._needs_layout = false;
        this.model.setv({
            inner_width: Math.round(this.frame._width.value),
            inner_height: Math.round(this.frame._height.value),
            outer_width: Math.round(this.layout._width.value),
            outer_height: Math.round(this.layout._height.value),
        }, { no_change: true });
        if (this.model.match_aspect !== false) {
            this.pause();
            this.update_dataranges();
            this.unpause(true);
        }
        if (!this._outer_bbox.equals(this.layout.bbox)) {
            var _a = this.layout.bbox, width = _a.width, height = _a.height;
            this.canvas_view.prepare_canvas(width, height);
            this._outer_bbox = this.layout.bbox;
            this._needs_paint = true;
        }
        if (!this._inner_bbox.equals(this.frame.inner_bbox)) {
            this._inner_bbox = this.layout.inner_bbox;
            this._needs_paint = true;
        }
        if (this._needs_paint) {
            // XXX: can't be this.request_paint(), because it would trigger back-and-forth
            // layout recomputing feedback loop between plots. Plots are also much more
            // responsive this way, especially in interactive mode.
            this._needs_paint = false;
            this.paint();
        }
    };
    PlotView.prototype.repaint = function () {
        if (this._needs_layout)
            this._invalidate_layout();
        this.paint();
    };
    PlotView.prototype.paint = function () {
        var _this = this;
        if (this.is_paused)
            return;
        logging_1.logger.trace("PlotView.paint() for " + this.model.id);
        var document = this.model.document;
        if (document != null) {
            var interactive_duration = document.interactive_duration();
            if (interactive_duration >= 0 && interactive_duration < this.model.lod_interval) {
                setTimeout(function () {
                    if (document.interactive_duration() > _this.model.lod_timeout) {
                        document.interactive_stop(_this.model);
                    }
                    _this.request_paint();
                }, this.model.lod_timeout);
            }
            else
                document.interactive_stop(this.model);
        }
        for (var id in this.renderer_views) {
            var v = this.renderer_views[id];
            if (this.range_update_timestamp == null ||
                (v instanceof glyph_renderer_1.GlyphRendererView && v.set_data_timestamp > this.range_update_timestamp)) {
                this.update_dataranges();
                break;
            }
        }
        var ctx = this.canvas_view.ctx;
        var ratio = this.canvas.pixel_ratio;
        // Set hidpi-transform
        ctx.save(); // Save default state, do *after* getting ratio, cause setting canvas.width resets transforms
        ctx.scale(ratio, ratio);
        ctx.translate(0.5, 0.5);
        var frame_box = [
            this.frame._left.value,
            this.frame._top.value,
            this.frame._width.value,
            this.frame._height.value,
        ];
        this._map_hook(ctx, frame_box);
        this._paint_empty(ctx, frame_box);
        this.prepare_webgl(ratio, frame_box);
        this.clear_webgl();
        if (this.visuals.outline_line.doit) {
            ctx.save();
            this.visuals.outline_line.set_value(ctx);
            var x0 = frame_box[0], y0 = frame_box[1], w = frame_box[2], h = frame_box[3];
            // XXX: shrink outline region by 1px to make right and bottom lines visible
            // if they are on the edge of the canvas.
            if (x0 + w == this.layout._width.value) {
                w -= 1;
            }
            if (y0 + h == this.layout._height.value) {
                h -= 1;
            }
            ctx.strokeRect(x0, y0, w, h);
            ctx.restore();
        }
        this._paint_levels(ctx, ['image', 'underlay', 'glyph'], frame_box, true);
        this._paint_levels(ctx, ['annotation'], frame_box, false);
        this._paint_levels(ctx, ['overlay'], frame_box, false);
        if (this._initial_state_info.range == null)
            this.set_initial_range();
        ctx.restore(); // Restore to default state
    };
    PlotView.prototype._paint_levels = function (ctx, levels, clip_region, global_clip) {
        for (var _i = 0, levels_1 = levels; _i < levels_1.length; _i++) {
            var level = levels_1[_i];
            for (var _a = 0, _b = this.computed_renderers; _a < _b.length; _a++) {
                var renderer = _b[_a];
                if (renderer.level != level)
                    continue;
                var renderer_view = this.renderer_views[renderer.id];
                ctx.save();
                if (global_clip || renderer_view.needs_clip) {
                    ctx.beginPath();
                    ctx.rect.apply(ctx, clip_region);
                    ctx.clip();
                }
                renderer_view.render();
                ctx.restore();
                if (renderer_view.has_webgl) {
                    this.blit_webgl();
                    this.clear_webgl();
                }
            }
        }
    };
    PlotView.prototype._map_hook = function (_ctx, _frame_box) { };
    PlotView.prototype._paint_empty = function (ctx, frame_box) {
        var _a = [0, 0, this.layout._width.value, this.layout._height.value], cx = _a[0], cy = _a[1], cw = _a[2], ch = _a[3];
        var fx = frame_box[0], fy = frame_box[1], fw = frame_box[2], fh = frame_box[3];
        ctx.clearRect(cx, cy, cw, ch);
        if (this.visuals.border_fill.doit) {
            this.visuals.border_fill.set_value(ctx);
            ctx.fillRect(cx, cy, cw, ch);
            ctx.clearRect(fx, fy, fw, fh);
        }
        if (this.visuals.background_fill.doit) {
            this.visuals.background_fill.set_value(ctx);
            ctx.fillRect(fx, fy, fw, fh);
        }
    };
    PlotView.prototype.save = function (name) {
        switch (this.model.output_backend) {
            case "canvas":
            case "webgl": {
                var canvas = this.canvas_view.get_canvas_element();
                if (canvas.msToBlob != null) {
                    var blob = canvas.msToBlob();
                    window.navigator.msSaveBlob(blob, name);
                }
                else {
                    var link = document.createElement('a');
                    link.href = canvas.toDataURL('image/png');
                    link.download = name + ".png";
                    link.target = "_blank";
                    link.dispatchEvent(new MouseEvent('click'));
                }
                break;
            }
            case "svg": {
                var ctx = this.canvas_view._ctx;
                var svg = ctx.getSerializedSvg(true);
                var svgblob = new Blob([svg], { type: 'text/plain' });
                var downloadLink = document.createElement("a");
                downloadLink.download = name + ".svg";
                downloadLink.innerHTML = "Download svg";
                downloadLink.href = window.URL.createObjectURL(svgblob);
                downloadLink.onclick = function (event) { return document.body.removeChild(event.target); };
                downloadLink.style.display = "none";
                document.body.appendChild(downloadLink);
                downloadLink.click();
                break;
            }
        }
    };
    PlotView.prototype.serializable_state = function () {
        var _a = _super.prototype.serializable_state.call(this), children = _a.children, state = tslib_1.__rest(_a, ["children"]);
        var renderers = this.get_renderer_views()
            .map(function (view) { return view.serializable_state(); })
            .filter(function (item) { return "bbox" in item; });
        return tslib_1.__assign({}, state, { children: children.concat(renderers) }); // XXX
    };
    return PlotView;
}(layout_dom_1.LayoutDOMView));
exports.PlotView = PlotView;
