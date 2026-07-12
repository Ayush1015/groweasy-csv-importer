import { useEffect, useState, useMemo } from 'react';
import Papa from 'papaparse';
import { useImportStore } from '@/store/useImportStore';
import { FileText, Trash2, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';
import { motion, useReducedMotion } from 'framer-motion';
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
} from '@tanstack/react-table';

export const PreviewStep = () => {
  const { file, setFile, setStep, setRawRecords, rawRecords } = useImportStore();
  const [loading, setLoading] = useState(true);
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    if (file && rawRecords.length === 0) {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          if (results.data.length === 0) {
            toast.error('CSV is empty');
            setStep(1);
            setFile(null);
            return;
          }
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          setRawRecords(results.data as Record<string, any>[]);
          setLoading(false);
        },
        error: (error) => {
          toast.error('Failed to parse CSV', { description: error.message });
          setStep(1);
          setFile(null);
        },
      });
    } else {
      setLoading(false);
    }
  }, [file, rawRecords.length, setFile, setRawRecords, setStep]);

  const columns = useMemo(() => {
    if (rawRecords.length === 0) return [];
    return Object.keys(rawRecords[0]).map((key) => ({
      header: key,
      accessorKey: key,
    }));
  }, [rawRecords]);

  const data = useMemo(() => rawRecords.slice(0, 50), [rawRecords]);

  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
        <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mb-4" />
        <p>Parsing CSV...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-emerald-500/10 text-emerald-500 rounded-xl">
            <FileText size={24} />
          </div>
          <div>
            <h3 className="font-semibold text-foreground text-lg">{file?.name}</h3>
            <p className="text-sm text-muted-foreground">
              {rawRecords.length} rows detected • {(file?.size ? file.size / 1024 : 0).toFixed(1)} KB
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              setFile(null);
              setRawRecords([]);
              setStep(1);
            }}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-destructive bg-destructive/10 hover:bg-destructive/20 active:scale-95 rounded-md transition-all"
          >
            <Trash2 size={16} />
            Cancel
          </button>
          <button
            onClick={() => setStep(3)}
            className="flex items-center gap-2 px-5 py-2 text-sm font-medium text-white bg-emerald-500 hover:bg-emerald-600 active:scale-95 rounded-md shadow-sm transition-all"
          >
            Confirm Import
            <ArrowRight size={16} />
          </button>
        </div>
      </div>

      <div className="border rounded-xl overflow-hidden bg-card shadow-sm">
        <div className="overflow-auto max-h-[450px]">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-muted-foreground uppercase bg-muted/80 sticky top-0 z-10 backdrop-blur-md supports-backdrop-filter:bg-muted/50 shadow-sm">
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <th key={header.id} className="px-4 py-4 font-semibold whitespace-nowrap">
                      {flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {table.getRowModel().rows.map((row, i) => (
                <motion.tr 
                  key={row.id} 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ 
                    duration: shouldReduceMotion ? 0 : 0.2, 
                    delay: shouldReduceMotion ? 0 : Math.min(i * 0.03, 0.45) 
                  }}
                  className="border-b last:border-0 hover:bg-muted/80 transition-colors"
                >
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="px-4 py-3 truncate max-w-[200px]">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
        {rawRecords.length > 50 && (
          <div className="p-3 text-center text-xs text-muted-foreground border-t bg-muted/30">
            Showing 50 of {rawRecords.length} rows for preview.
          </div>
        )}
      </div>
    </div>
  );
};
