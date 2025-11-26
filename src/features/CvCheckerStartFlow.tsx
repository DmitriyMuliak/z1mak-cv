'use client';

import React from 'react';
import { useCvStore } from './store/useCvStore';
import { ModeBar } from './components/ModeBar';
import { SendToAnalyzeForm } from './components/SendToAnalyzeForm';

export function CvCheckerStartFlow() {
  const { newJobMode, setNewJobMode } = useCvStore();

  return (
    <div className="max-w-4xl mx-auto">
      <ModeBar mode={newJobMode} onChange={setNewJobMode} />
      <SendToAnalyzeForm mode={newJobMode} />
    </div>
  );
}
