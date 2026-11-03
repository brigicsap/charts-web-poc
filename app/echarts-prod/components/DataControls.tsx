"use client";

import { ChevronLeft, ChevronRight, RotateCw } from "lucide-react";
import type { Resolution } from "../data/contracts";

export function DataControls({
	date,
	resolution,
	onDateChange,
	onResolutionChange,
	onPrevious,
	onNext,
	onRefresh,
	fetching,
}: {
	date: string;
	resolution: Resolution;
	onDateChange: (date: string) => void;
	onResolutionChange: (resolution: Resolution) => void;
	onPrevious?: () => void;
	onNext?: () => void;
	onRefresh: () => void;
	fetching: boolean;
}) {
	return (
		<div className="flex flex-wrap items-center justify-between gap-3">
			<fieldset className="flex gap-1" aria-label="Resolution">
				{(["day", "week"] as const).map((value) => (
					<button
						key={value}
						type="button"
						aria-pressed={resolution === value}
						onClick={() => onResolutionChange(value)}
						className={`rounded px-3 py-1 text-sm ${resolution === value ? "bg-zinc-800 text-white" : "bg-zinc-200 text-zinc-700"}`}
					>
						{value === "day" ? "Day" : "Week"}
					</button>
				))}
			</fieldset>
			<div className="flex items-center gap-2">
				<button
					type="button"
					title="Previous period"
					aria-label="Previous period"
					disabled={!onPrevious}
					onClick={onPrevious}
					className="grid h-8 w-8 place-items-center rounded border border-zinc-300 disabled:opacity-30"
				>
					<ChevronLeft size={16} />
				</button>
				<input
					type="date"
					aria-label="Date"
					value={date}
					min="2000-01-01"
					max="2099-12-31"
					onChange={(event) => {
						if (event.target.value) onDateChange(event.target.value);
					}}
					className="h-8 min-w-0 rounded border border-zinc-300 bg-transparent px-2 text-sm"
				/>
				<button
					type="button"
					title="Next period"
					aria-label="Next period"
					disabled={!onNext}
					onClick={onNext}
					className="grid h-8 w-8 place-items-center rounded border border-zinc-300 disabled:opacity-30"
				>
					<ChevronRight size={16} />
				</button>
				<button
					type="button"
					title="Refresh"
					aria-label="Refresh"
					disabled={fetching}
					onClick={onRefresh}
					className="grid h-8 w-8 place-items-center rounded border border-zinc-300 disabled:opacity-30"
				>
					<RotateCw size={16} className={fetching ? "animate-spin" : ""} />
				</button>
			</div>
		</div>
	);
}

export function DataState({
	pending,
	error,
	empty,
	retry,
}: {
	pending: boolean;
	error: Error | null;
	empty: boolean;
	retry: () => void;
}) {
	if (pending)
		return (
			<div
				role="status"
				className="grid h-[300px] place-items-center text-sm text-zinc-500"
			>
				Loading...
			</div>
		);
	if (error)
		return (
			<div
				role="alert"
				className="flex h-[300px] flex-col items-center justify-center gap-3 text-sm"
			>
				<p>{error.message}</p>
				<button
					type="button"
					onClick={retry}
					className="flex items-center gap-2 rounded border border-zinc-300 px-3 py-1"
				>
					<RotateCw size={14} />
					Retry
				</button>
			</div>
		);
	if (empty)
		return (
			<div
				role="status"
				className="grid h-[300px] place-items-center text-sm text-zinc-500"
			>
				No data for this period
			</div>
		);
	return null;
}

export function DataDetails({
	request,
	response,
	mapped,
}: {
	request: string;
	response: unknown;
	mapped: unknown;
}) {
	return (
		<details className="text-xs text-zinc-600 dark:text-zinc-400">
			<summary className="cursor-pointer">Request & data</summary>
			<pre className="mt-2 max-h-72 overflow-auto rounded bg-zinc-100 p-3 dark:bg-zinc-900">
				{JSON.stringify({ request, response, mapped }, null, 2)}
			</pre>
		</details>
	);
}
