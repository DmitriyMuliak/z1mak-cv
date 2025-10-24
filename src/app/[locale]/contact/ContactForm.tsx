'use client';

import { useForm, useFieldArray } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import { TextField } from '@/components/Forms/fields/TextField';
import { TextareaField } from '@/components/Forms/fields/TextareaField';
import { FileDropzoneField } from '@/components/Forms/fields/FileDropzoneField';
import { sendContactAction } from '@/actions/sendContact';
import { ContactSchemaFE, ContactSchemaFEType } from '@/schema/contactSchema';
import { useTranslations } from 'next-intl';
import { localizedValibotResolver } from '@/lib/validator/localizedSchemaResolver';
import { contactFileTypes } from '@/schema/contactSchema/consts';
import { createOnSubmitHandler } from '@/components/Forms/utils';
import { useDelayedSubmitting } from '@/hooks/useDelayedSubmitting';
import { CheckIcon, RefreshCw } from 'lucide-react';
import { RecaptchaField } from '@/components/Forms/fields/Recapthca';

export function ContactForm() {
  const tf = useTranslations('fields');
  const tc = useTranslations('common');
  const tv = useTranslations('validator');
  const form = useForm<ContactSchemaFEType>({
    resolver: localizedValibotResolver(ContactSchemaFE, tv),
    mode: 'onBlur',
    defaultValues: { name: '', email: '', message: '', files: [], recaptchaToken: '' },
  });
  const { fields, replace, remove, prepend } = useFieldArray({
    name: 'files',
    control: form.control,
  });
  const { delayedIsLoading } = useDelayedSubmitting({ isSubmitting: form.formState.isSubmitting });
  const isSubmitting = form.formState.isSubmitting;
  const isSuccess = !isSubmitting && form.formState.isSubmitSuccessful;
  const showSuccessLoader = delayedIsLoading && isSuccess;

  const handleSubmitCb = createOnSubmitHandler(sendContactAction, form);
  const onSubmit = form.handleSubmit(handleSubmitCb);
  const isFormInvalid = Object.keys(form.formState.errors).length > 0;

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
          replace={replace}
          remove={remove}
          prepend={prepend}
          setError={form.setError}
          clearErrors={form.clearErrors}
          validateTrigger={form.trigger}
          isSingleFile
          files={fields}
          multiple={false}
          accept={contactFileTypes}
        />
        <RecaptchaField
          control={form.control}
          name="recaptchaToken"
          clearErrors={form.clearErrors}
          visible={fields.length > 0}
        />
        <Button
          disabled={isSubmitting || isFormInvalid} // !form.formState.isValid - works differently than isFormInvalid
          type="submit"
          className={`!mt-0 w-full transition-colors duration-300 ${showSuccessLoader ? 'bg-green-500 hover:bg-green-500' : ''}`}
        >
          {showSuccessLoader ? tc('formButtonSendSuccessTitle') : tc('formButtonSendTitle')}
          {showSuccessLoader ? <CheckIcon className="w-5 h-5 mr-2" /> : null}
          {isSubmitting ? <RefreshCw className="w-5 h-5 mr-2 animate-spin" /> : null}
        </Button>
      </form>
    </Form>
  );
}
// className={`!mt-0 w-full transition-colors duration-300 ${isSuccess ? 'bg-green-500 hover:bg-green-600' : ''}`}
