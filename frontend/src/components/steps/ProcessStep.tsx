import { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { useImportStore } from '@/store/useImportStore';
import { toast } from 'sonner';
import { Sparkles, AlertTriangle, RefreshCcw, Loader2 } from 'lucide-react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';

const LOADING_STATUSES = [
  "Parsing CSV structure...",
  "Analyzing data types...",
  "Mapping fields to CRM schema...",
  "Validating records...",
  "Applying AI transformations...",
  "Finalizing import...",
];

export const ProcessStep = () => {
  const { file, setStep, setIsProcessing, setResults, error, setError } = useImportStore();
  const processed = useRef(false);
  const [statusIndex, setStatusIndex] = useState(0);
  const shouldReduceMotion = useReducedMotion();

  // Rotate status text
  useEffect(() => {
    if (error) return;
    const interval = setInterval(() => {
      setStatusIndex((prev) => (prev + 1) % LOADING_STATUSES.length);
    }, 1500);
    return () => clearInterval(interval);
  }, [error]);

  const triggerImport = async () => {
    if (!file) return;
    setError(null);
    setIsProcessing(true);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await axios.post('http://localhost:5000/api/import', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      
      setResults(response.data);
      setStep(4);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Failed to process import';
      setError(msg);
      toast.error('Import failed', { description: msg });
    } finally {
      setIsProcessing(false);
    }
  };

  useEffect(() => {
    if (!processed.current) {
      processed.current = true;
      triggerImport();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center text-destructive mb-4">
          <AlertTriangle size={32} />
        </div>
        <h3 className="text-xl font-semibold mb-2">Import Failed</h3>
        <p className="text-muted-foreground mb-6 max-w-md">{error}</p>
        <button
          onClick={() => {
            processed.current = false;
            triggerImport();
          }}
          className="flex items-center gap-2 px-6 py-2 bg-foreground text-background rounded-md shadow-sm font-medium hover:bg-foreground/90 active:scale-95 transition-all"
        >
          <RefreshCcw size={16} />
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center py-24 text-center max-w-2xl mx-auto">
      <div className="relative mb-8">
        <motion.div 
          className="absolute inset-0 bg-emerald-500 blur-2xl opacity-20 rounded-full"
          animate={{ scale: shouldReduceMotion ? 1 : [1, 1.2, 1], opacity: shouldReduceMotion ? 0.2 : [0.2, 0.4, 0.2] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        />
        <div className="relative bg-background border-2 border-emerald-500/30 p-5 rounded-full shadow-lg shadow-emerald-500/10">
          <motion.div
            animate={{ rotate: shouldReduceMotion ? 0 : 360 }}
            transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
          >
            <Sparkles className="text-emerald-500" size={40} strokeWidth={1.5} />
          </motion.div>
        </div>
      </div>
      
      <h3 className="text-2xl font-bold mb-6 tracking-tight">AI is working its magic...</h3>
      
      <div className="w-full bg-muted/30 rounded-xl p-6 border shadow-inner relative overflow-hidden">
        {/* Shimmer effect */}
        {!shouldReduceMotion && (
          <motion.div 
            className="absolute top-0 bottom-0 w-1/2 bg-linear-to-r from-transparent via-emerald-500/5 to-transparent skew-x-12"
            animate={{ left: ['-100%', '200%'] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          />
        )}
        
        {/* Placeholder lines to look like processing data */}
        <div className="space-y-4 mb-6 opacity-60">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex gap-4 items-center">
              <div className="h-2.5 w-1/4 bg-muted-foreground/20 rounded-full"></div>
              <div className="h-2.5 w-1/2 bg-muted-foreground/20 rounded-full"></div>
              <div className="h-2.5 w-1/4 bg-emerald-500/20 rounded-full"></div>
            </div>
          ))}
        </div>

        <div className="h-6 relative overflow-hidden flex justify-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={statusIndex}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -20, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="absolute text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-2"
            >
              <Loader2 size={16} className="animate-spin" />
              {LOADING_STATUSES[statusIndex]}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};
