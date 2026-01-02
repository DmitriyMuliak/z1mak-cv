import type { Messages } from './types';

type Props = {
  messages: Messages['TermsOfService'];
};

export function TermsOfService({ messages }: Props) {
  return (
    <div className="md:p-8">
      <div className="p-6 frosted-card">
        <h2 className="text-3xl font-semibold mb-4">{messages.title}</h2>
        <p className="leading-7 [&:not(:first-child)]:mt-6">{messages.section1}</p>
        <p className="leading-7 [&:not(:first-child)]:mt-6">{messages.section2}</p>
        <p className="leading-7 [&:not(:first-child)]:mt-6">{messages.section3Intro}</p>
        <ul className="my-6 ml-6 list-disc [&>li]:mt-2">
          <li>{messages.section3Item1}</li>
          <li>{messages.section3Item2}</li>
          <li>{messages.section3Item3}</li>
        </ul>
        <p className="leading-7 [&:not(:first-child)]:mt-6">{messages.section4}</p>
        <p className="leading-7 [&:not(:first-child)]:mt-6">{messages.section5}</p>
      </div>
    </div>
  );
}
