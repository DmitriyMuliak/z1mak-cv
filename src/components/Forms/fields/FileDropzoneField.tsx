'use client';

import { FormField, FormItem, FormControl, FormMessage } from '@/components/ui/form';
import Dropzone from 'react-dropzone';
import { cn } from '@/lib/utils';
import {
  Control,
  FieldValues,
  Path,
  UseFormSetError,
  UseFormClearErrors,
  UseFieldArrayReplace,
} from 'react-hook-form';
import { XIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';

const OneMb = 1048576;
const MAX_SIZE = OneMb * 10;
const MAX_SIZE_MB = (MAX_SIZE / 1024).toFixed();

interface FileDropzoneFieldProps<T extends FieldValues> {
  control: Control<T>;
  name: Path<T>;
  replace: UseFieldArrayReplace<T>;
  setError: UseFormSetError<T>;
  clearErrors: UseFormClearErrors<T>;
  files: unknown[];
}

export function FileDropzoneField<T extends FieldValues>({
  control,
  name,
  replace,
  setError,
  clearErrors,
  files,
}: FileDropzoneFieldProps<T>) {
  const t = useTranslations('fields.file');
  const tZod = useTranslations('zod');
  return (
    <div className="relative" data-form-field-id={name}>
      {files.map((_, index) => (
        <div key={index} className="flex items-end mt-7 mb-2 text-sm font-bold">
          <span>{`${t('addedFileTitle')}: ${(files[index] as { file?: File })?.file?.name ?? ''}`}</span>
          <button
            className="pl-1"
            onClick={() => {
              const updatedFiles = files.filter((_, i) => i !== index);
              // TODO: add types
              replace(updatedFiles as never[]);
            }}
          >
            <XIcon className="size-5 text-white hover:text-red-500" />
          </button>
        </div>
      ))}

      <FormField
        control={control}
        name={name}
        render={() => (
          <FormItem>
            <FormControl>
              <Dropzone
                multiple={false}
                maxSize={MAX_SIZE}
                maxFiles={1}
                accept={{
                  '': ['.jpg', '.jpeg', '.png', '.pdf', '.doc', '.docx'],
                }}
                onDropAccepted={(acceptedFiles) => {
                  const newFiles = acceptedFiles.map((acceptedFile) => {
                    return { file: acceptedFile };
                  });
                  // TODO: add types
                  replace(newFiles as never[]);
                  clearErrors(name);
                }}
                onDropRejected={(rejections) => {
                  const tooLarge = rejections.some((rej) =>
                    rej.errors.some((e) => e.code === 'file-too-large'),
                  );
                  const wrongType = rejections.some((rej) =>
                    rej.errors.some((e) => e.code === 'file-invalid-type'),
                  );
                  if (tooLarge) {
                    setError(name, {
                      type: 'manual',
                      message: tZod('file_too_large', { max: MAX_SIZE_MB }),
                    });
                  } else if (wrongType) {
                    setError(name, {
                      type: 'manual',
                      message: tZod('file_invalid_type'),
                    });
                  } else {
                    setError(name, {
                      type: 'manual',
                      message: tZod('file_problem'),
                    });
                  }
                }}
              >
                {({ getRootProps, getInputProps }) => (
                  <div
                    {...getRootProps({
                      className: cn(
                        'p-3 mb-2 flex flex-col items-center justify-center w-full rounded-md cursor-pointer border border-stone-950 hover:bg-gray-600/10 dark:border-slate-400/20 dark:bg-input/30 dark:hover:bg-gray-600/10 ',
                      ),
                    })}
                  >
                    <label
                      htmlFor={name}
                      className="text-sm cursor-pointer text-gray-900 dark:text-white"
                    >
                      {t('mainAddFileTitle')}
                    </label>
                    <input {...getInputProps()} />
                  </div>
                )}
              </Dropzone>
            </FormControl>
            <FormMessage className="text-red-700 dark:text-red-600" />
          </FormItem>
        )}
      />
    </div>
  );
}
