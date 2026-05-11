const { GoogleGenerativeAI } = require('@google/generative-ai');

// Module-scoped client — initialized once, reused across requests
let _genAI = null;
const getGenAI = () => {
  const key = process.env.GEMINI_API_KEY;
  if (!key || key === 'your_gemini_api_key_here') return null;
  if (!_genAI) _genAI = new GoogleGenerativeAI(key);
  return _genAI;
};

const SYSTEM_PROMPT = `You are CardioSentinel Clinical Assistant — an AI support tool embedded inside the CardioSentinel Remote cardiac monitoring platform.

Your role is to help clinical staff (cardiologists, nurses, clinicians) understand:
- AI cardiac risk prediction scores and what they mean clinically
- The 13 UCI Heart Disease clinical features (age, sex, cp, trestbps, chol, fbs, restecg, thalach, exang, oldpeak, slope, ca, thal)
- How to interpret risk levels: Low (<40%), Moderate (40–70%), High (≥70%)
- General cardiac health concepts, clinical guidelines, and terminology
- How to use the CardioSentinel platform effectively

Guidelines:
- Be concise and clinically accurate. Use plain language unless the user is clearly clinical.
- Always recommend consulting a specialist or attending physician for actual patient management decisions.
- Never refuse to explain clinical concepts — this is an educational/support tool.
- If given patient context, reference it naturally in your response.
- Keep replies focused and under 200 words unless a detailed explanation is needed.`;

const buildContextBlock = (patientContext) => {
  if (!patientContext || !patientContext.name) return '';
  const { name, age, sex, riskLevel, riskScore, vitals } = patientContext;
  let block = `\n\nCurrent patient context:\n- Patient: ${name}, ${age}y, ${sex === 1 ? 'Male' : 'Female'}\n- Risk Level: ${riskLevel || 'unknown'}\n- Last Risk Score: ${riskScore != null ? (riskScore * 100).toFixed(1) + '%' : 'N/A'}`;
  if (vitals) {
    block += `\n- Latest vitals: HR ${vitals.heartRate ?? '—'} bpm, BP ${vitals.systolicBP ?? '—'}/${vitals.diastolicBP ?? '—'} mmHg, SpO₂ ${vitals.oxygenSaturation ?? '—'}%`;
  }
  return block;
};

const sendMessage = async (req, res, next) => {
  try {
    const { message, patientContext, history = [] } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({ message: 'Message is required' });
    }

    const genAI = getGenAI();
    if (!genAI) {
      return res.status(503).json({ message: 'Gemini API key not configured. Add GEMINI_API_KEY to backend/.env' });
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    const systemWithContext = SYSTEM_PROMPT + buildContextBlock(patientContext);

    // Build chat history for multi-turn (Gemini format)
    const geminiHistory = history.map(m => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }]
    }));

    const chat = model.startChat({
      history: geminiHistory,
      systemInstruction: { parts: [{ text: systemWithContext }] },
    });

    const result = await chat.sendMessage(message.trim());
    const reply = result.response.text();

    res.json({ reply, timestamp: new Date().toISOString() });
  } catch (err) {
    console.error('Chat error:', err.message);
    if (err.message?.includes('API_KEY_INVALID')) {
      return res.status(401).json({ message: 'Invalid Gemini API key. Check your GEMINI_API_KEY in backend/.env' });
    }
    next(err);
  }
};

module.exports = { sendMessage };
