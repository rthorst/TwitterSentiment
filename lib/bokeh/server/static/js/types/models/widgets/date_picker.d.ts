import { InputWidget, InputWidgetView } from "./input_widget";
import * as p from "../../core/properties";
export declare class DatePickerView extends InputWidgetView {
    model: DatePicker;
    protected input_el: HTMLInputElement;
    private _picker;
    render(): void;
    _on_select(date: Date): void;
}
export declare namespace DatePicker {
    type Attrs = p.AttrsOf<Props>;
    type Props = InputWidget.Props & {
        value: p.Property<string>;
        min_date: p.Property<string>;
        max_date: p.Property<string>;
    };
}
export interface DatePicker extends DatePicker.Attrs {
}
export declare class DatePicker extends InputWidget {
    properties: DatePicker.Props;
    constructor(attrs?: Partial<DatePicker.Attrs>);
    static initClass(): void;
}
