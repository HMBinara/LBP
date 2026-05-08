import os
import google.generativeai as genai
from googleapiclient.discovery import build
from dotenv import load_dotenv

load_dotenv()

# Setup APIs
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
youtube = build('youtube', 'v3', developerKey=os.getenv("YOUTUBE_API_KEY"))

def search_youtube(query, max_results=10):
    request = youtube.search().list(
        q=query,
        part='snippet',
        type='video',
        maxResults=max_results,
        videoCaption='closedCaption' # ගොඩක් වෙලාවට captions තියෙන ඒවා හොඳයි
    )
    response = request.execute()
    
    results = []
    for item in response['items']:
        results.append({
            "title": item['snippet']['title'],
            "video_id": item['id']['videoId'],
            "url": f"https://www.youtube.com/watch?v={item['id']['videoId']}",
            "description": item['snippet']['description']
        })
    return results

def get_curated_resources(user_data):
    topic = user_data.get('topic')
    sub_topics = ", ".join(user_data.get('sub_topics', []))
    goal = user_data.get('goal')
    
    # 1. YouTube එකේ search කරනවා
    search_query = f"{topic} {sub_topics} tutorial for {goal}"
    raw_resources = search_youtube(search_query)
    
    # 2. Gemini ලවා filter කරගන්නවා
    model = genai.GenerativeModel('gemini-1.5-flash')
    
    prompt = f"""
    User wants to learn about {topic}.
    Specific Sub-topics: {sub_topics}
    Goal: {goal}
    Duration: {user_data.get('duration_days')} days
    
    Here are some YouTube search results:
    {raw_resources}
    
    Filter and pick the top 5 most relevant videos. Return the result strictly in JSON format as a list of objects with 'title', 'url', and 'reason_for_picking'.
    """
    
    response = model.generate_content(prompt)
    # JSON එක විතරක් clean කරලා ගන්නවා
    return response.text