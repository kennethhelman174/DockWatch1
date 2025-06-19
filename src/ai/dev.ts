
import { config } from 'dotenv';
config();

import '@/ai/flows/estimate-arrival-time.ts';
import '@/ai/flows/get-weather-forecast-flow.ts';
import '@/ai/flows/app-support-flow.ts';
import '@/ai/flows/get-daily-safety-tip-flow.ts'; // Added new flow
