import os
from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv

# Agents import කරගැනීම
from agents.curator import get_curated_resources
from agents.assessor import generate_assessment_quiz, evaluate_level
from agents.planner import generate_study_plan

load_dotenv()

app = Flask(__name__)
CORS(app)  # React frontend එකට සන්නිවේදනය කිරීමට අවසර දීම

# In-memory session storage
session_storage = {}

@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({"status": "running", "message": "Agentic Learning System is Online"})

# --- STEP 1 & 2: Content Harvesting සහ ප්‍රශ්න 10ක Mixed Quiz එකක් සැකසීම ---
@app.route('/start-journey', methods=['POST'])
def start_journey():
    try:
        user_input = request.json
        topic = user_input.get('topic')
        sub_topics = user_input.get('sub_topics', [])
        
        # 1. Curator Agent හරහා YouTube resources සෙවීම
        curated_data = get_curated_resources(user_input)
        
        # 2. Assessor Agent හරහා ප්‍රශ්න 10ක (Mixed Difficulty) Quiz එකක් සැකසීම
        quiz = generate_assessment_quiz(topic, sub_topics, curated_data)
        
        # Session ID එකක් සාදා දත්ත තාවකාලිකව සේව් කිරීම
        session_id = f"user_{len(session_storage) + 1}"
        session_storage[session_id] = {
            "user_input": user_input,
            "curated_resources": curated_data,
            "quiz_data": quiz
        }
        
        return jsonify({
            "status": "success",
            "session_id": session_id,
            "quiz": quiz
        })

    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

# --- STEP 3 & 4: ප්‍රශ්න 10 ඇගයීම, මට්ටම සෙවීම සහ Adaptive Syllabus එක සැකසීම ---
@app.route('/submit-quiz', methods=['POST'])
def submit_quiz():
    try:
        data = request.json
        session_id = data.get('session_id')
        user_answers = data.get('answers')

        if session_id not in session_storage:
            return jsonify({"status": "error", "message": "Invalid Session ID"}), 404

        current_session = session_storage[session_id]
        
        # 3. Assessor Agent ලවා ප්‍රශ්න 10 ඇගයීම සහ මට්ටම (Level) ගණනය කිරීම
        assessment_result = evaluate_level(user_answers, current_session['quiz_data'])
        
        # 4. Planner Agent ලවා දින 2ක් කලින් ඉවර වෙන පෞද්ගලික Syllabus එක සැකසීම
        final_plan = generate_study_plan(
            current_session['user_input'],
            current_session['curated_resources'],
            assessment_result
        )

        # Final plan එක session එකට ඇඩ් කිරීම
        session_storage[session_id]['final_plan'] = final_plan

        return jsonify({
            "status": "completed",
            "assessment": assessment_result,
            "study_plan": final_plan
        })

    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)