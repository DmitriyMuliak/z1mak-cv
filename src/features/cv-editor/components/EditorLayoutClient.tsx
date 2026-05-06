'use client';

import dynamic from 'next/dynamic';

const EditorLayout = dynamic(() => import('./EditorLayout').then((m) => m.EditorLayout), {
  ssr: false,
});

export function EditorLayoutClient() {
  return <EditorLayout />;
}
