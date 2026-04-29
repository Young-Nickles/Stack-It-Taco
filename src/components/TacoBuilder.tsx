/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ChevronRight, ChevronLeft, Check, Flame, Leaf, Package } from "lucide-react";

const STEPS = [
  {
    id: "base",
    title: "Choose Your Base",
    options: [
      { name: "Soft Corn", icon: <Package size={20} />, description: "Traditional, gluten-free, handmade" },
      { name: "Flour Stack", icon: <Package size={20} />, description: "Buttery, soft, great for big stacks" },
      { name: "The Bowl", icon: <Package size={20} />, description: "Low carb, extra greens, high stack" }
    ]
  },
  {
    id: "protein",
    title: "Pick Your Protein",
    options: [
      { name: "Al Pastor", icon: <Flame size={20} />, description: "Marinated pork with pineapple" },
      { name: "Beef Brisket", icon: <Flame size={20} />, description: "12-hour braised tender beef" },
      { name: "Chili Tofu", icon: <Leaf size={20} />, description: "Spicy crumbles with local soy" }
    ]
  },
  {
    id: "toppings",
    title: "Stack Toppings",
    isMultiple: true,
    options: [
      { name: "Pickled Onions", icon: <Check size={16} /> },
      { name: "Queso Fresco", icon: <Check size={16} /> },
      { name: "Fresh Cilantro", icon: <Check size={16} /> },
      { name: "Radish Slaw", icon: <Check size={16} /> },
      { name: "Grilled Corn", icon: <Check size={16} /> }
    ]
  },
  {
    id: "salsa",
    title: "Liquid Gold",
    options: [
      { name: "Salsa Verde", icon: <Flame size={20} className="text-green-500" /> },
      { name: "Ghost Burn", icon: <Flame size={20} className="text-red-600" /> },
      { name: "Mild Mango", icon: <Leaf size={20} className="text-orange-400" /> }
    ]
  }
];

export default function TacoBuilder() {
  const [currentStep, setCurrentStep] = useState(0);
  const [choices, setChoices] = useState<Record<string, any>>({});

  const handleSelect = (stepId: string, option: any, isMultiple = false) => {
    if (isMultiple) {
      const current = choices[stepId] || [];
      const index = current.findIndex((o: any) => o.name === option.name);
      if (index > -1) {
        setChoices({ ...choices, [stepId]: current.filter((_: any, i: number) => i !== index) });
      } else {
        setChoices({ ...choices, [stepId]: [...current, option] });
      }
    } else {
      setChoices({ ...choices, [stepId]: option });
      if (currentStep < STEPS.length - 1) {
        // Auto-advance for single choices after a small delay
        setTimeout(() => setCurrentStep(prev => prev + 1), 400);
      }
    }
  };

  const isFinal = currentStep === STEPS.length - 1 && choices[STEPS[currentStep].id];

  return (
    <section id="menu-builder" className="py-24 px-4 bg-neon-yellow border-y-2 border-black">
      <div className="max-w-5xl mx-auto text-center mb-16">
        <h2 className="font-display text-5xl md:text-7xl uppercase tracking-tighter mb-4">Build Your <span className="text-neon-orange">Taco</span></h2>
        <p className="font-mono text-zinc-600">The assembly line is yours. Stack it exactly how you like it for just <span className="font-bold text-black">$9.00</span>.</p>
      </div>
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col md:flex-row gap-12 items-start">
          
          {/* Left: Interactive Builder */}
          <div className="flex-1 w-full bg-white border-2 border-black brutal-shadow p-8 min-h-[500px] flex flex-col">
            <div className="flex justify-between items-center mb-8 border-b-2 border-black pb-4">
              <div>
                <p className="font-mono text-xs uppercase tracking-widest text-zinc-400">Step {currentStep + 1} of {STEPS.length}</p>
                <h2 className="font-display text-4xl uppercase">{STEPS[currentStep].title}</h2>
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={() => setCurrentStep(p => Math.max(0, p - 1))}
                  disabled={currentStep === 0}
                  className="p-2 border-2 border-black hover:bg-black hover:text-white disabled:opacity-30 disabled:hover:bg-white disabled:hover:text-black transition-colors"
                >
                  <ChevronLeft />
                </button>
                <button 
                  onClick={() => setCurrentStep(p => Math.min(STEPS.length - 1, p + 1))}
                  disabled={!choices[STEPS[currentStep].id] || currentStep === STEPS.length - 1}
                  className="p-2 border-2 border-black hover:bg-black hover:text-white disabled:opacity-30 disabled:hover:bg-white disabled:hover:text-black transition-colors"
                >
                  <ChevronRight />
                </button>
              </div>
            </div>

            <div className="flex-1">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentStep}
                  initial={{ x: 20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: -20, opacity: 0 }}
                  className="grid grid-cols-1 sm:grid-cols-2 gap-4"
                >
                  {STEPS[currentStep].options.map((option) => {
                    const isSelected = STEPS[currentStep].isMultiple 
                      ? (choices[STEPS[currentStep].id] || []).some((o: any) => o.name === option.name)
                      : choices[STEPS[currentStep].id]?.name === option.name;

                    return (
                      <button
                        key={option.name}
                        onClick={() => handleSelect(STEPS[currentStep].id, option, STEPS[currentStep].isMultiple)}
                        className={`text-left p-4 border-2 border-black transition-all ${
                          isSelected ? "bg-neon-orange text-white translate-x-[2px] translate-y-[2px] shadow-none" : "hover:bg-zinc-50 translate-x-[-2px] translate-y-[-2px] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-0 active:translate-y-0"
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          {option.icon}
                          <span className="font-display text-xl uppercase">{option.name}</span>
                        </div>
                        {option.description && <p className="font-mono text-xs opacity-70">{option.description}</p>}
                      </button>
                    );
                  })}
                </motion.div>
              </AnimatePresence>
            </div>

            {currentStep === STEPS.length - 1 && choices[STEPS[currentStep].id] && (
              <motion.div 
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="mt-12 pt-8 border-t-2 border-black"
              >
                <button className="brutal-btn w-full text-2xl py-6 bg-black text-white hover:bg-neon-orange">
                  Add to My Stack
                </button>
              </motion.div>
            )}
          </div>

          {/* Right: The Stack Preview */}
          <div className="w-full md:w-80 sticky top-32">
            <div className="bg-black text-white p-6 brutal-shadow border-2 border-black rotate-1">
              <h3 className="font-display text-3xl uppercase mb-6 border-b border-white/20 pb-2">Your Ticket</h3>
              <div className="space-y-4 font-mono text-sm">
                {STEPS.map((step) => (
                  <div key={step.id}>
                    <p className="text-[10px] uppercase text-zinc-500 mb-1">{step.title}</p>
                    {!choices[step.id] ? (
                      <p className="italic text-zinc-700">Waiting...</p>
                    ) : Array.isArray(choices[step.id]) ? (
                      <div className="flex flex-wrap gap-1">
                        {choices[step.id].map((o: any) => (
                          <span key={o.name} className="px-2 py-0.5 bg-zinc-800 rounded text-[10px]">{o.name}</span>
                        ))}
                      </div>
                    ) : (
                      <p className="text-neon-yellow font-bold uppercase">{choices[step.id].name}</p>
                    )}
                  </div>
                ))}
              </div>
              <div className="mt-8 pt-4 border-t border-dashed border-white/40 flex justify-between items-end">
                <span className="font-display text-xl uppercase">Total</span>
                <span className="font-mono text-2xl">$9.00</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
