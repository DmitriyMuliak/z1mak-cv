'use client';

// Integration - https://developers.google.com/recaptcha/docs/display
// Dashboard - https://www.google.com/u/1/recaptcha/admin/site/737387342
// Enterprise - https://console.cloud.google.com/security/recaptcha/

import { publicPrEnv } from '@/utils/processEnv/public';
import { useRef, useState, useEffect } from 'react';
import ReCAPTCHA from 'react-google-recaptcha';

interface CaptchaBoxProps {
  visible: boolean;
  onVerify: (token: string | null) => void;
}

export function RecaptchaV2({ visible, onVerify }: CaptchaBoxProps) {
  const captchaRef = useRef<ReCAPTCHA | null>(null);
  const [_expired, setExpired] = useState(false); // Google show it's own message

  const handleExpired = () => {
    setExpired(true);
    onVerify(null);
  };

  const handleChange = (token: string | null) => {
    setExpired(false);
    onVerify(token);
  };

  useEffect(() => {
    if (!visible && captchaRef.current) {
      captchaRef.current.reset();
      setExpired(false);
    }
  }, [visible]);

  return (
    <div>
      <ReCAPTCHA
        ref={captchaRef}
        sitekey={publicPrEnv.NEXT_PUBLIC_RECAPTCHA_SITE_KEY}
        onChange={handleChange}
        onExpired={handleExpired}
      />
      {/* {expired && (
        <p style={{ color: 'red', fontSize: '0.9rem', marginTop: 4 }}>
          Captcha is expired — please pass it one more time.
        </p>
      )} */}
    </div>
  );
}
