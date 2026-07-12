import { useState, useMemo } from 'react';
import { useImportStore } from '@/store/useImportStore';
import { CheckCircle2, AlertCircle, Database, ChevronDown, ChevronRight, Download } from 'lucide-react';
import CountUp from 'react-countup';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
} from '@tanstack/react-table';

export const ResultsStep = () => {
  const { results, reset } = useImportStore();
  const [showSkipped, setShowSkipped] = useState(false);
  const shouldReduceMotion = useReducedMotion();

  const columns = useMemo(() => {
    return results?.records[0] ? Object.keys(results.records[0]).map((key) => ({
      header: key,
      accessorKey: key,
    })) : [];
  }, [results]);

  const displayRecords = useMemo(() => results?.records.slice(0, 100) || [], [results]);
  const displaySkipped = useMemo(() => results?.skippedRecords.slice(0, 100) || [], [results]);

  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data: displayRecords,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  if (!results) return null;

  const handleDownload = () => {
    const jsonStr = JSON.stringify(results.records, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'imported_leads.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col space-y-8">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: shouldReduceMotion ? 0 : 0.4, delay: 0.1 }}
          className="p-5 rounded-2xl border bg-card flex items-center gap-5 shadow-sm"
        >
          <div className="p-3.5 bg-blue-500/10 text-blue-500 rounded-xl shadow-inner shadow-blue-500/20">
            <Database size={26} strokeWidth={2.5} />
          </div>
          <div>
            <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-1">Processed</p>
            <h4 className="text-3xl font-bold tracking-tight">
              <CountUp end={results.totalProcessed} duration={shouldReduceMotion ? 0 : 2} separator="," />
            </h4>
          </div>
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: shouldReduceMotion ? 0 : 0.4, delay: 0.2 }}
          className="p-5 rounded-2xl border bg-card flex items-center gap-5 shadow-sm"
        >
          <div className="p-3.5 bg-emerald-500/10 text-emerald-500 rounded-xl shadow-inner shadow-emerald-500/20">
            <CheckCircle2 size={26} strokeWidth={2.5} />
          </div>
          <div>
            <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-1">Imported</p>
            <h4 className="text-3xl font-bold tracking-tight">
              <CountUp end={results.totalImported} duration={shouldReduceMotion ? 0 : 2} separator="," />
            </h4>
          </div>
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: shouldReduceMotion ? 0 : 0.4, delay: 0.3 }}
          className="p-5 rounded-2xl border bg-card flex items-center gap-5 shadow-sm"
        >
          <div className="p-3.5 bg-amber-500/10 text-amber-500 rounded-xl shadow-inner shadow-amber-500/20">
            <AlertCircle size={26} strokeWidth={2.5} />
          </div>
          <div>
            <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-1">Skipped</p>
            <h4 className="text-3xl font-bold tracking-tight">
              <CountUp end={results.totalSkipped} duration={shouldReduceMotion ? 0 : 2} separator="," />
            </h4>
          </div>
        </motion.div>
      </div>

      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: shouldReduceMotion ? 0 : 0.4, delay: 0.4 }}
        className="flex justify-between items-center"
      >
        <h3 className="text-xl font-bold tracking-tight">Mapped Records</h3>
        <div className="flex gap-3">
          <button
            onClick={handleDownload}
            disabled={results.records.length === 0}
            className="flex items-center gap-2 px-5 py-2 text-sm font-medium text-foreground border rounded-md hover:bg-muted/80 active:scale-95 transition-all disabled:opacity-50 disabled:pointer-events-none"
          >
            <Download size={16} />
            Export JSON
          </button>
          <button
            onClick={reset}
            className="flex items-center gap-2 px-5 py-2 text-sm font-medium text-white bg-emerald-500 hover:bg-emerald-600 active:scale-95 rounded-md shadow-sm transition-all"
          >
            Start New Import
          </button>
        </div>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: shouldReduceMotion ? 0 : 0.5, delay: 0.5 }}
      >
        {results.records.length > 0 ? (
          <div className="border rounded-xl overflow-hidden bg-card shadow-sm">
            <div className="overflow-auto max-h-[450px]">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-muted-foreground uppercase bg-muted/80 sticky top-0 z-10 backdrop-blur-md supports-backdrop-filter:bg-muted/50 shadow-sm">
                  {table.getHeaderGroups().map((headerGroup) => (
                    <tr key={headerGroup.id}>
                      {headerGroup.headers.map((header) => (
                        <th key={header.id} className="px-4 py-4 font-semibold whitespace-nowrap">
                          {flexRender(header.column.columnDef.header, header.getContext())}
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
                        delay: shouldReduceMotion ? 0 : Math.min(0.6 + i * 0.02, 1.2) 
                      }}
                      className="border-b last:border-0 hover:bg-muted/80 transition-colors"
                    >
                      {row.getVisibleCells().map((cell) => (
                        <td key={cell.id} className="px-4 py-3 truncate max-w-[200px]" title={String(cell.getValue())}>
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </td>
                      ))}
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
            {results.records.length > 100 && (
              <div className="p-3 text-center text-xs text-muted-foreground border-t bg-muted/30">
                Showing 100 of {results.records.length} records. Export JSON to view all.
              </div>
            )}
          </div>
        ) : (
          <div className="p-12 text-center border rounded-xl bg-muted/20 text-muted-foreground">
            No records were successfully imported.
          </div>
        )}
      </motion.div>

      {/* Skipped Records Collapsible */}
      {results.skippedRecords.length > 0 && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: shouldReduceMotion ? 0 : 0.5, delay: 0.7 }}
          className="border border-amber-500/30 rounded-xl overflow-hidden bg-amber-50/30 dark:bg-amber-950/10 shadow-sm"
        >
          <button
            onClick={() => setShowSkipped(!showSkipped)}
            className="flex items-center justify-between w-full p-5 text-left font-semibold hover:bg-amber-50/50 dark:hover:bg-amber-950/30 transition-colors border-l-4 border-l-amber-500"
          >
            <div className="flex items-center gap-3 text-amber-700 dark:text-amber-400">
              <div className="p-1.5 bg-amber-500/20 rounded-lg">
                <AlertCircle size={20} />
              </div>
              <span className="text-base">View Skipped Records ({results.skippedRecords.length})</span>
            </div>
            {showSkipped ? <ChevronDown size={20} className="text-amber-700 dark:text-amber-400" /> : <ChevronRight size={20} className="text-amber-700 dark:text-amber-400" />}
          </button>
          
          <AnimatePresence>
            {showSkipped && (
              <motion.div 
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="border-t border-amber-500/20"
              >
                <div className="overflow-auto max-h-[350px]">
                  <table className="w-full text-sm text-left">
                    <thead className="text-xs text-amber-800/70 dark:text-amber-200/70 uppercase bg-amber-100/50 dark:bg-amber-900/20 sticky top-0">
                      <tr>
                        <th className="px-5 py-4 font-semibold w-1/3">Reason</th>
                        <th className="px-5 py-4 font-semibold">Raw Row Data</th>
                      </tr>
                    </thead>
                    <tbody>
                      {displaySkipped.map((item, idx) => (
                        <tr key={idx} className="border-b border-amber-500/10 last:border-0 hover:bg-amber-100/30 dark:hover:bg-amber-900/20 transition-colors">
                          <td className="px-5 py-3 text-amber-700 dark:text-amber-400 font-medium">
                            {item.reason}
                          </td>
                          <td className="px-5 py-3 font-mono text-xs truncate max-w-xl text-muted-foreground">
                            {JSON.stringify(item.row)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {results.skippedRecords.length > 100 && (
                  <div className="p-3 text-center text-xs text-amber-700/70 border-t border-amber-500/20 bg-amber-50/50 dark:bg-amber-900/20">
                    Showing first 100 skipped records.
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  );
};
