import Papa from 'papaparse';

export const parseCsv = (csvBuffer: Buffer): Record<string, any>[] => {
  const csvString = csvBuffer.toString('utf-8');
  
  const parsed = Papa.parse(csvString, {
    header: true,
    skipEmptyLines: true,
  });

  if (parsed.errors && parsed.errors.length > 0) {
    console.warn('CSV parsing generated some warnings/errors:', parsed.errors);
  }

  return parsed.data as Record<string, any>[];
};
