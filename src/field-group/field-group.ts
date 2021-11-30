import { atom, useAtom } from 'jotai';
import { FieldActions, FieldMeta, FieldProps, FieldValue } from '../common/common.types';
import { FieldMap, StateMap, ValueMap, } from './field-group.types';

const generateStateFromValues = <V extends ValueMap>(valueMap: V) => {
  const initialState = {
    items: {},
  } as StateMap<V>;

  for (const key in valueMap) {
    const value = valueMap[key];
    type ValueType = V[typeof key];

    const meta: FieldMeta<ValueType> = {
      error: undefined,
      isFocussed: false,
      value: value as any,
      wasTouched: false,
    };
    initialState.items[key] = meta;
  }

  return initialState;
};

export const createFieldGroup = <I extends ValueMap>(initialValues: I) => {
  const initialState = generateStateFromValues(initialValues);
  const fieldGroupAtom = atom(initialState);

  const useForm = () => {
    const [_state, setState] = useAtom(fieldGroupAtom);

    const state = _state as StateMap<I>; // Jotai removes type info

    const actions = {
      reset: (to?: StateMap<I>) => {
        setState(to ?? initialState)
      }
    }

    const fields = {} as FieldMap<I>;
    for (const key in state.items) {
      type ValueType = I[typeof key];
      const value = state.items[key].value;

      const actions: FieldActions<FieldValue> = {
        setMeta: (updates) => {
          const newItems = { ...state.items, [key]: { ...state.items[key], ...updates } }
          setState({ ...state, items: newItems });
        },
      };

      const props: FieldProps<ValueType> = {
        onBlur: () => {
          actions.setMeta({ isFocussed: false, wasTouched: true })
        },
        onChange: (e) => {
          if (typeof value === 'boolean' && 'checked' in e.target) {
            actions.setMeta({ value: e.target.checked });
            return;
          }
          if ('value' in e.target) {
            actions.setMeta({ value: e.target.value });
            return;
          }
        },
        onFocus: () => actions.setMeta({ isFocussed: true }),
        checked: typeof value === 'boolean' ? value : (undefined as any),
        value: typeof value === 'boolean' ? undefined : (value as any),
      };
      const meta = state.items[key];
      const isDirty = initialValues[key] !== meta.value as any
      fields[key] = { meta: { ...meta, isDirty }, props, actions, };
    }

    const groupMeta: Omit<FieldMeta<any>, "value"> & { isDirty: boolean } = {
      error: undefined, isDirty: false, isFocussed: false, wasTouched: false
    }

    for (const key in fields) {
      const { meta } = fields[key]
      if (meta.error) groupMeta.error = meta.error
      if (meta.isDirty) groupMeta.isDirty = meta.isDirty
      if (meta.isFocussed) groupMeta.isFocussed = meta.isFocussed
      if (meta.wasTouched) groupMeta.wasTouched = meta.wasTouched
    }

    return {
      fields,
      meta: groupMeta,
      actions,
      setState
    }
  };

  return useForm;
};
