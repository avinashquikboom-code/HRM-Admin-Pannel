import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Delete Your Account | VoxiqAI HRM',
  description:
    'How to request deletion of your VoxiqAI HRM account and associated data, what data is removed, and what may be retained for legal or employer obligations.',
  robots: { index: true, follow: true },
  openGraph: {
    title: 'Delete Your Account | VoxiqAI HRM',
    description:
      'Request deletion of your VoxiqAI HRM account and associated personal data.',
    type: 'article',
  },
};

const EFFECTIVE_DATE = 'June 29, 2026';
const LAST_UPDATED = 'June 29, 2026';

const SUPPORT_EMAIL = 'support@voxiqai.com';

type Section = {
  id: string;
  heading: string;
  body: React.ReactNode;
};

const SECTIONS: Section[] = [
  {
    id: 'overview',
    heading: 'Overview',
    body: (
      <p>
        This page explains how to request deletion of your VoxiqAI HRM account
        and the personal data associated with it. VoxiqAI HRM is a Human
        Resource Management platform, and accounts are created and managed by
        the employing organization on behalf of its employees. Because of this,
        deletion requests are handled in coordination with your employer.
      </p>
    ),
  },
  {
    id: 'how-to-request',
    heading: 'How to Request Account Deletion',
    body: (
      <>
        <p>
          To request deletion of your account and associated data, send an
          email to{' '}
          <a
            href={`mailto:${SUPPORT_EMAIL}?subject=Account%20Deletion%20Request`}
            className="text-primary underline-offset-2 hover:underline"
          >
            {SUPPORT_EMAIL}
          </a>{' '}
          from your registered email address, including the following details:
        </p>
        <ul>
          <li>
            <strong>Subject line:</strong> &ldquo;Account Deletion
            Request&rdquo;
          </li>
          <li>
            <strong>Full name</strong> as registered on the platform
          </li>
          <li>
            <strong>Employee ID</strong> (if available)
          </li>
          <li>
            <strong>Organization / employer name</strong>
          </li>
          <li>
            <strong>Registered email address or phone number</strong>
          </li>
        </ul>
        <p>
          Alternatively, you may contact your HR department or organization
          administrator, who can initiate the deletion request on your behalf.
        </p>
      </>
    ),
  },
  {
    id: 'verification-timeline',
    heading: 'Verification & Timeline',
    body: (
      <p>
        We verify each request to confirm it comes from the account owner or an
        authorized administrator. Once verified, deletion is processed within{' '}
        <strong>30 days</strong>. You will receive a confirmation email when the
        request has been completed. Where your employer manages the account,
        confirmation from the organization may be required before deletion can
        proceed.
      </p>
    ),
  },
  {
    id: 'data-deleted',
    heading: 'Data That Is Deleted',
    body: (
      <>
        <p>
          Upon a verified deletion request, the following personal data is
          permanently removed from active systems:
        </p>
        <ul>
          <li>Personal details (name, contact information, employee profile)</li>
          <li>Authentication credentials and device tokens</li>
          <li>App usage and analytics data linked to your account</li>
          <li>Location data collected for attendance verification</li>
          <li>Device information and diagnostics linked to your account</li>
        </ul>
      </>
    ),
  },
  {
    id: 'data-retained',
    heading: 'Data That May Be Retained',
    body: (
      <>
        <p>
          Certain records may be retained after account deletion where required
          by law or for legitimate employer obligations:
        </p>
        <ul>
          <li>
            <strong>Payroll and tax records</strong> retained for the period
            required by applicable financial and labor laws
          </li>
          <li>
            <strong>Attendance and leave records</strong> retained as part of
            the employer&rsquo;s statutory employment records
          </li>
          <li>
            <strong>Records required to resolve disputes</strong>, prevent
            fraud, or comply with legal and regulatory requirements
          </li>
        </ul>
        <p>
          Retained records are kept only for as long as legally necessary and
          are protected with the same security measures described in our Privacy
          Policy.
        </p>
      </>
    ),
  },
  {
    id: 'employer-managed-accounts',
    heading: 'Employer-Managed Accounts',
    body: (
      <p>
        Because VoxiqAI HRM accounts are provisioned and controlled by your
        employer, you may not be able to delete your account independently from
        within the app. Your employer remains the data controller for
        employment records. If your employer requires the data for ongoing
        employment or legal compliance, deletion of certain records may be
        deferred until those obligations end.
      </p>
    ),
  },
  {
    id: 'contact',
    heading: 'Contact for Deletion Requests',
    body: (
      <p>
        For any questions about account deletion or to submit a request, contact
        us at{' '}
        <a
          href={`mailto:${SUPPORT_EMAIL}?subject=Account%20Deletion%20Request`}
          className="text-primary underline-offset-2 hover:underline"
        >
          {SUPPORT_EMAIL}
        </a>
        . We aim to respond to all deletion-related inquiries within 5 business
        days.
      </p>
    ),
  },
];

export default function DeleteAccountPage() {
  return (
    <main className="min-h-screen bg-background text-text-primary transition-colors duration-300">
      <div className="mx-auto w-full max-w-3xl px-6 py-12 sm:py-16">
        <header className="mb-10 border-b border-border pb-8">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Delete Your Account
          </h1>
          <p className="mt-3 text-sm text-text-secondary">
            <span className="font-semibold text-text-primary">
              Effective Date:
            </span>{' '}
            {EFFECTIVE_DATE}
            <span className="mx-2 text-border">|</span>
            <span className="font-semibold text-text-primary">
              Last Updated:
            </span>{' '}
            {LAST_UPDATED}
          </p>
        </header>

        <article className="space-y-10">
          {SECTIONS.map((section) => (
            <section key={section.id} id={section.id} className="scroll-mt-24">
              <h2 className="mb-3 text-xl font-semibold tracking-tight">
                {section.heading}
              </h2>
              <div className="space-y-3 text-sm leading-relaxed text-text-secondary [&_a]:text-primary [&_li]:ml-1 [&_strong]:text-text-primary [&_ul]:list-disc [&_ul]:space-y-1.5 [&_ul]:pl-5">
                {section.body}
              </div>
            </section>
          ))}
        </article>

        <footer className="mt-12 border-t border-border pt-8 text-sm text-text-secondary">
          <p>
            <span className="font-semibold text-text-primary">Support:</span>{' '}
            <a
              href={`mailto:${SUPPORT_EMAIL}`}
              className="text-primary underline-offset-2 hover:underline"
            >
              {SUPPORT_EMAIL}
            </a>
            <span className="mx-2 text-border">|</span>
            <span className="font-semibold text-text-primary">Website:</span>{' '}
            <a
              href="https://voxiqai.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary underline-offset-2 hover:underline"
            >
              voxiqai.com
            </a>
          </p>
        </footer>
      </div>
    </main>
  );
}
