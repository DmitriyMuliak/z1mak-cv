'use client';

import { Dispatch, SetStateAction, useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useLocale, useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/navigation';
import { Form } from '@/components/ui/form';
import { localizedValibotResolver } from '@/lib/validator/localizedSchemaResolver';
import { createBaseOnSubmitHandler } from '@/components/Forms/utils';
import { useDelayedSubmitting } from '@/hooks/useDelayedSubmitting';
import { GlobalFormErrorMessage } from '@/components/Forms/fields/GlobalFormErrorMessage';
import { SubmitActionButton } from '@/components/Forms/buttons/SubmitActionButton';
import { paths } from '@/consts/routes';
import { SectionInput } from './SectionInput';
import { AddDescriptionBy, Mode } from '../store/useCvStore';
import { SendToAnalyzeFEType, getSendToAnalyzeSchema } from '../schema/form/toAnalyzeSchemaFE';
import { sendToAnalyzeAction } from '../actions/sendToAnalyzeAction';

interface Props {
  mode: Mode;
}

export const SendToAnalyzeForm: React.FC<Props> = ({ mode }) => {
  const { evaluationMode } = mode;
  const tc = useTranslations('common');
  const tv = useTranslations('validator');
  const tp = useTranslations('pages.cvChecker');
  const tre = useTranslations('common.resumeErrors');
  const locale = useLocale();
  const router = useRouter();

  const [addCvBy, setAddCvBy] = useState<AddDescriptionBy>('file');
  const [addJobBy, setAddJobBy] = useState<AddDescriptionBy>('text');

  const dynamicSchema = useMemo(() => {
    return getSendToAnalyzeSchema({
      evaluationMode,
      addCvBy,
      addJobBy,
    });
  }, [evaluationMode, addCvBy, addJobBy]);

  const form = useForm<SendToAnalyzeFEType>({
    resolver: localizedValibotResolver(dynamicSchema, tv),
    mode: 'onSubmit',
    defaultValues: { cvText: '', jobText: '', jobFile: [], cvFile: [] },
  });

  useEffect(() => {
    if (evaluationMode === 'general') {
      const inactiveFields = inactiveFieldsByMode[evaluationMode];
      // clear error for another field for unblock submit button
      form.clearErrors([inactiveFields.text, inactiveFields.file]);
    }
    if (evaluationMode === 'byJob') {
      const { active } = jobTabFields[addJobBy];
      form.getFieldState(active).isDirty && form.trigger(active);
    }
  }, [evaluationMode, form, addJobBy]);

  const getHandleTabOnChange =
    (tabFields: TabFields, setAddBy: Dispatch<SetStateAction<AddDescriptionBy>>) =>
    (value: AddDescriptionBy) => {
      const { active, inactive } = tabFields[value];
      setAddBy(value);
      // revalidate field if it have value - because we was reset before
      form.getFieldState(active).isDirty && form.trigger(active);
      // clear error for another field for unblock submit button
      form.clearErrors([inactive]);
    };

  const handleCvTabChange = getHandleTabOnChange(cvTabFields, setAddCvBy);
  const handleJobTabChange = getHandleTabOnChange(jobTabFields, setAddJobBy);

  const { delayedIsLoading } = useDelayedSubmitting({ isSubmitting: form.formState.isSubmitting });

  const onResult = async (out: Awaited<ReturnType<typeof sendToAnalyzeAction>>) => {
    if (out.success && out.data?.jobId) {
      router.push(paths.cvReport + `?jobId=${out.data?.jobId}`);
      return;
    }
  };

  const handleSubmitCb = createBaseOnSubmitHandler(sendToAnalyzeAction, form, onResult, {
    getAdditionalFEData: () => ({
      translateErrorFn: tre,
      locale,
      mode,
      addCvBy,
      addJobBy,
    }),
  });

  const onSubmit = form.handleSubmit(handleSubmitCb);

  const isFormInvalid = Object.keys(form.formState.errors).length > 0;
  const isSubmitting = form.formState.isSubmitting;
  const isSuccess = !isSubmitting && form.formState.isSubmitSuccessful;

  return (
    <Form {...form}>
      <form onSubmit={onSubmit} className="flex-1 pt-10 space-y-8">
        <SectionInput
          label={tp('cvForm.title')}
          textAreaPlaceHolder={tp('cvForm.textAreaPlaceholder')}
          control={form.control}
          form={form}
          textName="cvText"
          fileName="cvFile"
          addBy={addCvBy}
          setAddBy={handleCvTabChange}
        />
        <SectionInput
          label={tp('jobForm.title')}
          textAreaPlaceHolder={tp('jobForm.textAreaPlaceholder')}
          control={form.control}
          form={form}
          textName="jobText"
          fileName="jobFile"
          addBy={addJobBy}
          setAddBy={handleJobTabChange}
          isVisible={evaluationMode === 'byJob'}
        />
        <div>
          <SubmitActionButton
            isSubmitting={isSubmitting}
            isFormInvalid={isFormInvalid}
            showSuccessLoader={delayedIsLoading && isSuccess}
            title={tc('formButtonSendTitle')}
            onSuccessTitle={tc('formButtonSendSuccessTitle')}
          />
          <GlobalFormErrorMessage />
        </div>
      </form>
    </Form>
  );
};

const inactiveFieldsByMode = {
  general: { text: 'jobText', file: 'jobFile' },
  byJob: { text: 'cvText', file: 'cvFile' },
} as const;

const cvTabFields = {
  text: { active: 'cvText', inactive: 'cvFile' },
  file: { active: 'cvFile', inactive: 'cvText' },
} as const;

const jobTabFields = {
  text: { active: 'jobText', inactive: 'jobFile' },
  file: { active: 'jobFile', inactive: 'jobText' },
} as const;

type TabFields = typeof cvTabFields | typeof jobTabFields;
