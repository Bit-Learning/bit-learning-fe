import { createFileRoute } from "@tanstack/react-router";
import { GeneralError } from "@/feature/errors/general-error";
import GameListNetflix from "@/feature/game/components/GameListNetflix";
import { useSelector } from "react-redux";
import type { RootState } from "@/shared/redux/store";

type GameSearchParams = {
	type?: string;
};

export const Route = createFileRoute("/games/")({
	component: () => {
		const auth = useSelector((state: RootState) => state.auth);
		const username = auth.userInfo?.username ?? null;
		const role = auth.userInfo?.role ?? null;
		return <GameListNetflix username={username} role={role} />;
	},
	errorComponent: () => <GeneralError />,
	staticData: {
		headerStyle: "game",
	},
	validateSearch: (search: Record<string, unknown>): GameSearchParams => {
		return {
			type: (search.type as string) || undefined,
		};
	},
});
