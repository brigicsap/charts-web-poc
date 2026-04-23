"use client";

import Markdown from "react-markdown";

export default function NotesBox({ content }: { content: string }) {
	return (
		<div className="w-full rounded-lg bg-zinc-100 dark:bg-zinc-800 p-4">
			<div className="prose prose-sm dark:prose-invert max-w-none [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5">
				<Markdown>{content}</Markdown>
			</div>
		</div>
	);
}
