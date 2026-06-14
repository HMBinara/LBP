import os
import uuid
from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
import firebase_admin
from firebase_admin import credentials, firestore

# Agents import කරගැනීම (ඔයාගේ නිවැරදිම ශ්‍රිත නාමයන් සමඟ)
from agents.curator import get_curated_resources
from agents.assessor import generate_assessment_quiz, evaluate_level, ensure_quiz_payload
from agents.planner import generate_study_plan

load_dotenv()

app = Flask(__name__)
CORS(app)  # React frontend එකට සන්නිවේදනය කිරීමට අවසර දීම

# --- 1. Firebase Firestore Initialize කිරීම ---
try:
    cred = credentials.Certificate('serviceAccountKey.json')
    firebase_admin.initialize_app(cred)
    db = firestore.client()
    print("🔥 Firebase Firestore Connected Successfully!")
except Exception as e:
    print(f"❌ Firebase Initialization Error: {e}")
    db = None


def _friendly_error_message(error):
    text = str(error)
    lower = text.lower()
    if "quota" in lower or "rate" in lower or "429" in lower:
        return "AI service quota reached right now. Please retry in a few minutes."
    return "Something went wrong while processing your request. Please try again."


@app.run('/health', methods=['GET'])
def health_check():
    return jsonify({"status": "running", "message": "Agentic Learning System is Online"})


# --- STEP 1 & 2: Content Harvesting සහ ප්‍රශ්න 10ක Mixed Quiz එකක් සැකසීම ---
@app.route('/start-journey', methods=['POST'])
def start_journey():
    try:
        user_input = request.json or {}
        topic = user_input.get('topic')
        sub_topics = user_input.get('sub_topics', [])
        duration_days = user_input.get('duration_days')
        daily_hours = user_input.get('daily_hours')

        if not topic or duration_days is None or daily_hours is None:
            return jsonify({
                "status": "error",
                "message": "topic, duration_days, and daily_hours are required."
            }), 400
        
        # 1. Assessor Agent හරහා ප්‍රශ්න 10ක (Mixed Difficulty) Quiz එකක් සැකසීම
        quiz = generate_assessment_quiz(topic, sub_topics)
        quiz = ensure_quiz_payload(quiz, topic, sub_topics)
        
        # Unique Session ID එකක් සාදා ගැනීම (UUID)
        session_id = str(uuid.uuid4())
        
        # [DATABASE SAVE 1] - පරිශීලකයා දුන් Input සහ Gemini Quiz එක Firestore හි සේව් කිරීම
        if db:
            session_ref = db.collection('sessions').document(session_id)
            session_ref.set({
                "session_id": session_id,
                "user_input": user_input,
                "quiz_data": quiz,
                "status": "quiz_generated",
                "created_at": firestore.SERVER_TIMESTAMP
            })
        
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
        data = request.json or {}
        session_id = data.get('session_id')
        user_answers = data.get('answers')

        if not session_id or user_answers is None:
            return jsonify({"status": "error", "message": "Missing session_id or answers"}), 400
        if not isinstance(user_answers, list):
            return jsonify({"status": "error", "message": "answers must be an array."}), 400

        if not db:
            return jsonify({"status": "error", "message": "Database connection unavailable"}), 500

        # [DATABASE READ] - Firestore වෙතින් අදාළ සෙෂන් එකේ තොරතුරු ලබා ගැනීම
        session_ref = db.collection('sessions').document(session_id)
        doc = session_ref.get()

        if not doc.exists:
            return jsonify({"status": "error", "message": "Invalid Session ID"}), 404

        current_session = doc.to_dict()

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

        # [DATABASE UPDATE] - ලැබුණු ප්‍රතිඵල සහ Roadmap එක එකතු කර Firestore Document එක Update කිරීම
        session_ref.update({
            "user_answers": user_answers,
            "score": int(assessment_result["score"]),
            "skill_level": assessment_result["level"],
            "roadmap": final_plan.get("days", []),
            "status": "completed",
            "updated_at": firestore.SERVER_TIMESTAMP
        })

        # Frontend (Dashboard.jsx) එකට කෙලින්ම කියවිය හැකි flat JSON payload එකක් යැවීම
        return jsonify({
            "status": "success",
            "score": int(assessment_result["score"]),
            "skill_level": assessment_result["level"],
            "roadmap": final_plan.get("days", [])
        })

    except Exception as e:
        print(f"submit_quiz error: {e}")
        return jsonify({"status": "error", "message": _friendly_error_message(e)}), 500


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)