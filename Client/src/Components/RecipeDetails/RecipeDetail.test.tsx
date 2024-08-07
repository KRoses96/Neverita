import { beforeEach, describe, expect, it, vi } from "vitest";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { render, screen, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { mockRecipe, mockDiet } from "../../mocks/mock";
import { RecipeDetails } from "./RecipeDetails";

describe("Recipe Details Component", () => {
	beforeEach(() => {
		vi.resetAllMocks();
	});

	it("shows loading state when not loaded", () => {
		render(
			<MemoryRouter initialEntries={["/recipe/1"]}>
				<Routes>
					<Route path="/recipe/:id" element={<RecipeDetails userId={1} />} />
				</Routes>
			</MemoryRouter>,
		);
		expect(screen.getByRole("status")).toBeInTheDocument();
	});

	it("displays recipe details when loaded", async () => {
		vi.spyOn(window, "fetch").mockImplementation((url) =>
			Promise.resolve({
				ok: true,
				json: async () =>
					url.toString().includes("recipes") ? mockRecipe : mockDiet,
			} as Response),
		);

		render(
			<MemoryRouter initialEntries={["/recipe/1"]}>
				<Routes>
					<Route path="/recipe/:id" element={<RecipeDetails userId={1} />} />
				</Routes>
			</MemoryRouter>,
		);

		console.log(mockRecipe);
		await waitFor(() => {
			expect(screen.getByText(mockRecipe.name)).toBeInTheDocument();
			expect(screen.getByText(mockRecipe.description)).toBeInTheDocument();
			expect(screen.getByText(`Diet: ${mockDiet.result}`)).toBeInTheDocument();
		});
	});

	it("displays ingredient table correctly", async () => {
		vi.spyOn(window, "fetch").mockImplementation((url) =>
			Promise.resolve({
				ok: true,
				json: async () =>
					url.toString().includes("recipes") ? mockRecipe : mockDiet,
			} as Response),
		);

		render(
			<MemoryRouter initialEntries={["/recipe/1"]}>
				<Routes>
					<Route path="/recipe/:id" element={<RecipeDetails userId={1} />} />
				</Routes>
			</MemoryRouter>,
		);

		await waitFor(() => {
			expect(screen.getByText("Ingredient")).toBeInTheDocument();
			expect(screen.getByText("Quantity")).toBeInTheDocument();
			expect(screen.getByText("Preparation")).toBeInTheDocument();
			expect(screen.getByText("Cooking")).toBeInTheDocument();
			expect(screen.getByText("Ingredient 1")).toBeInTheDocument();
			expect(screen.getByText("100g")).toBeInTheDocument();
			expect(screen.getByText("Chopped")).toBeInTheDocument();
			expect(screen.getByText("Fried")).toBeInTheDocument();
			expect(screen.getByText("Diet: Vegetarian")).toBeInTheDocument();
		});
	});
});
