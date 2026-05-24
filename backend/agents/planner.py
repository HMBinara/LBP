import google.generativeai as genai
import os
import json
import re
from dotenv import load_dotenv

load_dotenv()

# Gemini configure කරගැනීම
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

def generate_study_plan(user_context, curated_resources, assessment_result):
    model = genai.GenerativeModel('gemini-1.5-flash')
    
    total_days = int(user_context['duration_days'])
    
    # ලොජික් එක: දවස් 2ක් අඩු කරලා තමයි core සිලබස් එක ඉවර කරන්නේ
    learning_days_limit = total_days - 2 if total_days > 2 else total_days
    
    prompt = f"""
    You are a Strategic Learning Architect. Your mission is to design a high-efficiency, personalized daily roadmap based on these details:
    - Topic: {user_context['topic']}
    - Sub-topics: {user_context['sub_topics']}
    - Primary Goal: {user_context['goal']}
    - Total Duration: {total_days} days
    - Daily Availability: {user_context['daily_hours']} hours
    - User Diagnosed Level: {assessment_result['level']} (Quiz Score: {assessment_result['score']}/{assessment_result['total']})
    - Curated Video Resources: {curated_resources}

    STRICT OPERATIONAL CONSTRAINTS & TIMING LOGIC:
    1. Early Completion Strategy: You MUST distribute and schedule all core theoretical concepts, sub-topics, and primary YouTube videos so that they are completely covered within the first {learning_days_limit} days.
    2. Final Revision Buffer: The remaining final 2 days (Day {total_days - 1} and Day {total_days}) MUST contain ZERO new videos or new topics. Dedicate these 2 days strictly to intensive practical practice, mock exams, and customized revision questions focused specifically on achieving the user's primary goal: '{user_context['goal']}'.
    3. Pacing: Match the difficulty of technical tasks to the diagnosed level ({assessment_result['level']}). If Beginner, tasks should be step-by-step; if Advanced, focus on architecture and bug fixing.
    4. Link Mapping: Ensure the 'video_url' field maps to the most relevant links provided in the resource pool. For the final revision days, set 'video_url' to "" (empty string) as no new video is required.

    Return strictly a valid JSON object following this exact template:
    {{
      "plan_name": "Course Title",
      "days": [
        {{
          "day": 1,
          "focus": "Topic or core concept of the day",
          "video_url": "URL from the resources",
          "tasks": [
            "Actionable task 1",
            "Actionable task 2"
          ],
          "estimated_time": "{user_context['daily_hours']} hours"
        }}
      ]
    }}
    """
    
    try:
        response = model.generate_content(prompt)
        response_text = response.text
        
        # Regex එකෙන් JSON object එක විතරක් වෙන් කරලා ගැනීම
        json_match = re.search(r'\{.*\}', response_text, re.DOTALL)
        
        if json_match:
            clean_json = json_match.group(0)
            return json.loads(clean_json)
        else:
            return json.loads(response_text.strip())
            
    except Exception as e:
        print(f"Error in Planner Agent: {e}")
        return {
            "error": "Failed to generate plan",
            "details": str(e),
            "days": [
                {
                    "day": 1,
                    "focus": "Error generating adaptive roadmap",
                    "video_url": "",
                    "tasks": ["Please try again or check backend logs."],
                    "estimated_time": "0 hours"
                }
            ]
        }