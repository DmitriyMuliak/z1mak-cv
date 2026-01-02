import { envType } from '@/utils/envType';
import { TextAreaCss, TextAreaDiv, TextAreaJs } from '../Textarea';
import { ServerFormUseAction } from '../FullServerSideForm/ServerFormUseAction';
import { ServerForm } from '../FullServerSideForm/serverForm';
import { SphereLoader } from '../Loaders/Sphere';
import { Sphere3DLoader } from '../Loaders/Sphere3D';
import { TwoLineCircle } from '../Loaders/TwoLineCircle';

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

const Spinners = () => {
  return (
    <>
      <SphereLoader />
      <Sphere3DLoader />
      <TwoLineCircle />
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
      <Spinners />
      <ServerForms />
      <TextAreas />
    </>
  ) : null;
};
