import { z } from 'zod';

export const CrmStatusEnum = z.enum([
  'GOOD_LEAD_FOLLOW_UP',
  'DID_NOT_CONNECT',
  'BAD_LEAD',
  'SALE_DONE',
]);

export const DataSourceEnum = z.enum([
  'leads_on_demand',
  'meridian_tower',
  'eden_park',
  'varah_swamy',
  'sarjapur_plots',
]);

export const CrmRecordSchema = z.object({
  created_at: z.string().default(''), // Normalized to ISO 8601 YYYY-MM-DD HH:mm:ss
  name: z.string().default(''),
  email: z.string().default(''),
  country_code: z.string().default(''),
  mobile_without_country_code: z.string().default(''),
  company: z.string().default(''),
  city: z.string().default(''),
  state: z.string().default(''),
  country: z.string().default(''),
  lead_owner: z.string().default(''),
  crm_status: z.union([CrmStatusEnum, z.literal('')]).catch('').default(''),
  crm_note: z.string().default(''),
  data_source: z.union([DataSourceEnum, z.literal('')]).catch('').default(''),
  possession_time: z.string().default(''),
  description: z.string().default(''),
});

export type CrmRecord = z.infer<typeof CrmRecordSchema>;

export interface ImportResult {
  success: boolean;
  totalProcessed: number;
  totalImported: number;
  totalSkipped: number;
  records: CrmRecord[];
  skippedRecords: Array<{
    row: Record<string, any>;
    reason: string;
  }>;
}
