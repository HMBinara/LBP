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
    
    prompt = f"""
    Create a highly structured daily study plan based on:
    - Topic: {user_context['topic']}
    - Sub-topics: {user_context['sub_topics']}
    - Goal: {user_context['goal']}
    - Duration: {user_context['duration_days']} days
    - Daily Availability: {user_context['daily_hours']} hours
    - User Skill Level: {assessment_result['level']} (Score: {assessment_result['score']}/{assessment_result['total']})
    - Available Resources: {curated_resources}

    Instructions:
    1. Organize the content into exactly {user_context['duration_days']} days.
    2. For each day, provide a 'focus' (Topic name), a 'video_url' from the resources provided, a list of 'tasks', and 'estimated_time'.
    3. Ensure the pace matches the user's skill level.
    4. Return strictly in valid JSON format.

    JSON Structure Example:
    {{
      "plan_name": "Course Name",
      "days": [
        {{
          "day": 1,
          "focus": "Topic name",
          "video_url": "link",
          "tasks": ["Task 1", "Task 2"],
          "estimated_time": "2 hours"
        }}
      ]
    }}
    """
    
    try:
        response = model.generate_content(prompt)
        response_text = response.text
        
        # මචං මෙතන තමයි අර Error එක Fix කරන තැන:
        # Regex පාවිච්චි කරලා ```json ... ``` ඇතුළේ තියෙන ටික විතරක් ගන්නවා.
        json_match = re.search(r'\{.*\}', response_text, re.DOTALL)
        
        if json_match:
            clean_json = json_match.group(0)
            return json.loads(clean_json)
        else:
            # කෙලින්ම JSON එක ආවා නම්
            return json.loads(response_text.strip())
            
    except Exception as e:
        print(f"Error in Planner Agent: {e}")
        # Error එකක් ආවොත් fallback එකක් විදිහට හිස් plan එකක් දෙනවා
        return {"error": "Failed to generate plan", "details": str(e)}