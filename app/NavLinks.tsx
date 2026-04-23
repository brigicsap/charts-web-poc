"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
	{ href: "/recharts", label: "Recharts" },
	{ href: "/victory", label: "Victory" },
	{ href: "/echarts", label: "ECharts" },
];

export default function NavLinks() {
	const pathname = usePathname();
	return (
		<div className="flex flex-wrap gap-2">
			{links.map(({ href, label }) => {
				const active = pathname === href;
				return (
					<Link
						key={href}
						href={href}
						className={`flex h-8 items-center rounded-full border border-solid px-4 text-sm font-medium transition-colors ${
							active
								? "border-black bg-black text-white dark:border-white dark:bg-white dark:text-black"
								: "border-black/[.08] hover:border-transparent hover:bg-black/[.04] dark:border-white/[.145] dark:hover:bg-[#1a1a1a]"
						}`}
					>
						{label}
					</Link>
				);
			})}
		</div>
	);
}
