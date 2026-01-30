import { Character } from "../page/StudentLobby";

export const getAbsPath = (relativePath: string): string => {
	return `/Square/${relativePath}`;
};

export const mockCharacters: Character[] = [
	{ id: 1, name: "Bear", url: getAbsPath("bear.png") },
	{ id: 2, name: "Buffalo", url: getAbsPath("buffalo.png") },
	{ id: 3, name: "Chick", url: getAbsPath("chick.png") },
	{ id: 4, name: "Chicken", url: getAbsPath("chicken.png") },
	{ id: 5, name: "Cow", url: getAbsPath("cow.png") },
	{ id: 6, name: "Crocodile", url: getAbsPath("crocodile.png") },
	{ id: 7, name: "Dog", url: getAbsPath("dog.png") },
	{ id: 8, name: "Duck", url: getAbsPath("duck.png") },
	{ id: 9, name: "Elephant", url: getAbsPath("elephant.png") },
	{ id: 10, name: "Frog", url: getAbsPath("frog.png") },
	{ id: 11, name: "Giraffe", url: getAbsPath("giraffe.png") },
	{ id: 12, name: "Goat", url: getAbsPath("goat.png") },
	{ id: 13, name: "Gorilla", url: getAbsPath("gorilla.png") },
	{ id: 14, name: "Hippo", url: getAbsPath("hippo.png") },
	{ id: 15, name: "Horse", url: getAbsPath("horse.png") },
	{ id: 16, name: "Monkey", url: getAbsPath("monkey.png") },
	{ id: 17, name: "Moose", url: getAbsPath("moose.png") },
	{ id: 18, name: "Narwhal", url: getAbsPath("narwhal.png") },
	{ id: 19, name: "Owl", url: getAbsPath("owl.png") },
	{ id: 20, name: "Panda", url: getAbsPath("panda.png") },
	{ id: 21, name: "Parrot", url: getAbsPath("parrot.png") },
	{ id: 22, name: "Penguin", url: getAbsPath("penguin.png") },
	{ id: 23, name: "Pig", url: getAbsPath("pig.png") },
	{ id: 24, name: "Rabbit", url: getAbsPath("rabbit.png") },
	{ id: 25, name: "Rhino", url: getAbsPath("rhino.png") },
	{ id: 26, name: "Sloth", url: getAbsPath("sloth.png") },
	{ id: 27, name: "Snake", url: getAbsPath("snake.png") },
	{ id: 28, name: "Walrus", url: getAbsPath("walrus.png") },
	{ id: 29, name: "Whale", url: getAbsPath("whale.png") },
	{ id: 30, name: "Zebra", url: getAbsPath("zebra.png") },
];
