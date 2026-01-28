import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ModeBar } from '@/features/cv-checker/components/ModeBar';
import { SendToAnalyzeForm } from '@/features/cv-checker/components/SendToAnalyzeForm';
import { Mode } from '@/features/cv-checker/store/useCvStore';

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
  useLocale: () => 'en',
}));

vi.mock('@/i18n/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

// Radix add a lot of execution of time
vi.mock('react-dropzone', () => ({
  __esModule: true,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  default: ({ children }: any) =>
    children({ getRootProps: () => ({}), getInputProps: () => ({}), isDragActive: false }),
}));

vi.mock('@/features/cv-checker/actions/sendToAnalyzeAction', () => ({
  sendToAnalyzeAction: vi.fn().mockResolvedValue({ success: true, data: { jobId: 'job-1' } }),
}));

const Wrapper = () => {
  const [mode, setMode] = useState<Mode>({
    evaluationMode: 'general',
    domain: 'it',
    depth: 'deep',
  });

  return (
    <>
      <ModeBar mode={mode} onChange={setMode} />
      <SendToAnalyzeForm mode={mode} />
    </>
  );
};

describe('CV analyzer mode switch', () => {
  it('shows job comparison fields when evaluation mode is switched to byJob', async () => {
    render(<Wrapper />);

    // job form is hidden in general mode
    expect(screen.queryByText('jobForm.title')).not.toBeInTheDocument();

    // open evaluation select (first combobox) and choose "byJob"
    const [evaluationSelect] = screen.getAllByRole('combobox');
    fireEvent.click(evaluationSelect);
    fireEvent.click(await screen.findByText('evaluation.items.byJob'));

    // job form becomes visible
    expect(await screen.findByText('jobForm.title')).toBeInTheDocument();
  });
});
