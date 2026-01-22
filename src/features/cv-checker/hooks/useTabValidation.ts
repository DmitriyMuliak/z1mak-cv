import { useEffect } from 'react';
import { UseFormReturn, FieldValues, Path } from 'react-hook-form';

type TabFieldConfig<T extends FieldValues> = {
  active: Path<T>;
  inactive: Path<T>;
};

type TabConfigMap<T extends FieldValues, K extends string> = Record<K, TabFieldConfig<T>>;

/**
 * Synchronizes form validation with the active tab selection.
 *
 * This hook is necessary to solve a race condition where validating inside an event handler
 * checks against a stale schema (before the state update and re-render).
 * Using useEffect ensures validation triggers only AFTER the schema has been updated for the new tab.
 */
export const useTabValidation = <T extends FieldValues, K extends string>(
  form: UseFormReturn<T>,
  currentTab: K,
  config: TabConfigMap<T, K>,
) => {
  useEffect(() => {
    const { active, inactive } = config[currentTab];

    // Prevent inactive tab errors from blocking submission
    form.clearErrors(inactive);

    validateIfActive(form, active);
  }, [currentTab, form, config]);
};

export const validateIfActive = <T extends FieldValues>(
  form: UseFormReturn<T>,
  fieldName: Path<T>,
) => {
  const val = form.getValues(fieldName);
  const hasValue = Array.isArray(val) ? val.length > 0 : !!val;
  const isDirty = form.getFieldState(fieldName).isDirty;

  if (isDirty || hasValue) {
    form.trigger(fieldName);
  }
};
