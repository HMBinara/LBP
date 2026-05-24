import json
import re
from dotenv import load_dotenv
from agents.model_utils import generate_with_model_fallbacks

load_dotenv()

def generate_study_plan(user_context, curated_resources, assessment_result):
  total_days = int(user_context['duration_days'])
  # The day index where core video resources MUST be embedded (two days before the end)
  embed_day = total_days - 2 if total_days >= 3 else total_days

  prompt = f"""
  You are a Strategic Learning Architect. Create a personalized, day-by-day learning roadmap using these inputs:
  - Topic: {user_context['topic']}
  - Sub-topics: {user_context['sub_topics']}
  - Goal: {user_context['goal']}
  - Total Duration (days): {total_days}
  - Daily Hours: {user_context['daily_hours']}
  - Diagnosed Level: {assessment_result['level']} (Score: {assessment_result['score']}/{assessment_result['total']})
  - Curated Resources (array): {curated_resources}

  Strict instructions (MANDATORY):
  1) Return ONLY valid JSON (no markdown, no explanation). The top-level object MUST contain a "days" array with exactly {total_days} entries (day 1 ... day {total_days}).
  2) Each day object MUST follow this schema exactly:
     {{"day": <int>, "topics": [<string>], "resources": [<resource objects>], "tasks": [<string>], "estimated_time": "{user_context['daily_hours']} hours"}}
  3) CRUCIAL TIMING RULE: Place all primary YouTube video resources from the Curator into the single day equal to two days before the end: day {embed_day}. That day must have the curated videos as the main `resources` entries. Other days may reference non-video reading or practice resources but MUST NOT include these primary YouTube videos.
  4) The final two days (day {total_days-1} and day {total_days}) MUST contain zero new videos; their `resources` arrays should be empty or contain only practice references (no YouTube items).
  5) For `resources` objects reuse the Curator structure: {{"type":"youtube","title":"...","embed_url":"...","summary":"..."}}.
  6) Ensure topics and tasks match the diagnosed level (Beginner → step-by-step; Intermediate → mixed; Advanced → architecture/project tasks).

  Example (simplified) output structure:
  {{"days": [{{"day":1,"topics":["..."],"resources":[],"tasks":["..."],"estimated_time":"{user_context['daily_hours']} hours"}}, ..., {{"day":{embed_day},"topics":["Practical implementations and video tutorials"],"resources":[{{"type":"youtube","title":"...","embed_url":"https://www.youtube.com/embed/XYZ","summary":"..."}}],"tasks":["Watch videos and implement"],"estimated_time":"{user_context['daily_hours']} hours"}}]}}
  """

  response = generate_with_model_fallbacks(prompt)
  response_text = response.text

  # Extract the first JSON object from the response
  json_match = re.search(r'\{.*\}', response_text, re.DOTALL)
  if not json_match:
    # If model returned only array, try to parse directly
    try:
      return json.loads(response_text.strip())
    except Exception as e:
      raise RuntimeError(f"Planner agent did not return valid JSON: {e}")

  parsed = json.loads(json_match.group(0))

  # Basic validation: ensure days length equals total_days and each day has required keys
  days = parsed.get('days') or []
  if not isinstance(days, list) or len(days) != total_days:
    raise RuntimeError(f"Planner must return 'days' array with {total_days} entries.")

  # Normalize each day to contain keys: day, topics(list), resources(list)
  curated_video_resources = [
      resource for resource in (curated_resources or [])
      if isinstance(resource, dict) and resource.get('type') == 'youtube'
  ]

  normalized_days = []
  for d in days:
    day_number = int(d.get('day'))
    resources = d.get('resources') or []

    # Enforce the T-2 injection rule regardless of Gemini drift.
    if day_number == embed_day:
      resources = curated_video_resources
    elif any(isinstance(resource, dict) and resource.get('type') == 'youtube' for resource in resources):
      resources = [resource for resource in resources if not (isinstance(resource, dict) and resource.get('type') == 'youtube')]

    normalized_days.append({
      'day': day_number,
      'topics': d.get('topics') or [],
      'resources': resources,
      'tasks': d.get('tasks') or [],
      'estimated_time': d.get('estimated_time') or f"{user_context['daily_hours']} hours"
    })

  return {'plan_name': parsed.get('plan_name', f"{user_context['topic']} study plan"), 'days': normalized_days}