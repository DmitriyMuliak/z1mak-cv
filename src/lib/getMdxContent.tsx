import fs from 'fs';
import path from 'path';
import { compileMDX } from 'next-mdx-remote/rsc';
import { remarkUnravelMdx } from 'remark-unravel-mdx';
import * as CardComponents from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Link } from '@/components/Link';
import * as Icons from '@/components/icons';
import { paths } from '@/consts/routes';

export async function getMdxContent(slug: string, locale: string) {
  const filePath = path.join(process.cwd(), 'src/content', slug, `${slug}.${locale}.mdx`);
  const source = fs.readFileSync(filePath, 'utf-8');

  const { content } = await compileMDX({
    source,
    options: {
      parseFrontmatter: true,
      scope: { paths },
      mdxOptions: {
        format: 'mdx',
        remarkPlugins: [remarkUnravelMdx], // remarkUnravelMdx: Prevent unnecessary paragraph wrapping.
        // rehypePlugins: [],
      },
    },
    components: {
      ...CardComponents,
      ...Icons,
      Separator,
      Link,
    },
  });

  return { content };
}
