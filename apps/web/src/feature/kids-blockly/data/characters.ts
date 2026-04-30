import characterBoyAsset from "../asset/character_boy.png";
import characterGirlAsset from "../asset/character_girl.png";
import characterMouseAsset from "../asset/character_mouse.png";
import characterRobotAsset from "../asset/character_robot.png";
import type { CharacterOption } from "../types";

export const characterOptions = [
	{
		id: "robot",
		name: "Robot",
		src: characterRobotAsset,
		alt: "Nhân vật robot",
	},
	{
		id: "boy",
		name: "Bạn nam",
		src: characterBoyAsset,
		alt: "Nhân vật bạn nam",
	},
	{
		id: "girl",
		name: "Bạn nữ",
		src: characterGirlAsset,
		alt: "Nhân vật bạn nữ",
	},
	{
		id: "mouse",
		name: "Chuột máy",
		src: characterMouseAsset,
		alt: "Nhân vật chuột máy",
	},
] satisfies [CharacterOption, ...CharacterOption[]];
