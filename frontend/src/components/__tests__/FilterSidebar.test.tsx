import { render, screen, fireEvent } from "@testing-library/react";
import { FilterSidebar, type FilterSidebarProps } from "../FilterSidebar";

// FilterSidebar uses @/theme/theme which needs to be mocked
jest.mock("@/theme/theme", () => ({
  tokens: {
    white: "#fff",
    gray200: "#e5e7eb",
    accent: "#ff9800",
    accentDark: "#e65100",
    primary: "#1a1a2e",
    gray50: "#f9fafb",
    gray900: "#111827",
  },
}));

const defaultProps: FilterSidebarProps = {
  sortBy: "popularity",
  onSortChange: jest.fn(),
  tempPriceRange: [0, 100000] as [number, number],
  priceRange: [0, 100000] as [number, number],
  onTempPriceChange: jest.fn(),
  onPriceCommit: jest.fn(),
  selectedRatings: [],
  onRatingsChange: jest.fn(),
  selectedCategories: [],
  onCategoriesChange: jest.fn(),
  categories: ["Electronics", "Clothing", "Books"],
  isFiltersActive: false,
  onClearFilters: jest.fn(),
};

describe("FilterSidebar", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders the Filters heading", () => {
    render(<FilterSidebar {...defaultProps} />);
    expect(screen.getByText("Filters")).toBeInTheDocument();
  });

  it("renders sort dropdown with default value", () => {
    render(<FilterSidebar {...defaultProps} />);
    expect(screen.getByText("Popularity")).toBeInTheDocument();
  });

  it("renders all category checkboxes", () => {
    render(<FilterSidebar {...defaultProps} />);
    expect(screen.getByText("Electronics")).toBeInTheDocument();
    expect(screen.getByText("Clothing")).toBeInTheDocument();
    expect(screen.getByText("Books")).toBeInTheDocument();
  });

  it("renders all rating checkboxes", () => {
    render(<FilterSidebar {...defaultProps} />);
    expect(screen.getByText("5 Stars & above")).toBeInTheDocument();
    expect(screen.getByText("4 Stars & above")).toBeInTheDocument();
    expect(screen.getByText("3 Stars & above")).toBeInTheDocument();
    expect(screen.getByText("2 Stars & above")).toBeInTheDocument();
    expect(screen.getByText("1 Star & above")).toBeInTheDocument();
  });

  it("calls onCategoriesChange when a category checkbox is toggled", () => {
    const onCategoriesChange = jest.fn();
    render(
      <FilterSidebar
        {...defaultProps}
        onCategoriesChange={onCategoriesChange}
      />,
    );
    const electronicsCheckbox = screen
      .getByText("Electronics")
      .closest("label")!
      .querySelector('input[type="checkbox"]')!;
    fireEvent.click(electronicsCheckbox);
    expect(onCategoriesChange).toHaveBeenCalledWith(["Electronics"]);
  });

  it("calls onRatingsChange when a rating checkbox is toggled", () => {
    const onRatingsChange = jest.fn();
    render(
      <FilterSidebar {...defaultProps} onRatingsChange={onRatingsChange} />,
    );
    const fiveStarCheckbox = screen
      .getByText("5 Stars & above")
      .closest("label")!
      .querySelector('input[type="checkbox"]')!;
    fireEvent.click(fiveStarCheckbox);
    expect(onRatingsChange).toHaveBeenCalledWith([5]);
  });

  it("allows multi-select for categories", () => {
    const onCategoriesChange = jest.fn();
    render(
      <FilterSidebar
        {...defaultProps}
        selectedCategories={["Electronics"]}
        onCategoriesChange={onCategoriesChange}
      />,
    );
    // Electronics should be checked
    const electronicsCheckbox = screen
      .getByText("Electronics")
      .closest("label")!
      .querySelector('input[type="checkbox"]') as HTMLInputElement;
    expect(electronicsCheckbox.checked).toBe(true);

    // Click Clothing to add it
    const clothingCheckbox = screen
      .getByText("Clothing")
      .closest("label")!
      .querySelector('input[type="checkbox"]')!;
    fireEvent.click(clothingCheckbox);
    expect(onCategoriesChange).toHaveBeenCalledWith([
      "Electronics",
      "Clothing",
    ]);
  });

  it("allows multi-select for ratings", () => {
    const onRatingsChange = jest.fn();
    render(
      <FilterSidebar
        {...defaultProps}
        selectedRatings={[5]}
        onRatingsChange={onRatingsChange}
      />,
    );
    const threeStarCheckbox = screen
      .getByText("3 Stars & above")
      .closest("label")!
      .querySelector('input[type="checkbox"]')!;
    fireEvent.click(threeStarCheckbox);
    expect(onRatingsChange).toHaveBeenCalledWith([5, 3]);
  });

  it("unchecks a category when clicked again", () => {
    const onCategoriesChange = jest.fn();
    render(
      <FilterSidebar
        {...defaultProps}
        selectedCategories={["Electronics", "Clothing"]}
        onCategoriesChange={onCategoriesChange}
      />,
    );
    const electronicsCheckbox = screen
      .getByText("Electronics")
      .closest("label")!
      .querySelector('input[type="checkbox"]')!;
    fireEvent.click(electronicsCheckbox);
    expect(onCategoriesChange).toHaveBeenCalledWith(["Clothing"]);
  });

  it("shows Clear All Filters button when filters are active", () => {
    render(<FilterSidebar {...defaultProps} isFiltersActive={true} />);
    expect(
      screen.getByRole("button", { name: "Clear All Filters" }),
    ).toBeInTheDocument();
  });

  it("hides Clear All Filters button when no filters are active", () => {
    render(<FilterSidebar {...defaultProps} isFiltersActive={false} />);
    expect(
      screen.queryByRole("button", { name: "Clear All Filters" }),
    ).not.toBeInTheDocument();
  });

  it("calls onClearFilters when Clear button is clicked", () => {
    const onClearFilters = jest.fn();
    render(
      <FilterSidebar
        {...defaultProps}
        isFiltersActive={true}
        onClearFilters={onClearFilters}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Clear All Filters" }));
    expect(onClearFilters).toHaveBeenCalledTimes(1);
  });

  it("renders price range display", () => {
    render(<FilterSidebar {...defaultProps} tempPriceRange={[1000, 5000]} />);
    expect(screen.getByText("₹1,000")).toBeInTheDocument();
    expect(screen.getByText("₹5,000")).toBeInTheDocument();
  });

  it("hides categories section when categories list is empty", () => {
    render(<FilterSidebar {...defaultProps} categories={[]} />);
    expect(screen.queryByText("Category")).not.toBeInTheDocument();
  });

  it("uses translation function when provided", () => {
    const t = jest.fn((key: string) => {
      if (key === "common.filters") return "Filtres";
      if (key === "common.sortBy") return "Trier par";
      return "";
    });
    render(<FilterSidebar {...defaultProps} t={t} />);
    expect(screen.getByText("Filtres")).toBeInTheDocument();
    expect(screen.getByText("Trier par")).toBeInTheDocument();
  });
});
