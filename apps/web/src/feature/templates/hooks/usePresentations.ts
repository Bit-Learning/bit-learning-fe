import { useCallback, useState } from "react";
import { slidevPresentations } from "../data/slidev-presentations";
import type { SlidevPresentation } from "../types";

export const usePresentations = () => {
	const [presentations, setPresentations] =
		useState<SlidevPresentation[]>(slidevPresentations);
	const [isLoading, setIsLoading] = useState(false);

	const createPresentation = useCallback(
		async (data: Partial<SlidevPresentation>) => {
			setIsLoading(true);
			try {
				// Simulate API call
				await new Promise((resolve) => setTimeout(resolve, 1000));

				const newPresentation: SlidevPresentation = {
					id: data.id || `presentation-${Date.now()}`,
					title: data.title || "",
					description: data.description || "",
					fileName: data.fileName || "",
					theme: data.theme || "default",
					thumbnail: data.thumbnail,
					tags: data.tags || [],
					createdAt: new Date().toISOString(),
					updatedAt: new Date().toISOString(),
				};

				setPresentations((prev) => [...prev, newPresentation]);

				// In a real app, you would:
				// 1. Send to API to create the .md file
				// 2. Update the database
				// 3. Refresh the list from server

				return { success: true, data: newPresentation };
			} catch (error) {
				console.error("Error creating presentation:", error);
				return { success: false, error: "Failed to create presentation" };
			} finally {
				setIsLoading(false);
			}
		},
		[],
	);

	const updatePresentation = useCallback(
		async (id: string, data: Partial<SlidevPresentation>) => {
			setIsLoading(true);
			try {
				// Simulate API call
				await new Promise((resolve) => setTimeout(resolve, 1000));

				setPresentations((prev) =>
					prev.map((p) =>
						p.id === id
							? {
									...p,
									...data,
									updatedAt: new Date().toISOString(),
								}
							: p,
					),
				);

				// In a real app, you would:
				// 1. Send to API to update the .md file
				// 2. Update the database
				// 3. Refresh from server

				return { success: true };
			} catch (error) {
				console.error("Error updating presentation:", error);
				return { success: false, error: "Failed to update presentation" };
			} finally {
				setIsLoading(false);
			}
		},
		[],
	);

	const deletePresentation = useCallback(async (id: string) => {
		setIsLoading(true);
		try {
			// Simulate API call
			await new Promise((resolve) => setTimeout(resolve, 1000));

			setPresentations((prev) => prev.filter((p) => p.id !== id));

			// In a real app, you would:
			// 1. Send to API to delete the .md file
			// 2. Remove from database
			// 3. Clean up any associated files

			return { success: true };
		} catch (error) {
			console.error("Error deleting presentation:", error);
			return { success: false, error: "Failed to delete presentation" };
		} finally {
			setIsLoading(false);
		}
	}, []);

	const duplicatePresentation = useCallback(
		async (id: string) => {
			setIsLoading(true);
			try {
				const original = presentations.find((p) => p.id === id);
				if (!original) throw new Error("Presentation not found");

				await new Promise((resolve) => setTimeout(resolve, 1000));

				const duplicated: SlidevPresentation = {
					...original,
					id: `${original.id}-copy-${Date.now()}`,
					title: `${original.title} (Copy)`,
					fileName: original.fileName.replace(".md", `-copy-${Date.now()}.md`),
					createdAt: new Date().toISOString(),
					updatedAt: new Date().toISOString(),
				};

				setPresentations((prev) => [...prev, duplicated]);

				return { success: true, data: duplicated };
			} catch (error) {
				console.error("Error duplicating presentation:", error);
				return { success: false, error: "Failed to duplicate presentation" };
			} finally {
				setIsLoading(false);
			}
		},
		[presentations],
	);

	return {
		presentations,
		isLoading,
		createPresentation,
		updatePresentation,
		deletePresentation,
		duplicatePresentation,
	};
};
