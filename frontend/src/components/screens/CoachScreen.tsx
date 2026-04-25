import { useState, useRef, useEffect } from "react";
import { ShimmerButton } from "../ShimmerComponents";
import { AIChatAssistant } from "../AI/AIChatAssistant";
import { Bot, Camera, XCircle, Info, CheckCircle2 } from "lucide-react";
import { CVDetector } from "../../../cv/services/cv-detector";
import { PUSHUP_FORM_RULES } from "../../../cv/exercises/pushup-params";
import { SQUAT_FORM_RULES } from "../../../cv/exercises/squat-params";
import { PLANK_FORM_RULES } from "../../../cv/exercises/plank-params";

type Exercise = {
  id: string;
  name: string;
  description: string;
  formRules: any;
};

const exercises: Exercise[] = [
  {
    id: "squats",
    name: "Squats",
    description: "Perfect your squat form with real-time feedback",
    formRules: SQUAT_FORM_RULES,
  },
  {
    id: "pushups",
    name: "Pushups",
    description: "Get tips on depth and form for maximum effectiveness",
    formRules: PUSHUP_FORM_RULES,
  },
  {
    id: "plank",
    name: "Plank Hold",
    description: "Strengthen your core with controlled plank sessions",
    formRules: PLANK_FORM_RULES,
  },
];

