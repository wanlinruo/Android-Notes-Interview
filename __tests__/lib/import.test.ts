import TurndownService from "turndown";

describe("Content import utilities", () => {
  test("HTML to Markdown conversion preserves code blocks", () => {
    const turndown = new TurndownService({
      headingStyle: "atx",
      codeBlockStyle: "fenced",
    });

    const html = `
      <h2>Example</h2>
      <pre><code class="language-kotlin">fun main() {
    println("Hello")
}</code></pre>
    `;

    const markdown = turndown.turndown(html);
    expect(markdown).toContain("## Example");
    expect(markdown).toContain("fun main()");
  });

  test("keyword matching finds relevant tags", () => {
    function matchTags(
      content: string,
      tagNames: string[]
    ): string[] {
      const lowerContent = content.toLowerCase();
      return tagNames.filter((tag) =>
        lowerContent.includes(tag.toLowerCase())
      );
    }

    const content = "Activity 的生命周期包括 onCreate 和 onResume";
    const tags = ["Activity", "Service", "Fragment", "Kotlin"];
    const matched = matchTags(content, tags);

    expect(matched).toContain("Activity");
    expect(matched).not.toContain("Service");
  });
});
