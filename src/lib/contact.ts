// Client-side form-to-email (Web3Forms). GitHub Pages has no server, so enrollment
// requests are emailed through Web3Forms straight to the course contact inbox.
// The access key is public by design: it only lets the form email that one inbox.
// Create a key at https://web3forms.com with OxTORHAT@proton.me as the recipient,
// then paste it between the quotes below (or set NEXT_PUBLIC_WEB3FORMS_KEY).
export const WEB3FORMS_ACCESS_KEY = process.env.NEXT_PUBLIC_WEB3FORMS_KEY || '';

export const contactConfigured = WEB3FORMS_ACCESS_KEY.length > 0;

const ENDPOINT = 'https://api.web3forms.com/submit';

export interface EnrollmentEmail {
  name: string;
  email: string;
  courseTitle: string;
  courseSlug: string;
}

/** Sends the enrollment request to the course contact inbox. Throws on failure. */
export async function sendEnrollmentEmail({ name, email, courseTitle, courseSlug }: EnrollmentEmail): Promise<void> {
  if (!contactConfigured) throw new Error('Email is not configured.');
  const payload = {
    access_key: WEB3FORMS_ACCESS_KEY,
    subject: `Enrollment request: ${courseTitle}`,
    from_name: name || email,
    // Web3Forms sets Reply-To from `email`, so a reply goes straight to the learner.
    email,
    name: name || '(no name)',
    course: courseTitle,
    course_url: `https://hmcyberacademy.com/courses/${courseSlug}/`,
    message: `New enrollment request.\n\nCourse: ${courseTitle}\nLearner: ${name || '(no name)'} <${email}>\n\nApprove in the admin once payment is confirmed.`,
    // Honeypot: real users leave this empty; bots fill it and are rejected.
    botcheck: '',
  };
  const res = await fetch(ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify(payload),
  });
  const data = await res.json().catch(() => null);
  if (!res.ok || !data?.success) throw new Error(data?.message || 'Could not send the email.');
}
