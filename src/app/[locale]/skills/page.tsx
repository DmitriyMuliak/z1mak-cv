import { setRequestLocale } from 'next-intl/server';
import { getMdxContent } from '@/lib/getMdxContent';

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function SkillsPage({ params }: Props) {
  const { locale } = await params;

  setRequestLocale(locale);

  // Also we can use Component approach
  // import { MDXRemote } from 'next-mdx-remote/rsc';
  // import SkillsPageContent from './skills.mdx';
  const { content } = await getMdxContent('skills', locale);

  return <div className="pb-4 md:p-8">{content}</div>;
}
