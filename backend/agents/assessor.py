import json
from agents.model_utils import generate_with_model_fallbacks


def ensure_quiz_payload(quiz_payload, topic, sub_topics):
  if isinstance(quiz_payload, dict):
    questions = quiz_payload.get("quiz")
    if isinstance(questions, list) and len(questions) > 0:
      return {"quiz": questions}

  if isinstance(quiz_payload, list) and len(quiz_payload) > 0:
    return {"quiz": quiz_payload}

  if isinstance(quiz_payload, str):
    try:
      parsed = json.loads(quiz_payload)
      return ensure_quiz_payload(parsed, topic, sub_topics)
    except Exception:
      pass

  raise ValueError("Quiz payload is missing or invalid.")

def generate_assessment_quiz(topic, sub_topics):
  prompt = f"""
  You are an expert Educational Assessor. Your task is to generate a comprehensive diagnostic quiz based on the topic '{topic}' and sub-topics {sub_topics}.
  Requirement Strategy:
  - Create exactly 10 Multiple Choice Questions (MCQs).
  - The quiz MUST have a mixed difficulty distribution to programmatically test all skill levels:
    * Questions 1 to 3: Easy / Fundamental level.
    * Questions 4 to 7: Medium / Conceptual level.
    * Questions 8 to 10: Hard / Practical or Advanced level.
  - Provide exactly 4 unique choices/options for each question.

  Return the response STRICTLY in valid JSON format only, without any markdown formatting or wrapper code. Use this exact structure:
  {{
    "quiz": [
      {{
        "id": 1,
        "question": "The question text here",
        "options": ["Option A", "Option B", "Option C", "Option D"],
        "answer": "The exact correct option text"
      }}
    ]
  }}
  """

  response = generate_with_model_fallbacks(prompt)

  clean_json = response.text.replace('```json', '').replace('```', '').strip()
  return json.loads(clean_json)

def evaluate_level(user_answers, quiz_data):
    """
    පරිශීලකයා ලබාදුන් පිළිතුරු 10 ඇගයීමට ලක් කර ලකුණු ප්‍රමාණය මත
    ඔවුන් සිටින සැබෑ මට්ටම (Level) ස්වයංක්‍රීයව ගණනය කිරීම.
    """
    score = 0
    quiz_list = quiz_data.get('quiz', [])
    total = len(quiz_list)
    
    # ප්‍රශ්න 10 සඳහා ලකුණු එකතු කිරීම
    for i in range(total):
        # Frontend එකෙන් එන answers array එකේ පිළිවෙළ සහ quiz එකේ පිළිවෙළ සසඳා බැලීම
        if i < len(user_answers):
            if user_answers[i] == quiz_list[i]['answer']:
                score += 1
                
    # ලකුණු 10න් ලැබෙන ප්‍රමාණය අනුව මට්ටම තීරණය කිරීම (Programmatic Level Assessment)
    if score <= 3:
        level = "Beginner"
    elif score <= 7:
        level = "Intermediate"
    else:
        level = "Advanced"
        
    return {
        "score": score, 
        "total": total, 
        "level": level
    }