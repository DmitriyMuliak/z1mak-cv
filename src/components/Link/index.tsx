'use client';

import { BaseLink } from '@/navigation';

type BaseLinkProps = React.ComponentProps<typeof BaseLink>;
type Props = BaseLinkProps & { dispatchLocationChangeEvent?: boolean };

export const Link: React.FC<Props> = ({ onClick, dispatchLocationChangeEvent, ...rest }) => {
  const isDispatchLocChange = dispatchLocationChangeEvent ?? true;

  return (
    <BaseLink
      {...rest}
      onClick={(e) => {
        isDispatchLocChange &&
          window.dispatchEvent(new CustomEvent('locationChangeCustom', { detail: rest.href }));
        onClick && onClick(e);
      }}
    />
  );
};
