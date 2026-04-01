describe("Article slug generation", () => {
  function generateSlug(title: string): string {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\u4e00-\u9fff]+/g, "-")
      .replace(/^-|-$/g, "");
  }

  test("generates slug from English title", () => {
    expect(generateSlug("Activity Lifecycle Guide")).toBe(
      "activity-lifecycle-guide"
    );
  });

  test("generates slug from Chinese title", () => {
    const slug = generateSlug("Activity 生命周期详解");
    expect(slug).toBe("activity-生命周期详解");
  });

  test("handles special characters", () => {
    expect(generateSlug("What is Handler?")).toBe("what-is-handler");
  });
});
