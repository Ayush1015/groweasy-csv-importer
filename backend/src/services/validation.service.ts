import { CrmRecordSchema, CrmRecord, ImportResult } from '../types/crm.types';

export const validateAndFilterRecords = (
  aiRecords: any[],
  rawRecords: Record<string, any>[]
): Partial<ImportResult> => {
  const imported: CrmRecord[] = [];
  const skipped: Array<{ row: Record<string, any>; reason: string }> = [];

  aiRecords.forEach((record, index) => {
    const rawRow = rawRecords[index] || {};

    // First validate with Zod
    console.log('AI Record before parse:', record);
    const validationResult = CrmRecordSchema.safeParse(record);

    if (!validationResult.success) {
      skipped.push({
        row: rawRow,
        reason: 'Failed strict schema validation: ' + validationResult.error.issues.map((e: any) => `${e.path.join('.')}: ${e.message}`).join(', '),
      });
      return;
    }

    const validRecord = validationResult.data;

    // Apply skip rule: If NEITHER a valid email NOR a valid mobile number exists
    if (!validRecord.email && !validRecord.mobile_without_country_code) {
      skipped.push({
        row: rawRow,
        reason: 'No email or mobile number found',
      });
      return;
    }

    imported.push(validRecord);
  });

  return {
    records: imported,
    skippedRecords: skipped,
  };
};
