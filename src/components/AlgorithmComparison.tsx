import { useStore } from '../store/useStore';
import { ShieldCheck, Zap, Activity, BrainCircuit } from 'lucide-react';

const ALGORITHMS = [
  { id: 'Z-Score', name: 'Z-Score', icon: Activity, desc: 'Statistical deviation analysis' },
  { id: 'IQR', name: 'IQR Method', icon: Zap, desc: 'Box-plot outlier detection' },
  { id: 'Moving Average', name: 'Moving Avg', icon: ShieldCheck, desc: 'Rolling window deviation' },
  { id: 'LSTM-NN', name: 'LSTM RNN', icon: BrainCircuit, desc: 'Neural network prediction' },
  { id: 'Ensemble', name: 'Ensemble', icon: ShieldCheck, desc: 'Weighted voting system' },
];

export function AlgorithmComparison() {
  const { activeAlgorithm, setAlgorithm } = useStore();

  return (
    <div className="bg-gray-900/40 backdrop-blur-xl border border-white/5 p-6 rounded-3xl">
      <h3 className="text-white font-bold mb-6 flex items-center gap-2">
         <BrainCircuit size={18} className="text-blue-500" />
         Detection Engine Config
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
        {ALGORITHMS.map((alg) => {
          const Icon = alg.icon;
          const isActive = activeAlgorithm === alg.id;

          return (
            <button
              key={alg.id}
              onClick={() => setAlgorithm(alg.id)}
              className={`
                group p-4 rounded-2xl border transition-all duration-300 text-left
                ${isActive 
                  ? 'bg-blue-600 border-blue-500 shadow-lg shadow-blue-600/20' 
                  : 'bg-white/5 border-white/5 hover:border-white/10'
                }
              `}
            >
              <Icon size={18} className={`mb-3 ${isActive ? 'text-white' : 'text-blue-400'}`} />
              <h4 className={`text-xs font-bold uppercase tracking-widest ${isActive ? 'text-white' : 'text-gray-300'}`}>
                {alg.name}
              </h4>
              <p className={`text-[10px] mt-1 ${isActive ? 'text-white/70' : 'text-gray-500'}`}>
                {alg.desc}
              </p>
              
              {isActive && (
                <div className="mt-3 pt-3 border-t border-white/10">
                   <div className="flex justify-between items-center text-[9px] font-bold uppercase">
                      <span>Accuracy</span>
                      <span>98.2%</span>
                   </div>
                   <div className="w-full h-1 bg-white/20 rounded-full mt-1 overflow-hidden">
                      <div className="w-[98%] h-full bg-white rounded-full" />
                   </div>
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
