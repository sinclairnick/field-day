import { FieldMeta } from "../common/common.types";

export const DEFAULT_META: Omit<FieldMeta<any>, "value"> = {
	error: undefined,
	isFocussed: false,
	wasTouched: false,
	customData: {}
}
