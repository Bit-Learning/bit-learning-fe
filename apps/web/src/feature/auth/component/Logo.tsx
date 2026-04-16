interface LogoProps {
	compact?: boolean;
}

const Logo = ({ compact = false }: LogoProps) => {
	return (
		<div
			className={`flex items-center justify-center ${compact ? "mb-4 sm:mb-5" : "mb-8"}`}
		>
			<div className="flex items-center">
				<img
					src="/Logo.png"
					alt="Bit Learning Logo"
					className={`w-full object-contain ${
						compact ? "h-12 sm:h-14 lg:h-16" : "h-20 sm:h-15 md:h-15 lg:h-20"
					}`}
				/>
			</div>
		</div>
	);
};

export default Logo;
