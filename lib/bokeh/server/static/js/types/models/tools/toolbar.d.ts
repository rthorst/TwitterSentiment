import * as p from "../../core/properties";
import { Tool } from "./tool";
import { GestureTool } from "./gestures/gesture_tool";
import { ToolbarBase } from "./toolbar_base";
export declare type Drag = Tool;
export declare type Inspection = Tool;
export declare type Scroll = Tool;
export declare type Tap = Tool;
export declare namespace Toolbar {
    type Attrs = p.AttrsOf<Props>;
    type Props = ToolbarBase.Props & {
        active_drag: p.Property<Drag | "auto">;
        active_inspect: p.Property<Inspection | Inspection[] | "auto" | null>;
        active_scroll: p.Property<Scroll | "auto">;
        active_tap: p.Property<Tap | "auto">;
        active_multi: p.Property<GestureTool | null>;
    };
}
export interface Toolbar extends Toolbar.Attrs {
}
export declare class Toolbar extends ToolbarBase {
    properties: Toolbar.Props;
    constructor(attrs?: Partial<Toolbar.Attrs>);
    static initClass(): void;
    initialize(): void;
    connect_signals(): void;
    protected _init_tools(): void;
}
