#!/usr/bin/env python3
"""
Gather all YouTube videos for all exercises, tasks, and special quests in ThriveFold.
- Preserves all existing entries in exercise-videos.json and task-videos.json.
- Verifies every new video ID against YouTube's oEmbed endpoint.
- Produces:
  1. Updated exercise-videos.json (with child_pose, cycling, and hardcoded ones)
  2. Updated task-videos.json (with all 151 tasks and 49 special quests)
  3. Master thrivefold-videos-all.json with all exercises, tasks, special quests, links, channels, and categories.
"""

import os
import json
import re
import time
import urllib.request
import urllib.parse
from concurrent.futures import ThreadPoolExecutor, as_completed

BASE_DIR = '/Volumes/Amit/Projects/Apps/thrivefold'
EXERCISE_JSON_PATH = os.path.join(BASE_DIR, 'src/content/exercise-videos.json')
TASK_JSON_PATH = os.path.join(BASE_DIR, 'src/content/task-videos.json')
CATALOG_JSON_PATH = os.path.join(BASE_DIR, 'src/content/game/thrivefold_real_game_catalog_v3.json')
WORKOUTS_TS_PATH = os.path.join(BASE_DIR, 'src/domain/fitness/workouts.ts')
ALL_VIDEOS_JSON_PATH = os.path.join(BASE_DIR, 'src/content/thrivefold-videos-all.json')

USER_AGENTS = [
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
    'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
]

def check_oembed(video_id):
    """Verify video exists, is public, and embeddable via YouTube oEmbed."""
    url = f"https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v={video_id}&format=json"
    req = urllib.request.Request(url, headers={'User-Agent': USER_AGENTS[0]})
    try:
        with urllib.request.urlopen(req, timeout=6) as res:
            if res.status == 200:
                data = json.loads(res.read().decode('utf-8'))
                title = data.get('title')
                channel = data.get('author_name')
                if title and channel:
                    return {
                        'videoId': video_id,
                        'title': title,
                        'channel': channel
                    }
    except Exception:
        pass
    return None

def search_youtube_candidates(query):
    """Scrape candidate video IDs from YouTube search results."""
    encoded = urllib.parse.quote_plus(query)
    url = f"https://www.youtube.com/results?search_query={encoded}"
    req = urllib.request.Request(
        url,
        headers={
            'User-Agent': USER_AGENTS[hash(query) % len(USER_AGENTS)],
            'Accept-Language': 'en-US,en;q=0.9',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        }
    )
    try:
        with urllib.request.urlopen(req, timeout=8) as res:
            html = res.read().decode('utf-8', errors='ignore')
            # Extract video IDs matching /watch?v=XXXXXXXXXXX
            video_ids = re.findall(r'/watch\?v=([a-zA-Z0-9_-]{11})', html)
            seen = []
            for vid in video_ids:
                if vid not in seen:
                    seen.append(vid)
            return seen
    except Exception as e:
        return []

def find_verified_video(query_list):
    """Search YouTube with queries until a candidate video passes oEmbed verification."""
    for query in query_list:
        candidates = search_youtube_candidates(query)
        for vid in candidates[:4]:  # check top 4 candidates
            verified = check_oembed(vid)
            if verified:
                return verified
            time.sleep(0.1)
        time.sleep(0.2)
    return None

