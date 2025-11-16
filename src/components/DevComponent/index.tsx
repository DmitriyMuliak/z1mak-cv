import { envType } from '@/utils/envType';
import { TextAreaCss, TextAreaDiv, TextAreaJs } from '../Textarea';
import { ServerFormUseAction } from '../FullServerSideForm/ServerFormUseAction';
import { ServerForm } from '../FullServerSideForm/ServerForm';

const TextAreas = () => {
  return (
    <>
      <TextAreaCss />
      <TextAreaDiv />
      <TextAreaJs />
    </>
  );
};

const ServerForms = () => {
  return (
    <>
      <ServerForm />
      <ServerFormUseAction />
    </>
  );
};

export const DevComponent = () => {
  // eslint-disable-next-line prefer-const
  let innerShow = false;
  // innerShow = true;
  // innerShow = false;
  const show = innerShow && envType.isDev;
  return show ? (
    <>
      <ServerForms />
      <TextAreas />
    </>
  ) : null;
};
