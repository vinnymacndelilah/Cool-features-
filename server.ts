import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import ViteExpress from 'vite-express';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Initialize Firebase Admin
if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
  try {
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
    initializeApp({
      credential: cert(serviceAccount)
    });
    console.log('Firebase Admin initialized.');
  } catch (error) {
    console.error('Error parsing FIREBASE_SERVICE_ACCOUNT_KEY:', error);
  }
} else {
  console.warn('FIREBASE_SERVICE_ACCOUNT_KEY not found. Firestore admin functionality may not work.');
  // Initialize with application default credentials as fallback if available in cloud run
  initializeApp();
}

const db = getFirestore();

// Initialize Gemini
let ai: GoogleGenAI | null = null;
if (process.env.GEMINI_API_KEY) {
  ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
}

// API Routes
app.post('/api/generate-lesson', async (req, res) => {
  try {
    if (!ai) throw new Error('Gemini API key is not configured.');
    const { theme, ageGroup, interests } = req.body;
    
    const prompt = `You are Adeline, an elite AI learning companion for a homeschool family.
The family consists of four students: Addy (11th Grade), Della (9th Grade), Cash (8th Grade), and Ellie (6th Grade).
You are teaching a daily, family-style lesson around the theme: "${theme}".
Target Age Group/Level: ${ageGroup}
Student Interests: ${interests}

CRITICAL CURRICULUM DIRECTIVES:
1. Speak DIRECTLY to the kids (Addy, Della, Cash, Ellie). Use an engaging, conversational, yet intellectually rigorous tone.
2. DO NOT just provide a vague outline. You must actually TEACH the concepts simply and thoroughly within the 'directTeaching' blocks. Explain the 'why' and the 'how'.
3. Science & God's Creation: Must focus on exciting, experiment-based science tailored for survival, thriving in real life, and self-sustainability. Focus on off-grid preparedness, agriculture, mechanics, or applied biology.
4. History & Justice: Must focus on learning from the past to change the future through *real projects today*. Strong justice focus: how can we help those suffering and stop those causing it?
5. The core of EVERY DAY is a Big, Fun, Hands-On Science Experiment (Sovereign Lab). This family experiment MUST be explicitly detailed.
6. The Individual Breakouts are NOT disconnected random topics. They MUST be tiered roles, tasks, or calculations *within* the family science experiment, aligned to their specific grade-level standards.

ACADEMIC STANDARDS INTEGRATION & PROGRESSION:
A school year has roughly 180 days. To ensure we cover all standards over the year, you MUST randomly select ONE standard from the pool of all possible Oklahoma Academic Standards for each child's grade level. 
The standard you select must be applied to their specific role in today's family science experiment.

For this specific generation, please select and teach exactly ONE standard for each child from the following domains, and apply it directly to their task in the family experiment:

Addy (11th Grade): Randomly select ONE standard from High School Algebra II, Chemistry, Physics, US History, or English III.
Della (9th Grade): Randomly select ONE standard from High School Algebra I, Biology, OK History/Government, or English I.
Cash (8th Grade): Randomly select ONE standard from 8th Grade Pre-Algebra, Physical Science, Early US History, or 8th Grade ELA.
Ellie (6th Grade): Randomly select ONE standard from 6th Grade Math, Earth & Space Science, Western Hemisphere Social Studies, or 6th Grade ELA.

Format as a structured JSON object with the following schema:
{
  "title": "Lesson Title",
  "narrativeHook": "A story or scenario to start the day, speaking directly to them",
  "integratedActivities": [
    {
      "subject": "Subject Name",
      "activityName": "Activity Title",
      "directTeaching": "Thorough, direct-to-student teaching text explaining the concept clearly.",
      "interactiveQuestion": "A specific question they need to answer in their book.",
      "questionId": "unique_string_id_for_this_question"
    }
  ],
  "scienceExperiment": {
    "name": "Experiment Name",
    "directTeaching": "Explanation of the science behind this and why it matters for survival/justice.",
    "materials": ["item1", "item2"],
    "instructions": ["step1", "step2"],
    "reflectionQuestion": "A question asking them to record their observations or thoughts.",
    "questionId": "unique_string_id_for_experiment"
  },
  "writingPrompt": {
    "prompt": "The creative writing or project planning prompt.",
    "questionId": "unique_string_id_for_writing"
  },
  "multimediaResources": [
    {
      "title": "Resource Title",
      "type": "Video | Simulation | Interactive | Archive",
      "description": "Why this resource is valuable for this lesson",
      "searchQuery": "What to search for on YouTube or Google to find this exact resource"
    }
  ],
  "individualBreakouts": {
    "Addy": {
      "directTeaching": "Explanation connecting her specific grade-level standard directly to her required role/task in today's family science experiment. YOU MUST EXPLICITLY STATE WHICH STANDARD YOU CHOSE AT THE BEGINNING. Teach the practical, hands-on application of this standard within the context of the experiment.",
      "appliedChallenge": "Her specific hands-on task, mini-experiment, or real-world calculation for the family experiment. DO NOT ask theoretical questions. Ask her to do something physical or calculate something real for the family, and record her findings here.",
      "questionId": "unique_string_id_addy"
    },
    "Della": {
      "directTeaching": "Explanation connecting her specific grade-level standard directly to her required role/task in today's family science experiment. YOU MUST EXPLICITLY STATE WHICH STANDARD YOU CHOSE AT THE BEGINNING.",
      "appliedChallenge": "Her specific hands-on task, mini-experiment, or real-world calculation for the family experiment. DO NOT ask theoretical questions. Ask her to do something physical or calculate something real for the family, and record her findings here.",
      "questionId": "unique_string_id_della"
    },
    "Cash": {
      "directTeaching": "Explanation connecting his specific grade-level standard directly to his required role/task in today's family science experiment. YOU MUST EXPLICITLY STATE WHICH STANDARD YOU CHOSE AT THE BEGINNING.",
      "appliedChallenge": "His specific hands-on task, mini-experiment, or real-world calculation for the family experiment. DO NOT ask theoretical questions. Ask him to do something physical or calculate something real for the family, and record his findings here.",
      "questionId": "unique_string_id_cash"
    },
    "Ellie": {
      "directTeaching": "Explanation connecting her specific grade-level standard directly to her required role/task in today's family science experiment. YOU MUST EXPLICITLY STATE WHICH STANDARD YOU CHOSE AT THE BEGINNING.",
      "appliedChallenge": "Her specific hands-on task, mini-experiment, or real-world calculation for the family experiment. DO NOT ask theoretical questions. Ask her to do something physical or calculate something real for the family, and record her findings here.",
      "questionId": "unique_string_id_ellie"
    }
  },
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.1-pro-preview',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      }
    });

    if (!response.text) throw new Error('Failed to generate content');
    const lessonPlan = JSON.parse(response.text);
    res.json(lessonPlan);
  } catch (error: any) {
    console.error('Error generating lesson:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/bible-study', async (req, res) => {
  try {
    if (!ai) throw new Error('Gemini API key is not configured.');
    const { topicOrVerse } = req.body;

    const prompt = `You are a biblical scholar and linguist.
Create a daily Bible deep dive based on this topic or verse: "${topicOrVerse}".

Requirements:
1. Provide the English translation (indicate which version, prefer ESV or NASB for accuracy, but explain).
2. Deep dive into the original meaning and context (Hebrew/Greek).
3. Use the original names (e.g., Yeshua, YHWH, Elohim) and original text.
4. Point out if a typical English translation has lost meaning or changed nuances, and explain why.
5. Connect it to the "Justice & Change-Making" and "Discipleship" subjects.

Format as a structured JSON object:
{
  "reference": "Book Chapter:Verse",
  "englishText": "The text in English",
  "originalLanguageAnalysis": "Deep dive into Hebrew/Greek meanings",
  "translationNuances": "What gets lost in translation and why",
  "historicalContext": "The historical and cultural context",
  "application": "How to apply this to life today, specifically around justice and discipleship"
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.1-pro-preview',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      }
    });

    if (!response.text) throw new Error('Failed to generate content');
    const bibleStudy = JSON.parse(response.text);
    res.json(bibleStudy);
  } catch (error: any) {
    console.error('Error generating bible study:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/generate-study-session', async (req, res) => {
  try {
    if (!ai) throw new Error('Gemini API key is not configured.');
    const { skillsData } = req.body;

    const prompt = `You are an elite academic coach for a homeschool family aiming for early graduation and top-tier mastery.
The family consists of Addy (16), Della (14), Cash (13), and Ellie (11).
Here is the student's current mastery data across core subjects:
${JSON.stringify(skillsData, null, 2)}

Analyze this data to identify learning gaps (the lowest scores) and areas of strength.
Then, design a highly personalized, targeted study session to close the specific gaps identified, while leveraging their strengths to keep them motivated. Incorporate elements of self-reliance, survival, or real-world justice where possible.

Requirements:
1. Identify which student this session might be best for based on typical age levels or keep it adaptable for all.
2. Briefly state their top strength and biggest gap.
3. Outline a 45-minute focused study session targeting the gap.
4. Suggest a specific technique (e.g. Feynman technique, Pomodoro with active recall, or a specific type of practice problem).

Format as a structured JSON object:
{
  "analysis": "Brief 1-2 sentence analysis of strengths and gaps",
  "focusSubject": "The subject needing the most work",
  "sessionTitle": "Catchy title for the study session",
  "targetStudent": "Addy, Della, Cash, Ellie, or All",
  "studyPlan": [
    {
      "duration": "e.g., 10 mins",
      "activity": "What they will actually do",
      "technique": "The cognitive technique used"
    }
  ],
  "encouragement": "A motivating statement acknowledging their goal of early graduation"
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.1-pro-preview',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      }
    });

    if (!response.text) throw new Error('Failed to generate content');
    const studySession = JSON.parse(response.text);
    res.json(studySession);
  } catch (error: any) {
    console.error('Error generating study session:', error);
    res.status(500).json({ error: error.message });
  }
});

const PORT = parseInt(process.env.PORT || '3000', 10);
ViteExpress.listen(app, PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});

