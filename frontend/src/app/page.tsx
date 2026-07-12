'use client';

import { useImportStore } from '@/store/useImportStore';
import { Layout } from '@/components/layout/Layout';
import { UploadStep } from '@/components/steps/UploadStep';
import { PreviewStep } from '@/components/steps/PreviewStep';
import { ProcessStep } from '@/components/steps/ProcessStep';
import { ResultsStep } from '@/components/steps/ResultsStep';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';

export default function Home() {
  const currentStep = useImportStore((state) => state.step);
  const shouldReduceMotion = useReducedMotion();

  const getStepComponent = () => {
    switch (currentStep) {
      case 1: return <UploadStep key="step1" />;
      case 2: return <PreviewStep key="step2" />;
      case 3: return <ProcessStep key="step3" />;
      case 4: return <ResultsStep key="step4" />;
      default: return null;
    }
  };

  return (
    <Layout>
      <div className="relative w-full">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: shouldReduceMotion ? 0 : 0.3, ease: 'easeOut' }}
            className="w-full"
          >
            {getStepComponent()}
          </motion.div>
        </AnimatePresence>
      </div>
    </Layout>
  );
}
