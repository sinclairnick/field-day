import { atom, useAtom } from 'jotai';
import { useEffect } from 'react';
import { UseFieldGroupOptions } from '..';
import { generateFieldProps, usePrevious } from '../common/common.constants';
import { FieldActions, FieldMeta, FieldValue } from '../common/common.types';
import { FieldMap, StateMap, ValueMap, } from './field-group.types';
import merge from "lodash/merge"
import isEqual from "lodash/isEqual"
import { DeepPartial, Widen } from '../util/util.types';
import { useDelayedEffect } from '../util/use-delayed-effect';
import { FieldGroupHelpers } from './field-group.constants';

class Wrapper<T extends ValueMap> {
  wrapper() {
    return createFieldGroup<T>({} as T)
  }
}

export type UseFieldGroupHook<T extends ValueMap> = ReturnType<Wrapper<T>["wrapper"]>
export type FieldGroupObject<T extends ValueMap> = ReturnType<UseFieldGroupHook<T>>
export type FieldGroupState<T extends ValueMap> = StateMap<Widen<T>>

export const createFieldGroup = <V extends ValueMap>(_initialValues: V) => {
  type I = Widen<V>
  const _initialState = FieldGroupHelpers.generateStateFromValues(_initialValues as I)
  const fieldGroupAtom = atom(_initialState);
  const initialValuesAtom = atom(_initialValues as I)
  const initialStateAtom = atom(_initialState as StateMap<I>)

  const useFieldGroup = (opts?: UseFieldGroupOptions<I>) => {
    const [initialValues, setInitialValues] = useAtom(initialValuesAtom)
    const [initialState, setInitialState] = useAtom(initialStateAtom)
    const [state, setState] = useAtom(fieldGroupAtom);
    const { validationDelay = 100 } = opts ?? {}

    const previousState = usePrevious(state)
    const hasStateChanged = !isEqual(previousState, state)

    const previousInitialValues = usePrevious(initialValues)
    const hasInitialValuesChanged = !isEqual(previousInitialValues, opts?.initialValues?.values)

    const _setInitialValues = (
      values: I,
      opts?: {
        resetState?: boolean,
        defaultMeta?: Parameters<typeof FieldGroupHelpers["generateStateFromValues"]>[1]
      }) => {
      const { resetState = true } = opts ?? {}
      setInitialValues(values)
      const newInitialState = FieldGroupHelpers.generateStateFromValues(values, opts?.defaultMeta)
      setInitialState(newInitialState)
      if (resetState) {
        setState(newInitialState)
      }
    }

    const actions = {
      validate: () => {
        const errors = opts?.validate?.(state.items)
        const newState = { ...state }
        for (const key in state.items) {
          const error = errors?.[key]
          newState.items[key].error = error ?? undefined
        }
        setState(newState)
      },
      getState: () => state,
      setState,
      reset: () => setState(initialState),
      updateState: (to: DeepPartial<StateMap<I>>) => {
        setState(merge({ ...initialState }, { ...to }))
      },
      collectValues: () => {
        const values = {} as I
        for (const key in state.items) {
          const item = state.items[key]
          values[key] = item.value
        }
        return values
      },
      getInitialValues: () => initialValues,
    }

    useDelayedEffect(() => {
      if (hasStateChanged) {
        actions.validate()
      }
    }, [hasStateChanged, actions.validate, validationDelay], validationDelay)

    useEffect(() => {
      if (!hasInitialValuesChanged) {
        return
      }
      if (opts?.initialValues !== undefined) {
        _setInitialValues(
          opts.initialValues.values,
          {
            resetState: opts.initialValues.resetState,
            defaultMeta: opts.initialValues.defaultMeta
          }
        )
      }
    }, [hasInitialValuesChanged, _setInitialValues])


    const fields = {} as FieldMap<I>;
    for (const key in state.items) {
      const value = state.items[key].value;

      const actions: FieldActions<FieldValue> = {
        setMeta: (updates) => {
          const newItems = { ...state.items, [key]: { ...state.items[key], ...updates } }
          setState({ ...state, items: newItems });
        },
      };
      const props = generateFieldProps(value, actions)

      const meta = state.items[key];
      const isDirty = initialValues[key] !== meta.value as any
      fields[key] = { meta: { ...meta, isDirty }, props, actions, };
    }

    const groupMeta: Omit<FieldMeta<any>, "value" | "_id"> & { isDirty: boolean } = {
      error: undefined,
      isDirty: false,
      isFocussed: false,
      wasTouched: false,
      customData: state.customData
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
