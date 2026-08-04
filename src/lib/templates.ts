export type DocTemplate = {
  id: string;
  name: string;
  description: string;
  title: string;
  content: string;
  accent: string;
};

export const DOCUMENT_TEMPLATES: DocTemplate[] = [
  {
    id: "resume",
    name: "Resume",
    description: "Clean professional resume",
    title: "Resume — Ali Raza",
    accent: "#1a73e8",
    content: `<h1>Ali Raza</h1><p><em>Full-stack Engineer</em> · ali@alidocs.dev</p><h2>Experience</h2><p><strong>Senior Engineer</strong> — Product Studio</p><ul><li>Shipped collaborative editing tools used by internal teams</li><li>Built full-stack features across Next.js, APIs, and databases</li></ul><h2>Skills</h2><p>TypeScript, React, Node.js, PostgreSQL, product design</p><h2>Education</h2><p>B.S. Computer Science</p>`,
  },
  {
    id: "meeting-notes",
    name: "Meeting notes",
    description: "Agenda and action items",
    title: "Meeting notes",
    accent: "#34a853",
    content: `<h1>Meeting notes</h1><p><strong>Date:</strong> — &nbsp;&nbsp; <strong>Attendees:</strong> —</p><h2>Agenda</h2><ul><li>Topic one</li><li>Topic two</li><li>Topic three</li></ul><h2>Discussion</h2><p></p><h2>Action items</h2><ol><li>Owner — task — due date</li><li>Owner — task — due date</li></ol>`,
  },
  {
    id: "project-proposal",
    name: "Project proposal",
    description: "Goals, scope, timeline",
    title: "Project proposal",
    accent: "#f9ab00",
    content: `<h1>Project proposal</h1><h2>Overview</h2><p>Summarize the opportunity and desired outcome.</p><h2>Goals</h2><ul><li>Goal 1</li><li>Goal 2</li><li>Goal 3</li></ul><h2>Scope</h2><p><strong>In scope</strong></p><ul><li></li></ul><p><strong>Out of scope</strong></p><ul><li></li></ul><h2>Timeline</h2><ol><li>Discovery</li><li>Build</li><li>Launch</li></ol>`,
  },
  {
    id: "letter",
    name: "Letter",
    description: "Formal letter layout",
    title: "Letter",
    accent: "#ea4335",
    content: `<p>Ali Raza<br/>Your City<br/>ali@alidocs.dev</p><p></p><p>Dear Recipient,</p><p></p><p>Write your letter here.</p><p></p><p>Sincerely,</p><p><strong>Ali Raza</strong></p>`,
  },
];

export function getTemplate(id: string) {
  return DOCUMENT_TEMPLATES.find((template) => template.id === id);
}
