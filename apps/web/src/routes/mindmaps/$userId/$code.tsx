import { createFileRoute, redirect } from "@tanstack/react-router";
import { selectAuthStateInfo } from "@/feature/auth/store/auth.selectors";
import Mindmap from "@/feature/mindmap/pages/MindMap";
import { getMindMapDataByUserIdAndCode } from "@/feature/mindmap/services/mindmap.service";
import store from "@/shared/redux/store";

export const Route = createFileRoute("/mindmaps/$userId/$code")({
	beforeLoad: async ({ params }) => {
		const state = store.getState();
		const { userInfo } = selectAuthStateInfo(state);

		if (!userInfo || userInfo.id.toString() !== params.userId) {
			throw redirect({ to: "/404" });
		}
	},

	loader: async ({ params }) => {
		try {
			const res = await getMindMapDataByUserIdAndCode(
				+params.userId,
				params.code,
			);
			return res.data.data;
		} catch (err: any) {
			if (err.response?.status === 404) {
				throw redirect({ to: "/404" });
			}
			throw err;
		}
	},

	component: RouteComponent,
});

function RouteComponent() {
	const data = Route.useLoaderData();

	return <>{data && <Mindmap data={data} />}</>;
}
