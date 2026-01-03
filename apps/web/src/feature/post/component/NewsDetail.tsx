import { useNavigate, useParams } from "@tanstack/react-router";
import { Badge } from "@workspace/ui/components/Badge";
import { Button } from "@workspace/ui/components/Button";
import { Card, CardContent } from "@workspace/ui/components/Card";
import { toast } from "@workspace/ui/components/Sonner";
import {
	ArrowLeft,
	Bookmark,
	Calendar,
	CheckCircle,
	Clock,
	Copy,
	Eye,
	Facebook,
	Heart,
	Linkedin,
	Share2,
	Tag,
	Twitter,
} from "lucide-react";
import React from "react";

const NewsDetail: React.FC = () => {
	const { id } = useParams({ from: "/_layout/news/$id" });
	const navigate = useNavigate();
	const [isLiked, setIsLiked] = React.useState(false);
	const [isBookmarked, setIsBookmarked] = React.useState(false);
	const [copied, setCopied] = React.useState(false);

	// Mock data - trong thực tế sẽ fetch từ API
	const newsData = [
		{
			id: 1,
			title: "Xu hướng lập trình 2024: Những công nghệ đáng chú ý",
			excerpt:
				"Khám phá những xu hướng lập trình mới nhất trong năm 2024, từ AI/ML đến Web3 và các framework mới...",
			content: `
        <p>Năm 2024 đánh dấu sự phát triển mạnh mẽ của nhiều công nghệ mới trong lĩnh vực lập trình. Từ trí tuệ nhân tạo đến blockchain, các developer đang chứng kiến những thay đổi đáng kể trong cách tiếp cận phát triển phần mềm.</p>

        <h2>1. Trí tuệ nhân tạo và Machine Learning</h2>
        <p>AI và ML tiếp tục là xu hướng nổi bật nhất trong năm 2024. Với sự phát triển của các mô hình ngôn ngữ lớn như GPT-4, Claude, và các công cụ AI coding như GitHub Copilot, việc phát triển phần mềm đang trở nên hiệu quả hơn bao giờ hết.</p>

        <p>Các framework như TensorFlow, PyTorch, và các thư viện mới như Hugging Face Transformers đang được sử dụng rộng rãi để xây dựng các ứng dụng AI thông minh.</p>

        <h2>2. Web3 và Blockchain</h2>
        <p>Mặc dù có những thăng trầm, Web3 vẫn là một lĩnh vực đầy tiềm năng. Các ngôn ngữ lập trình như Solidity, Rust (cho Solana), và Move (cho Aptos) đang được nhiều developer quan tâm.</p>

        <p>Các framework phát triển dApp như Hardhat, Truffle, và các công cụ mới như Foundry đang giúp việc phát triển blockchain trở nên dễ dàng hơn.</p>

        <h2>3. Framework Frontend mới</h2>
        <p>React 18 với Concurrent Features, Vue 3 với Composition API, và SvelteKit đang thay đổi cách chúng ta xây dựng giao diện người dùng. Đặc biệt, các framework mới như Qwik và Solid.js đang thu hút sự chú ý với hiệu suất vượt trội.</p>

        <h2>4. Cloud Native và DevOps</h2>
        <p>Kubernetes, Docker, và các công cụ như Terraform, Ansible đang trở thành tiêu chuẩn trong việc triển khai ứng dụng. Serverless computing với AWS Lambda, Vercel Functions, và các nền tảng tương tự đang thay đổi cách chúng ta suy nghĩ về infrastructure.</p>

        <h2>5. Mobile Development</h2>
        <p>Flutter và React Native tiếp tục phát triển mạnh mẽ, trong khi các framework mới như Kotlin Multiplatform và SwiftUI đang mang lại trải nghiệm native tốt hơn.</p>

        <h2>Kết luận</h2>
        <p>Năm 2024 là một năm đầy thú vị cho các developer. Việc nắm bắt và học hỏi những công nghệ mới sẽ giúp bạn không bị tụt hậu trong thị trường việc làm cạnh tranh ngày nay.</p>

        <p>Hãy bắt đầu với một công nghệ mà bạn quan tâm nhất và dành thời gian để thực hành. Chỉ có thực hành mới giúp bạn thành thạo và tự tin khi áp dụng vào các dự án thực tế.</p>
      `,
			author: "Nguyễn Ngọc Lâm",
			authorAvatar: "NL",
			authorBio:
				"Giám đốc & Giảng viên chính tại BithubLearning. Chuyên gia Full-stack Development với 8+ năm kinh nghiệm.",
			date: "2024-01-15",
			readTime: "5 phút",
			views: 1250,
			category: "programming",
			tags: ["JavaScript", "React", "AI", "Web3", "Trending", "2024"],
			image:
				"https://images.unsplash.com/photo-1461749280684-dccba630e2f6?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
			featured: true,
			trending: true,
		},
		{
			id: 2,
			title: "Hướng dẫn học React từ cơ bản đến nâng cao",
			excerpt:
				"Lộ trình học React hoàn chỉnh cho người mới bắt đầu, từ JSX cơ bản đến các pattern nâng cao...",
			content: `
        <p>React là một trong những thư viện JavaScript phổ biến nhất hiện nay, được sử dụng bởi hàng triệu developer trên toàn thế giới. Trong bài viết này, chúng ta sẽ cùng tìm hiểu lộ trình học React từ cơ bản đến nâng cao.</p>

        <h2>1. Kiến thức cơ bản cần có</h2>
        <p>Trước khi bắt đầu học React, bạn cần nắm vững:</p>
        <ul>
          <li>HTML, CSS cơ bản</li>
          <li>JavaScript ES6+ (arrow functions, destructuring, modules, async/await)</li>
          <li>DOM manipulation</li>
          <li>Node.js và npm cơ bản</li>
        </ul>

        <h2>2. React Fundamentals</h2>
        <h3>2.1 JSX</h3>
        <p>JSX là một syntax extension cho JavaScript, cho phép bạn viết HTML-like code trong JavaScript:</p>
        <pre><code>const element = &lt;h1&gt;Hello, World!&lt;/h1&gt;;</code></pre>

        <h3>2.2 Components</h3>
        <p>Components là các khối xây dựng cơ bản của React. Có hai cách để tạo component:</p>
        <p><strong>Function Component:</strong></p>
        <pre><code>function Welcome(props) {
  return &lt;h1&gt;Hello, {props.name}&lt;/h1&gt;;
}</code></pre>

        <p><strong>Class Component:</strong></p>
        <pre><code>class Welcome extends React.Component {
  render() {
    return &lt;h1&gt;Hello, {this.props.name}&lt;/h1&gt;;
  }
}</code></pre>

        <h3>2.3 Props và State</h3>
        <p>Props là dữ liệu được truyền từ component cha xuống component con. State là dữ liệu nội bộ của component.</p>

        <h2>3. React Hooks</h2>
        <p>Hooks là một tính năng mới trong React 16.8, cho phép sử dụng state và các tính năng khác của React trong function components.</p>

        <h3>3.1 useState</h3>
        <pre><code>import React, { useState } from 'react';

function Counter() {
  const [count, setCount] = useState(0);

  return (
    &lt;div&gt;
      &lt;p&gt;You clicked {count} times&lt;/p&gt;
      &lt;button onClick={() =&gt; setCount(count + 1)}&gt;
        Click me
      &lt;/button&gt;
    &lt;/div&gt;
  );
}</code></pre>

        <h3>3.2 useEffect</h3>
        <p>useEffect cho phép thực hiện side effects trong function components:</p>
        <pre><code>import React, { useState, useEffect } from 'react';

function Example() {
  const [count, setCount] = useState(0);

  useEffect(() =&gt; {
    document.title = \`You clicked \${count} times\`;
  });

  return (
    &lt;div&gt;
      &lt;p&gt;You clicked {count} times&lt;/p&gt;
      &lt;button onClick={() =&gt; setCount(count + 1)}&gt;
        Click me
      &lt;/button&gt;
    &lt;/div&gt;
  );
}</code></pre>

        <h2>4. Advanced React Patterns</h2>
        <h3>4.1 Custom Hooks</h3>
        <p>Custom hooks cho phép bạn tái sử dụng logic giữa các components:</p>
        <pre><code>function useCounter(initialValue = 0) {
  const [count, setCount] = useState(initialValue);

  const increment = () =&gt; setCount(count + 1);
  const decrement = () =&gt; setCount(count - 1);
  const reset = () =&gt; setCount(initialValue);

  return { count, increment, decrement, reset };
}</code></pre>

        <h3>4.2 Context API</h3>
        <p>Context API giúp chia sẻ dữ liệu giữa các components mà không cần truyền props qua nhiều cấp.</p>

        <h2>5. State Management</h2>
        <p>Đối với các ứng dụng lớn, bạn có thể cần sử dụng các thư viện quản lý state như Redux, Zustand, hoặc Jotai.</p>

        <h2>6. Performance Optimization</h2>
        <ul>
          <li>React.memo() - tối ưu re-render</li>
          <li>useMemo() - memoize giá trị tính toán</li>
          <li>useCallback() - memoize functions</li>
          <li>Code splitting với React.lazy()</li>
        </ul>

        <h2>7. Testing</h2>
        <p>Học cách test React components với Jest và React Testing Library:</p>
        <pre><code>import { render, screen } from '@testing-library/react';
import App from './App';

test('renders learn react link', () =&gt; {
  render(&lt;App /&gt;);
  const linkElement = screen.getByText(/learn react/i);
  expect(linkElement).toBeInTheDocument();
});</code></pre>

        <h2>8. Next Steps</h2>
        <p>Sau khi nắm vững React cơ bản, bạn có thể:</p>
        <ul>
          <li>Học Next.js cho full-stack development</li>
          <li>Tìm hiểu React Native cho mobile development</li>
          <li>Học các thư viện UI như Material-UI, Ant Design</li>
          <li>Thực hành với các dự án thực tế</li>
        </ul>

        <h2>Kết luận</h2>
        <p>Học React là một hành trình dài và đầy thú vị. Điều quan trọng nhất là thực hành thường xuyên và xây dựng các dự án thực tế. Hãy bắt đầu với những dự án nhỏ và dần dần nâng cao độ phức tạp.</p>

        <p>Chúc bạn thành công trên con đường học React!</p>
      `,
			author: "Trần Thị Minh",
			authorAvatar: "TM",
			authorBio:
				"Giảng viên Frontend tại BithubLearning. Chuyên gia React, Vue.js và UI/UX Design với 5+ năm kinh nghiệm.",
			date: "2024-01-12",
			readTime: "8 phút",
			views: 980,
			category: "programming",
			tags: ["React", "JavaScript", "Frontend", "Tutorial", "Hooks"],
			image:
				"https://images.unsplash.com/photo-1633356122544-f134324a6cee?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
			featured: false,
			trending: true,
		},
	];

	const currentNews = newsData.find(
		(news) => news.id === Number.parseInt(id || "1", 10),
	);

	if (!currentNews) {
		return (
			<div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-orange-50">
				<div className="text-center">
					<h1 className="mb-4 text-2xl font-bold text-gray-900">
						Không tìm thấy bài viết
					</h1>
					<Button onClick={() => navigate({ to: "/news" })}>
						<ArrowLeft className="mr-2 h-4 w-4" />
						Quay lại tin tức
					</Button>
				</div>
			</div>
		);
	}

	const formatDate = (dateString: string) => {
		const date = new Date(dateString);
		return date.toLocaleDateString("vi-VN", {
			year: "numeric",
			month: "long",
			day: "numeric",
		});
	};

	const handleShare = (platform: string) => {
		const url = window.location.href;
		const title = currentNews.title;

		switch (platform) {
			case "facebook":
				window.open(
					`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
					"_blank",
				);
				break;
			case "twitter":
				window.open(
					`https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`,
					"_blank",
				);
				break;
			case "linkedin":
				window.open(
					`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
					"_blank",
				);
				break;
			case "copy":
				navigator.clipboard.writeText(url);
				setCopied(true);
				toast.success({ title: "Đã sao chép link!" });
				setTimeout(() => setCopied(false), 2000);
				break;
		}
	};

	const handleLike = () => {
		setIsLiked(!isLiked);
		toast.success({ title: isLiked ? "Đã bỏ thích" : "Đã thích bài viết!" });
	};

	const handleBookmark = () => {
		setIsBookmarked(!isBookmarked);
		toast.success({ title: isBookmarked ? "Đã bỏ lưu" : "Đã lưu bài viết!" });
	};

	return (
		<div className="min-h-screen bg-gradient-to-br from-blue-50 to-orange-50">
			{/* Header */}
			<div className="sticky top-0 z-10 border-b bg-white">
				<div className="container mx-auto max-w-4xl px-4 py-4">
					<div className="flex items-center justify-between">
						<Button
							variant="ghost"
							onClick={() => navigate({ to: "/news" })}
							className="flex items-center gap-2"
						>
							<ArrowLeft className="h-4 w-4" />
							Quay lại tin tức
						</Button>
						<div className="flex items-center gap-2">
							<Button
								variant="ghost"
								size="sm"
								onClick={handleLike}
								className={isLiked ? "text-red-500" : ""}
							>
								<Heart className={`h-4 w-4 ${isLiked ? "fill-current" : ""}`} />
							</Button>
							<Button
								variant="ghost"
								size="sm"
								onClick={handleBookmark}
								className={isBookmarked ? "text-blue-500" : ""}
							>
								<Bookmark
									className={`h-4 w-4 ${isBookmarked ? "fill-current" : ""}`}
								/>
							</Button>
							<Button
								variant="ghost"
								size="sm"
								onClick={() => handleShare("copy")}
							>
								{copied ? (
									<CheckCircle className="h-4 w-4 text-green-500" />
								) : (
									<Share2 className="h-4 w-4" />
								)}
							</Button>
						</div>
					</div>
				</div>
			</div>

			{/* Article Content */}
			<article className="container mx-auto max-w-4xl px-4 py-8">
				{/* Article Header */}
				<header className="mb-8">
					<div className="mb-4 flex items-center gap-2">
						<Badge className="bg-blue-700 text-white">
							{currentNews.category === "programming"
								? "Lập trình"
								: currentNews.category === "technology"
									? "Công nghệ"
									: currentNews.category === "education"
										? "Giáo dục"
										: currentNews.category === "career"
											? "Nghề nghiệp"
											: "Mẹo hay"}
						</Badge>
						{currentNews.featured && (
							<Badge className="bg-yellow-500 text-white">Nổi bật</Badge>
						)}
						{currentNews.trending && (
							<Badge className="bg-orange-500 text-white">Trending</Badge>
						)}
					</div>

					<h1 className="mb-6 text-3xl font-bold leading-tight text-gray-900 md:text-4xl">
						{currentNews.title}
					</h1>

					<p className="mb-6 text-xl leading-relaxed text-gray-600">
						{currentNews.excerpt}
					</p>

					{/* Article Meta */}
					<div className="mb-6 flex flex-wrap items-center gap-6 text-sm text-gray-500">
						<div className="flex items-center gap-2">
							<div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-r from-blue-700 to-orange-600 text-sm font-bold text-white">
								{currentNews.authorAvatar}
							</div>
							<div>
								<div className="font-medium text-gray-900">
									{currentNews.author}
								</div>
								<div className="text-xs text-gray-500">
									{currentNews.authorBio}
								</div>
							</div>
						</div>
						<div className="flex items-center gap-1">
							<Calendar className="h-4 w-4" />
							{formatDate(currentNews.date)}
						</div>
						<div className="flex items-center gap-1">
							<Clock className="h-4 w-4" />
							{currentNews.readTime}
						</div>
						<div className="flex items-center gap-1">
							<Eye className="h-4 w-4" />
							{currentNews.views.toLocaleString()} lượt xem
						</div>
					</div>

					{/* Tags */}
					<div className="mb-8 flex flex-wrap gap-2">
						{currentNews.tags.map((tag) => (
							<Badge key={tag} variant="secondary" className="text-xs">
								<Tag className="mr-1 h-3 w-3" />
								{tag}
							</Badge>
						))}
					</div>
				</header>

				{/* Featured Image */}
				<div className="mb-8">
					<img
						src={currentNews.image}
						alt={currentNews.title}
						className="h-64 w-full rounded-xl object-cover shadow-lg md:h-96"
					/>
				</div>

				{/* Article Body */}
				<div
					className="prose prose-lg mb-8 max-w-none"
					dangerouslySetInnerHTML={{ __html: currentNews.content }}
				/>

				{/* Share Section */}
				<div className="mb-8 rounded-xl border bg-white p-6 shadow-sm">
					<h3 className="mb-4 text-lg font-semibold text-gray-900">
						Chia sẻ bài viết
					</h3>
					<div className="flex flex-wrap gap-3">
						<Button
							variant="outline"
							size="sm"
							onClick={() => handleShare("facebook")}
							className="flex items-center gap-2"
						>
							<Facebook className="h-4 w-4 text-blue-600" />
							Facebook
						</Button>
						<Button
							variant="outline"
							size="sm"
							onClick={() => handleShare("twitter")}
							className="flex items-center gap-2"
						>
							<Twitter className="h-4 w-4 text-blue-400" />
							Twitter
						</Button>
						<Button
							variant="outline"
							size="sm"
							onClick={() => handleShare("linkedin")}
							className="flex items-center gap-2"
						>
							<Linkedin className="h-4 w-4 text-blue-700" />
							LinkedIn
						</Button>
						<Button
							variant="outline"
							size="sm"
							onClick={() => handleShare("copy")}
							className="flex items-center gap-2"
						>
							{copied ? (
								<CheckCircle className="h-4 w-4 text-green-500" />
							) : (
								<Copy className="h-4 w-4" />
							)}
							{copied ? "Đã sao chép" : "Sao chép link"}
						</Button>
					</div>
				</div>

				{/* Author Card */}
				<Card className="mb-8">
					<CardContent className="p-6">
						<div className="flex items-start gap-4">
							<div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-r from-blue-700 to-orange-600 text-xl font-bold text-white">
								{currentNews.authorAvatar}
							</div>
							<div className="flex-1">
								<h3 className="mb-2 text-xl font-semibold text-gray-900">
									{currentNews.author}
								</h3>
								<p className="mb-4 text-gray-600">{currentNews.authorBio}</p>
								<Button variant="outline" size="sm">
									Xem thêm bài viết
								</Button>
							</div>
						</div>
					</CardContent>
				</Card>

				{/* Related Articles */}
				<div className="rounded-xl border bg-white p-6 shadow-sm">
					<h3 className="mb-6 text-xl font-semibold text-gray-900">
						Bài viết liên quan
					</h3>
					<div className="grid gap-4 md:grid-cols-2">
						{newsData
							.filter(
								(news) =>
									news.id !== currentNews.id &&
									news.category === currentNews.category,
							)
							.slice(0, 2)
							.map((news) => (
								<Card
									key={news.id}
									className="cursor-pointer transition-shadow hover:shadow-md"
									onClick={() =>
										navigate({
											to: "/news/$id",
											params: { id: news.id.toString() },
										})
									}
								>
									<CardContent className="p-4">
										<div className="flex gap-3">
											<img
												src={news.image}
												alt={news.title}
												className="h-20 w-20 flex-shrink-0 rounded-lg object-cover"
											/>
											<div className="flex-1">
												<h4 className="mb-2 line-clamp-2 font-semibold text-gray-900">
													{news.title}
												</h4>
												<div className="flex items-center gap-2 text-xs text-gray-500">
													<span>{formatDate(news.date)}</span>
													<span>•</span>
													<span>{news.readTime}</span>
												</div>
											</div>
										</div>
									</CardContent>
								</Card>
							))}
					</div>
				</div>
			</article>
		</div>
	);
};

export default NewsDetail;
