export default function LegendValues({
	items,
	isInteractive = false,
}: {
	items: { label: string; color: string; valueText: string }[];
	isInteractive?: boolean;
}) {
	return (
		<div className="flex flex-wrap gap-x-6 gap-y-2" aria-live="polite">
			{items.map((item) => (
				<div key={item.label} className="flex items-start gap-2">
					<span
						className="mt-1 h-3 w-3 shrink-0 rounded-sm"
						style={{ backgroundColor: item.color }}
					/>
					<div>
						<div className="text-xs text-zinc-500 dark:text-zinc-400">
							{item.label}
						</div>
						<div
							className={`text-sm tabular-nums ${isInteractive ? "font-semibold" : "font-medium"}`}
						>
							{item.valueText}
						</div>
					</div>
				</div>
			))}
		</div>
	);
}
