import os
from googleapiclient.discovery import build
from dotenv import load_dotenv
import json
import re
from agents.model_utils import generate_with_model_fallbacks

load_dotenv()

# Setup APIs
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

def get_curated_resources(topic, skill_level, user_data):
    """
    සොයාගත් YouTube වීඩියෝ සමූහය Gemini AI ලවා විශ්ලේෂණය කර,
    පරිශීලකයාගේ ඉලක්කයට වඩාත්ම ගැළපෙන හොඳම වීඩියෝ 7-8 වෙන් කර ගැනීම.
    """
    sub_topics = ", ".join(user_data.get('sub_topics', [])) if isinstance(user_data.get('sub_topics'), list) else user_data.get('sub_topics', '')
    goal = user_data.get('goal')
    
    # 1. YouTube එකේ search කිරීම (Targeted Search Query)
    search_query = f"{topic} {sub_topics} complete tutorial for {goal}"
    raw_resources = search_youtube(search_query)
    
    if not raw_resources:
        raise RuntimeError("Unable to fetch YouTube resources for the requested topic.")

        prompt = f"""
        User wants to master the topic: '{topic}'.
        Diagnosed skill level: {skill_level}.
        Specific Sub-topics specified: {sub_topics}
        Primary Educational/Career Goal: {goal}
        Duration allocated: {user_data.get('duration_days')} days

        Here is a pool of raw YouTube search results (title + video_id + url + description):
        {raw_resources}

        Task:
        - From the pool above, select the top 7 to 8 videos that together form a chronological and pedagogically-sound sequence covering the topic and sub-topics.
        - For each selected video, return exactly these fields: `type`, `title`, `embed_url`, `summary`.
            * `type`: must be the literal string "youtube".
            * `title`: cleaned human-friendly title.
            * `embed_url`: the YouTube embed URL in the form https://www.youtube.com/embed/VIDEO_ID.
            * `summary`: 1-2 sentence explanation of what the video teaches and why it was selected.

        IMPORTANT: Return STRICTLY a JSON array (no markdown fences, no prose). Use this exact example structure:
        [
            {
                "type": "youtube",
                "title": "...",
                "embed_url": "https://www.youtube.com/embed/VIDEO_ID",
                "summary": "Short summary"
            }
        ]
        """

    try:
        response = generate_with_model_fallbacks(prompt)
        response_text = response.text
        
        # Extract JSON array only and return.
        json_match = re.search(r'\[.*\]', response_text, re.DOTALL)
        if json_match:
            clean_json = json_match.group(0)
            parsed = json.loads(clean_json)
        else:
            parsed = json.loads(response_text.strip())

        # Normalize embed_url to ensure it's in embed format
        normalized = []
        for item in parsed:
            try:
                vid = item.get('embed_url') or item.get('video_id') or item.get('url')
                # If it's a full watch URL, extract id
                if vid and 'watch?v=' in vid:
                    vid_id = vid.split('watch?v=')[-1].split('&')[0]
                    embed = f"https://www.youtube.com/embed/{vid_id}"
                elif vid and isinstance(vid, str) and len(vid) <= 20 and not vid.startswith('http'):
                    # likely a raw id
                    embed = f"https://www.youtube.com/embed/{vid}"
                elif vid and vid.startswith('https://www.youtube.com/embed/'):
                    embed = vid
                else:
                    embed = item.get('embed_url') or item.get('url') or ''

                normalized.append({
                    "type": "youtube",
                    "title": item.get('title', '')[:240],
                    "embed_url": embed,
                    "summary": item.get('summary') or item.get('reason_for_picking') or item.get('description', '')[:400]
                })
            except Exception:
                continue

        return normalized
            
    except Exception as e:
        print(f"Error in Curator Agent Filtering: {e}")
        raise RuntimeError(f"Curator agent failed to generate resources: {e}")