import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { UploadCloud, FileType, AlertCircle } from 'lucide-react';
import { useImportStore } from '@/store/useImportStore';
import { toast } from 'sonner';
import { motion, useReducedMotion } from 'framer-motion';

export const UploadStep = () => {
  const { setFile, setStep } = useImportStore();
  const shouldReduceMotion = useReducedMotion();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const onDrop = useCallback((acceptedFiles: File[], rejectedFiles: any[]) => {
    if (rejectedFiles.length > 0) {
      toast.error('Invalid file', {
        description: 'Please upload a CSV file under 5MB.',
      });
      return;
    }
    
    if (acceptedFiles.length > 0) {
      setFile(acceptedFiles[0]);
      setStep(2);
    }
  }, [setFile, setStep]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
      'application/vnd.ms-excel': ['.csv']
    },
    maxSize: 5 * 1024 * 1024, // 5MB
    multiple: false,
  });

  return (
    <div className="flex flex-col items-center justify-center min-h-[350px]">
      <motion.div
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        {...(getRootProps() as any)}
        animate={{
          scale: isDragActive ? (shouldReduceMotion ? 1 : 1.02) : 1,
        }}
        transition={{ duration: shouldReduceMotion ? 0 : 0.2 }}
        className={`w-full max-w-xl p-14 border-2 border-dashed rounded-3xl transition-colors duration-200 cursor-pointer flex flex-col items-center text-center group
          ${isDragActive ? 'border-emerald-500 bg-emerald-500/5' : 'border-border hover:border-emerald-500/50 hover:bg-muted/50'}
        `}
      >
        <input {...getInputProps()} />
        
        <motion.div 
          className="p-5 rounded-full bg-emerald-500/10 text-emerald-500 mb-6 shadow-inner shadow-emerald-500/20"
          animate={{
            y: shouldReduceMotion ? 0 : [0, -6, 0],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          <UploadCloud size={36} strokeWidth={2.5} />
        </motion.div>
        
        <h3 className="text-2xl font-bold mb-3 tracking-tight">
          {isDragActive ? 'Drop your CSV here' : 'Drag & drop your CSV'}
        </h3>
        
        <p className="text-muted-foreground mb-8 text-base">
          or <span className="text-emerald-600 dark:text-emerald-400 font-medium group-hover:underline underline-offset-4">click to browse</span> from your computer
        </p>
        
        <div className="flex items-center gap-6 text-sm text-muted-foreground font-medium bg-muted/40 px-6 py-2.5 rounded-full border border-border/50 shadow-sm">
          <div className="flex items-center gap-2">
            <FileType size={16} className="text-emerald-600 dark:text-emerald-400" />
            CSV only
          </div>
          <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground/30" />
          <div className="flex items-center gap-2">
            <AlertCircle size={16} className="text-amber-500" />
            Max 5MB
          </div>
        </div>
      </motion.div>
    </div>
  );
};
