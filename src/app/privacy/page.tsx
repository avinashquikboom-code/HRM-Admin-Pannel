import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy | Hopkid HRM',
  description:
    'Privacy Policy for Hopkid HRM — how we collect, use, share, and protect your data on our Human Resource Management platform.',
  robots: { index: true, follow: true },
  openGraph: {
    title: 'Privacy Policy | Hopkid HRM',
    description:
      'How Hopkid HRM collects, uses, shares, and protects your data.',
    type: 'article',
  },
};

const EFFECTIVE_DATE = 'June 27, 2026';
const LAST_UPDATED = 'June 27, 2026';

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
        Hopkid HRM is a Human Resource Management platform that helps
        organizations manage workforce operations digitally, including
        attendance, payroll, leave management, and employee communication.
      </p>
    ),
  },
  {
    id: 'information-collection',
    heading: 'Information Collection',
    body: (
      <>
        <p>The platform collects several categories of data:</p>
        <ul>
          <li>
            <strong>Personal Details:</strong> Name, employee ID, department,
            contact information, and employment status
          </li>
          <li>
            <strong>Authentication Data:</strong> Encrypted credentials and
            device tokens
          </li>
          <li>
            <strong>Attendance Records:</strong> Check-in/out times, shift
            information, and overtime data
          </li>
          <li>
            <strong>Location Data:</strong> GPS information for attendance
            verification (optional, employer-controlled)
          </li>
          <li>
            <strong>Payroll Information:</strong> Salary details, tax
            information, and deduction records
          </li>
          <li>
            <strong>Leave Records:</strong> Applications, approvals, and
            historical data
          </li>
          <li>
            <strong>Device Information:</strong> OS version, device model, and
            diagnostics
          </li>
          <li>
            <strong>Usage Analytics:</strong> App engagement and performance
            metrics
          </li>
        </ul>
      </>
    ),
  },
  {
    id: 'key-permissions',
    heading: 'Key Permissions',
    body: (
      <p>
        The app may request access to location, camera, storage, notifications,
        and internet connectivity based on organizational requirements.
      </p>
    ),
  },
  {
    id: 'data-usage',
    heading: 'Data Usage',
    body: (
      <p>
        Information is processed to authenticate users, manage HR functions,
        generate reports, detect fraud, and maintain security while complying
        with legal obligations.
      </p>
    ),
  },
  {
    id: 'data-sharing',
    heading: 'Data Sharing',
    body: (
      <>
        <p>Information is shared only with:</p>
        <ul>
          <li>The employing organization</li>
          <li>Authorized HR administrators</li>
          <li>Essential service providers (cloud hosting, analytics, email)</li>
          <li>Legal authorities when required</li>
        </ul>
      </>
    ),
  },
  {
    id: 'security-measures',
    heading: 'Security Measures',
    body: (
      <p>
        The platform implements SSL/TLS encryption, secure APIs, authentication
        tokens, password encryption, firewall protection, and regular security
        updates.
      </p>
    ),
  },
  {
    id: 'user-rights',
    heading: 'User Rights',
    body: (
      <p>
        Employees may request data access, correction, deletion (subject to
        employer approval), and data portability depending on applicable laws.
      </p>
    ),
  },
  {
    id: 'account-deletion',
    heading: 'Account Deletion',
    body: (
      <p>
        Employees cannot always delete their accounts independently because
        accounts are managed by their employer. Contact your HR department or{' '}
        <a href="mailto:support@hopkid.in" className="text-primary underline-offset-2 hover:underline">
          support@hopkid.in
        </a>
        .
      </p>
    ),
  },
  {
    id: 'policy-updates',
    heading: 'Policy Updates',
    body: (
      <p>
        Users accept any revised policies by continuing to use the platform.
      </p>
    ),
  },
];

export default function PrivacyPolicyPage() {
  return (
    <main className="min-h-screen bg-background text-text-primary transition-colors duration-300">
      <div className="mx-auto w-full max-w-3xl px-6 py-12 sm:py-16">
        <header className="mb-10 border-b border-border pb-8">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Privacy Policy for Hopkid HRM
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
              href="mailto:support@hopkid.in"
              className="text-primary underline-offset-2 hover:underline"
            >
              support@hopkid.in
            </a>
            <span className="mx-2 text-border">|</span>
            <span className="font-semibold text-text-primary">Website:</span>{' '}
            <a
              href="https://hopkid.in"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary underline-offset-2 hover:underline"
            >
              hopkid.in
            </a>
          </p>
        </footer>
      </div>
    </main>
  );
}
