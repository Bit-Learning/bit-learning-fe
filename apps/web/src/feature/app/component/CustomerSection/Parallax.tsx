import {
	type MotionValue,
	motion,
	useScroll,
	useSpring,
	useTransform,
} from "motion/react";
import React from "react";

export const HeroParallax = ({
	products,
}: {
	products: {
		title: string;
		link: string;
		thumbnail: string;
	}[];
}) => {
	const firstRow = products.slice(0, 5);
	const secondRow = products.slice(5, 10);
	const thirdRow = products.slice(10, 15);
	const ref = React.useRef(null);
	const { scrollYProgress } = useScroll({
		target: ref,
		offset: ["start start", "end start"],
	});

	const springConfig = { stiffness: 300, damping: 30, bounce: 100 };

	const translateX = useSpring(
		useTransform(scrollYProgress, [0, 1], [0, 1000]),
		springConfig,
	);
	const translateXReverse = useSpring(
		useTransform(scrollYProgress, [0, 1], [0, -1000]),
		springConfig,
	);
	const rotateX = useSpring(
		useTransform(scrollYProgress, [0, 0.2], [15, 0]),
		springConfig,
	);
	const opacity = useSpring(
		useTransform(scrollYProgress, [0, 0.2], [0.2, 1]),
		springConfig,
	);
	const rotateZ = useSpring(
		useTransform(scrollYProgress, [0, 0.2], [20, 0]),
		springConfig,
	);
	const translateY = useSpring(
		useTransform(scrollYProgress, [0, 0.2], [-700, 500]),
		springConfig,
	);
	return (
		<div
			ref={ref}
			className="relative flex h-[300vh] flex-col self-auto overflow-hidden py-40 antialiased [perspective:1000px] [transform-style:preserve-3d]"
		>
			<Header />
			<motion.div
				style={{
					rotateX,
					rotateZ,
					translateY,
					opacity,
				}}
				className=""
			>
				<motion.div className="mb-20 flex flex-row-reverse space-x-20 space-x-reverse">
					{firstRow.map((product) => (
						<ProductCard
							product={product}
							translate={translateX}
							key={product.title}
						/>
					))}
				</motion.div>
				<motion.div className="mb-20 flex flex-row space-x-20">
					{secondRow.map((product) => (
						<ProductCard
							product={product}
							translate={translateXReverse}
							key={product.title}
						/>
					))}
				</motion.div>
				<motion.div className="flex flex-row-reverse space-x-20 space-x-reverse">
					{thirdRow.map((product) => (
						<ProductCard
							product={product}
							translate={translateX}
							key={product.title}
						/>
					))}
				</motion.div>
			</motion.div>
		</div>
	);
};

export const Header = () => {
	return (
		<div className="relative top-0 left-0 mx-auto w-full max-w-7xl px-4 py-20 md:py-40">
			<h1 className="text-2xl font-bold md:text-7xl dark:text-white">
				Khách hàng của chúng tôi
			</h1>
			<p className="mt-8 max-w-2xl text-base md:text-xl dark:text-neutral-200">
				Theo phân loại của chúng tôi, kinh tế Việt Nam đang được vận hành với 14
				lĩnh vực ngành kinh doanh. Điều đáng tự hào của BASICO là bạn có thể tìm
				thấy trong cơ sở khách hàng phong phú của chúng tôi những thương hiệu
				dẫn đầu trong hầu hết lĩnh vực, ngành kinh doanh. Đó là những doanh
				nghiệp đầu ngành, mang lại niềm tự hào cho kinh tế Việt Nam. Còn chúng
				tôi tự hào vì BASICO được họ lựa chọn với tư cách hãng luật duy nhất
				phục vụ toàn diện, gắn kết chiến lược trên con đường phát triển…
			</p>
		</div>
	);
};

export const ProductCard = ({
	product,
	translate,
}: {
	product: {
		title: string;
		link: string;
		thumbnail: string;
	};
	translate: MotionValue<number>;
}) => {
	return (
		<motion.div
			style={{
				x: translate,
			}}
			whileHover={{
				y: -20,
			}}
			key={product.title}
			className="group/product relative h-96 w-[40rem] shrink-0"
		>
			<a href={product.link} className="block group-hover/product:shadow-2xl">
				<img
					src={product.thumbnail}
					height="500"
					width="500"
					className="absolute inset-0 h-full w-full object-cover object-left-top"
					alt={product.title}
				/>
			</a>
			<div className="pointer-events-none absolute inset-0 h-full w-full bg-black opacity-0 group-hover/product:opacity-80" />
			<h2 className="absolute bottom-4 left-4 text-white opacity-0 group-hover/product:opacity-100">
				{product.title}
			</h2>
		</motion.div>
	);
};
