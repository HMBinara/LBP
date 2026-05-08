from flask import Flask, request, jsonify
from agents.curator import get_curated_resources
from agents.assessor import generate_assessment_quiz

app = Flask(__name__)

# Temporary storage (පස්සේ මේක DB එකකට දාමු)
session_data = {}

@app.route('/start-journey', methods=['POST'])
def start_journey():
    data = request.json
    
    # 1. Curator සොයාගන්නා දත්ත
    curated_data = get_curated_resources(data)
    
    # 2. Assessor ප්‍රශ්නාවලියක් හදයි
    quiz = generate_assessment_quiz(data['topic'], data['sub_topics'], curated_data)
    
    # දත්ත ටික තාවකාලිකව තියාගන්නවා ඊළඟ step එකට
    session_id = "user_1" # පසුව dynamic කරමු
    session_data[session_id] = {
        "user_input": data,
        "curated_resources": curated_data,
        "quiz": quiz
    }
    
    return jsonify({
        "status": "success",
        "quiz": quiz,
        "session_id": session_id
    })

# User ක්විස් එක කරලා එවන උත්තර Evaluate කරන්න
@app.route('/submit-quiz', methods=['POST'])
def submit_quiz():
    data = request.json
    session_id = data['session_id']
    user_answers = data['answers']
    
    from agents.assessor import evaluate_level
    result = evaluate_level(user_answers, session_data[session_id]['quiz'])
    
    # මීළඟට මේ result එක Planner (Agent 3) එකට යවන්න ඕනේ
    return jsonify({
        "status": "evaluated",
        "result": result
    })

if __name__ == '__main__':
    app.run(debug=True)