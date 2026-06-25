import json
import os
import uuid

import firebase_admin
from firebase_admin import credentials, firestore
from flask import Flask, jsonify, request
from flask_cors import CORS
from dotenv import load_dotenv

from agents.assessor import ensure_quiz_payload, generate_assessment_quiz
from agents.curator import get_curated_resources
from agents.planner import generate_study_plan

load_dotenv()

app = Flask(__name__)
CORS(app)  # React frontend එකට සන්නිවේදනය කිරීමට අවසර දීම

def _initialize_firestore_client():
    if not firebase_admin._apps:
        cred_path = os.path.join(os.path.dirname(__file__), "serviceAccountKey.json")
        if not os.path.exists(cred_path):
            raise FileNotFoundError(
                "Firebase service account file not found at backend/serviceAccountKey.json."
            )
        firebase_admin.initialize_app(credentials.Certificate(cred_path))
    return firestore.client()


try:
    db = _initialize_firestore_client()
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


def _normalize_quiz_questions(quiz_payload):
    if isinstance(quiz_payload, dict):
        questions = quiz_payload.get("quiz") or quiz_payload.get("quiz_questions")
        if isinstance(questions, list):
            return questions
    if isinstance(quiz_payload, list):
        return quiz_payload
    if isinstance(quiz_payload, str):
        parsed = json.loads(quiz_payload)
        return _normalize_quiz_questions(parsed)
    raise ValueError("Quiz payload is missing or invalid.")


def _score_answers(quiz_questions, answers):
    score = 0
    for index, question in enumerate(quiz_questions):
        expected = question.get("answer")
        provided = answers[index] if index < len(answers) else None
        if expected is not None and str(provided).strip() == str(expected).strip():
            score += 1
    return score


def _skill_level_from_score(score):
    if score <= 4:
        return "Beginner"
    if score <= 7:
        return "Intermediate"
    return "Advanced"


def _roadmap_array(roadmap_payload):
    if isinstance(roadmap_payload, dict):
        days = roadmap_payload.get("days")
        if isinstance(days, list):
            return days
    if isinstance(roadmap_payload, list):
        return roadmap_payload
    return []


@app.route('/health', methods=['GET'])
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
        goal = user_input.get("goal") or topic

        if not topic or duration_days is None or daily_hours is None:
            return jsonify({
                "status": "error",
                "message": "topic, duration_days, and daily_hours are required."
            }), 400
        
        # 1. Assessor Agent හරහා ප්‍රශ්න 10ක (Mixed Difficulty) Quiz එකක් සැකසීම
        quiz_payload = generate_assessment_quiz(topic, sub_topics)
        quiz_payload = ensure_quiz_payload(quiz_payload, topic, sub_topics)
        quiz_questions = _normalize_quiz_questions(quiz_payload)

        # Unique Session ID එකක් සාදා ගැනීම (UUID)
        session_id = str(uuid.uuid4())
        
        # [DATABASE SAVE 1] - පරිශීලකයා දුන් Input සහ Gemini Quiz එක Firestore හි සේව් කිරීම
        if db:
            session_ref = db.collection('sessions').document(session_id)
            session_ref.set({
                "session_id": session_id,
                "user_input": user_input,
                "topic": topic,
                "sub_topics": sub_topics,
                "duration_days": duration_days,
                "daily_hours": daily_hours,
                "goal": goal,
                "quiz_data": quiz_questions, # Keeping quiz_data for compatibility if needed
                "quiz_questions": quiz_questions,
                "status": "quiz_generated",
                "created_at": firestore.SERVER_TIMESTAMP
            })
        
        return jsonify({
            "status": "success",
            "session_id": session_id,
            "quiz": quiz_questions,
            "quiz_questions": quiz_questions
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

        current_session = doc.to_dict() or {}
        
        # Make sure we use the correctly formatted quiz questions array
        raw_quiz_data = current_session.get("quiz_questions") or current_session.get("quiz_data")
        quiz_questions = _normalize_quiz_questions(raw_quiz_data)

        if len(quiz_questions) != 10:
            # Downgrading this to a warning as the frontend depends on receiving a response anyway, but it's good to log
            print(f"Warning: Stored quiz data has {len(quiz_questions)} questions instead of 10.")

        score = _score_answers(quiz_questions, user_answers)
        skill_level = _skill_level_from_score(score)
        assessment_result = {
            "score": score,
            "total": len(quiz_questions),
            "level": skill_level
        }

        # Ensure downstream agents get the verified level plus the same criteria context.
        curated_resources = get_curated_resources(
            current_session.get('topic'),
            skill_level,
            current_session,
            assessment_result
        )

        final_plan = generate_study_plan(
            {
                "topic": current_session.get("topic"),
                "sub_topics": current_session.get("sub_topics", []),
                "duration_days": current_session.get("duration_days"),
                "daily_hours": current_session.get("daily_hours"),
                "goal": current_session.get("goal") or current_session.get("topic"),
            },
            curated_resources,
            assessment_result
        )

        roadmap_payload = _roadmap_array(final_plan)

        # [DATABASE UPDATE] - ලැබුණු ප්‍රතිඵල සහ Roadmap එක එකතු කර Firestore Document එක Update කිරීම
        session_ref.update({
            "user_answers": user_answers,
            "score": int(assessment_result["score"]),
            "skill_level": assessment_result["level"],
            "roadmap": roadmap_payload,
            "status": "completed",
            "updated_at": firestore.SERVER_TIMESTAMP
        })

        # Frontend (Dashboard.jsx) එකට කෙලින්ම කියවිය හැකි flat JSON payload එකක් යැවීම
        return jsonify({
            "status": "success",
            "score": int(assessment_result["score"]),
            "skill_level": assessment_result["level"],
            "level": assessment_result["level"],            # Fallback 1
            "roadmap": roadmap_payload,                     # Standard
            "plan": final_plan,                             # Fallback 2 (Full Object)
            "days": roadmap_payload                         # Fallback 3
        })

    except Exception as e:
        print(f"submit_quiz error: {e}")
        return jsonify({"status": "error", "message": _friendly_error_message(e)}), 500


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)