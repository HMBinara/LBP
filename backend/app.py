import os
from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv

# Agents import කරගැනීම
from agents.curator import get_curated_resources
from agents.assessor import generate_assessment_quiz, evaluate_level, ensure_quiz_payload
from agents.planner import generate_study_plan

load_dotenv()

app = Flask(__name__)
CORS(app)  # React frontend එකට සන්නිවේදනය කිරීමට අවසර දීම

# In-memory session storage
session_storage = {}


def _friendly_error_message(error):
    text = str(error)
    lower = text.lower()
    if "quota" in lower or "rate" in lower or "429" in lower:
        return "AI service quota reached right now. A fallback flow was used when possible. Please retry in a few minutes."
    return "Something went wrong while processing your request. Please try again."

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
        
        # 1. Assessor Agent හරහා ප්‍රශ්න 10ක (Mixed Difficulty) Quiz එකක් සැකසීම
        quiz = generate_assessment_quiz(topic, sub_topics)
        quiz = ensure_quiz_payload(quiz, topic, sub_topics)
        
        # Session ID එකක් සාදා දත්ත තාවකාලිකව සේව් කිරීම
        session_id = f"user_{len(session_storage) + 1}"
        session_storage[session_id] = {
            "user_input": user_input,
            "quiz_data": quiz
        }
        
        return jsonify({
            "status": "success",
            "session_id": session_id,
            "quiz": quiz
        })

    except Exception as e:
        print(f"start_journey error: {e}")
        return jsonify({"status": "error", "message": _friendly_error_message(e)}), 500

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

        # 4. Curator Agent හරහා skill level-aware resources සෙවීම
        curated_resources = get_curated_resources(
            current_session['user_input'].get('topic'),
            assessment_result['level'],
            current_session['user_input']
        )

        # 5. Planner Agent ලවා දින 2ක් කලින් ඉවර වෙන පෞද්ගලික Syllabus එක සැකසීම
        final_plan = generate_study_plan(
            current_session['user_input'],
            curated_resources,
            assessment_result
        )

        # Final plan එක session එකට ඇඩ් කිරීම
        session_storage[session_id]['final_plan'] = final_plan

        return jsonify({
            "status": "success",
            "score": assessment_result["score"],
            "skill_level": assessment_result["level"],
            "roadmap": final_plan.get("days", []),
            "resources": curated_resources
        })

    except Exception as e:
        print(f"submit_quiz error: {e}")
        return jsonify({"status": "error", "message": _friendly_error_message(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)