import { getUserInfo } from '@/actions/auth/getUser';
import { signOutAction } from '@/actions/auth/signOut';
import { DevComponent } from '@/components/DevComponent';
import { Button } from '@/components/ui/button';
import { envType } from '@/utils/envType';
import { notFound } from 'next/navigation';

export async function ShowUserInfo() {
  const info = await getUserInfo();
  return (
    <div className="p-8">
      <pre>{info}</pre>
    </div>
  );
}

export async function InnerDevPage() {
  return (
    <div className="p-8">
      <Button onClick={signOutAction}>Sign Out</Button>
      <ShowUserInfo />
    </div>
  );
}

export default async function DevPage() {
  if (!envType.isDev) notFound();

  // const showInnerDev = true;
  const showInnerDev = false;
  return (
    <>
      {envType.isDev && showInnerDev ? <InnerDevPage /> : null}
      <DevComponent />
    </>
  );
}
