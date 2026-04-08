import Marquee from "@workspace/ui/components/custom/marquee";

type TechItem = {
	name: string;
	logo: string;
};

const languageItems: TechItem[] = [
	{
		name: "HTML",
		logo: "/tech-logos/html5.svg",
	},
	{
		name: "CSS",
		logo: "/tech-logos/css3.svg",
	},
	{
		name: "JavaScript",
		logo: "/tech-logos/javascript.svg",
	},
	{
		name: "Java",
		logo: "/tech-logos/java.svg",
	},
	{
		name: "Spring",
		logo: "/tech-logos/spring.svg",
	},
	{
		name: "Kotlin",
		logo: "/tech-logos/kotlin.svg",
	},
	{
		name: "TypeScript",
		logo: "/tech-logos/typescript.svg",
	},
	{
		name: "React",
		logo: "/tech-logos/react.svg",
	},
	{
		name: "Dart",
		logo: "/tech-logos/dart.svg",
	},
	{
		name: "C++",
		logo: "/tech-logos/cpp.svg",
	},
	{
		name: "Go",
		logo: "/tech-logos/go.svg",
	},
	{
		name: "Node.js",
		logo: "/tech-logos/nodejs.svg",
	},
	{
		name: "Python",
		logo: "/tech-logos/python.svg",
	},
	{
		name: "SQL",
		logo: "/tech-logos/sql.svg",
	},
	{
		name: "Cobol",
		logo: "/tech-logos/cobol-original.svg",
	},
];

const toolItems: TechItem[] = [
	{
		name: "Git",
		logo: "/tech-logos/git.svg",
	},
	{
		name: "GitHub",
		logo: "/tech-logos/github.svg",
	},
	{
		name: "Docker",
		logo: "/tech-logos/docker.svg",
	},
	{
		name: "Ansible",
		logo: "/tech-logos/ansible.svg",
	},
	{
		name: "Terraform",
		logo: "/tech-logos/terraform.svg",
	},
	{
		name: "Vite",
		logo: "/tech-logos/vite.svg",
	},
	{
		name: "VS Code",
		logo: "/tech-logos/vscode.svg",
	},
	{
		name: "Postman",
		logo: "/tech-logos/postman.svg",
	},
	{
		name: "Linux",
		logo: "/tech-logos/linux.svg",
	},
	{
		name: "Figma",
		logo: "/tech-logos/figma.svg",
	},
	{
		name: "Jenkins",
		logo: "/tech-logos/jenkins.svg",
	},
	{
		name: "Jira",
		logo: "/tech-logos/jira.svg",
	},
	{
		name: "Kubernetes",
		logo: "/tech-logos/k8s.svg",
	},
	{
		name: "Redis",
		logo: "/tech-logos/redis.svg",
	},
	{
		name: "PostgreSQL",
		logo: "/tech-logos/postgresql.svg",
	},
	{
		name: "Grafana",
		logo: "/tech-logos/grafana.svg",
	},
	{
		name: "Express.js",
		logo: "/tech-logos/express-original.svg",
	},
	{
		name: "DynamoDB",
		logo: "/tech-logos/dynamodb-original.svg",
	},
	{
		name: "Elacsticsearch",
		logo: "/tech-logos/elasticsearch-original.svg",
	},
	{
		name: "Django",
		logo: "/tech-logos/django-plain.svg",
	},
	{
		name: "Deno.js",
		logo: "/tech-logos/denojs-original.svg",
	},
	{
		name: "CouchDB",
		logo: "/tech-logos/couchdb-original.svg",
	},
	{
		name: "CMake",
		logo: "/tech-logos/cmake-original.svg",
	},
	{
		name: "Cassandra",
		logo: "/tech-logos/cassandra-original.svg",
	},
	{
		name: "Bun",
		logo: "/tech-logos/bun-original.svg",
	},
	{
		name: "Bootstrap",
		logo: "/tech-logos/bootstrap-original.svg",
	},
	{
		name: "Blazor",
		logo: "/tech-logos/blazor-original.svg",
	},
	{
		name: "Apache Kafka",
		logo: "/tech-logos/apachekafka-original.svg",
	},
	{
		name: "Arduino",
		logo: "/tech-logos/arduino-original.svg",
	},
	{
		name: "Astro",
		logo: "/tech-logos/astro-original.svg",
	},
	{
		name: "Azure SQL Database",
		logo: "/tech-logos/azuresqldatabase-original.svg",
	},
	{
		name: "Bash",
		logo: "/tech-logos/bash-original.svg",
	},
	{
		name: "Biome",
		logo: "/tech-logos/biome-original.svg",
	},
];

const platforms: TechItem[] = [
	{
		name: "AWS",
		logo: "/tech-logos/aws.svg",
	},
	{
		name: "Azure",
		logo: "/tech-logos/azure.svg",
	},
	{
		name: "Google Cloud",
		logo: "/tech-logos/gcp.svg",
	},
	{
		name: "Vercel",
		logo: "/tech-logos/vercel.svg",
	},
	{
		name: "Firebase",
		logo: "/tech-logos/firebase.svg",
	},
	{
		name: "Cloudflare",
		logo: "/tech-logos/cloudflare.svg",
	},
	{
		name: "GitHub",
		logo: "/tech-logos/github-original.svg",
	},
	{
		name: "GitHub",
		logo: "/tech-logos/gitlab-original.svg",
	},
	{
		name: "DigitalOcean",
		logo: "/tech-logos/digitalocean-original.svg",
	},
	{
		name: "Debian",
		logo: "/tech-logos/debian-original.svg",
	},
	{
		name: "Datadog",
		logo: "/tech-logos/datadog-original.svg",
	},
	{
		name: "Confluence",
		logo: "/tech-logos/confluence-original.svg",
	},
	{
		name: "CircleCI",
		logo: "/tech-logos/circleci-plain.svg",
	},
	{
		name: "ArgoCD",
		logo: "/tech-logos/argocd-original.svg",
	},
	{
		name: "Apache",
		logo: "/tech-logos/apache-original.svg",
	},
	{
		name: "Bitbucket",
		logo: "/tech-logos/bitbucket-original.svg",
	},
];

const TechChip: React.FC<TechItem> = ({ name, logo }) => (
	<div className="flex items-center gap-2 rounded-full border border-slate-200 bg-white/95 px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm backdrop-blur-sm">
		<img
			src={logo}
			alt={name}
			className="h-5 w-5 object-contain"
			loading="lazy"
		/>
		<span>{name}</span>
	</div>
);

export const TechSlider = () => {
	return (
		<section className="my-10 space-y-3">
			<Marquee pauseOnHover speed={25}>
				{toolItems.map((item) => (
					<TechChip key={item.name} {...item} />
				))}
			</Marquee>
			<Marquee pauseOnHover speed={25} reverse>
				{languageItems.map((item) => (
					<TechChip key={item.name} {...item} />
				))}
			</Marquee>
			<Marquee pauseOnHover speed={25}>
				{platforms.map((item) => (
					<TechChip key={item.name} {...item} />
				))}
			</Marquee>
		</section>
	);
};
