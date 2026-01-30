import { Gamepad } from "lucide-react";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { selectAuthStateInfo } from "@/feature/auth/store/auth.selectors";
import { useRouter } from "@tanstack/react-router";
import { Button } from "@workspace/ui/components/Button";
import { HostGameService } from "../api/HostGameService";
import { createGameSocket, type GameMessage } from "../utils/gameSocket";
import { mockCharacters } from "../data";
import "../styles/studentlobby.css";

export type Character = {
	id: number;
	name: string;
	url: string;
};

const StudentLobby = () => {
	const initialCharacter: Character = mockCharacters[0] ?? {
		id: 0,
		name: "",
		url: "",
	};
	const [selected, setSelected] = useState<Character>(initialCharacter);
	const [pinInput, setPinInput] = useState("");
	const [isJoined, setIsJoined] = useState(false);
	const router = useRouter();
	const { userInfo } = useSelector(selectAuthStateInfo);

	useEffect(() => {
		// If pin is present in URL, auto-fill
		const search = router.state.location.search as { pin?: string };
		if (search?.pin) {
			setPinInput(search.pin);
		}
	}, [router.state.location.search]);

	useEffect(() => {
		if (!isJoined || !pinInput || !userInfo?.username) return;

		const connection = createGameSocket({
			pinCode: pinInput,
			onMessage: (msg: GameMessage) => {
				if (msg.type === "GAME_START") {
					// Later: navigate to in-game screen
				}
			},
		});

		// Notify join to host
		connection.sendJoin(userInfo.username);

		return () => {
			connection.disconnect();
		};
	}, [isJoined, pinInput, userInfo?.username]);

	const handleJoin = async () => {
		if (!pinInput) return;
		await HostGameService.joinSession({ pinCode: pinInput });
		setIsJoined(true);
	};

	return (
		<div className="min-h-screen min-w-screen flex flex-col container">
			{/* Texture overlay */}
			<div
				className="absolute inset-0 pointer-events-none
					bg-[radial-gradient(circle,rgba(0,0,0,0.25)_1px,transparent_1px)]
					opacity-[0.12]"
			/>

			<div className="relative z-10 flex flex-col min-h-screen">
				{/* Top bar with PIN input */}
				{/* Top bar */}
				<div className="bg-[#9b49ab] text-white py-3 px-5 flex items-center justify-between border-b-4 border-[#793a8b] shadow-lg">
					<div className="font-bold text-xl">Sảnh chờ</div>
					<div className="flex items-center gap-2">
						<input
							type="text"
							placeholder="Mã PIN"
							value={pinInput}
							onChange={(e) => setPinInput(e.target.value.toUpperCase())}
							className="rounded-lg px-3 py-1 text-white text-sm"
						/>
						<Button
							type="button"
							onClick={handleJoin}
							className="bg-white text-purple-700 font-semibold px-3 py-1 text-sm rounded-lg disabled:opacity-60"
							isDisabled={!pinInput || isJoined}
						>
							{isJoined ? "Đã tham gia" : "Tham gia"}
						</Button>
					</div>
				</div>

				{/* Main */}
				<div className="flex flex-1 flex-col lg:flex-row p-3 sm:p-4 md:p-6 gap-4 md:gap-6">
					{/* Left: character grid */}
					<div className="bg-[#9b49ab] rounded-xl p-3 md:p-4 w-full lg:w-2/3 shadow-lg border-b-8 border-[#793a8b]">
						<div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 gap-2 sm:gap-3 md:gap-4">
							{mockCharacters.map((char) => (
								<button
									type="button"
									key={char.id}
									onClick={() => setSelected(char)}
									className={`aspect-square rounded-lg flex items-center justify-center relative
                  transition-all duration-200 transform hover:scale-110
                  ${
										selected.id === char.id
											? "ring-4 ring-yellow-400 ring-offset-2 ring-offset-[#9b49ab] shadow-xl scale-105"
											: "hover:ring-2 hover:ring-white/50"
									}`}
								>
									<img
										src={char.url}
										alt={char.name}
										className={`max-w-full max-h-full object-contain transition-all duration-200 ${
											selected.id === char.id ? "brightness-110" : ""
										}`}
									/>
									{selected.id === char.id && (
										<div className="absolute inset-0 bg-gradient-to-b from-yellow-400/20 to-transparent rounded-lg pointer-events-none" />
									)}
								</button>
							))}
						</div>
					</div>

					{/* Right: selected preview */}
					<div className="flex-1 flex flex-col items-center justify-center min-h-[300px] lg:min-h-0">
						<div className="relative w-64 h-64 sm:w-80 sm:h-80 md:w-96 md:h-96 rounded-xl flex flex-col items-center justify-center">
							{/* Scene */}
							<img
								src="/scene/city.jpg"
								alt="scene"
								className="absolute inset-0 w-full h-full opacity-70 rounded-lg object-cover"
							/>

							<div className="text-center z-10">
								<h2
									className="text-2xl sm:text-3xl md:text-4xl font-extrabold mb-4 text-white
  [paint-order:stroke_fill]
  [-webkit-text-stroke:1.5px_#000]
  drop-shadow-[2px_2px_0_rgba(0,0,0,0.8)]"
								>
									{selected.name}
								</h2>

								<img
									src={selected.url}
									alt={selected.name}
									className="w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 object-contain mx-auto mb-4"
								/>
							</div>
						</div>

						<div className="text-center z-10 mt-4 gap-2 md:gap-3 flex justify-center items-center">
							<Gamepad className="h-6 w-6 md:h-8 md:w-8 lg:h-10 lg:w-10 text-white" />
							<h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-semibold text-gray-500">
								Waiting for Host
							</h1>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};
export default StudentLobby;
