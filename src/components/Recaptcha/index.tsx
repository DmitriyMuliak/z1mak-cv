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
  const [_expired, setExpired] = useState(false);

  // 🔁 коли токен спливає
  const handleExpired = () => {
    setExpired(true);
    onVerify(null);
  };

  // ✅ коли користувач проходить перевірку
  const handleChange = (token: string | null) => {
    setExpired(false);
    onVerify(token);
  };

  // 🧹 якщо компонент став невидимим (файли видалили)
  // не видаляємо капчу, просто скидаємо токен
  useEffect(() => {
    if (!visible && captchaRef.current) {
      captchaRef.current.reset();
      setExpired(false);
    }
  }, [visible]);

  return (
    <div
      style={{
        display: visible ? 'block' : 'none', // 🔹 просто ховаємо, не unmount
        transition: 'opacity 0.3s ease',
        opacity: visible ? 1 : 0,
      }}
    >
      <ReCAPTCHA
        ref={captchaRef}
        sitekey={publicPrEnv.NEXT_PUBLIC_RECAPTCHA_SITE_KEY}
        onChange={handleChange}
        onExpired={handleExpired}
      />
      {/* {expired && (
        <p style={{ color: 'red', fontSize: '0.9rem', marginTop: 4 }}>
          Термін дії капчі сплив — пройди перевірку знову.
        </p>
      )} */}
    </div>
  );
}
