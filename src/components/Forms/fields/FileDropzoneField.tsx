'use client';

import { FormField, FormItem, FormControl, FormMessage } from '@/components/ui/form';
import Dropzone, { DropzoneState, DropzoneOptions } from 'react-dropzone';
import { cn } from '@/lib/utils';
import {
  Control,
  FieldValues,
  Path,
  FieldArray,
  ArrayPath,
  useFormState,
  FieldError,
  useFieldArray,
  useFormContext,
  RefCallBack,
  FieldArrayWithId,
  UseFieldArrayRemove,
  UseFormTrigger,
} from 'react-hook-form';
import { XIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useMergeRefs } from '@/hooks/useMergeRefs';

interface FileDropzoneFieldProps<T extends FieldValues> extends DropzoneOptions {
  control: Control<T>;
  name: ArrayPath<T>;
  className?: string;
}

export function FileDropzoneField<T extends FieldValues>({
  control,
  name,
  className,
  multiple = true,
  ...rest
}: FileDropzoneFieldProps<T>) {
  type TFiles = FieldArray<T, ArrayPath<T>>;
  const t = useTranslations('fields.file');
  const { errors } = useFormState({ control });
  const { trigger } = useFormContext<T>();
  const { fields, replace, remove, prepend } = useFieldArray({
    name,
    control,
  });

  return (
    <div className="relative" data-form-field-id={name}>
      <FormField
        control={control}
        name={name as Path<T>}
        render={({ field: { ref: rhfRef } }) => (
          <FormItem>
            <FormControl>
              <Dropzone
                {...rest}
                multiple={multiple}
                onDropAccepted={(acceptedFiles) => {
                  const files = acceptedFiles.map((file) => ({ file }));
                  if (!multiple) {
                    replace(files as TFiles);
                    trigger(name as Path<T>);
                    return;
                  }
                  prepend(files as TFiles);
                  trigger(name as Path<T>);
                }}
                onDropRejected={(rejections) => {
                  // Accept and show any file. Validation will be on schema level.
                  const files = rejections.map(({ file }) => ({ file }));
                  if (!multiple) {
                    replace(files as TFiles);
                    trigger(name as Path<T>);
                    return;
                  }
                  prepend(files as TFiles);
                  trigger(name as Path<T>);
                }}
              >
                {(dropzoneState) => (
                  <FileDropzoneTrigger
                    {...dropzoneState}
                    rhfRef={rhfRef}
                    label={t('mainAddFileTitle')}
                    className={className}
                    hasError={!!errors[name]}
                  />
                )}
              </Dropzone>
            </FormControl>
            <FormMessage className="text-red-700 dark:text-red-600" />
          </FormItem>
        )}
      />
      <FileDropzoneList
        name={name}
        fields={fields}
        remove={remove}
        trigger={trigger}
        control={control}
      />
    </div>
  );
}

interface FileDropzoneTriggerProps extends Pick<
  DropzoneState,
  'getRootProps' | 'getInputProps' | 'isDragActive'
> {
  rhfRef: RefCallBack;
  label: string;
  className?: string;
  hasError?: boolean;
}

function FileDropzoneTrigger({
  getRootProps,
  getInputProps,
  isDragActive,
  rhfRef,
  label,
  className,
  hasError,
}: FileDropzoneTriggerProps) {
  const { ref: dropzoneRef, ...rootProps } = getRootProps();
  const mergedRef = useMergeRefs(rhfRef, dropzoneRef);

  return (
    <div
      {...rootProps}
      ref={mergedRef}
      className={cn(
        'flex flex-col items-center justify-center w-full rounded-md border p-3 mb-2 text-sm transition-colors',
        'cursor-pointer shadow-xs',
        isDragActive && 'bg-accent',
        'outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:border-ring',
        !hasError &&
          'border-stone-950 dark:border-slate-400/20 hover:bg-gray-600/10 dark:bg-input/30 dark:hover:bg-gray-600/10',
        hasError && [
          'aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40',
          'border-red-700',
          'dark:aria-invalid:border-red-700',
          'focus-visible:border-destructive',
          'focus-visible:ring-destructive/20',
          'dark:focus-visible:ring-destructive/40',
          'transition-colors',
        ],
        className,
      )}
    >
      <span aria-hidden="true" className="text-sm cursor-pointer text-gray-900 dark:text-white">
        {label}
      </span>
      <input
        {...getInputProps({
          'aria-label': label,
        })}
      />
    </div>
  );
}

interface FileDropzoneListProps<T extends FieldValues> {
  name: ArrayPath<T>;
  fields: FieldArrayWithId<T, ArrayPath<T>, 'id'>[];
  remove: UseFieldArrayRemove;
  trigger: UseFormTrigger<T>;
  control: Control<T>;
}

function FileDropzoneList<T extends FieldValues>({
  name,
  fields,
  remove,
  trigger,
  control,
}: FileDropzoneListProps<T>) {
  const { errors } = useFormState({ control, name: name as Path<T> });
  const arrayErrors = errors[name] as undefined | Record<number, { file?: FieldError }>;

  if (fields.length === 0) return null;

  return (
    <div className="mt-2 space-y-2">
      {fields.map((field, index) => {
        const item = field as unknown as { file: File } & Record<'id', string>;
        const fileError = arrayErrors?.[index]?.file?.message;

        return (
          <div key={item.id}>
            <div className="flex items-center gap-2 text-sm font-bold">
              <button
                type="button"
                className="transition-colors text-gray-500 hover:text-red-500 dark:text-gray-400 dark:hover:text-red-400"
                onClick={() => {
                  remove(index);
                  trigger(name as Path<T>);
                }}
              >
                <XIcon className="size-5" />
                <span className="sr-only">Remove file</span>
              </button>
              <span className="truncate max-w-[300px]">{item.file.name}</span>
            </div>
            {fileError && (
              <p className="text-red-700 dark:text-red-600 text-sm mt-1 pl-7">{fileError}</p>
            )}
          </div>
        );
      })}
    </div>
  );
}
