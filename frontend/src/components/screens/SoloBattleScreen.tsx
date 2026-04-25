import { useNavigate } from "react-router-dom";
import { useState, useEffect, useRef, useCallback } from "react";
import { LiveBattleCard } from "../LiveBattleCard";
import { AnimatedTitle } from "../AnimatedTitle";
import { ShimmerButton, ShimmerCard } from "../ShimmerComponents";
import { ElectricButton } from "../ElectricButton";
import { CVDetector } from "../../../cv/services/cv-detector";
import { PUSHUP_FORM_RULES } from "../../../cv/exercises/pushup-params";
import { SQUAT_FORM_RULES } from "../../../cv/exercises/squat-params";
import { PLANK_FORM_RULES } from "../../../cv/exercises/plank-params";
import { LUNGE_FORM_RULES } from "../../../cv/exercises/lunge-params";
import { getCurrentUser } from "../../services/auth";

type ExerciseType = "push-up" | "squat" | "plank" | "lunge";

interface ExerciseOption {
  id: ExerciseType;
  name: string;
  description: string;
  icon: string;
  formRules: any;
}

const EXERCISE_OPTIONS: ExerciseOption[] = [
  {
    id: "push-up",
    name: "Push-ups",
    description: "Classic upper body exercise",
    icon: "",
    formRules: PUSHUP_FORM_RULES,
  },
  {
    id: "squat",
    name: "Squats",
    description: "Lower body strength builder",
    icon: "",
    formRules: SQUAT_FORM_RULES,
  },
  {
    id: "plank",
    name: "Plank Hold",
    description: "Core stability challenge",
    icon: "",
    formRules: PLANK_FORM_RULES,
  },
  {
    id: "lunge",
    name: "Sit-ups",
    description: "Core strength and endurance",
    icon: "",
    formRules: LUNGE_FORM_RULES,
  },
];

