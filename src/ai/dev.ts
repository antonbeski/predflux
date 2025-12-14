import { config } from 'dotenv';
import path from 'path';

// Load .env.local first, then .env
config({ path: path.resolve(process.cwd(), '.env.local') });
config();

import '@/ai/flows/analyze-stock-data-and-generate-recommendations.ts';
import '@/ai/flows/generate-daily-stock-recommendation-report.ts';
import '@/ai/flows/search-stocks.ts';
