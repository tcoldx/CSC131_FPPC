
import emailjs from '@emailjs/browser';

const SERVICE_ID = process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID!;
const TEMPLATE_ID = process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID!;
const PUBLIC_KEY = process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY!;

/*
EMAIL NOTIFICATION SYSTEM --

FOR AUTOMATIC INTEGRATION:
In matching-engine/routes/matching.ts, after collection.insertOne(result):

import { sendConflictAlert } from '../../app/email/emailNotification';

await sendConflictAlert(
  investigatorEmail,
  result.officialId,
  `Official: ${result.officialName} | Matter: ${result.matterTitle} | Score: ${Math.round(result.score * 100)}%`
);

This should only run for newly inserted FlaggedResults
to avoid duplicate notifications.

FOR CLIENT HANDOVER:
Replace EmailJS with Microsoft Graph API and move
investigator emails from localStorage to MongoDB.
*/

export async function sendConflictAlert(
  investigatorEmail: string,
  conflictId: string,
  details: string
): Promise<void> {
  await emailjs.send(
    SERVICE_ID,
    TEMPLATE_ID,
    {
      to_email: investigatorEmail,
      conflict_id: conflictId,
      message: details,
    },
    PUBLIC_KEY
  );
}
