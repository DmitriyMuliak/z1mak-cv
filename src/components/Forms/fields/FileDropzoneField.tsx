'use client';

import { FormField, FormItem, FormControl, FormMessage } from '@/components/ui/form';
import Dropzone, { DropzoneOptions, FileRejection } from 'react-dropzone';
import { cn } from '@/lib/utils';
import {
  Control,
  FieldValues,
  Path,
  UseFormSetError,
  FieldArray,
  ArrayPath,
  useFormState,
  FieldError,
  useFieldArray,
  useFormContext,
} from 'react-hook-form';
import { XIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';

const OneMbInKb = 1048576;
const MAX_SIZE = OneMbInKb * 10;
const MAX_SIZE_MB = (MAX_SIZE / 1024 / 1024).toFixed();

interface FileDropzoneFieldProps<T extends FieldValues> extends DropzoneOptions {
  control: Control<T>;
  name: ArrayPath<T>;
  className?: string;
}

export function FileDropzoneField<T extends FieldValues>({
  control,
  name,
  isSingleFile,
  className,
  ...rest
}: FileDropzoneFieldProps<T> & { isSingleFile?: boolean }) {
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
        render={() => (
          <FormItem>
            <FormControl>
              <Dropzone
                {...rest}
                onDropAccepted={(acceptedFiles) => {
                  const files = acceptedFiles.map((file) => ({ file }));
                  if (isSingleFile) {
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
                  if (isSingleFile) {
                    replace(files as TFiles);
                    trigger(name as Path<T>);
                    return;
                  }
                  prepend(files as TFiles);
                  trigger(name as Path<T>);
                }}
              >
                {({ getRootProps, getInputProps, isDragActive }) => (
                  <div
                    {...getRootProps({
                      className: cn(
                        'p-3 mb-2 flex flex-col items-center justify-center w-full rounded-md cursor-pointer border border-stone-950 hover:bg-gray-600/10 dark:border-slate-400/20 dark:bg-input/30 dark:hover:bg-gray-600/10 ',
                        isDragActive ? `bg-gray-600/10 dark:bg-gray-600/10` : '',
                        className,
                      ),
                    })}
                  >
                    <span
                      aria-hidden="true"
                      className="text-sm cursor-pointer text-gray-900 dark:text-white"
                    >
                      {t('mainAddFileTitle')}
                    </span>
                    <input
                      {...getInputProps({
                        'aria-label': t('mainAddFileTitle'),
                      })}
                    />
                  </div>
                )}
              </Dropzone>
            </FormControl>
            <FormMessage className="text-red-700 dark:text-red-600" />
          </FormItem>
        )}
      />
      {fields.map((field, index) => {
        const item = field as unknown as { file: File } & Record<'id', string>;

        const arrayErrors = errors[name] as undefined | Record<number, { file?: FieldError }>;
        const fileError = arrayErrors?.[index]?.file?.message;

        return (
          <div key={item.id}>
            <div className="flex items-end text-sm font-bold">
              <button
                type="button"
                className="pr-1"
                onClick={() => {
                  remove(index);
                  trigger(name as Path<T>);
                }}
              >
                <XIcon className="size-5 text-white hover:text-red-500" />
              </button>
              <span>{item.file.name}</span>
            </div>
            {fileError && (
              <p className="text-red-700 dark:text-red-600 text-sm mt-1 pl-6">{fileError}</p>
            )}
          </div>
        );
      })}
    </div>
  );
}

const _onRejectedValidation = <T extends FieldValues>(
  name: Path<T>,
  rejections: FileRejection[],
  setError: UseFormSetError<T>,
  tValidator: ReturnType<typeof useTranslations<'validator'>>,
) => {
  const tooLarge = rejections.some((rej) => rej.errors.some((e) => e.code === 'file-too-large'));
  const wrongType = rejections.some((rej) =>
    rej.errors.some((e) => e.code === 'file-invalid-type'),
  );

  if (tooLarge) {
    setError(name, {
      type: 'manual',
      message: tValidator('file_too_large', { max: MAX_SIZE_MB }),
    });
  } else if (wrongType) {
    setError(name, {
      type: 'manual',
      message: tValidator('file_invalid_type'),
    });
  } else {
    setError(name, {
      type: 'manual',
      message: tValidator('file_problem'),
    });
  }
};
