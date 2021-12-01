import { atom, useAtom } from 'jotai';
import { useEffect, useState } from 'react';
import { UseFieldGroupOptions } from '..';
import { usePrevious } from '../common/common.constants';
import { DeepPartial, FieldActions, FieldMeta, FieldProps, FieldValue, Widen } from '../common/common.types';
import { FieldMap, StateMap, ValueMap, } from './field-group.types';
import merge from "lodash/merge"
import isEqual from "lodash/isEqual"

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

export const createFieldGroup = <V extends ValueMap>(_initialValues: V) => {
  type I = Widen<V>
  const _initialState = generateStateFromValues(_initialValues) as StateMap<I>
  const fieldGroupAtom = atom(_initialState);

  const useFieldGroup = (opts?: UseFieldGroupOptions<I>) => {
    const [initialValues, setInitialValues] = useState(_initialValues as I)
    const [initialState, setInitialState] = useState(_initialState)
    const [state, setState] = useAtom(fieldGroupAtom);


    const previousState = usePrevious(state)
    const hasStateChanged = !isEqual(previousState, state)

    const actions = {
      validate: () => {
        const errors = opts?.validate?.(state.items)
        const newState = { ...state }
        for (const key in state.items) {
          if (errors !== undefined && key in errors) {
            const error = errors[key]
            newState.items[key].error = error ?? undefined
          } else {
            newState.items[key].error = undefined
          }
        }
        setState(newState)
      },
      setState,
      reset: () => {
        setState(initialState)
      },
      updateState: (to: DeepPartial<StateMap<I>>) => {
        setState(merge({ ...initialState }, { ...to }))
      },
      setInitialValues: (values: I, opts?: { resetState?: boolean }) => {
        const { resetState = true } = opts ?? {}
        setInitialValues(values)
        const newInitialState = generateStateFromValues(values)
        setInitialState(newInitialState)
        console.log(newInitialState, resetState)
        if (resetState) {
          setState(newInitialState)
        }
      }
    }

    useEffect(() => {
      if (hasStateChanged) {
        actions.validate()
      }
    }, [hasStateChanged])


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
    }
  };

  return useFieldGroup;
};
