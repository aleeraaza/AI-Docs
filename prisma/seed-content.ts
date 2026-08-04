import fs from "node:fs/promises";
import path from "node:path";
import {
  AlignmentType,
  Document,
  HeadingLevel,
  Packer,
  Paragraph,
  TextRun,
} from "docx";

export const WELCOME_TITLE = "Welcome to Ali Docs";
export const GUIDE_TITLE = "About Ali Docs - How to use this product";
export const RESUME_TITLE = "Ali Raza - Full Stack Software Engineer";

export const WELCOME_HTML = `<h1>Welcome to Ali Docs</h1>
<p>Hi — I’m <strong>Ali Raza</strong>. Thanks for opening Ali Docs.</p>
<p>This is a lightweight collaborative document editor inspired by Google Docs. It was built as a focused full-stack product slice: create and edit documents, import files, share with teammates, and keep everything persisted.</p>
<h2>What you can do here</h2>
<ul>
<li>Create a blank document or start from a template</li>
<li>Edit with rich text — headings, lists, links, and more</li>
<li>Import <code>.txt</code>, <code>.md</code>, or <code>.docx</code> files</li>
<li>Download your work as Word, PDF, Markdown, or plain text</li>
<li>Share a document with Reader or Writer access</li>
</ul>
<h2>Try the reviewer path</h2>
<ol>
<li>Sign in as <strong>ali@alidocs.dev</strong> (password <code>password123</code>)</li>
<li>Open or create a document and edit it — watch autosave</li>
<li>Use <strong>Share</strong> to grant access to <strong>carol@alidocs.dev</strong></li>
<li>Sign out, sign in as Carol, and find it under <em>Shared with me</em></li>
</ol>
<p>Enjoy exploring — and if something feels unclear, open the “About Ali Docs” guide in Carol’s library.</p>`;

export const GUIDE_HTML = `<h1>About Ali Docs</h1>
<p>Ali Docs is an internal-style productivity tool for shared writing. It demonstrates document creation, editing, file handling, sharing, and persistence in a real product environment.</p>
<h2>Who built this</h2>
<p><strong>Ali Raza</strong> — full-stack engineer. Demo accounts use seeded users so reviewers can test sharing without setting up auth providers.</p>
<h2>Demo accounts</h2>
<ul>
<li><strong>ali@alidocs.dev</strong> / password123 — owns the resume sample</li>
<li><strong>bob@alidocs.dev</strong> / password123 — owns the Welcome document</li>
<li><strong>carol@alidocs.dev</strong> / password123 — owns this How-to guide</li>
</ul>
<h2>How to use the product</h2>
<h3>Home</h3>
<ol>
<li>Use <strong>Blank document</strong> or a template under “Start a new document”</li>
<li>Use <strong>Upload file</strong> to import .txt, .md, or .docx (max 2MB)</li>
<li>Find your work under <strong>Recent documents</strong></li>
<li>Filter with Owned by anyone / Owned by me / Shared with me</li>
</ol>
<h3>Document menu</h3>
<ul>
<li><strong>Open</strong> / <strong>Open in new tab</strong></li>
<li><strong>Rename</strong></li>
<li><strong>Share / Manage access</strong> — grant Reader or Writer</li>
<li><strong>Remove</strong> — permanently deletes (owners only)</li>
</ul>
<h3>Inside a document</h3>
<ul>
<li>Edit the title and body — changes autosave</li>
<li>Use the formatting toolbar for structure and emphasis</li>
<li><strong>Download</strong> exports to .docx, .pdf, .md, or .txt</li>
<li><strong>Share</strong> opens manage access (owners)</li>
</ul>
<h2>What was intentionally out of scope</h2>
<ul>
<li>Realtime multiplayer cursors</li>
<li>Comments / suggestions</li>
<li>Version history</li>
<li>Public link sharing</li>
</ul>
<p>Those cuts keep depth in editing, import/export, and sharing — the areas that matter most for this exercise.</p>`;

function paragraphsFromHtml(html: string): Paragraph[] {
  const blocks = html
    .replace(/\r\n/g, "\n")
    .split(/<\/(?:h1|h2|h3|p|li|ul|ol)>/i)
    .map((chunk) => chunk.trim())
    .filter(Boolean);

  const result: Paragraph[] = [];

  for (const block of blocks) {
    const h1 = /<h1[^>]*>([\s\S]*)/i.exec(block);
    if (h1) {
      result.push(
        new Paragraph({
          text: stripTags(h1[1]),
          heading: HeadingLevel.HEADING_1,
          spacing: { after: 200 },
        }),
      );
      continue;
    }
    const h2 = /<h2[^>]*>([\s\S]*)/i.exec(block);
    if (h2) {
      result.push(
        new Paragraph({
          text: stripTags(h2[1]),
          heading: HeadingLevel.HEADING_2,
          spacing: { after: 160 },
        }),
      );
      continue;
    }
    const h3 = /<h3[^>]*>([\s\S]*)/i.exec(block);
    if (h3) {
      result.push(
        new Paragraph({
          text: stripTags(h3[1]),
          heading: HeadingLevel.HEADING_3,
          spacing: { after: 120 },
        }),
      );
      continue;
    }
    const li = /<li[^>]*>([\s\S]*)/i.exec(block);
    if (li) {
      result.push(
        new Paragraph({
          children: [new TextRun(stripTags(li[1]))],
          bullet: { level: 0 },
          spacing: { after: 80 },
        }),
      );
      continue;
    }
    const p = /<p[^>]*>([\s\S]*)/i.exec(block);
    if (p) {
      result.push(
        new Paragraph({
          children: [new TextRun(stripTags(p[1]))],
          spacing: { after: 120 },
          alignment: AlignmentType.LEFT,
        }),
      );
    }
  }

  return result.length
    ? result
    : [new Paragraph({ children: [new TextRun("")] })];
}

function stripTags(value: string) {
  return value
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .trim();
}

export async function writeSampleDocx(
  filename: string,
  title: string,
  html: string,
) {
  const samplesDir = path.join(process.cwd(), "samples");
  await fs.mkdir(samplesDir, { recursive: true });
  const doc = new Document({
    sections: [
      {
        children: [
          new Paragraph({
            text: title,
            heading: HeadingLevel.TITLE,
            spacing: { after: 240 },
          }),
          ...paragraphsFromHtml(html),
        ],
      },
    ],
  });
  const buffer = await Packer.toBuffer(doc);
  const filePath = path.join(samplesDir, filename);
  await fs.writeFile(filePath, buffer);
  return filePath;
}
