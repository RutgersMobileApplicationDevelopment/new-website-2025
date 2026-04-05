"use client";

import { StarButton } from "@/components/StarButton";
import BentoCard from "@/components/ui/bento-card";

const members = [
  { name: "Ryan Purakal", role: "Lead Developer", status: "Active" },
  { name: "Alex Chen", role: "UI Designer", status: "Active" },
  { name: "Jordan Kim", role: "Backend Dev", status: "Active" },
  { name: "Sam Torres", role: "DevOps", status: "Inactive" },
];

export default function WebTeamPage() {
  return (
    <main className="fixed inset-0 bg-[#050505] text-white overflow-y-auto">
      <div className="max-w-3xl mx-auto px-6 py-20 space-y-16">

        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="font-display text-5xl tracking-[0.08em]">Web Team</h1>
          <p className="text-white/50 font-body text-lg">Coming soon.</p>
        </div>

        {/* Buttons */}
        <section className="space-y-4">
          <h2 className="font-heading text-xl tracking-widest uppercase text-white/40">Buttons</h2>
          <div className="flex flex-wrap gap-3">
            <button className="ui-btn ui-btn-primary">Primary</button>
            <button className="ui-btn ui-btn-secondary">Secondary</button>
            <button className="ui-btn ui-btn-ghost">Ghost</button>
            <button className="ui-btn ui-btn-destructive">Destructive</button>
            <button className="ui-btn ui-btn-primary" disabled>Disabled</button>
            <StarButton>Star Button</StarButton>
          </div>
        </section>

        {/* Inputs */}
        <section className="space-y-4">
          <h2 className="font-heading text-xl tracking-widest uppercase text-white/40">Inputs</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <input className="ui-input" type="text" placeholder="Full name" />
            <input className="ui-input" type="email" placeholder="Email address" />
          </div>
          <select className="ui-select">
            <option value="">Select a role</option>
            <option value="frontend">Frontend</option>
            <option value="backend">Backend</option>
            <option value="design">Design</option>
            <option value="devops">DevOps</option>
          </select>
          <textarea className="ui-textarea" placeholder="Tell us about yourself..." />
        </section>

        {/* Table */}
        <section className="space-y-4">
          <h2 className="font-heading text-xl tracking-widest uppercase text-white/40">Team Members</h2>
          <div className="ui-table-bordered rounded-lg">
            <table className="ui-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Role</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {members.map((m) => (
                  <tr key={m.name}>
                    <td>{m.name}</td>
                    <td className="text-white/60">{m.role}</td>
                    <td>
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${
                          m.status === "Active"
                            ? "bg-[#cc1111]/15 text-[#ee2222]"
                            : "bg-white/5 text-white/30"
                        }`}
                      >
                        {m.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Bento Card */}
        <section className="space-y-4">
          <h2 className="font-heading text-xl tracking-widest uppercase text-white/40">Dashboard</h2>
          <BentoCard />
        </section>

        {/* CTA */}
        <div className="flex justify-center pt-4">
          <StarButton lightColor="#cc1111" duration={4}>Join the Web Team</StarButton>
        </div>

      </div>
    </main>
  );
}
