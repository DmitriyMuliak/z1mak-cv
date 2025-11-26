// store/useCvStore.ts
import { create } from 'zustand';
import { AnalysisSchemaType } from '../schema/analysisSchema';

export type AddDescriptionBy = 'file' | 'text';

export interface Mode {
  evaluationMode: 'general' | 'byJob';
  domain: 'it' | 'common';
  depth: 'standard' | 'deep';
}

export interface JobRecord {
  id: string;
  file_path: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  result?: AnalysisSchemaType;
  created_at: string;
  updated_at?: string;
  mode: Mode;
}

interface CvState {
  lastReport: AnalysisSchemaType | null;
  newJobMode: Mode;
  currentJobId?: string | null;
  jobs: JobRecord[];
  setJobs: (jobs: JobRecord[]) => void;
  setCurrentJobId: (id?: string | null) => void;
  updateJob: (job: Partial<JobRecord> & { id: string }) => void;
  setNewJobMode: (newJobMode: Mode) => void;
  setLastReport: (newLastReport: AnalysisSchemaType) => void;
}

// TODO: add base data structures + dev tools + immer
export const useCvStore = create<CvState>((set) => ({
  lastReport: null,
  newJobMode: {
    evaluationMode: 'general',
    domain: 'it',
    depth: 'deep',
  },
  currentJobId: null,
  jobs: [],
  setJobs: (jobs) => set({ jobs }),
  setCurrentJobId: (id) => set({ currentJobId: id }),
  updateJob: (job) =>
    set((s) => ({ jobs: s.jobs.map((j) => (j.id === job.id ? { ...j, ...job } : j)) })),
  setNewJobMode: (newJobMode) => set({ newJobMode }),
  setLastReport: (lastReport) => set({ lastReport }),
}));
