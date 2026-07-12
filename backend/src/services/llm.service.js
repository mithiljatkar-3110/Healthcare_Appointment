const { GoogleGenAI, Type } = require('@google/genai');
const axios = require('axios');

const PRE_VISIT_SUMMARY_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    urgency: { type: Type.STRING, enum: ['Low', 'Medium', 'High'] },
    chiefComplaint: { type: Type.STRING },
    suggestedQuestions: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      minItems: 3,
      maxItems: 3,
    },
  },
  required: ['urgency', 'chiefComplaint', 'suggestedQuestions'],
};

const POST_VISIT_SUMMARY_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    diagnosis: { type: Type.STRING },
    medicationSchedule: { type: Type.ARRAY, items: { type: Type.STRING } },
    lifestyleAdvice: { type: Type.ARRAY, items: { type: Type.STRING } },
    followUpSteps: { type: Type.ARRAY, items: { type: Type.STRING } },
  },
  required: ['diagnosis', 'medicationSchedule', 'lifestyleAdvice', 'followUpSteps'],
};

const validatePreVisitSummary = (summary) => {
  if (!summary || typeof summary !== 'object' || Array.isArray(summary)) {
    throw new Error('Gemini returned an invalid summary object.');
  }

  const { urgency, chiefComplaint, suggestedQuestions } = summary;
  if (
    !['Low', 'Medium', 'High'].includes(urgency) ||
    typeof chiefComplaint !== 'string' ||
    !Array.isArray(suggestedQuestions) ||
    suggestedQuestions.length !== 3 ||
    !suggestedQuestions.every((question) => typeof question === 'string' && question.trim())
  ) {
    throw new Error('Gemini returned an invalid pre-visit summary shape.');
  }

  return { urgency, chiefComplaint: chiefComplaint.trim(), suggestedQuestions: suggestedQuestions.map((question) => question.trim()) };
};

const validatePostVisitSummary = (summary) => {
  if (!summary || typeof summary !== 'object' || Array.isArray(summary)) {
    throw new Error('Groq returned an invalid post-visit summary object.');
  }

  const { diagnosis, medicationSchedule, lifestyleAdvice, followUpSteps } = summary;
  const validStringList = (value) => Array.isArray(value) && value.length > 0 && value.every((item) => typeof item === 'string' && item.trim());

  if (typeof diagnosis !== 'string' || !diagnosis.trim() || !validStringList(medicationSchedule) || !validStringList(lifestyleAdvice) || !validStringList(followUpSteps)) {
    throw new Error('Groq returned an invalid post-visit summary shape.');
  }

  return {
    diagnosis: diagnosis.trim(),
    medicationSchedule: medicationSchedule.map((item) => item.trim()),
    lifestyleAdvice: lifestyleAdvice.map((item) => item.trim()),
    followUpSteps: followUpSteps.map((item) => item.trim()),
  };
};

const parseSummary = (text, provider, validator) => {
  if (!text) {
    throw new Error(`${provider} returned no summary content.`);
  }

  try {
    return validator(JSON.parse(text));
  } catch (error) {
    if (error instanceof SyntaxError) {
      throw new Error(`${provider} returned invalid JSON.`);
    }
    throw error;
  }
};

const createPrompt = (symptoms) => `Analyse these symptoms and return ONLY valid JSON.

Return this exact structure:
{
  "urgency":"Low|Medium|High",
  "chiefComplaint":"",
  "suggestedQuestions":["...","...","..."]
}

Symptoms: ${symptoms || 'No symptoms provided.'}`;

const generateGeminiSummary = async (prompt) => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error('GEMINI_API_KEY is not configured.');

  const model = process.env.GEMINI_MODEL || 'gemini-flash-latest';
  const ai = new GoogleGenAI({ apiKey });
  const response = await ai.models.generateContent({
    model,
    contents: prompt,
    config: {
      responseMimeType: 'application/json',
      responseSchema: PRE_VISIT_SUMMARY_SCHEMA,
      temperature: 0.2,
    },
  });
  return parseSummary(response.text?.trim(), 'Gemini', validatePreVisitSummary);
};

const generateGroqSummary = async (prompt, validator) => {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) throw new Error('GROQ_API_KEY is not configured.');

  const response = await axios.post(
    'https://api.groq.com/openai/v1/chat/completions',
    {
      model: process.env.GROQ_MODEL || 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: 'Return only valid JSON with no markdown or commentary.' },
        { role: 'user', content: prompt },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.2,
    },
    {
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      timeout: 20_000,
    },
  );

  return parseSummary(response.data?.choices?.[0]?.message?.content?.trim(), 'Groq', validator);
};

const generatePreVisitSummary = async (symptoms) => {
  const prompt = createPrompt(symptoms);
  let geminiError;

  if (process.env.GEMINI_API_KEY) {
    try {
      return await generateGeminiSummary(prompt);
    } catch (error) {
      geminiError = error;
      console.warn(`Gemini pre-visit summary failed; trying Groq fallback: ${error.message}`);
    }
  }

  if (process.env.GROQ_API_KEY) {
    return generateGroqSummary(prompt, validatePreVisitSummary);
  }

  throw geminiError || new Error('No LLM API key is configured.');
};

const generatePostVisitSummary = async (clinicalNotes, prescription) => {
  const prompt = `Convert these clinical notes into a patient-friendly summary. Return ONLY valid JSON.

Include diagnosis, medication schedule, lifestyle advice, and follow-up steps using this exact structure:
{
  "diagnosis":"",
  "medicationSchedule":["..."],
  "lifestyleAdvice":["..."],
  "followUpSteps":["..."]
}

Clinical notes:
${clinicalNotes}

Prescription:
${JSON.stringify(prescription)}`;

  return generateGroqSummary(prompt, validatePostVisitSummary);
};

module.exports = { generatePreVisitSummary, generatePostVisitSummary };
