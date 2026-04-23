import Link from "next/link";

export default function Home() {
	return (
		<div className="flex flex-col flex-1 items-center justify-center bg-zinc-50 font-sans dark:bg-black">
			<main className="flex flex-1 w-full max-w-3xl flex-col items-center gap-8 py-32 px-16 bg-white dark:bg-black sm:items-start">
				<h1 className="text-3xl font-semibold tracking-tight text-black dark:text-zinc-50">
					Charts POC
				</h1>
				<div className="flex flex-col gap-4 text-base font-medium sm:flex-row">
					<Link
						href="/recharts"
						className="flex h-12 w-full items-center justify-center rounded-full border border-solid border-black/[.08] px-5 transition-colors hover:border-transparent hover:bg-black/[.04] dark:border-white/[.145] dark:hover:bg-[#1a1a1a] md:w-[158px]"
					>
						Recharts
					</Link>
					<Link
						href="/victory"
						className="flex h-12 w-full items-center justify-center rounded-full border border-solid border-black/[.08] px-5 transition-colors hover:border-transparent hover:bg-black/[.04] dark:border-white/[.145] dark:hover:bg-[#1a1a1a] md:w-[158px]"
					>
						Victory
					</Link>
					<Link
						href="/echarts"
						className="flex h-12 w-full items-center justify-center rounded-full border border-solid border-black/[.08] px-5 transition-colors hover:border-transparent hover:bg-black/[.04] dark:border-white/[.145] dark:hover:bg-[#1a1a1a] md:w-[158px]"
					>
						ECharts
					</Link>
				</div>
			</main>
		</div>
	);
}
