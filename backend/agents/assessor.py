import google.generativeai as genai
import os
import json

def generate_assessment_quiz(topic, sub_topics, curated_content):
    model = genai.GenerativeModel('gemini-1.5-flash')
    
    # Prompt එක හදන්නේ user දැනටමත් දන්න දේ මැන ගන්න
    prompt = f"""
    Based on the topic '{topic}' and sub-topics {sub_topics}, generate a diagnostic quiz.
    Use these curated resources for context: {curated_content}
    
    Requirement:
    - Create 5 Multiple Choice Questions (MCQs).
    - Vary the difficulty.
    - Return strictly in JSON format:
    {{
      "quiz": [
        {{
          "id": 1,
          "question": "question text",
          "options": ["A", "B", "C", "D"],
          "answer": "correct option"
        }}
      ]
    }}
    """
    
    response = model.generate_content(prompt)
    
    # Gemini සමහර වෙලාවට ```json ... 
    #කියලා දෙන නිසා ඒක clean කරගන්නවා
    clean_json = response.text.replace('```json', '').replace('```', '').strip()
    return json.loads(clean_json)

def evaluate_level(user_answers, quiz_data):
    # මෙතනදී user ගේ score එක බලලා level එකක් දෙනවා
    score = 0
    total = len(quiz_data['quiz'])
    
    # සරලව ලකුණු ගණනය කිරීම
    # (පසුව AI එක ලවාම 'මොන කොටසද මදි' කියලා analyze කරවන්න පුළුවන්)
    for i in range(total):
        if user_answers[i] == quiz_data['quiz'][i]['answer']:
            score += 1
            
    if score <= 2: level = "Beginner"
    elif score <= 4: level = "Intermediate"
    else: level = "Advanced"
    
    return {"score": score, "total": total, "level": level}