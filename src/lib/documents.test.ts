import { describe, expect, it } from "vitest";
import { markdownToHtml, plainTextToHtml } from "@/lib/html-content";

describe("plainTextToHtml", () => {
  it("escapes HTML and preserves paragraphs", () => {
    const html = plainTextToHtml("Hello <world>\n\nSecond line");
    expect(html).toContain("Hello &lt;world&gt;");
    expect(html).toContain("<p>");
    expect(html.split("<p>").length - 1).toBe(2);
  });
});

describe("markdownToHtml", () => {
  it("converts headings, emphasis, and lists", () => {
    const markdown = `# Title

A **bold** and *italic* line.

- one
- two

1. first
2. second
`;
    const html = markdownToHtml(markdown);
    expect(html).toContain("<h1>Title</h1>");
    expect(html).toContain("<strong>bold</strong>");
    expect(html).toContain("<em>italic</em>");
    expect(html).toContain("<ul>");
    expect(html).toContain("<ol>");
    expect(html).toContain("<li>one</li>");
    expect(html).toContain("<li>first</li>");
  });

  it("returns an empty paragraph for blank input", () => {
    expect(markdownToHtml("")).toBe("<p></p>");
  });
});
