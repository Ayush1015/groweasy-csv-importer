import { Header } from './Header';
import { Stepper } from './Stepper';

export const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="min-h-screen flex flex-col bg-background font-sans antialiased text-foreground selection:bg-emerald-500/30 selection:text-emerald-900 dark:selection:text-emerald-100">
      <Header />
      <main className="flex-1 container mx-auto px-4 max-w-5xl py-12">
        <div className="mb-10 text-center md:text-left">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-3">Data Import</h1>
          <p className="text-muted-foreground text-lg max-w-2xl">
            Securely upload your CSV files. Our AI will automatically parse and map the data to the correct CRM fields.
          </p>
        </div>
        
        <Stepper />
        
        <div className="mt-8 bg-card border rounded-2xl shadow-sm overflow-hidden p-6 md:p-8 min-h-[500px]">
          {children}
        </div>
      </main>
    </div>
  );
};
