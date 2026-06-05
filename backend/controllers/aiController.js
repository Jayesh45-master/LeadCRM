import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini API client if API key is present
const getGeminiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'your_key_here' || apiKey.trim() === '') {
    return null;
  }
  return new GoogleGenerativeAI(apiKey);
};

// Helper to clean Markdown JSON formatting from Gemini responses
const cleanJsonResponse = (text) => {
  let cleaned = text.trim();
  // Remove markdown code fences if present
  if (cleaned.startsWith('```json')) {
    cleaned = cleaned.substring(7);
  } else if (cleaned.startsWith('```')) {
    cleaned = cleaned.substring(3);
  }
  if (cleaned.endsWith('```')) {
    cleaned = cleaned.substring(0, cleaned.length - 3);
  }
  return cleaned.trim();
};

// 1. AI Lead Scoring
export const scoreLead = async (req, res) => {
  try {
    const { name, company, source, status, notes } = req.body;
    const client = getGeminiClient();

    if (!client) {
      // Graceful mockup fallback
      let score = 50;
      let reason = 'Moderate conversion potential. Standard lead metadata profile.';

      if (notes && notes.toLowerCase().includes('replied')) {
        score = 87;
        reason = 'Lead replied quickly and requested proposal details.';
      } else if (source === 'Referral') {
        score = 80;
        reason = 'High trust referral lead. Ready to connect.';
      } else if (status === 'Converted') {
        score = 100;
        reason = 'Customer successfully converted.';
      } else if (status === 'Lost') {
        score = 15;
        reason = 'Lead marked as lost. Low conversion probability.';
      } else if (notes && notes.toLowerCase().includes('budget')) {
        score = 75;
        reason = 'Showed strong intent and discussed budget requirements.';
      }

      return res.status(200).json({ score, reason, isDemo: true });
    }

    const model = client.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const prompt = `You are an AI sales assistant. Score the conversion probability of the following lead from 0 to 100 and provide a one-sentence rationale. Return ONLY a JSON object containing the keys "score" (number) and "reason" (string).

Lead Details:
Name: ${name || 'N/A'}
Company: ${company || 'N/A'}
Source: ${source || 'N/A'}
Status: ${status || 'N/A'}
Notes: ${notes || 'N/A'}`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    try {
      const parsed = JSON.parse(cleanJsonResponse(text));
      return res.status(200).json({ ...parsed, isDemo: false });
    } catch (parseError) {
      console.error('Failed to parse Gemini JSON response:', text, parseError);
      return res.status(500).json({ message: 'AI model returned invalid format', error: parseError.message });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// 2. AI Generated Lead Summary
export const summarizeLead = async (req, res) => {
  try {
    const { name, notes } = req.body;
    const client = getGeminiClient();

    if (!client || !notes || notes.trim() === '') {
      const fallbackSummary = notes && notes.trim() !== ''
        ? `${name || 'Lead'} is interested in product options. Needs proposal details and a follow-up call scheduled next week.`
        : 'No notes available to summarize.';
      return res.status(200).json({ summary: fallbackSummary, isDemo: true });
    }

    const model = client.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const prompt = `Summarize the following CRM salesperson notes into a bulleted 2-to-3 line overview. Keep it professional and action-oriented. Do not include introductory text, just return the summary.

Lead Name: ${name || 'N/A'}
Notes: ${notes}`;

    const result = await model.generateContent(prompt);
    return res.status(200).json({ summary: result.response.text().trim(), isDemo: false });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// 3. Smart Note Generator
export const smartNotes = async (req, res) => {
  try {
    const { text } = req.body;
    const client = getGeminiClient();

    if (!client) {
      // Mockup structured meeting notes
      const structuredNotes = `### Meeting Summary
- **Main Discussion**: Discussed client needs, integration, and budget details.
- **Budget status**: Initial budget requirements aligned.
- **Next Steps**: Follow-up call scheduled next week to deliver the official proposal.`;

      return res.status(200).json({ summary: structuredNotes, isDemo: true });
    }

    const model = client.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const prompt = `Convert the following raw sales note transcript or scribbles into a structured meeting summary. Use clean markdown bullet points (e.g., Summary, Discussed Points, Next Steps).

Raw Notes:
${text}`;

    const result = await model.generateContent(prompt);
    return res.status(200).json({ summary: result.response.text().trim(), isDemo: false });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// 4. AI Next Best Action
export const nextBestAction = async (req, res) => {
  try {
    const { name, status, notes } = req.body;
    const client = getGeminiClient();

    if (!client) {
      let action = 'Schedule introductory discovery call.';
      let reason = 'New lead added to the pipeline. First contact is required.';

      if (status === 'Contacted') {
        action = 'Send formal pricing proposal.';
        reason = 'Initial contact made. Lead is expecting pricing details.';
      } else if (status === 'Qualified') {
        action = 'Schedule product demo session.';
        reason = 'Lead is qualified and has explicit requirements.';
      } else if (status === 'Converted') {
        action = 'Initiate customer onboarding process.';
        reason = 'Deal closed successfully. Setup account.';
      } else if (notes && notes.toLowerCase().includes('pricing')) {
        action = 'Send custom discount pricing options tomorrow morning.';
        reason = 'Lead raised budget questions in notes.';
      }

      return res.status(200).json({ action, reason, isDemo: true });
    }

    const model = client.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const prompt = `You are a sales coach. Recommend the next best action and reason for the following lead. Return ONLY a JSON object containing the keys "action" (string) and "reason" (string).

Lead status: ${status || 'N/A'}
Notes: ${notes || 'N/A'}
Name: ${name || 'N/A'}`;

    const result = await model.generateContent(prompt);
    const cleanText = cleanJsonResponse(result.response.text());
    try {
      const parsed = JSON.parse(cleanText);
      return res.status(200).json({ ...parsed, isDemo: false });
    } catch (parseError) {
      console.error('Failed to parse Gemini Next Action response:', cleanText, parseError);
      return res.status(500).json({ message: 'AI model returned invalid format', error: parseError.message });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// 5. CRM Chat Assistant
export const chatAssistant = async (req, res) => {
  try {
    const { messages, leadsContext } = req.body;
    const client = getGeminiClient();

    const userMessage = messages[messages.length - 1].text;

    if (!client) {
      // Mock respond depending on query keywords
      let response = "I'm your CRM assistant. How can I help you analyze your customer pipeline?";
      const msgLower = userMessage.toLowerCase();

      if (msgLower.includes('highest') || msgLower.includes('score') || msgLower.includes('best')) {
        response = 'Based on the mock database, **Rahul Sharma** has the highest score of **87%** because he replied quickly and requested details.';
      } else if (msgLower.includes('leads') || msgLower.includes('how many')) {
        response = `You currently have **${leadsContext?.length || 7} leads** in your database, spread across New, Contacted, Qualified, and Converted stages.`;
      } else if (msgLower.includes('convert') || msgLower.includes('sales')) {
        response = 'To convert more leads, prioritize calling Qualified leads like **Sneha Patel** and send proposal follow-ups.';
      }

      return res.status(200).json({ response, isDemo: true });
    }

    const model = client.getGenerativeModel({ model: 'gemini-1.5-flash' });
    
    // Construct system instructions with lead database context
    const contextPrompt = `You are a helpful AI CRM assistant for LeadCRM. Answer user queries by analyzing the lead database context provided below. Keep your responses conversational, short, and use markdown formatting.

Lead Database Context:
${JSON.stringify(leadsContext, null, 2)}

Chat History:
${messages.map(m => `${m.sender === 'user' ? 'User' : 'Assistant'}: ${m.text}`).join('\n')}

Assistant:`;

    const result = await model.generateContent(contextPrompt);
    return res.status(200).json({ response: result.response.text().trim(), isDemo: false });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