export function CoachScreen() {
  const [selectedExercise, setSelectedExercise] = useState<string | null>(null);
  const [isActive, setIsActive] = useState(false);
  const [showAIChat, setShowAIChat] = useState(false);
  
  // CV State
  const [reps, setReps] = useState(0);
  const [formFeedback, setFormFeedback] = useState<string>("Initializing camera...");
  const [formValid, setFormValid] = useState(true);
  const [isCameraReady, setIsCameraReady] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const detectorRef = useRef<CVDetector | null>(null);

  const handleStart = (exerciseId: string) => {
    setSelectedExercise(exerciseId);
    setIsActive(true);
    setReps(0);
    setFormFeedback("Get in position...");
  };

  const handleEnd = () => {
    if (detectorRef.current) {
        detectorRef.current.stopDetection();
    }
    setIsActive(false);
    setSelectedExercise(null);
    setIsCameraReady(false);
    
    // Stop all video tracks
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
    }
  };

  // Initialize CV when active
  useEffect(() => {
    if (!isActive || !selectedExercise) return;

    const startCV = async () => {
        if (!videoRef.current || !canvasRef.current) return;
        
        try {
            // Get webcam stream
            const stream = await navigator.mediaDevices.getUserMedia({ 
                video: { width: 640, height: 480 } 
            });
            videoRef.current.srcObject = stream;
            
            // Wait for video to be ready
            await new Promise((resolve) => {
                if (videoRef.current) videoRef.current.onloadedmetadata = resolve;
            });

            const exercise = exercises.find(e => e.id === selectedExercise);
            detectorRef.current = new CVDetector();
            await detectorRef.current.initialize(videoRef.current, canvasRef.current);
            
            detectorRef.current.setFormRules(exercise?.formRules || {}, selectedExercise);
            detectorRef.current.setRepCallback((count) => {
                setReps(count);
                setFormFeedback("Great rep! Keep going.");
                setFormValid(true);
            });

            detectorRef.current.setFormErrorCallback((errors) => {
                setFormFeedback(errors[0] || "Check your form!");
                setFormValid(false);
            });

            detectorRef.current.setDetectionUpdateCallback((result) => {
                setFormValid(result.formValid);
                if (result.formValid && result.landmarks) {
                  // Keep showing positive message
                }
            });

            detectorRef.current.startDetection();
            setIsCameraReady(true);
        } catch (err) {
            console.error("Coach CV Error:", err);
            setFormFeedback("Camera Error: Please check permissions.");
        }
    };

    startCV();
    
    return () => {
        if (detectorRef.current) {
            detectorRef.current.stopDetection();
        }
        if (videoRef.current?.srcObject) {
            const stream = videoRef.current.srcObject as MediaStream;
            stream.getTracks().forEach(track => track.stop());
        }
    };
  }, [isActive, selectedExercise]);

  if (isActive && selectedExercise) {
    const exercise = exercises.find((e) => e.id === selectedExercise);
    return (
      <div className="fixed inset-0 z-[100] bg-slate-950 flex flex-col font-sans text-white">
        {/* Top Header */}
        <div className="p-6 flex justify-between items-center border-b border-cyan-500/20 bg-black/40 backdrop-blur-md">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-cyan-500/20 rounded-xl">
               <Bot className="text-cyan-400" size={24} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white audiowide-regular">{exercise?.name}</h3>
              <p className="text-sm text-cyan-400/70 uppercase tracking-widest">Live Coaching Session</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-[10px] uppercase tracking-tighter text-neutral-500">Total Reps</div>
            <div className="text-4xl font-bold text-cyan-400 audiowide-regular">{reps}</div>
          </div>
        </div>

        {/* Content Grid */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-[1fr_350px] gap-6 p-6 overflow-hidden">
          {/* Main Visual Arena */}
          <div className="relative rounded-[32px] bg-neutral-900 border border-white/10 overflow-hidden shadow-2xl flex items-center justify-center">
             {!isCameraReady ? (
               <div className="text-center animate-pulse z-10">
                  <Camera className="w-16 h-16 text-cyan-500/40 mx-auto mb-4" />
                  <p className="text-neutral-500 audiowide-regular">Syncing Optical Sensors...</p>
               </div>
             ) : null}
             
             <video 
                ref={videoRef} 
                className={`w-full h-full object-cover transform scale-x-[-1] absolute inset-0 ${isCameraReady ? 'opacity-100' : 'opacity-0'}`} 
                autoPlay 
                playsInline 
                muted 
             />
             <canvas 
                ref={canvasRef} 
                className="absolute inset-0 w-full h-full object-contain pointer-events-none transform scale-x-[-1] z-10" 
             />

             {/* Form Alert Overlay */}
             {!formValid && isCameraReady && (
                <div className="absolute top-8 left-1/2 -translate-x-1/2 z-50 px-6 py-3 bg-red-600/90 text-white rounded-full flex items-center gap-3 animate-bounce shadow-xl backdrop-blur-sm border border-red-400">
                   <XCircle size={18} />
                   <span className="font-bold uppercase text-[11px] tracking-widest">{formFeedback}</span>
                </div>
             )}
          </div>

          {/* Side Intelligence Panel */}
          <div className="flex flex-col gap-6 overflow-y-auto pr-2 scrollbar-hide">
             {/* Feedback Card */}
             <div className="bg-neutral-900/80 border border-white/5 rounded-3xl p-6 backdrop-blur-xl">
                <div className="flex items-center gap-2 mb-4 text-cyan-400">
                   <Info size={16} />
                   <h4 className="text-[10px] uppercase tracking-[0.2em] font-bold">Coach Analysis</h4>
                </div>
                <div className={`p-4 rounded-2xl transition-colors ${formValid ? 'bg-cyan-500/10 border border-cyan-500/20' : 'bg-red-500/10 border border-red-500/20'}`}>
                   <p className={`text-sm font-medium leading-relaxed ${formValid ? 'text-white' : 'text-red-400'}`}>
                      {formFeedback}
                   </p>
                </div>
             </div>

             {/* Intensity Bars */}
             <div className="bg-neutral-900/80 border border-white/5 rounded-3xl p-6 backdrop-blur-xl">
                <h4 className="text-[10px] uppercase tracking-[0.2em] font-bold text-neutral-500 mb-6">Intensity Level</h4>
                <div className="relative h-40 w-full flex items-end justify-between gap-1.5 px-2">
                   {[40, 70, 90, 60, 80, 100, 70].map((h, i) => (
                      <div 
                        key={i} 
                        className="flex-1 bg-gradient-to-t from-cyan-600 to-cyan-400 rounded-t-lg transition-all duration-700"
                        style={{ height: isActive && isCameraReady ? `${h}%` : '10%' }}
                      />
                   ))}
                </div>
             </div>

             <div className="bg-cyan-500/5 border border-cyan-500/10 rounded-3xl p-6 mt-auto">
                <p className="text-[10px] leading-relaxed text-neutral-500 italic">
                   "ForgeBot is currently tracking 33 pose landmarks to ensure muscle activation."
                </p>
             </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="p-6 flex justify-center bg-black/60 border-t border-white/5">
           <button
            onClick={handleEnd}
            className="px-10 py-3 rounded-2xl bg-red-600 hover:bg-red-500 text-white font-bold uppercase tracking-[0.2em] text-[10px] transition-all shadow-xl shadow-red-600/20 active:scale-95"
           >
            End Training
           </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-[1400px] mx-auto text-white pb-32">
      <div className="mb-12">
        <h1 className="text-4xl audiowide-regular text-cyan-400 mb-3 flex items-center gap-4">
          <Bot size={36} className="text-cyan-400" />
          <span className="flex items-center gap-3">
             AI COACHING <span className="text-[10px] bg-cyan-500/20 px-3 py-1 rounded-full text-cyan-300 animate-pulse uppercase tracking-[0.3em]">Neural Active</span>
          </span>
        </h1>
        <p className="text-neutral-400 text-lg max-w-2xl leading-relaxed">
          Unlock your true potential with ForgeBot's real-time motion tracking. Pick an exercise to begin your supervised session.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {exercises.map((exercise) => (
          <div
            key={exercise.id}
            className="group relative bg-neutral-900/40 border border-white/10 p-8 rounded-[40px] hover:border-cyan-500/50 transition-all duration-500 hover:shadow-2xl hover:shadow-cyan-500/10 hover:-translate-y-2 backdrop-blur-xl"
          >
            <div className="flex justify-between items-start mb-6">
                <div className="p-4 bg-cyan-500/10 rounded-2xl text-cyan-400 group-hover:scale-110 transition-transform">
                   <CheckCircle2 size={24} />
                </div>
            </div>
            <h3 className="text-2xl font-bold text-white mb-4 audiowide-regular">{exercise.name}</h3>
            <p className="text-neutral-500 text-sm mb-8 leading-relaxed">
              {exercise.description}
            </p>
            <ShimmerButton 
              className="w-full h-14 rounded-2xl font-bold text-sm uppercase tracking-widest"
              onClick={() => handleStart(exercise.id)}
            >
              Start Session
            </ShimmerButton>
          </div>
        ))}
      </div>

      {/* Floating AI Chat Assistant */}
      <div className="fixed bottom-24 right-8 z-[90]">
        <button
          onClick={() => setShowAIChat(!showAIChat)}
          className="w-16 h-16 rounded-[24px] bg-gradient-to-tr from-cyan-600 to-cyan-400 flex items-center justify-center text-black shadow-2xl shadow-cyan-500/30 hover:scale-110 active:scale-95 transition-all outline-none border-none cursor-pointer"
        >
          <Bot size={32} />
        </button>
      </div>

      {showAIChat && <AIChatAssistant onClose={() => setShowAIChat(false)} />}
    </div>
  );
}
