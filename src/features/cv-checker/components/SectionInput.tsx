'use client';

import { Control } from 'react-hook-form';
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
  textName,
  fileName,
  addBy,
  setAddBy,
  isVisible = true,
}) => {
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
          data-testid={`textarea-${textName}`}
          className="field-sizing-content resize-none min-h-[64px] max-h-[200px]"
        />
      </div>

      <div className={cn(isText && 'hidden')}>
        <FileDropzoneField
          control={control}
          name={fileName}
          multiple={false}
          accept={cvFileTypes}
          data-testid={`dropzone-${fileName}`}
          className="min-h-[64px] mb-0"
        />
      </div>
    </div>
  );
};
