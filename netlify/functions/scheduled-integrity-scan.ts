import { schedule } from '@netlify/functions';
import axios from 'axios';

// Scheduled cron job: Runs daily at 06:00 UTC (matches vercel.json cron schedule: "0 6 * * *")
export const handler = schedule('0 6 * * *', async () => {
  const siteUrl = process.env.URL || process.env.DEPLOY_URL || 'http://localhost:8888';
  const cronSecret = process.env.CRON_SECRET;

  console.log(`[Scheduled Integrity Scan] Triggering daily integrity scan on ${siteUrl}...`);

  try {
    const headers: Record<string, string> = {};
    if (cronSecret) {
      headers['Authorization'] = `Bearer ${cronSecret}`;
    }

    const response = await axios.get(
      `${siteUrl}/api/health/integrity-scan?sinceHours=24&instanceId=instance_001`,
      {
        headers,
        timeout: 25000
      }
    );

    console.log('[Scheduled Integrity Scan] Result status:', response.status);
    return {
      statusCode: 200,
      body: JSON.stringify({ success: true, result: response.data })
    };
  } catch (error: any) {
    console.error('[Scheduled Integrity Scan] Error:', error?.message || error);
    return {
      statusCode: 500,
      body: JSON.stringify({ success: false, error: error?.message || 'Integrity scan failed' })
    };
  }
});
