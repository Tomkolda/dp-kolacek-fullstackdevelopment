import type {FormValidateInput, SetFieldValue} from '@mantine/form';
import type {ReactNode} from 'react';

import type {ActionResult} from './useFormSubmit';

export type FormValues = Record<string, unknown>;
export type StringFieldName<T extends FormValues> = Extract<
  {
    [K in keyof T]: T[K] extends string ? K : never;
  }[keyof T],
  string
>;

type BaseField<T extends FormValues> = {
  name: Extract<keyof T, string>;
  label: string;
  placeholder?: string;
  required?: boolean;
};

export type TextField<T extends FormValues = FormValues> = BaseField<T> & {
  type: 'text' | 'date';
};

export type TextareaField<T extends FormValues = FormValues> = BaseField<T> & {
  type: 'textarea';
  minRows?: number;
  maxRows?: number;
};

export type NumberField<T extends FormValues = FormValues> = BaseField<T> & {
  type: 'number';
  min?: number;
  allowNegative?: boolean;
};

export type TimeField<T extends FormValues = FormValues> = BaseField<T> & {
  type: 'time';
};

export type StorageImageField<T extends FormValues = FormValues> = {
  type: 'storageImage';
  name: StringFieldName<T>;
  bucket: string;
  label?: string;
  required?: boolean;
};

export type SelectField<T extends FormValues = FormValues> = BaseField<T> & {
  type: 'select';
  options: Array<{value: string; label: string}>;
};

export type CustomField<T extends FormValues = FormValues> = {
  type: 'custom';
  name: string;
  render: (ctx: {
    values: T;
    setFieldValue: SetFieldValue<T>;
    isSaving: boolean;
  }) => ReactNode;
};

export type FormField<T extends FormValues = FormValues> =
  | TextField<T>
  | TextareaField<T>
  | NumberField<T>
  | TimeField<T>
  | SelectField<T>
  | StorageImageField<T>
  | CustomField<T>;

export type FormValidate<T extends FormValues = FormValues> =
  FormValidateInput<T>;

export type FormSubmit<T extends FormValues = FormValues> = (
  values: T,
) => Promise<ActionResult>;
