import google.generativeai as genai
import os
import json

def generate_assessment_quiz(topic, sub_topics, curated_content):
    # Gemini Model එක active කරගැනීම
    model = genai.GenerativeModel('gemini-1.5-flash')
    
    # AI එකට දෙන ලොජික් එක: ප්‍රශ්න 10ක් විවිධ මට්ටම් වලින් හදන්න කීම
    prompt = f"""
    You are an expert Educational Assessor. Your task is to generate a comprehensive diagnostic quiz based on the topic '{topic}' and sub-topics {sub_topics}.
    Use these curated learning resources for content validation and context: {curated_content}
    
    Requirement Strategy:
    - Create exactly 10 Multiple Choice Questions (MCQs).
    - The quiz MUST have a mixed difficulty distribution to programmatically test all skill levels:
      * Questions 1 to 3: Easy / Fundamental level (to test Beginner concepts).
      * Questions 4 to 7: Medium / Conceptual level (to test Intermediate understanding).
      * Questions 8 to 10: Hard / Practical or Advanced level (to test deep expertise).
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
    
    response = model.generate_content(prompt)
    
    # Gemini වෙතින් එන text එක පිරිසිදු කර ගැනීම (Markdown backticks අයින් කිරීම)
    clean_json = response.text.replace('```json', '').replace('```', '').strip()
    
    try:
        return json.loads(clean_json)
    except Exception as e:
        # JSON parse වෙන්න බැරි වුණොත් fallback එකක් විදිහට error එක log කරලා හිස් ව්‍යුහයක් යවනවා
        print(f"Error parsing quiz JSON: {str(e)}")
        raise e

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