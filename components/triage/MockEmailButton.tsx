"use client";

import { useMutation } from "convex/react";
import { Loader2, Plus, Send, Trash2, X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { api } from "@/convex/_generated/api";

export function MockEmailButton() {
	const sendMockEmail = useMutation(api.emails.triggerMockEmail);
	const clearTestData = useMutation(api.emails.clearTestData);

	const [showForm, setShowForm] = useState(false);
	const [from, setFrom] = useState("");
	const [subject, setSubject] = useState("");
	const [body, setBody] = useState("");
	const [sending, setSending] = useState(false);
	const [sent, setSent] = useState(false);
	const [clearing, setClearing] = useState(false);

	const handleSend = async () => {
		if (!from || !subject || !body) return;
		setSending(true);
		try {
			await sendMockEmail({ from, subject, body });
			setFrom("");
			setSubject("");
			setBody("");
			setShowForm(false);
			setSent(true);
			setTimeout(() => setSent(false), 3000);
		} catch (err) {
			console.error("[MockEmailButton] send failed", err);
		} finally {
			setSending(false);
		}
	};

	const handleClear = async () => {
		setClearing(true);
		try {
			await clearTestData();
		} catch (err) {
			console.error("[MockEmailButton] clear failed", err);
		} finally {
			setClearing(false);
		}
	};

	return (
		<div className="flex flex-col items-center pt-2">
			{!showForm ? (
				<div className="flex gap-2">
					<Button variant="outline" size="sm" onClick={() => setShowForm(true)}>
						<Plus className="size-4 mr-1.5" />
						Send Test Email
					</Button>
					<Button
						variant="outline"
						size="sm"
						onClick={handleClear}
						disabled={clearing}
						className="text-error hover:text-error"
					>
						<Trash2 className="size-4 mr-1.5" />
						{clearing ? "Clearing..." : "Clear Test Emails"}
					</Button>
				</div>
			) : (
				<div className="w-full max-w-md bg-surface border border-border rounded-lg p-4 space-y-3 shadow-card">
					<div className="flex items-center justify-between">
						<span className="text-sm font-medium text-text-primary">
							New Test Email
						</span>
						<button
							onClick={() => setShowForm(false)}
							className="text-text-muted hover:text-text-primary transition-colors"
						>
							<X className="size-4" />
						</button>
					</div>
					<div>
						<label className="block text-xs font-medium text-text-secondary mb-1">
							From
						</label>
						<input
							type="text"
							value={from}
							onChange={(e) => setFrom(e.target.value)}
							placeholder="customer@example.com"
							className="w-full bg-bg-primary border border-border rounded-md px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
						/>
					</div>
					<div>
						<label className="block text-xs font-medium text-text-secondary mb-1">
							Subject
						</label>
						<input
							type="text"
							value={subject}
							onChange={(e) => setSubject(e.target.value)}
							placeholder="Where is my order?"
							className="w-full bg-bg-primary border border-border rounded-md px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
						/>
					</div>
					<div>
						<label className="block text-xs font-medium text-text-secondary mb-1">
							Body
						</label>
						<textarea
							value={body}
							onChange={(e) => setBody(e.target.value)}
							placeholder="I placed an order on Monday and haven't received any shipping updates..."
							rows={3}
							className="w-full bg-bg-primary border border-border rounded-md px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all resize-none"
						/>
					</div>
					<div className="flex gap-2 pt-1">
						<Button
							size="sm"
							onClick={handleSend}
							disabled={sending || !from || !subject || !body}
							className="gap-1.5"
						>
							{sending ? (
								<Loader2 className="size-3.5 animate-spin" />
							) : (
								<Send className="size-3.5" />
							)}
							{sending ? "Sending..." : "Send"}
						</Button>
						<Button
							size="sm"
							variant="outline"
							onClick={() => setShowForm(false)}
						>
							Cancel
						</Button>
					</div>
				</div>
			)}
			{sent && (
				<p className="mt-2 text-xs text-success-dark">
					Test email sent! Check the feed above.
				</p>
			)}
		</div>
	);
}
