// TODO: FIX ../css/global import type
import en from '../messages/en.json';
type Messages = typeof en;

declare module 'next-intl' {
  export interface AppConfig {
    Messages: Messages; // Record<DeepKeyOf<Messages>, string>;
  }
}
