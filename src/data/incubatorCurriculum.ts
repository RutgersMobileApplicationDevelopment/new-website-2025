/* ────────────────────────────────────────────────────────────────────────────
 * Incubator curriculum data
 *
 * All information sourced from the Spring 2026 RUMAD Incubator curriculum PDF.
 * This module is the single source of truth for the incubator page;
 * update it when a new semester's curriculum is released.
 * ──────────────────────────────────────────────────────────────────────────── */

export interface TimelineEvent {
  /** ISO-style "MMM DD" date label, or a range like "Mar 22 – Mar 30" */
  date: string;
  /** Week number (null for pre-program events) */
  week: number | null;
  title: string;
  description: string;
  /** Visual tag type */
  tag?: 'checkpoint' | 'workshop' | 'showcase' | 'break' | 'social' | 'deadline';
  location?: string;
}

export interface FAQ {
  question: string;
  answer: string;
}

/* ── Programme overview ────────────────────────────────────────────────────── */

export const PROGRAM_OVERVIEW = {
  title: 'RUMAD Incubator',
  tagline: 'Build a startup-worthy mobile app in 9 weeks.',
  description:
    "The RUMAD Incubator is a 9-week guided program where teams of five collaborate to design, build, and ship a complete mobile application. You'll work alongside experienced mentors, attend hands-on workshops, and present your project at our final showcase.",
  highlights: [
    'Guided team project — a real product you can put on your resume',
    'Weekly mentor-led meetings keep you on track',
    'Bi-weekly workshops on industry-relevant topics',
    '3 checkpoints to validate progress',
    'Final showcase — the best project gets featured on our website',
  ],
};

/* ── Team structure ────────────────────────────────────────────────────────── */

export interface TeamRole {
  role: string;
  count: number;
  color: string;
  description: string;
}

export const TEAM_ROLES: TeamRole[] = [
  {
    role: 'Frontend Dev',
    count: 2,
    color: '#ee6622',
    description:
      'Build the user-facing side of the app: UI screens, navigation, animations, and client-side logic using SwiftUI, Jetpack Compose, or React Native.',
  },
  {
    role: 'Backend Dev',
    count: 2,
    color: '#cc1111',
    description:
      'Design and implement APIs, databases, authentication, and server infrastructure that power the app.',
  },
  {
    role: 'Mentor',
    count: 1,
    color: '#39e6b0',
    description:
      'An experienced RUMAD member who guides the team through architecture decisions, code reviews, and project management.',
  },
];

/* ── Meeting schedule ──────────────────────────────────────────────────────── */

export const MEETINGS = {
  teamMeetings: {
    day: 'Every Monday',
    duration: '~1 hour',
    description:
      'Weekly team meetings with your mentor. Expect coding sessions, task delegation, and debugging help.',
  },
  workshops: {
    day: 'Bi-weekly Wednesdays',
    time: '7:00 – 8:00 PM',
    description:
      'Hands-on workshops covering topics like API design, state management, UX prototyping, and deployment.',
  },
};

/* ── Timeline ──────────────────────────────────────────────────────────────── */

