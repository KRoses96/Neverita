import type { MealPlanInputType, MealPlanUpdateType } from "../types";
import { prisma } from "./prisma";

export const getAllMealPlansModel = async (userId: number) => {
	try {
		const mealPlans = await prisma.mealPlan.findMany({
			where: {
				userId,
			},
		});
		return mealPlans;
	} catch (error) {
		console.error("Error fetching meal plans:", error);
		throw new Error("Could not fetch meal plans");
	}
};

export const getMealPlanByDateModel = async (userId: number, date: Date) => {
	try {
		const mealPlan = await prisma.mealPlan.findFirst({
			where: {
				userId,
				date,
			},
			include: {
				breakfast: true,
				lunch: true,
				dinner: true,
			},
		});
		return mealPlan;
	} catch (error) {
		console.error("Error fetching meal plan by date:", error);
		throw new Error("Could not fetch meal plan by date");
	}
};

export const getWeeklyMealPlanModel = async (
	userId: number,
	startDate: Date,
	endDate: Date,
) => {
	try {
		const mealPlans = await prisma.mealPlan.findMany({
			where: {
				date: {
					lte: endDate,
					gte: startDate,
				},
			},
			include: {
				breakfast: true,
				lunch: true,
				dinner: true,
			},
		});
		console.log(mealPlans);
		return mealPlans;
	} catch (error) {
		console.error(`Error fetching weekly meal plan: ${error}`);
		throw new Error("Could not fetch weekly meal plan");
	}
};

export const createMealPlanModel = async (
	userId: number,
	mealPlanData: MealPlanInputType,
) => {
	try {
		mealPlanData.userId = userId;
		mealPlanData.date = new Date(mealPlanData.date);
		const newMealPlan = await prisma.mealPlan.create({
			data: mealPlanData,
		});
		return newMealPlan;
	} catch (error) {
		console.error("Error creating meal plan:", error);
		throw new Error("Could not create meal plan");
	}
};

export const updateMealPlanModel = async (
	userId: number,
	mealPlanId: number,
	mealPlanData: MealPlanUpdateType,
) => {
	try {
		mealPlanData.userId = userId;
		await prisma.mealPlan.update({
			where: {
				id: mealPlanId,
				userId,
			},
			data: mealPlanData,
		});
	} catch (error) {
		console.error("Error updating meal plan:", error);
		throw new Error("Could not update meal plan");
	}
};

export const deleteMealPlanModel = async (
	userId: number,
	mealPlanId: number,
) => {
	try {
		await prisma.mealPlan.delete({
			where: {
				id: mealPlanId,
				userId,
			},
		});
	} catch (error) {
		console.error("Error deleting meal plan:", error);
		throw new Error("Could not delete meal plan");
	}
};
