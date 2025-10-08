'use client';

import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import { TextField } from '@/components/Forms/fields/TextField';
import { TextareaField } from '@/components/Forms/fields/TextareaField';
import { FileDropzoneField } from '@/components/Forms/fields/FileDropzoneField';
import { sendContactAction } from '@/actions/sendContact';
import { getContactSchema, FrontContactFormType } from '@/schema/contactSchema';
import { useTranslations } from 'next-intl';
import { useTranslatedSchema } from '@/hooks/useTranslatedSchema';

export function ContactForm() {
  const schema = useTranslatedSchema(getContactSchema);
  const t = useTranslations('fields');
  const form = useForm<FrontContactFormType>({
    resolver: zodResolver(schema),
    mode: 'onBlur',
    defaultValues: { name: '', email: '', message: '', files: [] },
  });

  const { fields, replace } = useFieldArray({ name: 'files', control: form.control });

  const onSubmit = form.handleSubmit(async (data) => {
    const formData = new FormData();
    const { files, ...rest } = data;
    Object.entries(rest).forEach(([key, value]) => formData.append(key, value as string));
    files?.forEach((item) => {
      if (item?.file instanceof File) {
        formData.append('files', item.file);
      }
    });
    const res = await sendContactAction(formData);
    if (res.errors) {
      Object.entries(res.errors).forEach(([field, messages]) =>
        form.setError(field as keyof FrontContactFormType, { message: messages.join(', ') }),
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
          label={t('name.label')}
          placeholder={t('name.placeholder')}
        />
        <TextField
          control={form.control}
          name="email"
          label={t('email.label')}
          placeholder={t('email.placeholder')}
          type="email"
        />
        <TextareaField
          control={form.control}
          name="message"
          label={t('message.label')}
          placeholder={t('message.placeholder')}
        />
        <FileDropzoneField
          control={form.control}
          name="files"
          replace={replace}
          setError={form.setError}
          clearErrors={form.clearErrors}
          files={fields}
        />
        <Button type="submit" className="!mt-0 w-full">
          Send
        </Button>
      </form>
    </Form>
  );
}