export function SoloBattleScreen() {
  const navigate = useNavigate();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const detectorRef = useRef<CVDetector | null>(null);
  
  // Game state
  const [userReps, setUserReps] = useState(0);
  const [opponentReps, setOpponentReps] = useState(0);
  const [opponentName] = useState<string>("ForgeBot AI");
  const [isCVReady, setIsCVReady] = useState(false);
  const [selectedExercise, setSelectedExercise] = useState<ExerciseType | null>(null);
  const [showExerciseSelection, setShowExerciseSelection] = useState(true);
  const [showRoundEnd, setShowRoundEnd] = useState(false);
  const [currentRound, setCurrentRound] = useState(1);
  const [userRoundsWon, setUserRoundsWon] = useState(0);
  const [opponentRoundsWon, setOpponentRoundsWon] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(60);
  const [gamePhase, setGamePhase] = useState<"ready" | "countdown" | "live" | "ended">("ready");
  const [userReady, setUserReady] = useState(false);
  const [startCountdown, setStartCountdown] = useState(5);
  const [roundWinner, setRoundWinner] = useState<string | null>(null);
  const [showGameOver, setShowGameOver] = useState(false);

  // Initialize CV
  useEffect(() => {
    if (!selectedExercise || gamePhase !== "ready") return;

    const startCV = async () => {
      if (!videoRef.current || !canvasRef.current) return;
      
      try {
        const rules = EXERCISE_OPTIONS.find(e => e.id === selectedExercise)?.formRules;
        detectorRef.current = new CVDetector(videoRef.current, canvasRef.current, rules);
        
        detectorRef.current.onRepDetected = () => {
          setUserReps(prev => prev + 1);
        };

        detectorRef.current.onReadyStateChange = (ready) => {
          setIsCVReady(ready);
        };

        await detectorRef.current.start();
      } catch (err) {
        console.error("CV Start Error:", err);
      }
    };

    startCV();
    return () => detectorRef.current?.stop();
  }, [selectedExercise, gamePhase]);

  // AI Opponent Simulation Logic
  useEffect(() => {
    if (gamePhase !== "live") return;

    // AI does 1 rep every 2-5 seconds
    const aiInterval = setInterval(() => {
      setOpponentReps(prev => prev + 1);
    }, 2000 + Math.random() * 3000);

    return () => clearInterval(aiInterval);
  }, [gamePhase]);

  // Game Timer
  useEffect(() => {
    if (gamePhase !== "live") return;

    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          handleRoundEnd();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [gamePhase]);

  // Handle Countdown
  useEffect(() => {
    if (gamePhase !== "countdown") return;

    const timer = setInterval(() => {
      setStartCountdown(prev => {
        if (prev <= 1) {
          setGamePhase("live");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [gamePhase]);

  const handleRoundEnd = () => {
    let winner = "tie";
    if (userReps > opponentReps) {
      winner = "user";
      setUserRoundsWon(prev => prev + 1);
    } else if (opponentReps > userReps) {
      winner = "opponent";
      setOpponentRoundsWon(prev => prev + 1);
    }
    
    setRoundWinner(winner);
    setGamePhase("ended");
    setShowRoundEnd(true);

    setTimeout(() => {
      if (currentRound >= 3 || userRoundsWon >= 1 || opponentRoundsWon >= 1) { // Quick end for demo or 3 rounds
         if (currentRound >= 3 || (userRoundsWon + (winner === 'user' ? 1 : 0)) >= 2 || (opponentRoundsWon + (winner === 'opponent' ? 1 : 0)) >= 2) {
            setShowGameOver(true);
            return;
         }
      }
      
      // Next Round Prepare
      setCurrentRound(prev => prev + 1);
      setShowRoundEnd(false);
      setSelectedExercise(null);
      setShowExerciseSelection(true);
      setGamePhase("ready");
      setUserReps(0);
      setOpponentReps(0);
      setTimeRemaining(60);
      setStartCountdown(5);
    }, 5000);
  };

  const handleExerciseSelect = (exerciseId: ExerciseType) => {
    setSelectedExercise(exerciseId);
    setShowExerciseSelection(false);
    setGamePhase("ready");
  };

  const handleUserReady = () => {
    setUserReady(true);
    // Simulate AI also getting ready
    setTimeout(() => {
      setGamePhase("countdown");
    }, 1500);
  };

  if (showGameOver) {
    const totalWinner = userRoundsWon > opponentRoundsWon ? "You" : "ForgeBot AI";
    return (
      <div className="flex flex-col items-center justify-center min-vh-100 bg-black text-white p-6 text-center">
        <h1 className="text-5xl audiowide-regular text-cyan-400 mb-4">MATCH OVER</h1>
        <p className="text-2xl mb-8">Winner: <span className="text-white font-bold">{totalWinner}</span></p>
        <div className="flex gap-4">
          <ElectricButton onClick={() => navigate("/app")}>Home</ElectricButton>
          <ElectricButton onClick={() => window.location.reload()}>Rematch AI</ElectricButton>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-black text-white p-4">
      <AnimatedTitle title="SOLO TRAINING" subtitle={`ROUND ${currentRound} VS AI`} />
      
      <div className="flex-1 flex flex-col items-center justify-center relative">
        {showExerciseSelection && (
          <Card className="bg-neutral-900/90 border-cyan-500/50 p-8 max-w-2xl w-full z-50">
            <CardHeader>
              <CardTitle className="text-xl text-cyan-400 uppercase tracking-widest text-center">Select Your Training Exercise</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              {EXERCISE_OPTIONS.map(opt => (
                <div 
                  key={opt.id}
                  onClick={() => handleExerciseSelect(opt.id)}
                  className="p-4 bg-white/5 border border-white/10 rounded-xl hover:border-cyan-500 cursor-pointer transition-all"
                >
                  <h3 className="font-bold text-cyan-400">{opt.name}</h3>
                  <p className="text-xs text-neutral-400">{opt.description}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {selectedExercise && !showRoundEnd && (
          <LiveBattleCard 
            videoRef={videoRef}
            canvasRef={canvasRef}
            userReps={userReps}
            opponentReps={opponentReps}
            opponentName={opponentName}
            timeRemaining={timeRemaining}
            exerciseName={EXERCISE_OPTIONS.find(e => e.id === selectedExercise)?.name || ""}
            isLive={gamePhase === "live"}
            startCountdown={startCountdown}
            gamePhase={gamePhase}
            isUserReady={userReady}
            isOpponentReady={true}
            onUserReady={handleUserReady}
            isPlank={selectedExercise === "plank"}
          />
        )}

        {showRoundEnd && (
          <div className="bg-black/90 border border-cyan-500/50 p-12 rounded-3xl text-center z-50 animate-in zoom-in duration-300">
            <h2 className="text-4xl audiowide-regular text-cyan-400 mb-4">ROUND OVER</h2>
            <p className="text-xl">
              {roundWinner === "user" ? "Victory!" : roundWinner === "opponent" ? "AI Dominance" : "Tie"}
            </p>
            <div className="mt-8 flex justify-center gap-12">
               <div>
                 <p className="text-xs uppercase text-neutral-500">You</p>
                 <p className="text-3xl font-bold">{userReps}</p>
               </div>
               <div className="text-cyan-600 text-3xl font-bold">VS</div>
               <div>
                 <p className="text-xs uppercase text-neutral-500">AI</p>
                 <p className="text-3xl font-bold">{opponentReps}</p>
               </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function Card({ children, className, ...props }: any) {
  return <div className={`rounded-xl border ${className}`} {...props}>{children}</div>;
}
function CardHeader({ children, className }: any) {
  return <div className={`p-4 border-b ${className}`}>{children}</div>;
}
function CardContent({ children, className }: any) {
  return <div className={`p-4 ${className}`}>{children}</div>;
}
function CardTitle({ children, className }: any) {
  return <h3 className={`font-semibold ${className}`}>{children}</h3>;
}
