import { getUserInfo } from '@/actions/auth/getUser';
import { signOutAction } from '@/actions/auth/signOut';
import { DevComponent } from '@/components/DevComponent';
// import { AiInput } from '@/components/ResumeChat/AiInput';
import { Button } from '@/components/ui/button';
import { envType } from '@/utils/envType';

export async function ShowUserInfo() {
  const info = await getUserInfo();
  return (
    <div className="p-8">
      <pre>{info}</pre>
    </div>
  );
}

export default async function CVCheckerPage() {
  return (
    <div className="p-8">
      <h2 className="text-3xl font-semibold mb-4">CV Checker</h2>
      <DevComponent />
      {envType.isDev ? <Button onClick={signOutAction}>Sign Out</Button> : null}
      {/* <AiInput /> */}
      {/* <ShowUserInfo /> */}
    </div>
  );
}
