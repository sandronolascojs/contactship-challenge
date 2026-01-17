export interface SyncExternalLeadsJobData {
  source: string;
  batchSize?: number;
}

export interface GenerateSummaryJobData {
  leadId: string;
}

export interface SyncJobResult {
  syncJobId: string;
  recordsProcessed: number;
  recordsCreated: number;
  recordsSkipped: number;
  errors: { leadId: string; message: string }[];
}
