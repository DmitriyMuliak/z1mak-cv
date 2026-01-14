'use client';

import { useFieldArray, Control, UseFormReturn } from 'react-hook-form';
import { TextareaField } from '@/components/Forms/fields/TextareaField';
import { FileDropzoneField } from '@/components/Forms/fields/FileDropzoneField';
import { SendToAnalyzeFEType } from '../schema/form/toAnalyzeSchemaFE';
import { cvFileTypes } from '../schema/form/common';
import { ToggleAddingBy } from './ToggleAddingBy';
import { cn } from '@/lib/utils';
import { AddDescriptionBy } from '../store/useCvStore';

type SectionInputProps = {
  label: string;
  textAreaPlaceHolder: string;
  control: Control<SendToAnalyzeFEType>;
  form: UseFormReturn<SendToAnalyzeFEType>;
  textName: 'cvText' | 'jobText';
  fileName: 'cvFile' | 'jobFile';
  addBy: AddDescriptionBy;
  setAddBy: (val: AddDescriptionBy) => void;
  isVisible?: boolean;
};

export const SectionInput: React.FC<SectionInputProps> = ({
  label,
  textAreaPlaceHolder,
  control,
  form,
  textName,
  fileName,
  addBy,
  setAddBy,
  isVisible = true,
}) => {
  const { fields, replace, remove, prepend } = useFieldArray({
    name: fileName,
    control,
  });

  if (!isVisible) return null;

  const isText = addBy === 'text';

  return (
    <div className="space-y-3">
      <div className="flex flex-col space-y-3">
        <div className="content-center font-medium">{label}</div>
        <ToggleAddingBy
          value={addBy}
          onValueChange={(val) => val && setAddBy(val as AddDescriptionBy)}
        />
      </div>

      <div className={cn(!isText && 'hidden')}>
        <TextareaField
          control={control}
          name={textName}
          label=""
          placeholder={textAreaPlaceHolder}
          className="field-sizing-content resize-none min-h-[64px] max-h-[200px]"
        />
      </div>

      <div className={cn(isText && 'hidden')}>
        <FileDropzoneField
          control={control}
          name={fileName}
          isSingleFile
          multiple={false}
          accept={cvFileTypes}
          className="min-h-[64px] mb-0"
          // casting need for have possibility to use v.AnySchema in case when we should ignore inputs
          files={fields as unknown as { file: File; id: string }[]}
          // Field Array methods
          replace={replace}
          remove={remove}
          prepend={prepend}
          // Form methods
          setError={form.setError}
          clearErrors={form.clearErrors}
          validateTrigger={form.trigger}
        />
      </div>
    </div>
  );
};
