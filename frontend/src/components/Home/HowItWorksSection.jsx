import { BrainCircuit, FileOutput, FileText, MoveRight } from 'lucide-react';
import React from 'react';

const steps = [
  {
    icon: <FileText size={64} strokeWidth={1.5} />,
    label: 'Upload your PDF',
    description: 'Simply drag and drop your PDF document or click to upload',
  },
  {
    icon: <BrainCircuit size={64} strokeWidth={1.5} />,
    label: 'AI Analysis',
    description:
      'Our advanced AI analyzes your PDF and generates a summary instantly',
  },
  {
    icon: <FileOutput size={64} strokeWidth={1.5} />,
    label: 'Get summary',
    description:
      'Receive a clear and concise summary of your document in seconds',
  },
];

const StepItem = ({ icon, label, description }) => (
  <div className="relative p-6 rounded-2xl bg-white/5 backdrop-blur-xs border border-white/10 hover:border-rose-500/50 transition-colors group w-full shadow-sm hover:shadow-md">
    <div className="flex flex-col gap-4 h-full">
      <div className="flex items-center justify-center h-24 w-24 mx-auto rounded-2xl bg-gradient-to-br from-rose-500/10 to-transparent group-hover:from-rose-500/20 transition-colors">
        <div className="text-rose-500">{icon}</div>
      </div>
      <div className="flex flex-col flex-1 gap-1 justify-between">
        <h4 className="text-center font-bold text-xl text-slate-900 tracking-tight">{label}</h4>
        <p className="text-center text-slate-500 text-sm font-medium">{description}</p>
      </div>
    </div>
  </div>
);

function HowItWorksSection() {
  return (
    <section id="features" className="relative py-24">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-30"
      >
        <div
          style={{
            clipPath:
              'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)',
          }}
          className="relative left-[calc(50%-11rem)] aspect-1155/678 w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500 opacity-20 sm:left-[calc(50%-30rem)] sm:w-[72rem]"
        />
      </div>

      <div className="text-center mb-16 px-4">
        <h2 className="font-black text-xs uppercase tracking-[0.2em] mb-4 text-rose-500">
          How it works
        </h2>
        <h3 className="font-black text-3xl lg:text-5xl text-slate-900 max-w-2xl mx-auto tracking-tight">
          Transform any PDF into an easy-to-digest summary in 3 simple steps
        </h3>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto px-4 relative">
        {steps.map((step, id) => (
          <div key={id} id={`step-${id}`} className="relative flex items-stretch">
            <StepItem {...step} />

            {id < steps.length - 1 && (
              <div className="hidden md:block absolute top-1/2 -right-4 transform -translate-y-1/2 z-10 pointer-events-none">
                <MoveRight
                  size={32}
                  strokeWidth={1}
                  className="text-rose-400 opacity-50"
                ></MoveRight>
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}

export default HowItWorksSection;
