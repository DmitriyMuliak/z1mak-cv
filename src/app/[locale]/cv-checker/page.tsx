import { getUserInfo } from '@/actions/auth/getUser';
import { signOutAction } from '@/actions/auth/signOut';
import { Button } from '@/components/ui/button';
import { publicPrEnv } from '@/utils/processEnv/public';

const isDev = publicPrEnv.NODE_ENV === 'development';

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
      {isDev ? <Button onClick={signOutAction}>Sign Out</Button> : null}
      {/* <ShowUserInfo /> */}
    </div>
  );
}
