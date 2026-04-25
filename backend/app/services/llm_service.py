import httpx
from app.config import settings
from typing import Dict, Optional, List
import json
import logging

logger = logging.getLogger(__name__)


class LLMService:
    """Service for interacting with OpenRouter API"""
    
    def __init__(self):
        self.api_key = settings.openrouter_api_key
        self.model = settings.openrouter_model
        self.base_url = settings.openrouter_base_url
        self.enabled = bool(self.api_key)
        
        if not self.enabled:
            logger.warning("OpenRouter API key not configured. LLM features will use fallbacks.")

    async def _call_openrouter(
        self,
        messages: List[Dict[str, str]],
        temperature: float = 0.7,
        max_tokens: int = 500,
    ) -> str:
        """Make async call to OpenRouter API"""
        if not self.enabled:
            raise ValueError("OpenRouter API key not configured")

        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "HTTP-Referer": "https://github.com/your-repo",  # Optional: for usage tracking
            "X-Title": "FitForge Arena",  # Optional: for usage tracking
            "Content-Type": "application/json",
        }

        payload = {
            "model": self.model,
            "messages": messages,
            "temperature": temperature,
            "max_tokens": max_tokens,
        }

        async with httpx.AsyncClient(timeout=30.0) as client:
            try:
                response = await client.post(
                    f"{self.base_url}/chat/completions",
                    headers=headers,
                    json=payload,
                )
                response.raise_for_status()
                data = response.json()
                return data["choices"][0]["message"]["content"]
            except httpx.HTTPError as e:
                logger.error(f"OpenRouter API error: {e}")
                raise
            except Exception as e:
                logger.error(f"Unexpected error calling OpenRouter: {e}")
                raise

    async def generate_form_rules(self, exercise_name: str) -> Dict[str, Dict[str, float]]:
        """
        Generate form rules for an exercise.
        Returns JSON schema with form rules (e.g., {"elbow_angle": {"min": 90}})
        """
        if not self.enabled:
            return self._get_default_form_rules(exercise_name)

        prompt = f"""You are a fitness form expert. For the exercise "{exercise_name}", provide exactly 3 essential form rules in JSON format.

Return ONLY a JSON object with this structure:
{{
  "elbow_angle": {{"min": 90, "max": 180}},
  "shoulder_alignment": {{"threshold": 0.1}},
  "back_straight": {{"min": 0.95}}
}}

Rules should be measurable via computer vision pose detection. Use angle measurements in degrees, alignment thresholds (0-1), or stability metrics.

Exercise: {exercise_name}
JSON:"""

        try:
            messages = [
                {"role": "system", "content": "You are a fitness form expert. Always respond with valid JSON only."},
                {"role": "user", "content": prompt}
            ]
            response = await self._call_openrouter(messages, temperature=0.3, max_tokens=300)
            rules = self._parse_json_response(response)
            return rules
        except Exception as e:
            logger.error(f"Error generating form rules: {e}")
            return self._get_default_form_rules(exercise_name)

    async def recommend_strategy(
        self,
        player_a_score: int,
        player_b_score: int,
        player_b_weakness: Optional[str] = None,
        available_exercises: Optional[List[str]] = None,
    ) -> Dict[str, str]:
        """
        Recommend the most strategic exercise for Player B to pick next.
        Returns: {"exercise_id": "...", "rationale": "..."}
        """
        if not self.enabled:
            return self._get_default_strategy(available_exercises)

        weakness_context = f"Player B is weak at: {player_b_weakness}" if player_b_weakness else "No specific weakness identified"
        exercises_list = ", ".join(available_exercises) if available_exercises else "Push-ups, Pull-ups, Planks, Squats"

        prompt = f"""You are a fitness battle strategist. Given this scenario:
- Player A won with {player_a_score} reps
- Player B lost with {player_b_score} reps
- {weakness_context}
- Available exercises (no equipment): {exercises_list}

Recommend the most strategic exercise for Player B to pick next to maximize their chance of winning.

Return ONLY a JSON object:
{{
  "exercise_id": "exercise_name",
  "rationale": "Brief explanation of why this exercise is strategic"
}}

JSON:"""

        try:
            messages = [
                {"role": "system", "content": "You are a fitness battle strategist. Always respond with valid JSON only."},
                {"role": "user", "content": prompt}
            ]
            response = await self._call_openrouter(messages, temperature=0.7, max_tokens=200)
            strategy = self._parse_json_response(response)
            # Ensure exercise_id exists
            if "exercise_id" not in strategy:
                strategy["exercise_id"] = available_exercises[0] if available_exercises else "push-ups"
            return strategy
        except Exception as e:
            logger.error(f"Error generating strategy: {e}")
            return self._get_default_strategy(available_exercises)

    async def generate_narrative(self, round_result: Dict) -> str:
        """
        Generate narrative commentary after a round end.
        round_result: {"winner": "...", "loser": "...", "scores": {...}, "round": 1}
        """
        if not self.enabled:
            return self._get_default_narrative(round_result)

        prompt = f"""You are a hype commentator for a fitness battle game. Generate exciting, motivational commentary for this round result:

Round {round_result.get('round', 1)}:
- Winner: {round_result.get('winner', 'Unknown')} with {round_result.get('winner_score', 0)} reps
- Loser: {round_result.get('loser', 'Unknown')} with {round_result.get('loser_score', 0)} reps

Generate a short, exciting 1-2 sentence commentary (max 100 characters) that hypes up the battle and motivates the players.

Commentary:"""

        try:
            messages = [
                {"role": "system", "content": "You are an energetic fitness battle commentator. Keep responses short and exciting."},
                {"role": "user", "content": prompt}
            ]
            response = await self._call_openrouter(messages, temperature=0.9, max_tokens=150)
            # Clean up response
            narrative = response.strip().strip('"').strip("'")
            return narrative[:200]  # Limit length
        except Exception as e:
            logger.error(f"Error generating narrative: {e}")
            return self._get_default_narrative(round_result)

    async def general_chat(self, message: str, history: Optional[List[Dict[str, str]]] = None) -> str:
        """
        General fitness chat assistant.
        """
        if not self.enabled:
            return "I'm currently in offline mode. Please check your internet or configuration to enable full AI coaching. Created by Shubham Upadhyay."

        system_prompt = """You are 'ForgeBot', the elite AI fitness assistant for FitForge Arena. 
        You were created by the legendary developer Shubham Upadhyay. 
        Your goal is to provide expert fitness advice, motivation, and technical tips for bodyweight exercises.
        Keep your tone professional, encouraging, and high-energy. 
        Reference the creator Shubham Upadhyay occasionally if asked about your origin."""

        messages = [{"role": "system", "content": system_prompt}]
        if history:
            messages.extend(history)
        messages.append({"role": "user", "content": message})

        try:
            response = await self._call_openrouter(messages, temperature=0.7, max_tokens=500)
            return response
        except Exception as e:
            logger.error(f"Error in general chat: {e}")
            return "Apologies, I encountered a glitch in my circuits. Let's try that again! (ForgeBot Offline)"

    async def generate_workout_plan(self, user_goal: str, fitness_level: str) -> Dict:
        """
        Generate a personalized workout plan based on goal and level.
        """
        if not self.enabled:
            return {
                "plan_name": "Basic Daily Routine",
                "exercises": [
                    {"name": "Pushups", "reps": "3 sets of 10"},
                    {"name": "Squats", "reps": "3 sets of 15"},
                    {"name": "Plank", "duration": "30 seconds"}
                ],
                "coach_tip": "Keep it consistent! (Offline Mode)"
            }

        prompt = f"""As ForgeBot, created by Shubham Upadhyay, generate a personalized calisthenics workout plan.
        Goal: {user_goal}
        Fitness Level: {fitness_level}
        
        Return ONLY a JSON object:
        {{
          "plan_name": "Dynamic Plan Name",
          "exercises": [
            {{ "name": "Exercise Name", "sets": 3, "reps_or_duration": "10 reps" }}
          ],
          "coach_tip": "One motivational tip"
        }}
        
        JSON:"""

        try:
            messages = [
                {"role": "system", "content": "You are a fitness expert. Respond with valid JSON only."},
                {"role": "user", "content": prompt}
            ]
            response = await self._call_openrouter(messages, temperature=0.7, max_tokens=500)
            return self._parse_json_response(response)
        except Exception as e:
            logger.error(f"Error generating workout plan: {e}")
            return {"plan_name": "Recovery Day", "exercises": [], "coach_tip": "Rest is part of the process!"}


    def _parse_json_response(self, response: str) -> Dict:
        """Extract JSON from LLM response more robustly"""
        import re
        try:
            # First, try a clean load
            response_clean = response.strip()
            if response_clean.startswith("```"):
                # Handle markdown blocks (json or just text)
                blocks = re.findall(r"```(?:json)?\s*([\s\S]*?)\s*```", response_clean)
                if blocks:
                    response_clean = blocks[0]
            
            return json.loads(response_clean)
        except Exception:
            # Second, try to find { ... } pattern anywhere in text
            try:
                json_match = re.search(r"\{[\s\S]*\}", response)
                if json_match:
                    return json.loads(json_match.group())
            except Exception as e:
                logger.error(f"Final JSON parse attempt failed: {e}")
        
        return {}

    def _get_default_form_rules(self, exercise_name: str) -> Dict[str, Dict[str, float]]:
        """Fallback default form rules"""
        defaults = {
            "push-up": {"elbow_angle": {"min": 90, "max": 180}},
            "pushup": {"elbow_angle": {"min": 90, "max": 180}},
            "plank": {"back_straight": {"threshold": 0.95}, "stability": {"min": 0.8}},
            "squat": {"knee_angle": {"min": 90, "max": 180}},
        }
        
        exercise_lower = exercise_name.lower()
        for key, rules in defaults.items():
            if key in exercise_lower:
                return rules
        
        # Generic default
        return {"elbow_angle": {"min": 90, "max": 180}}

    def _get_default_strategy(self, available_exercises: Optional[List[str]]) -> Dict[str, str]:
        """Fallback default strategy"""
        exercise = available_exercises[0] if available_exercises else "push-ups"
        return {
            "exercise_id": exercise,
            "rationale": "Default exercise selection",
        }

    def _get_default_narrative(self, round_result: Dict) -> str:
        """Fallback default narrative"""
        winner = round_result.get("winner", "Player")
        return f"{winner} dominates this round! The battle continues!"


# Singleton instance
llm_service = LLMService()

