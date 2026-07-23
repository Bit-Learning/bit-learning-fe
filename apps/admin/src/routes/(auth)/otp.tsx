import Otp from "@/features/auth/pages/Otp";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/(auth)/otp")({
	component: Otp,
});
