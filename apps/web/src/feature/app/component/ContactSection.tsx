import { Button } from "@workspace/ui/components/Button";
import { Card } from "@workspace/ui/components/Card";
import {
	Map,
	MapControls,
	MapMarker,
	MarkerContent,
	MarkerLabel,
	MarkerPopup,
	useMap,
} from "@workspace/ui/components/map";
import {
	ArrowRight,
	Clock,
	ExternalLink,
	Mail,
	MapPin,
	Mountain,
	Navigation,
	Phone,
	RotateCcw,
	Star,
} from "lucide-react";
import React from "react";

const place = {
	id: 1,
	name: "Bit Learning",
	label: "Trung tâm đào tạo lập trình Bit Learning",
	category: "Education",
	rating: 4.8,
	reviews: 12453,
	hours: "9:00 AM - 5:00 PM",
	image:
		"https://images.unsplash.com/photo-1484417894907-623942c8ee29?q=30&w=1032&auto=format&fit=crop",
	lng: 106.63721742496388,
	lat: 10.799615359777903,
};

function MapController() {
	const { map, isLoaded } = useMap();
	const [pitch, setPitch] = React.useState(0);
	const [bearing, setBearing] = React.useState(0);

	React.useEffect(() => {
		if (!map || !isLoaded) return;

		const handleMove = () => {
			setPitch(Math.round(map.getPitch()));
			setBearing(Math.round(map.getBearing()));
		};

		map.on("move", handleMove);
		return () => {
			map.off("move", handleMove);
		};
	}, [map, isLoaded]);

	const handle3DView = () => {
		map?.easeTo({
			pitch: 60,
			bearing: -20,
			duration: 1000,
		});
	};

	const handleReset = () => {
		map?.easeTo({
			pitch: 0,
			bearing: 0,
			duration: 1000,
		});
	};

	if (!isLoaded) return null;

	return (
		<div className="absolute left-3 top-3 z-10 flex flex-col gap-2">
			<div className="flex gap-2">
				<Button size="sm" variant="secondary" onClick={handle3DView}>
					<Mountain className="mr-1.5 size-4" />
					3D View
				</Button>
				<Button size="sm" variant="secondary" onClick={handleReset}>
					<RotateCcw className="mr-1.5 size-4" />
					Reset
				</Button>
			</div>
			<div className="bg-background/90 rounded-md border px-3 py-2 font-mono text-xs backdrop-blur">
				<div>Pitch: {pitch}°</div>
				<div>Bearing: {bearing}°</div>
			</div>
		</div>
	);
}

