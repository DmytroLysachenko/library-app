import React from "react";
import { render } from "@testing-library/react";

import EntryLoadingSkeleton from "@/components/admin/EntryLoadingSkeleton";

describe("EntryLoadingSkeleton", () => {
  it("renders the skeleton layout with the expected number of placeholders", () => {
    const { container } = render(<EntryLoadingSkeleton />);

    const wrapper = container.querySelector(".mx-auto.max-w-2xl");
    expect(wrapper).not.toBeNull();

    const skeletonPlaceholders = container.querySelectorAll(".animate-pulse");
    expect(skeletonPlaceholders).toHaveLength(7);
  });

  it("displays a separator between author and category placeholders", () => {
    const { container } = render(<EntryLoadingSkeleton />);

    const separator = container.querySelector("span.text-muted-foreground");
    expect(separator).not.toBeNull();
    expect(separator?.textContent?.trim()).toHaveLength(1);
  });
});
