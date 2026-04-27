type LegendItem = {
	label: string;
	color: string;
	valueText: string;
};

export default function LegendValues({
	items,
	isInteractive,
}: {
	items: LegendItem[];
	isInteractive: boolean;
}) {
	return (
		<div className="flex w-full flex-wrap items-center justify-end gap-4 text-sm">
			{isInteractive ? (
				<span className="rounded bg-zinc-100 px-2 py-0.5 text-xs text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
					Highlighted
				</span>
			) : null}
			{items.map((item) => (
				<div key={item.label} className="flex items-center gap-2">
					<span
						className="h-3 w-3 rounded-sm"
						style={{ backgroundColor: item.color }}
					/>
					<span className="text-zinc-600 dark:text-zinc-300">{item.label}</span>
					<span className="font-medium text-black dark:text-zinc-100">
						{item.valueText}
					</span>
				</div>
			))}
		</div>
	);
}
