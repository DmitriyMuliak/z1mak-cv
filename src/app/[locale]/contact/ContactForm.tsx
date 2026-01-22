'use client';

import { useForm } from 'react-hook-form';
import { useTranslations } from 'next-intl';
import { Form } from '@/components/ui/form';
import { TextField } from '@/components/Forms/fields/TextField';
import { TextareaField } from '@/components/Forms/fields/TextareaField';
import { FileDropzoneField } from '@/components/Forms/fields/FileDropzoneField';
import { sendContactAction } from '@/actions/sendContact';
import { ContactSchemaFE, ContactSchemaFEType } from '@/schema/contactSchema/contactSchemaFE';
import { localizedValibotResolver } from '@/lib/validator/localizedSchemaResolver';
import { contactFileTypes } from '@/schema/contactSchema/consts';
import { createOnSubmitHandler } from '@/components/Forms/utils';
import { useDelayedSubmitting } from '@/hooks/useDelayedSubmitting';
import { RecaptchaField } from '@/components/Forms/fields/Recapthca';
import { GlobalFormErrorMessage } from '@/components/Forms/fields/GlobalFormErrorMessage';
import { SubmitActionButton } from '@/components/Forms/buttons/SubmitActionButton';

export function ContactForm() {
  const tf = useTranslations('fields');
  const tc = useTranslations('common');
  const tv = useTranslations('validator');
  const form = useForm<ContactSchemaFEType>({
    resolver: localizedValibotResolver(ContactSchemaFE, tv),
    mode: 'onBlur',
    defaultValues: { name: '', email: '', message: '', files: [], recaptchaToken: null },
  });
  const files = form.watch('files');
  const { delayedIsLoading } = useDelayedSubmitting({ isSubmitting: form.formState.isSubmitting });
  const { isSubmitting, isValid } = form.formState;
  const isSuccess = !isSubmitting && form.formState.isSubmitSuccessful;
  const showSuccessLoader = delayedIsLoading && isSuccess;

  const handleSubmitCb = createOnSubmitHandler(sendContactAction, form);
  const onSubmit = form.handleSubmit(handleSubmitCb);

  return (
    <Form {...form}>
      <form onSubmit={onSubmit} className="flex-1 max-w-md space-y-5">
        <TextField
          control={form.control}
          name="name"
          label={tf('name.label')}
          placeholder={tf('name.placeholder')}
        />
        <TextField
          control={form.control}
          name="email"
          label={tf('email.label')}
          placeholder={tf('email.placeholder')}
          type="email"
        />
        <TextareaField
          control={form.control}
          name="message"
          label={tf('message.label')}
          placeholder={tf('message.placeholder')}
        />
        <FileDropzoneField
          control={form.control}
          name="files"
          multiple={false}
          accept={contactFileTypes}
        />
        <RecaptchaField
          control={form.control}
          name="recaptchaToken"
          clearErrors={form.clearErrors}
          visible={!!files && files.length > 0}
        />
        <SubmitActionButton
          isSubmitting={isSubmitting}
          isFormInvalid={!isValid}
          showSuccessLoader={showSuccessLoader}
          title={tc('formButtonSendTitle')}
          onSuccessTitle={tc('formButtonSendSuccessTitle')}
        />
        <GlobalFormErrorMessage />
      </form>
    </Form>
  );
}
