import { GoogleGenerativeAI } from '@google/generative-ai';
import pRetry from 'p-retry';
import { env } from '../config/env';
import { logger } from '../utils/logger';

const genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY);

const systemPrompt = `You are an AI data mapper for GrowEasy's CRM.
Your task is to take an array of raw CSV row objects (in JSON format) and map them to our strict CRM schema.

TARGET SCHEMA:
- created_at: Must be parseable via \`new Date(created_at)\`. Normalize to ISO 8601 (YYYY-MM-DD HH:mm:ss). If none, leave blank.
- name: string
- email: string (If multiple, use first as email, append rest to crm_note)
- country_code: string (If available, else blank)
- mobile_without_country_code: string (If multiple, use first as mobile_without_country_code, append rest to crm_note)
- company: string
- city: string
- state: string
- country: string
- lead_owner: string
- crm_status: ONLY one of ["GOOD_LEAD_FOLLOW_UP", "DID_NOT_CONNECT", "BAD_LEAD", "SALE_DONE"]. If ambiguous or missing, leave blank ("").
- crm_note: Catch-all for remarks, follow-ups, extra contact info, or unmapped useful info.
- data_source: ONLY one of ["leads_on_demand", "meridian_tower", "eden_park", "varah_swamy", "sarjapur_plots"]. If ambiguous or missing, leave blank ("").
- possession_time: string
- description: string

RULES:
1. If you are not highly confident a value matches one of the allowed enum values for crm_status or data_source exactly, return an empty string ("") for that field — never invent a new value.
2. If a record has NEITHER a valid email NOR a valid mobile number, you MUST STILL MAP IT. Our backend will handle the skip logic.
3. Reason internally about ambiguous column headers:
   - "Ph No", "Contact", "Cell", "WhatsApp Number" -> mobile_without_country_code
   - "Lead Src", "Channel", "Campaign" -> data_source
   - "Project" -> might map to data_source if it matches an enum, else put in crm_note.
4. Output MUST be ONLY a valid JSON array of objects. NO explanation, no markdown code fences, no preamble.

EXAMPLE INPUT:
[
  { "Full Name": "John Doe", "Email Address": "john@test.com", "Phone": "555-1234, 555-9876", "Created Time": "10/12/2023 2:30 PM", "Campaign Name": "eden_park" }
]

EXAMPLE OUTPUT:
[
  {
    "created_at": "2023-10-12 14:30:00",
    "name": "John Doe",
    "email": "john@test.com",
    "country_code": "",
    "mobile_without_country_code": "555-1234",
    "company": "",
    "city": "",
    "state": "",
    "country": "",
    "lead_owner": "",
    "crm_status": "",
    "crm_note": "Additional Phone: 555-9876",
    "data_source": "eden_park",
    "possession_time": "",
    "description": ""
  }
]
`;

export const processBatchWithAI = async (batch: Record<string, any>[]): Promise<any[]> => {
  return pRetry(
    async (attempt: number) => {
      logger.info(`Calling AI for batch of size ${batch.length}, attempt ${attempt}`);
      
      const prompt = `Map the following rows: \n\n${JSON.stringify(batch)}`;
      
      const model = genAI.getGenerativeModel({
        model: 'gemini-flash-latest',
        systemInstruction: systemPrompt,
      });

      const response = await model.generateContent(prompt);
      const text = response.response.text();
      console.log('AI Raw text:', text);
      
      // Strip markdown code fences if AI added them
      const cleanText = text.replace(/^\s*```json/m, '').replace(/```\s*$/m, '').trim();

      try {
        const parsed = JSON.parse(cleanText);
        if (!Array.isArray(parsed)) {
          throw new Error('AI response is not a JSON array');
        }
        return parsed;
      } catch (err) {
        logger.error('Failed to parse AI response', { text: cleanText });
        throw new Error('Invalid JSON from AI');
      }
    },
    {
      retries: 2,
      onFailedAttempt: error => {
        logger.warn(`AI batch attempt ${error.attemptNumber} failed. ${error.retriesLeft} retries left.`);
      },
    }
  );
};
