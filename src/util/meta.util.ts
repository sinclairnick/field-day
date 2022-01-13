import { FieldMeta } from "../common/common.types";

export const DEFAULT_META: Omit<FieldMeta<any>, "value" | "_id"> = {
	error: undefined,
	isFocussed: false,
	wasTouched: false,
	customData: {}
}
