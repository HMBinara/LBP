import os
import google.generativeai as genai
from googleapiclient.discovery import build
from dotenv import load_dotenv
import json
import re

load_dotenv()

# Setup APIs
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
youtube = build('youtube', 'v3', developerKey=os.getenv("YOUTUBE_API_KEY"))

def search_youtube(query, max_results=12):
    """
    YouTube API එක මඟින් දී ඇති query එකට අදාළ වීඩියෝ සොයාගැනීම.
    """
    try:
        request = youtube.search().list(
            q=query,
            part='snippet',
            type='video',
            maxResults=max_results,
            videoCaption='closedCaption'  # Captions (Subtitles) ඇති හොඳම වීඩියෝ පෙරීම
        )
        response = request.execute()
        
        results = []
        for item in response.get('items', []):
            # සමහර විට videoId එක කෙලින්ම id එක ඇතුළේ නැතිවෙන්න පුළුවන් නිසා check කරනවා
            video_id = item.get('id', {}).get('videoId')
            if video_id:
                results.append({
                    "title": item['snippet']['title'],
                    "video_id": video_id,
                    "url": f"https://www.youtube.com/watch?v={video_id}",
                    "description": item['snippet']['description']
                })
        return results
    except Exception as e:
        print(f"YouTube API Error: {e}")
        return []

def get_curated_resources(user_data):
    """
    සොයාගත් YouTube වීඩියෝ සමූහය Gemini AI ලවා විශ්ලේෂණය කර,
    පරිශීලකයාගේ ඉලක්කයට වඩාත්ම ගැළපෙන හොඳම වීඩියෝ 7-8 වෙන් කර ගැනීම.
    """
    topic = user_data.get('topic')
    sub_topics = ", ".join(user_data.get('sub_topics', [])) if isinstance(user_data.get('sub_topics'), list) else user_data.get('sub_topics', '')
    goal = user_data.get('goal')
    
    # 1. YouTube එකේ search කිරීම (Targeted Search Query)
    search_query = f"{topic} {sub_topics} complete tutorial for {goal}"
    raw_resources = search_youtube(search_query)
    
    if not raw_resources:
        return []

    # 2. Gemini ලවා filter කරගැනීම
    model = genai.GenerativeModel('gemini-1.5-flash')
    
    prompt = f"""
    User wants to master the topic: '{topic}'.
    Specific Sub-topics specified: {sub_topics}
    Primary Educational/Career Goal: {goal}
    Duration allocated: {user_data.get('duration_days')} days
    
    Here is a pool of raw YouTube search results:
    {raw_resources}
    
    Task:
    Filter and select the top 7 to 8 most educational, high-quality, and highly relevant videos that chronologically cover the topic and sub-topics.
    
    Return the result STRICTLY in valid JSON format as an array of objects. Do not include any markdown styling like ```json.
    Use this exact JSON structure:
    [
      {{
        "title": "Cleaned Video Title",
        "url": "YouTube Video URL",
        "reason_for_picking": "Short description of what concept this video covers"
      }}
    ]
    """
    
    try:
        response = model.generate_content(prompt)
        response_text = response.text
        
        # Regex එක භාවිතයෙන් JSON array එක පමණක් වෙන් කර ගැනීම
        json_match = re.search(r'\[.*\]', response_text, re.DOTALL)
        
        if json_match:
            clean_json = json_match.group(0)
            return json.loads(clean_json)
        else:
            return json.loads(response_text.strip())
            
    except Exception as e:
        print(f"Error in Curator Agent Filtering: {e}")
        # Fallback: කිසියම් හේතුවකින් AI එක ක්‍රැෂ් වුවහොත් raw වීඩියෝ වලින් මුල් 6 කෙලින්ම යවනවා
        return [{
            "title": res["title"],
            "url": res["url"],
            "reason_for_picking": "Fallback direct selection"
        } for res in raw_resources[:6]]