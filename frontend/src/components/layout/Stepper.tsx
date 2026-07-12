import { Check } from 'lucide-react';
import { useImportStore } from '@/store/useImportStore';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';

const steps = [
  { id: 1, name: 'Upload CSV' },
  { id: 2, name: 'Preview' },
  { id: 3, name: 'Process AI' },
  { id: 4, name: 'Results' },
];

export const Stepper = () => {
  const currentStep = useImportStore((state) => state.step);
  const shouldReduceMotion = useReducedMotion();

  return (
    <div className="w-full py-8">
      <div className="flex items-center justify-between relative">
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-[3px] bg-muted z-0 rounded-full overflow-hidden">
          <motion.div 
            className="h-full bg-emerald-500" 
            initial={false}
            animate={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
            transition={{ duration: shouldReduceMotion ? 0 : 0.5, ease: "easeInOut" }}
          />
        </div>

        {steps.map((step) => {
          const isActive = currentStep === step.id;
          const isCompleted = currentStep > step.id;

          return (
            <div key={step.id} className="relative z-10 flex flex-col items-center gap-3">
              <motion.div
                layout
                className={`flex h-11 w-11 items-center justify-center rounded-full border-2 bg-background font-semibold transition-colors duration-300 shadow-sm
                  ${isActive ? 'border-emerald-500 text-emerald-500' : ''}
                  ${isCompleted ? 'border-emerald-500 bg-emerald-500 text-white' : ''}
                  ${!isActive && !isCompleted ? 'border-muted text-muted-foreground' : ''}
                `}
                animate={{
                  scale: isActive ? 1.1 : 1,
                }}
                transition={{ duration: shouldReduceMotion ? 0 : 0.2 }}
              >
                <AnimatePresence mode="wait">
                  {isCompleted ? (
                    <motion.div
                      key="check"
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0, opacity: 0 }}
                      transition={{ duration: shouldReduceMotion ? 0 : 0.2 }}
                    >
                      <Check size={20} className="stroke-[3px]" />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="number"
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0, opacity: 0 }}
                      transition={{ duration: shouldReduceMotion ? 0 : 0.2 }}
                    >
                      {step.id}
                    </motion.div>
                  )}
                </AnimatePresence>
                
                {isActive && (
                  <motion.div
                    layoutId="activeStepRing"
                    className="absolute -inset-1.5 rounded-full border border-emerald-500/30"
                    transition={{ duration: shouldReduceMotion ? 0 : 0.4, ease: "easeOut" }}
                  />
                )}
              </motion.div>
              <span
                className={`text-sm font-medium absolute -bottom-7 w-max transition-colors duration-300
                  ${isActive ? 'text-foreground' : isCompleted ? 'text-foreground/80' : 'text-muted-foreground'}
                `}
              >
                {step.name}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