const ContactSection: React.FC = () => {
	return (
		<section className="grid w-full md:grid-cols-2">
			<div className="bg-linear-to-br flex items-center justify-center from-blue-600 to-blue-700 px-8 py-16">
				<div className="w-full max-w-2xl text-center text-white">
					<h2 className="mb-8 text-4xl font-bold tracking-tight">
						LIÊN HỆ TƯ VẤN
					</h2>
					<p className="mb-8 text-xl opacity-90">
						Bạn cần tư vấn về khóa học lập trình? <br />
						Hãy liên hệ với Bithub Learning ngay!
					</p>

					<div className="mb-8 space-y-4 text-left">
						<div className="flex items-center gap-3">
							<div className="text-lg font-semibold">Nguyễn Ngọc Lâm</div>
						</div>
						<div className="flex items-center gap-3">
							<div className="text-sm opacity-80">
								Giảng viên - Chuyên gia Lập trình
							</div>
						</div>
						<div className="flex items-center gap-3">
							<Phone className="h-5 w-5 text-orange-300" />
							<div>
								<div className="font-semibold">Điện thoại:</div>
								<div className="text-lg">0767.666.299</div>
							</div>
						</div>
						<div className="flex items-center gap-3">
							<Mail className="h-5 w-5 text-orange-300" />
							<div>
								<div className="font-semibold">Email:</div>
								<div className="text-lg">bithubvn@gmail.com</div>
							</div>
						</div>
						<div className="flex items-center gap-3">
							<MapPin className="h-5 w-5 text-orange-300" />
							<div>
								<div className="font-semibold">Địa chỉ:</div>
								<div className="text-lg">
									929 Âu Cơ, Phường Tân Sơn Nhì, Hồ Chí Minh
								</div>
							</div>
						</div>
						<div className="flex items-center gap-3">
							<Clock className="h-5 w-5 text-orange-300" />
							<div>
								<div className="font-semibold">Website:</div>
								<div className="text-lg">https://bithub.edu.vn</div>
							</div>
						</div>
					</div>

					<div className="mb-8">
						<Card className="h-[600px] overflow-hidden p-0">
							<Map center={[106.63721742496388, 10.799615359777903]} zoom={11}>
								<MapMarker
									key={place.id}
									longitude={place.lng}
									latitude={place.lat}
								>
									<MarkerContent>
										<div className="size-5 cursor-pointer rounded-full border-2 border-white bg-rose-500 shadow-lg transition-transform hover:scale-110" />
										<MarkerLabel position="bottom">{place.label}</MarkerLabel>
									</MarkerContent>
									<MarkerPopup className="w-62 p-0">
										<div className="relative h-20 overflow-hidden rounded-t-md">
											{/* <Image fill src={place.image} alt={place.name} className="object-cover" /> */}
											<img
												src={place.image}
												alt={place.name}
												className="absolute inset-0 h-full w-full object-cover"
											/>
										</div>
										<div className="space-y-2 p-3">
											<div>
												<span className="text-muted-foreground text-xs font-medium uppercase tracking-wide">
													{place.category}
												</span>
												<h3 className="text-foreground font-semibold leading-tight">
													{place.name}
												</h3>
											</div>
											<div className="flex items-center gap-3 text-sm">
												<div className="flex items-center gap-1">
													<Star className="size-3.5 fill-amber-400 text-amber-400" />
													<span className="font-medium">{place.rating}</span>
													<span className="text-muted-foreground">
														({place.reviews.toLocaleString()})
													</span>
												</div>
											</div>
											<div className="text-muted-foreground flex items-center gap-1.5 text-sm">
												<Clock className="size-3.5" />
												<span>{place.hours}</span>
											</div>
											<div className="flex gap-2 pt-1">
												<Button size="sm" className="h-8 flex-1">
													<Navigation className="mr-1.5 size-3.5" />
													Directions
												</Button>
												<Button size="sm" variant="outline" className="h-8">
													<ExternalLink className="size-3.5" />
												</Button>
											</div>
										</div>
									</MarkerPopup>
								</MapMarker>
								<MapControls />
								<MapController />
							</Map>
						</Card>
					</div>

					<div className="flex flex-col justify-center gap-4 sm:flex-row">
						<Button
							className="bithub-button-secondary px-8 py-4 text-lg"
							onClick={() => {
								window.location.href = "/contact";
							}}
						>
							TƯ VẤN MIỄN PHÍ <ArrowRight className="ml-2 h-5 w-5" />
						</Button>
						<Button
							className="border-2 border-white bg-white px-8 py-3 text-blue-600 hover:bg-blue-100"
							onClick={() => {
								window.location.href = "/offline-course";
							}}
						>
							ĐĂNG KÝ KHÓA HỌC
						</Button>
					</div>
				</div>
			</div>

			<div className="relative h-full w-full">
				<img
					src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80"
					alt="BithubLearning Contact"
					className="h-full w-full object-cover"
				/>
				<div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-transparent" />
				<div className="absolute bottom-8 left-8 right-8 rounded-xl bg-white/90 p-6 backdrop-blur-sm">
					<h3 className="mb-3 text-2xl font-bold text-gray-900">
						Dịch vụ của chúng tôi
					</h3>
					<div className="grid grid-cols-2 gap-4 text-sm">
						<div className="flex items-center gap-2">
							<div className="h-2 w-2 rounded-full bg-blue-600" />
							<span>Khóa học Online</span>
						</div>
						<div className="flex items-center gap-2">
							<div className="h-2 w-2 rounded-full bg-orange-500" />
							<span>Khóa học Offline</span>
						</div>
						<div className="flex items-center gap-2">
							<div className="h-2 w-2 rounded-full bg-green-500" />
							<span>Tư vấn khóa học</span>
						</div>
						<div className="flex items-center gap-2">
							<div className="h-2 w-2 rounded-full bg-purple-500" />
							<span>Mentorship 1-1</span>
						</div>
					</div>
				</div>
			</div>
		</section>
	);
};

export default ContactSection;
