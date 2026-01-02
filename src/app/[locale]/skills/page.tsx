import { getLocale } from 'next-intl/server';
import { getMdxContent } from '@/lib/getMdxContent';

export default async function SkillsPage() {
  const locale = await getLocale();
  // Also we can use Component approach
  // import { MDXRemote } from 'next-mdx-remote/rsc';
  // import SkillsPageContent from './skills.mdx';
  const { content } = await getMdxContent('skills', locale);

  return <div className="md:p-8">{content}</div>;
}
