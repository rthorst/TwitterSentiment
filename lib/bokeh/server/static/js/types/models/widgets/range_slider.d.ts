import { AbstractSlider, AbstractSliderView, SliderSpec } from "./abstract_slider";
import * as p from "../../core/properties";
export declare class RangeSliderView extends AbstractSliderView {
    model: RangeSlider;
    protected _calc_to(): SliderSpec;
    protected _calc_from(values: number[]): number[];
}
export declare namespace RangeSlider {
    type Attrs = p.AttrsOf<Props>;
    type Props = AbstractSlider.Props;
}
export interface RangeSlider extends RangeSlider.Attrs {
}
export declare class RangeSlider extends AbstractSlider {
    properties: RangeSlider.Props;
    constructor(attrs?: Partial<RangeSlider.Attrs>);
    static initClass(): void;
    behaviour: "drag";
    connected: boolean[];
    protected _formatter(value: number, format: string): string;
}
