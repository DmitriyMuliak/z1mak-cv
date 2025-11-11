'use server';

import { SignUpSchemaBase } from '@/schema/loginSchema';
import { createFormAction } from '../utils'; // ActionReturn,
import { createServerClient } from '@/lib/supabase/server';
import { getBaseUrl } from '@/utils/getBaseUrl';
import { devLogger } from '@/lib/devLogger';

export const signUpWithEmailAction = createFormAction(
  SignUpSchemaBase,
  async (dataForm, _formData, additionalFEData) => {
    const state = additionalFEData as string;
    const url = getBaseUrl();
    const redirectTo = state ? url + state : url; // should be full url because of supabase auth service logic
    const supabase = await createServerClient();
    const { data, error } = await supabase.auth.signUp({
      email: dataForm.email,
      password: dataForm.password,
      options: {
        emailRedirectTo: redirectTo,
        data: {
          full_name: dataForm.name, // add to user.user_metadata
        },
      },
    });
    if (error) {
      devLogger.log('signInWithEmailAction Error', error);
    }
    devLogger.log('signUp data', data);
  },
);
