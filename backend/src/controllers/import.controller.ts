import { Request, Response, NextFunction } from 'express';
import pLimit from 'p-limit';
import { env } from '../config/env';
import { parseCsv } from '../services/csv.service';
import { processBatchWithAI } from '../services/ai.service';
import { validateAndFilterRecords } from '../services/validation.service';
import { ImportResult } from '../types/crm.types';
import { logger } from '../utils/logger';

export const importCsv = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({ success: false, message: 'No file uploaded' });
      return;
    }

    // 1. Parse CSV
    const rawRecords = parseCsv(req.file.buffer);
    if (rawRecords.length === 0) {
      res.status(400).json({ success: false, message: 'CSV is empty' });
      return;
    }

    logger.info(`Parsed ${rawRecords.length} rows from CSV`);

    // 2. Chunking
    const batchSize = env.BATCH_SIZE;
    const batches: Record<string, any>[][] = [];
    for (let i = 0; i < rawRecords.length; i += batchSize) {
      batches.push(rawRecords.slice(i, i + batchSize));
    }

    // 3. Process batches concurrently with a cap
    const limit = pLimit(env.CONCURRENCY_CAP);
    const aiResults = await Promise.all(
      batches.map((batch) => limit(() => processBatchWithAI(batch).catch((err) => {
        logger.error('Batch processing failed completely, marking as skipped', err);
        // If AI fails completely after retries, return an array of empty objects to be caught by validation
        return batch.map(() => ({ _internal_error: 'AI parsing failed' }));
      })))
    );

    // Flatten AI results
    const flatAiRecords = aiResults.flat();

    // 4. Validate and Apply Skip Logic
    const { records = [], skippedRecords = [] } = validateAndFilterRecords(flatAiRecords, rawRecords);

    // 5. Aggregate result
    const result: ImportResult = {
      success: true,
      totalProcessed: rawRecords.length,
      totalImported: records.length,
      totalSkipped: skippedRecords.length,
      records,
      skippedRecords,
    };

    res.json(result);
  } catch (error) {
    next(error);
  }
};
