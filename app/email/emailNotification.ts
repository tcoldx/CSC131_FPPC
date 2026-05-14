
import emailjs from '@emailjs/browser';

const SERVICE_ID = 'service_iduu137';
const TEMPLATE_ID = 'template_6qkauwi';
const PUBLIC_KEY = 'AaDSrRdOGdc6I2NRX';

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
