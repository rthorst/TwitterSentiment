import { GestureTool, GestureToolView } from "./gesture_tool";
import { BoxAnnotation } from "../../annotations/box_annotation";
import { CartesianFrame } from "../../canvas/cartesian_frame";
import * as p from "../../../core/properties";
import { GestureEvent } from "../../../core/ui_events";
import { Dimensions, BoxOrigin } from "../../../core/enums";
export declare class BoxZoomToolView extends GestureToolView {
    model: BoxZoomTool;
    protected _base_point: [number, number] | null;
    _match_aspect(base_point: [number, number], curpoint: [number, number], frame: CartesianFrame): [[number, number], [number, number]];
    protected _compute_limits(curpoint: [number, number]): [[number, number], [number, number]];
    _pan_start(ev: GestureEvent): void;
    _pan(ev: GestureEvent): void;
    _pan_end(ev: GestureEvent): void;
    _update([sx0, sx1]: [number, number], [sy0, sy1]: [number, number]): void;
}
export declare namespace BoxZoomTool {
    type Attrs = p.AttrsOf<Props>;
    type Props = GestureTool.Props & {
        dimensions: p.Property<Dimensions>;
        overlay: p.Property<BoxAnnotation>;
        match_aspect: p.Property<boolean>;
        origin: p.Property<BoxOrigin>;
    };
}
export interface BoxZoomTool extends BoxZoomTool.Attrs {
}
export declare class BoxZoomTool extends GestureTool {
    properties: BoxZoomTool.Props;
    overlay: BoxAnnotation;
    constructor(attrs?: Partial<BoxZoomTool.Attrs>);
    static initClass(): void;
    tool_name: string;
    icon: string;
    event_type: "pan";
    default_order: number;
    readonly tooltip: string;
}
