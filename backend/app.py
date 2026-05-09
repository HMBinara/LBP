import os
from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv

# Agents import කරගන්න (මම පල්ලෙහා මේවායේ folders ගැන විස්තරයක් දාන්නම්)
from agents.curator import get_curated_resources
from agents.assessor import generate_assessment_quiz, evaluate_level
from agents.planner import generate_study_plan

load_dotenv()

app = Flask(__name__)
CORS(app) # React frontend එකේ ඉඳන් backend එකට access දෙන්න

# DB එකක් වෙනුවට තාවකාලිකව දත්ත තියාගන්න (In-memory storage)
session_storage = {}

@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({"status": "running", "message": "Agentic Learning System is Online"})

# --- STEP 1 & 2: සර්ච් කිරීම සහ Quiz එකක් හැදීම ---
@app.route('/start-journey', methods=['POST'])
def start_journey():
    try:
        user_input = request.json
        topic = user_input.get('topic')
        
        # 1. Agent 1 (Curator) ලවා resources හොයනවා
        curated_data = get_curated_resources(user_input)
        
        # 2. Agent 2 (Assessor) ලවා quiz එකක් හදනවා
        quiz = generate_assessment_quiz(topic, user_input.get('sub_topics', []), curated_data)
        
        # දත්ත session එකේ සේව් කරනවා ඊළඟ step එකට
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

# --- STEP 3 & 4: Quiz එක Evaluate කරලා Syllabus එක හැදීම ---
@app.route('/submit-quiz', methods=['POST'])
def submit_quiz():
    try:
        data = request.json
        session_id = data.get('session_id')
        user_answers = data.get('answers')

        if session_id not in session_storage:
            return jsonify({"status": "error", "message": "Invalid Session ID"}), 404

        current_session = session_storage[session_id]
        
        # 3. Quiz එක Evaluate කිරීම
        assessment_result = evaluate_level(user_answers, current_session['quiz_data'])
        
        # 4. Agent 3 (Planner) ලවා පෞද්ගලික Syllabus එක හැදීම
        final_plan = generate_study_plan(
            current_session['user_input'],
            current_session['curated_resources'],
            assessment_result
        )

        # Final plan එකත් session එකට ඇඩ් කරනවා
        session_storage[session_id]['final_plan'] = final_plan

        return jsonify({
            "status": "completed",
            "assessment": assessment_result,
            "study_plan": final_plan
        })

    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

if __name__ == '__main__':
    # Debug mode on කරලා තියෙන්නේ වෙනස්කම් කරද්දී auto restart වෙන්න
    app.run(host='0.0.0.0', port=5000, debug=True)