export const TIMELINE: TimelineEvent[] = [
  {
    date: 'Feb 9',
    week: null,
    title: 'Application Deadline',
    description: 'Submit your incubator application by this date.',
    tag: 'deadline',
  },
  {
    date: 'Feb 20',
    week: null,
    title: 'Social + Team Matching',
    description:
      'Social event at the Livingston Coffee House. Get to know potential teammates and mentors — teams are formed based on interests and skills.',
    tag: 'social',
    location: 'Livingston Coffee House',
  },
  {
    date: 'Feb 22',
    week: null,
    title: 'Team Announcement',
    description:
      'Final team assignments are announced. Meet your squad and start planning!',
  },
  {
    date: 'Feb 24',
    week: 1,
    title: 'Kickoff Meeting',
    description:
      'Teams meet for the first time. Set up communication channels, pick a project idea, outline the tech stack, and create a rough roadmap.',
    location: 'BSC 120AB',
  },
  {
    date: 'Mar 3',
    week: 2,
    title: 'Project Foundation',
    description:
      'Begin building your project. Scaffold the codebase, set up version control, and divide initial tasks.',
    location: 'BSC 120AB',
  },
  {
    date: 'Mar 5',
    week: 2,
    title: 'Workshop 1',
    description:
      'First workshop — topics include project architecture, CI/CD essentials, and effective collaboration with Git.',
    tag: 'workshop',
    location: 'BSC 116AB',
  },
  {
    date: 'Mar 10',
    week: 3,
    title: 'Checkpoint 1',
    description:
      'Demo your initial progress. Show project scaffolding, basic navigation, and data models. Receive mentor feedback.',
    tag: 'checkpoint',
    location: 'BSC 120AB',
  },
  {
    date: 'Mar 17',
    week: 4,
    title: 'Core Feature Sprint',
    description: 'Focus on implementing the core feature set your users will interact with most.',
    location: 'BSC 120AB',
  },
  {
    date: 'Mar 19',
    week: 4,
    title: 'Workshop 2',
    description:
      'Second workshop — deep dive into API integration, state management patterns, and responsive design.',
    tag: 'workshop',
    location: 'BSC 116AB',
  },
  {
    date: 'Mar 22 – Mar 30',
    week: null,
    title: 'Spring Break',
    description:
      'Take a breather! No meetings during spring break. Optionally continue working at your own pace.',
    tag: 'break',
  },
  {
    date: 'Mar 31',
    week: 5,
    title: 'Checkpoint 2',
    description:
      'Mid-program check-in after the break. Demo your core features, discuss blockers, and adjust your timeline.',
    tag: 'checkpoint',
    location: 'BSC 120AB',
  },
  {
    date: 'Apr 7',
    week: 6,
    title: 'Feature Completion',
    description:
      'Push to complete all planned features. Focus on integration between frontend and backend.',
    location: 'BSC 120AB',
  },
  {
    date: 'Apr 9',
    week: 6,
    title: 'Workshop 3',
    description:
      'Third workshop — covering UX polish, testing strategies, and preparing for demo day.',
    tag: 'workshop',
    location: 'BSC 116AB',
  },
  {
    date: 'Apr 14',
    week: 7,
    title: 'Checkpoint 3',
    description:
      'Final checkpoint before polish phase. Nearly-complete app demo with mentor and peer feedback.',
    tag: 'checkpoint',
    location: 'BSC 120AB',
  },
  {
    date: 'Apr 21',
    week: 8,
    title: 'Polish & QA',
    description:
      'Bug fixes, performance optimisation, UI polish, and writing documentation. Prepare your showcase materials.',
    location: 'LSC Collaborative Learning Center',
  },
  {
    date: 'Apr 28',
    week: 9,
    title: 'Dress Rehearsal',
    description:
      'Practice your demo presentation. Get final feedback from mentors before the showcase.',
    location: 'LSC Collaborative Learning Center',
  },
  {
    date: 'May 4',
    week: 9,
    title: 'Final Showcase',
    description:
      'Present your finished project to the RUMAD community, alumni, and guests. The best project gets featured on rumad.club!',
    tag: 'showcase',
    location: 'BSC 120AB',
  },
];

/* ── FAQs ──────────────────────────────────────────────────────────────────── */

export const FAQS: FAQ[] = [
  {
    question: 'Do I need prior experience?',
    answer:
      "Some programming experience is expected — you should be comfortable with at least one language (Swift, Kotlin, TypeScript, Python, etc.). The incubator isn't a beginner bootcamp, but mentors are there to help you level up.",
  },
  {
    question: 'What technologies can we use?',
    answer:
      "Any mobile framework is welcome: SwiftUI, UIKit, Jetpack Compose, React Native, Flutter — it's your team's choice. Backend can be anything from Node.js to Django to Firebase.",
  },
  {
    question: 'How are teams formed?',
    answer:
      'Teams are formed after the social/matching event on Feb 20. We consider your skill set, interests, and availability to create balanced groups of 5.',
  },
  {
    question: 'How much time per week should I expect?',
    answer:
      'Plan for about 5-8 hours per week: 1 hour for the team meeting, plus individual coding time. Workshops add about 1 extra hour every other week.',
  },
  {
    question: 'Can I work on an existing project?',
    answer:
      'No, all incubator projects start from scratch. This ensures a level playing field and lets every team member contribute from day one.',
  },
  {
    question: 'What happens at the showcase?',
    answer:
      'Each team gives a live demo of their app and a short presentation. The best project is selected by a panel and featured on rumad.club.',
  },
];