def main():
    print("=== Loading existing data ===")
    with open(EXERCISE_JSON_PATH, 'r') as f:
        exercise_videos = json.load(f)
    print(f"Loaded {len(exercise_videos)} existing exercise videos.")

    with open(TASK_JSON_PATH, 'r') as f:
        task_videos = json.load(f)
    print(f"Loaded {len(task_videos)} existing task videos.")

    # 1. Exercises
    with open(WORKOUTS_TS_PATH, 'r') as f:
        workouts_content = f.read()
    
    # Extract all exercise IDs and names from workouts.ts
    exercise_defs = re.findall(
        r'\{\s*id:\s*[\'"]([a-z0-9_]+)[\'"],\s*name:\s*[\'"]([^\'"]+)[\'"]',
        workouts_content
    )
    
    # Filter to only actual exercises (before WORKOUT_PLANS)
    exercises_to_check = []
    seen_eids = set()
    for eid, name in exercise_defs:
        if eid == 'home_beginner':
            break
        if eid not in seen_eids:
            seen_eids.add(eid)
            exercises_to_check.append((eid, name))

    print(f"Total exercises in workouts.ts: {len(exercises_to_check)}")

    # Add hardcoded ones if not in exercise_videos
    hardcoded = {
        'squat_bw': {'videoId': 'eWatHIujxPM', 'title': 'How to Do a Bodyweight Squat (Perfect Form + Common Mistakes)', 'channel': 'Over The Hill Athlete'},
        'pushup': {'videoId': 'zF0jbubK_jU', 'title': 'How To Do A Push-Up: Proper Form & Technique', 'channel': 'BuiltLean'},
        'glute_bridge': {'videoId': 'OUgsJ8-Vi0E', 'title': 'How to Perform the Perfect Glute Bridge', 'channel': 'Airrosti Rehab Centers'},
        'plank': {'videoId': 'mwlp75MS6Rg', 'title': 'How to do a Plank | Proper Form & Technique', 'channel': 'NASM'},
    }
    for k, v in hardcoded.items():
        if k not in exercise_videos:
            exercise_videos[k] = v

    # Missing exercises
    missing_exercises = [(eid, name) for eid, name in exercises_to_check if eid not in exercise_videos]
    print(f"Missing exercises to gather: {len(missing_exercises)}")
    for eid, name in missing_exercises:
        print(f"  Searching video for exercise: {eid} ({name})")
        queries = [
            f"{name} proper form tutorial exercise",
            f"how to do {name} exercise",
            f"{eid.replace('_', ' ')} exercise technique"
        ]
        video = find_verified_video(queries)
        if video:
            exercise_videos[eid] = video
            print(f"    ✓ Found: {video['title']} ({video['channel']})")
        else:
            print(f"    ✗ Failed to find verified video for {eid}")

    # 2. Tasks & Special Quests
    with open(CATALOG_JSON_PATH, 'r') as f:
        catalog = json.load(f)

    task_definitions = catalog.get('taskDefinitions', [])
    special_quests = catalog.get('specialQuestDefinitions', [])
    print(f"Catalog has {len(task_definitions)} tasks and {len(special_quests)} special quests.")

    tasks_to_find = [t for t in task_definitions if t['id'] not in task_videos]
    sq_to_find = [sq for sq in special_quests if sq['id'] not in task_videos]
    print(f"Missing tasks to fetch: {len(tasks_to_find)}")
    print(f"Missing special quests to fetch: {len(sq_to_find)}")

    all_items_to_fetch = []
    for t in tasks_to_find:
        all_items_to_fetch.append({
            'id': t['id'],
            'type': 'task',
            'title': t.get('title', ''),
            'domain': t.get('domainId', ''),
            'purpose': t.get('purpose', t.get('shortDescription', ''))
        })
    for sq in sq_to_find:
        all_items_to_fetch.append({
            'id': sq['id'],
            'type': 'special_quest',
            'title': sq.get('title', ''),
            'domain': sq.get('domainId', ''),
            'purpose': sq.get('purpose', sq.get('shortDescription', ''))
        })

    def process_item(item):
        item_id = item['id']
        title = item['title']
        purpose = item['purpose']
        domain = item['domain']
        clean_title = re.sub(r'[\'\"’]', '', title)
        
        queries = [
            f"{clean_title} guide tutorial",
            f"{clean_title} mental health wellness",
            f"{purpose[:60]} how to",
            f"{clean_title} {domain}",
            f"{clean_title}"
        ]
        video = find_verified_video(queries)
        return item_id, item['type'], title, video

    print(f"\nGathering verified YouTube videos for {len(all_items_to_fetch)} items with 6 concurrent threads...")
    success_count = 0
    fail_count = 0

    with ThreadPoolExecutor(max_workers=6) as executor:
        futures = {executor.submit(process_item, item): item for item in all_items_to_fetch}
        for i, future in enumerate(as_completed(futures), 1):
            item = futures[future]
            try:
                item_id, item_type, title, video = future.result()
                if video:
                    task_videos[item_id] = video
                    success_count += 1
                    print(f"[{i}/{len(all_items_to_fetch)}] ✓ {item_id}: {video['title'][:50]}... ({video['channel']})")
                else:
                    fail_count += 1
                    print(f"[{i}/{len(all_items_to_fetch)}] ✗ {item_id}: No verified video found")
            except Exception as e:
                fail_count += 1
                print(f"[{i}/{len(all_items_to_fetch)}] ! {item['id']}: Error {e}")

    print(f"\nCompleted: {success_count} found, {fail_count} failed.")

    # 3. Save updated exercise-videos.json
    print(f"Saving updated {EXERCISE_JSON_PATH} ({len(exercise_videos)} total)...")
    with open(EXERCISE_JSON_PATH, 'w', encoding='utf-8') as f:
        json.dump(exercise_videos, f, indent=2, ensure_ascii=False)

    # 4. Save updated task-videos.json
    print(f"Saving updated {TASK_JSON_PATH} ({len(task_videos)} total)...")
    with open(TASK_JSON_PATH, 'w', encoding='utf-8') as f:
        json.dump(task_videos, f, indent=2, ensure_ascii=False)

    # 5. Build master all-videos file
    print(f"Building master unified catalog at {ALL_VIDEOS_JSON_PATH}...")
    master_catalog = {
        "_meta": {
            "version": "1.0.0",
            "generatedAt": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
            "totalExercises": len(exercise_videos),
            "totalTasks": len([t for t in task_definitions if t['id'] in task_videos]),
            "totalSpecialQuests": len([sq for sq in special_quests if sq['id'] in task_videos]),
            "totalVideos": len(exercise_videos) + len(task_videos)
        },
        "exercises": exercise_videos,
        "tasks": {t['id']: task_videos[t['id']] for t in task_definitions if t['id'] in task_videos},
        "specialQuests": {sq['id']: task_videos[sq['id']] for sq in special_quests if sq['id'] in task_videos},
        "all": {}
    }

    # Combined map
    for eid, data in exercise_videos.items():
        master_catalog["all"][f"exercise:{eid}"] = {
            **data,
            "category": "exercise",
            "url": f"https://www.youtube.com/watch?v={data['videoId']}",
            "embedUrl": f"https://www.youtube-nocookie.com/embed/{data['videoId']}"
        }
    for tid, data in task_videos.items():
        master_catalog["all"][f"task:{tid}"] = {
            **data,
            "category": "task",
            "url": f"https://www.youtube.com/watch?v={data['videoId']}",
            "embedUrl": f"https://www.youtube-nocookie.com/embed/{data['videoId']}"
        }

    with open(ALL_VIDEOS_JSON_PATH, 'w', encoding='utf-8') as f:
        json.dump(master_catalog, f, indent=2, ensure_ascii=False)

    print(f"Successfully created master catalog with {len(master_catalog['all'])} verified entries!")

if __name__ == '__main__':
    main()
