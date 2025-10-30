'use server';
import { getLocale, getTranslations } from 'next-intl/server';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import nodemailer from 'nodemailer';
import { ContactSchemaBE, type ContactSchemaBEType } from '@/schema/contactSchema';
import { verifyRecaptchaToken } from './verifyRecaptchaToken';
import { createFormAction } from './utils';
import { privatePrEnv } from '@/utils/processEnv/private';

const AWS_REGION = privatePrEnv.AWS_REGION;
const AWS_S3_BUCKET = privatePrEnv.AWS_S3_BUCKET;
const AWS_ACCESS_KEY_ID = privatePrEnv.AWS_ACCESS_KEY_ID;
const AWS_SECRET_ACCESS_KEY = privatePrEnv.AWS_SECRET_ACCESS_KEY;
const GMAIL_USER = privatePrEnv.GMAIL_USER;
const GMAIL_PASS = privatePrEnv.GMAIL_PASS;

// TODO: add OAuth2 authentication
const mailTransport = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: GMAIL_USER,
    pass: GMAIL_PASS,
  },
});

const s3Client = new S3Client({
  region: AWS_REGION,
  credentials: {
    accessKeyId: AWS_ACCESS_KEY_ID,
    secretAccessKey: AWS_SECRET_ACCESS_KEY,
  },
});

export const sendContactAction = createFormAction(
  ContactSchemaBE,
  async (data): SendContactActionReturn => {
    const locale = await getLocale();
    const t = await getTranslations({ namespace: 'validator', locale });

    if (data.recaptchaToken) {
      const result = await verifyRecaptchaToken(data.recaptchaToken);
      if (!result.success) {
        return { success: false, errors: { recaptchaToken: [t('captchaInvalid')] } };
      }
    }

    // Normalize files into an array of File
    const files: File[] = Array.isArray(data.files) ? data.files : data.files ? [data.files] : [];

    const uploadResult = await uploadFilesToBucket(files).catch(
      (): UploadError => ({ success: false, uploaded: [], error: 'Problems with file uploading' }),
    );

    if (!uploadResult.success) {
      // For granular error per file need to return errors: { files: [{ file: {message} }] } and check it in createOnSubmitHandler
      return { success: false, errors: { files: [t('file_upload_base_error')] } };
    }

    const html = getEmailBody(data, uploadResult.uploaded);

    await mailTransport.sendMail({
      from: GMAIL_USER,
      to: GMAIL_USER,
      subject: 'Contact form from z1makCV',
      html,
      attachments: await Promise.all(
        files.map(async (file) => ({
          filename: file.name,
          content: Buffer.from(await file.arrayBuffer()),
          contentType: file.type || 'application/octet-stream',
        })),
      ),
    });
  },
);

function generateUniqueKey(originalName: string) {
  const safeName = originalName.replace(/[^a-zA-Z0-9._-]/g, '_');
  const timestamp = Date.now();
  const rand = Math.random().toString(36).slice(2, 8);
  return `${timestamp}-${rand}-${safeName}`;
}

function buildS3PublicUrl(key: string) {
  // Assumes the bucket allows public read; adjust if using signed URLs
  return `https://${AWS_S3_BUCKET}.s3.${AWS_REGION}.amazonaws.com/${encodeURIComponent(key)}`;
}

async function uploadFilesToBucket(files: File[]): Promise<UploadSuccess> {
  const uploaded = [] as { key: string; url: string; name: string }[];

  for (const file of files) {
    const arrayBuffer = await file.arrayBuffer();
    const key = generateUniqueKey(file.name);

    await s3Client.send(
      new PutObjectCommand({
        Bucket: AWS_S3_BUCKET,
        Key: key,
        Body: Buffer.from(arrayBuffer),
        ContentType: file.type || 'application/octet-stream',
        // ACL: 'public-read', // Don't need for public bucket (handled by Bucket policy)
      }),
    );

    uploaded.push({ key, url: buildS3PublicUrl(key), name: file.name });
  }

  return { success: true, uploaded };
}

function getEmailBody(
  data: ContactSchemaBEType,
  files: { key: string; url: string; name: string }[],
) {
  const filesListHtml = files.length
    ? `<ul>${files.map((f) => `<li><a href="${f.url}">${f.name}</a></li>`).join('')}</ul>`
    : '<p>No files uploaded.</p>';

  const html = `
    <div>
      <h2>New Contact Request</h2>
      <p><strong>Name:</strong> ${data.name}</p>
      <p><strong>Email:</strong> ${data.email}</p>
      <p><strong>Message:</strong></p>
      <p>${data.message.replace(/\n/g, '<br/>')}</p>
      <h3>Uploaded Files</h3>
      ${filesListHtml}
    </div>
  `;

  return html;
}

type SendContactActionErrorType = [string];
type SendContactActionReturn = Promise<{
  success: boolean;
  errors: {
    recaptchaToken?: SendContactActionErrorType;
    files?: SendContactActionErrorType;
  };
} | void>;

interface UploadSuccess {
  success: true;
  uploaded: {
    key: string;
    url: string;
    name: string;
  }[];
}

interface UploadError {
  success: false;
  uploaded: never[];
  error: string;
}
