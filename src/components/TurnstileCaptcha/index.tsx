'use client';

// Dashboard - https://dash.cloudflare.com/f050cd1ac717dcd0b3d3584dbbd54a58/turnstile
// Testing - https://developers.cloudflare.com/turnstile/troubleshooting/testing/
// Integration - https://docs.page/marsidev/react-turnstile
// IntegrationSupabase - https://supabase.com/docs/guides/auth/auth-captcha?queryGroups=captcha-method&captcha-method=turnstile-2
// Additional Clearance Check - https://developers.cloudflare.com/cloudflare-challenges/concepts/clearance/

import { publicPrEnv } from '@/utils/processEnv/public';
import { CSSProperties, useImperativeHandle, useRef } from 'react';
import { Turnstile, TurnstileInstance } from '@marsidev/react-turnstile';
import { useTheme } from 'next-themes';
import { useLocale } from 'next-intl';

export interface TurnstileCaptchaRef {
  reset: () => void;
}
interface CaptchaBoxProps {
  onVerify: (token: string | undefined) => void;
  actionName: string;
  containerClassName?: string;
  containerStyle?: CSSProperties;
  ref?: React.Ref<TurnstileCaptchaRef>;
}

export function TurnstileCaptcha({
  onVerify,
  actionName,
  containerClassName,
  containerStyle,
  ref,
}: CaptchaBoxProps) {
  const { resolvedTheme } = useTheme();
  const language = useLocale();
  const captchaRef = useRef<TurnstileInstance | undefined>(undefined);

  useImperativeHandle(ref, () => ({
    reset: () => {
      captchaRef.current?.reset();
    },
  }));

  const handleExpired = () => {
    onVerify(undefined);
  };

  const handleError = () => {
    onVerify(undefined);
  };

  const handleChange = (token: string | undefined) => {
    onVerify(token);
  };

  return (
    <div className={containerClassName} style={containerStyle}>
      <Turnstile
        ref={captchaRef}
        siteKey={publicPrEnv.NEXT_PUBLIC_CLOUDFLARE_CAPTCHA_SITE_KEY}
        onError={handleError}
        onExpire={handleExpired}
        onSuccess={handleChange}
        options={{
          action: `submit-${actionName}-form`,
          theme: resolvedTheme as 'dark' | 'light',
          size: 'flexible',
          language,
        }}
      />
    </div>
  );
}
