'use client';

import { useCvStore } from '../store/useCvStore';
import { ModeBar } from './ModeBar';
import { SendToAnalyzeForm } from './SendToAnalyzeForm';
import { HistoryModal } from './HistoryModal';

export function CvCheckerStartFlow() {
  const { newJobMode, setNewJobMode } = useCvStore();

  return (
    <div className="w-full max-w-4xl mx-auto">
      <HistoryModal />
      <ModeBar mode={newJobMode} onChange={setNewJobMode} />
      <SendToAnalyzeForm mode={newJobMode} />
    </div>
  );
}
