'use client';

import { useForm, useFieldArray } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import { TextField } from '@/components/Forms/fields/TextField';
import { TextareaField } from '@/components/Forms/fields/TextareaField';
import { FileDropzoneField } from '@/components/Forms/fields/FileDropzoneField';
import { sendContactAction } from '@/actions/sendContact';
import { ContactSchema, ContactSchemaType } from '@/schema/contactSchema';
import { useTranslations } from 'next-intl';
import { localizedValibotResolver } from '@/lib/validator/localizedSchemaResolver';
import { contactFileTypes } from '@/schema/contactSchema/consts';

export function ContactForm() {
  const tf = useTranslations('fields');
  const tc = useTranslations('common');
  const tv = useTranslations('validator');
  const form = useForm<ContactSchemaType>({
    resolver: localizedValibotResolver(ContactSchema, tv),
    mode: 'onBlur',
    defaultValues: { name: '', email: '', message: '', files: [] },
  });

  const { fields, replace, remove, prepend } = useFieldArray({
    name: 'files',
    control: form.control,
  });

  const onSubmit = form.handleSubmit(async (data) => {
    console.log('handleSubmit', data);
    const formData = new FormData();

    Object.entries(data).forEach(([key, value]) => {
      if (typeof value !== 'object' && value !== null) formData.append(key, value);
      if (value && Array.isArray(value)) {
        if (value.length && value[0].file) {
          value.forEach((fileContainer) => {
            formData.append('files', fileContainer.file, fileContainer.file.name);
          });
        }
      }
    });

    const res = await sendContactAction(formData);

    if (res.errors) {
      Object.entries(res.errors).forEach(([field, messages]) =>
        form.setError(field as keyof ContactSchemaType, { message: messages.join(', ') }),
      );
    }

    if (res.success) form.reset();
  });

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
        <Button
          disabled={form.formState.isSubmitting || !form.formState.isValid}
          type="submit"
          className="!mt-0 w-full"
        >
          {tc('formButtonSendTitle')}
        </Button>
      </form>
    </Form>
  );
}
