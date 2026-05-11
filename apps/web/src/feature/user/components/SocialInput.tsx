import { Input } from "@workspace/ui/components/Input";

export const SOCIAL_VALIDATORS: Record<
	string,
	{ pattern: RegExp; example: string }
> = {
	facebook: {
		pattern: /^https:\/\/(www\.)?facebook\.com\/.+/,
		example: "https://www.facebook.com/username",
	},
	instagram: {
		pattern: /^https:\/\/(www\.)?instagram\.com\/.+/,
		example: "https://www.instagram.com/username",
	},
	twitter: {
		pattern: /^https:\/\/(www\.)?(twitter|x)\.com\/.+/,
		example: "https://www.twitter.com/username",
	},
	linkedin: {
		pattern: /^https:\/\/(www\.)?linkedin\.com\/in\/.+/,
		example: "https://www.linkedin.com/in/username",
	},
	github: {
		pattern: /^https:\/\/github\.com\/.+/,
		example: "https://github.com/username",
	},
	website: {
		pattern: /^https:\/\/.+/,
		example: "https://yourwebsite.com",
	},
};

export const SocialInput = ({
	icon: Icon,
	color,
	placeholder,
	value,
	onChange,
	type,
	disabled,
}: any) => {
	const trimmed = value?.trim() || "";
	const hasValue = trimmed.length > 0;
	const validator = SOCIAL_VALIDATORS[type];
	const isValid = hasValue && validator?.pattern.test(trimmed);
	const isInvalid = hasValue && !isValid && !disabled;

	return (
		<div className="flex flex-col gap-1">
			<div className="flex items-center gap-3">
				{hasValue && isValid ? (
					<a
						href={trimmed}
						target="_blank"
						rel="noopener noreferrer"
						className="size-15 rounded-xl bg-none flex items-center justify-center shrink-0 hover:bg-slate-200 transition-colors cursor-pointer"
						style={{ color }}
					>
						<Icon className="w-8 h-10" />
					</a>
				) : (
					<div
						className="size-15 rounded-xl bg-none flex items-center justify-center shrink-0"
						style={{ color: isInvalid ? "#ef4444" : color }}
					>
						<Icon className="w-8 h-8" />
					</div>
				)}
				<Input
					placeholder={placeholder}
					value={value || ""}
					onChange={(e: any) => onChange(e.target.value)}
					disabled={disabled}
					className={
						isInvalid
							? "border-red-400 focus:ring-red-400 focus:border-red-400"
							: ""
					}
				/>
			</div>
			{isInvalid && (
				<p className="text-sm text-red-500 ml-15 pl-0.5">
					VD: {validator?.example}
				</p>
			)}
		</div>
	);
};
