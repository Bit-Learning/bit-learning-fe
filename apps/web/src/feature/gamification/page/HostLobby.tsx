import { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { selectAuthStateInfo } from "@/feature/auth/store/auth.selectors";
import { useRouter } from "@tanstack/react-router";
import { Button } from "@workspace/ui/components/Button";
import { HostGameService } from "../api/HostGameService";
import { createGameSocket, type GameMessage } from "../utils/gameSocket";

interface PlayerItem {
	id: number;
	name: string;
}

const HostLobby = () => {
	const router = useRouter();
	const search = router.state.location.search as { pin?: string };
	const initialPin = search?.pin;
	const [pinCode] = useState<string | undefined>(initialPin);
	const [players, setPlayers] = useState<PlayerItem[]>([]);
	const [socketReady, setSocketReady] = useState(false);
	const { userInfo } = useSelector(selectAuthStateInfo);

	useEffect(() => {
		if (!pinCode || !userInfo?.username) return;

		const connection = createGameSocket({
			pinCode,
			onMessage: (msg: GameMessage<unknown>) => {
				if (msg.type === "PLAYER_JOINED" && msg.username) {
					const username = msg.username;
					setPlayers((prev) => {
						if (prev.some((p) => p.name === username)) return prev;
						return [...prev, { id: prev.length + 1, name: username }];
					});
				}
				if (msg.type === "LEADERBOARD_UPDATE") {
					// Host dashboard could use leaderboard payload later
				}
			},
		});

		setSocketReady(true);

		return () => {
			connection.disconnect();
		};
	}, [pinCode, userInfo?.username]);

	const handleStart = async () => {
		if (!pinCode) return;
		await HostGameService.startSession(pinCode);
	};

	const displayPin = useMemo(() => pinCode ?? "------", [pinCode]);

	return (
		<div className="min-h-screen bg-gradient-to-br from-purple-600 to-cyan-400 flex flex-col">
			{/* Top Bar */}
			<div className="bg-purple-700 text-white px-6 py-3 flex justify-between items-center">
				<div className="flex items-center gap-4">
					{/* Fake QR */}
					<div className="bg-white text-black p-2 rounded">
						<div className="grid grid-cols-4 gap-1">
							{Array.from({ length: 16 }).map((_, i) => (
								<div key={i} className="w-2 h-2 bg-black" />
							))}
						</div>
					</div>

					<div>
						<p className="text-sm">Go to play.example.com</p>
						<p className="text-sm">and enter Game ID:</p>
					</div>
				</div>

				<div className="text-4xl font-extrabold tracking-widest">
					{displayPin}
				</div>

				<Button
					type="button"
					onClick={handleStart}
					isDisabled={!socketReady || !pinCode}
					className="bg-white text-purple-700 font-bold px-6 py-2 rounded-lg shadow hover:scale-105 transition disabled:opacity-60"
				>
					Start
				</Button>
			</div>

			{/* Body */}
			<div className="flex-1 p-8 text-white">
				<h1 className="text-3xl font-extrabold mb-6 text-center">Join Game</h1>

				<div className="grid grid-cols-3 gap-6 max-w-4xl mx-auto">
					{players.map((player) => (
						<div
							key={player.id}
							className="bg-white text-black rounded-xl p-4 flex items-center gap-4 shadow-lg"
						>
							<div className="text-3xl">👤</div>
							<div className="font-semibold">{player.name}</div>
						</div>
					))}
					{players.length === 0 && (
						<p className="col-span-3 text-center text-white/80">
							Chưa có người chơi tham gia.
						</p>
					)}
				</div>
			</div>
		</div>
	);
};

export default HostLobby;
