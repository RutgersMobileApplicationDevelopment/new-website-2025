'use client';

import { NavBar } from '@/components/NavBar';
import {
  IncubatorHero,
  TeamSection,
  ScheduleSection,
  TimelineSection,
  FAQSection,
  IncubatorCTA,
} from '@/components/incubator';
import {
  PROGRAM_OVERVIEW,
  TEAM_ROLES,
  MEETINGS,
  TIMELINE,
  FAQS,
} from '@/data/incubatorCurriculum';

export default function IncubatorPage() {
  return (
    <>
      <NavBar />

      {/* Scrollable wrapper — overrides the global overflow:hidden on body */}
      <div className="h-screen overflow-y-auto bg-[#050505] text-white scroll-smooth [scrollbar-width:none] [-webkit-overflow-scrolling:touch] [&::-webkit-scrollbar]:hidden">
        <IncubatorHero
          title={PROGRAM_OVERVIEW.title}
          tagline={PROGRAM_OVERVIEW.tagline}
          description={PROGRAM_OVERVIEW.description}
          highlights={PROGRAM_OVERVIEW.highlights}
        />

        <TeamSection roles={TEAM_ROLES} />

        <ScheduleSection
          teamMeetings={MEETINGS.teamMeetings}
          workshops={MEETINGS.workshops}
        />

        <TimelineSection events={TIMELINE} />

        <FAQSection faqs={FAQS} />

        <IncubatorCTA />
      </div>
    </>
  );
}
