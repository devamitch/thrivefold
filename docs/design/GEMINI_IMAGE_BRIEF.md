# Thrivefold — image brief for Gemini

Give this whole file to Gemini (image generation). Each image has an exact file name and folder,
the screen it goes on, and a ready prompt. Save every file at exactly that path; Claude wires them
into the screens (each one replaces a placeholder or a borrowed illustration listed under "Replaces").

## 1. Rules for every image

**Match the existing set.** Reference images already in the app (use them as style references):
`assets/illustrations/wellness-eye-vision.jpg`, `wellness-meditation-mind.jpg`, `workout-yoga-flow.jpg`.

- **Style:** soft editorial gouache / flat-painted illustration, gentle grain, no hard outlines,
  calm daylight, airy negative space. Not photographic, not 3D, not cartoon, not anime.
- **Palette:** warm cream and bone backgrounds (#F3F1EC, #EAE6DE), sage green (#8FA886),
  terracotta (#C9714E), soft sky blue, warm oak wood, ink navy accents (#24324A). No neon, no purple
  gradients.
- **People:** adults of varied ages, body types and skin tones, with South Asian people well
  represented. Faces turned away, in profile, or small and soft, never a detailed or identifiable
  face. Modest, everyday clothing. No body-shaming poses, no "before/after", no sexualised framing.
- **Never include:** text, letters, numbers, logos, watermarks, signatures, app screens with
  readable UI, brand products, religious symbols, flags, medical devices that imply diagnosis.
- **Size:** 1200 × 896 px, JPG, quality ~80, under 450 KB.
- **Safe area:** most screens crop to a wide 16:7 strip through the middle (rows ~185–710 of 896).
  Keep the subject and anything important inside that middle band; top and bottom may be cropped.

Base prompt to prepend to every image prompt below:

> Soft editorial gouache illustration, flat painted texture with gentle grain, calm daylight, warm
> cream and bone background, palette of sage green, terracotta, oak wood and soft sky blue with ink
> navy accents, airy negative space, no text, no letters, no logos, no watermark, people shown from
> behind or in soft profile with no detailed faces, subject centred in a wide horizontal band,
> 1200x896.

## 2. Images

| # | File (save exactly here) | Screen | Replaces |
|---|---|---|---|
| 1 | `assets/illustrations/beta-lab-hub.jpg` | Beta Lab (top hero) | `games-focus.jpg` |
| 2 | `assets/illustrations/beta-face-exercises.jpg` | Face & eye exercises (intro) | none |
| 3 | `assets/illustrations/beta-hand-games.jpg` | Hand Games (intro) | `workout-mobility.jpg` |
| 4 | `assets/illustrations/beta-eye-pursuit.jpg` | Eye Pursuit (intro) | none |
| 5 | `assets/illustrations/beta-breathing.jpg` | Breathing Coach (top) | none |
| 6 | `assets/illustrations/beta-voice-practice.jpg` | Voice Practice (top) | none |
| 7 | `assets/illustrations/beta-body-style.jpg` | Body & Style Companion (top) | `workout-strength.jpg` |
| 8 | `assets/illustrations/beta-pose-coach.jpg` | Live Pose Coach (top) | none |
| 9 | `assets/illustrations/beta-coach-assistant.jpg` | Thrive Coach assistant (empty chat) | none |
| 10 | `assets/illustrations/outdoors-walk.jpg` | Home → Outdoors card (before a town is chosen) | none |
| 11 | `assets/illustrations/profile-kosh.jpg` | Settings → Your profile (top) | none |
| 12 | `assets/illustrations/nutrition-plate.jpg` | Meal log / nutrition (empty state) | none |
| 13 | `assets/illustrations/activity-indoor.jpg` | Activity sessions (treadmill, walking pad) | none |
| 14 | `assets/illustrations/health-men.jpg` | Men's health hub (top) | none |
| 15 | `assets/illustrations/health-pride.jpg` | LGBTQ+ wellbeing hub (top) | none |
| 16 | `assets/illustrations/emergency-help.jpg` | Urgent support / emergency (top) | none |

### 1. beta-lab-hub.jpg
A bright, airy home studio corner at morning: a wooden desk with a small plant, a phone propped on a
little stand facing a person seen from behind who is mid-stretch, soft abstract shapes floating
gently in the air suggesting motion trails (circles and arcs in sage and terracotta), large window
with green hills. Feeling: curious, playful, calm technology.

### 2. beta-face-exercises.jpg
A woman in soft profile sitting cross-legged on a cushion by a window, eyes gently closed, one hand
lightly touching her cheek as in a face-relaxation exercise, a small round mirror on a low wooden
table, warm light on the side of the face, a sprig of eucalyptus in a ceramic vase. Calm self-care,
no make-up products.

### 3. beta-hand-games.jpg
Close, friendly view of two hands (varied skin tones, one older, one younger) playfully showing
gestures — an open palm and a thumbs up — over a light wooden table, a phone standing on a small
stand in soft focus, a cup of tea, small floating dots and arcs suggesting motion. Warm and joyful.

### 4. beta-eye-pursuit.jpg
A person seen from behind sitting on a bench in a sunlit room, following with their gaze a single
soft terracotta circle gliding along a gentle curved path across the wall, faint dotted trail
behind the circle, large window with distant green hills. Peaceful focus.

### 5. beta-breathing.jpg
A man in soft profile seated on a floor cushion in a quiet room, hands resting on the belly, a large
pale sage circle behind him like a slow breath expanding, sheer curtains moving slightly, morning
light, a small brass bowl on the floor. Deep calm.

### 6. beta-voice-practice.jpg
A young woman in soft profile standing by an open window, one hand on her chest, mouth slightly
open as if humming or singing a long note, soft flowing ribbon-like waves in sage and terracotta
drifting from her toward the window, potted plants, warm daylight. Confident and gentle. No
microphones, no music notes as text.

### 7. beta-body-style.jpg
A bright dressing corner: a tall wooden-framed mirror leaning on the wall reflecting only soft
shapes, a clothes rail with a few garments in sage, cream, terracotta and navy, a pair of glasses
on a small side table, a person seen from behind choosing a shirt. Inclusive, relaxed, no body
focus, no measuring tapes.

### 8. beta-pose-coach.jpg
A person in comfortable activewear doing a slow, well-aligned squat on a yoga mat in a sunny living
room, seen from the side at a distance, faint thin sage lines and small dots tracing the joints of
the body like a gentle skeleton overlay, phone on a stand nearby. Supportive, not clinical.

### 9. beta-coach-assistant.jpg
A cosy reading nook in the evening: a person seen from behind sitting on a window seat holding a
phone, from which soft rounded speech-bubble shapes (empty, no text) float upward and turn into
little leaves, a warm lamp, a mug, a sleeping cat on a cushion. Friendly companionship.

### 10. outdoors-walk.jpg
A tree-lined Indian neighbourhood lane in early morning: low colourful houses, a tea stall with a
steaming kettle, two people walking away from the viewer with a water bottle, soft clouds and a
light breeze in the leaves, a low skyline in the distance. Fresh, inviting, everyday.

### 11. profile-kosh.jpg
A calm desk scene from above at a slight angle: an open linen-bound notebook with blank pages, a
pair of glasses, a small potted plant, a cup of tea, a family-style photo frame showing only soft
abstract shapes, a phone face down. Warm, personal, organised.

### 12. nutrition-plate.jpg
A wholesome Indian home meal on a wooden table seen from above: a steel thali with dal, rice,
seasonal vegetables, salad, curd and a roti, a glass of water, fresh herbs scattered, natural
light. Balanced and appetising, no meat in the centre (meat-free so it suits all diets).

### 13. activity-indoor.jpg
A bright apartment corner with a slim walking pad under a standing desk, a person seen from behind
walking while looking out of a big window at green trees, water bottle on the desk, plants, soft
morning light. Active and cheerful.

### 14. health-men.jpg
A man in his thirties seen from behind on a balcony at sunrise, stretching his arms overhead after a
workout, a towel on the railing, a jute mat, potted plants, city rooftops softly in the distance.
Strong, calm, everyday.

### 15. health-pride.jpg
Two friends seen from behind sitting close on a sunlit grassy hill, one resting a head on the
other's shoulder, a picnic blanket in soft muted rainbow stripes (sage, terracotta, sand, sky,
lavender-grey), wildflowers around. Warm, affirming, private. No flags, no text.

### 16. emergency-help.jpg
A reassuring scene: a person sitting on a sofa holding a phone to their ear, a friend's hand resting
gently on their shoulder, warm lamp light, a glass of water on the table, a window with soft
evening light. Safe, supported, calm. No sirens, no flashing lights, no hospital imagery.

## 3. After saving

Commit nothing yourself if another agent is working; just put the files at the paths above and
tell Claude "images are in". Claude will check size and safe area, add them to
`src/constants/assets.ts`, and replace the borrowed illustrations listed in the table.
