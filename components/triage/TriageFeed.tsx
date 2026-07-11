"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { motion } from "motion/react";
import { api } from "@/convex/_generated/api";
import { FeedErrorBoundary } from "@/components/triage/FeedErrorBoundary";
import { TriageStatsBar } from "@/components/triage/TriageStatsBar";
import { DecisionFilters } from "@/components/triage/DecisionFilters";
import { DecisionCard } from "@/components/triage/DecisionCard";
import { DecisionCardSkeleton } from "@/components/triage/DecisionCardSkeleton";
import { TriageEmptyState } from "@/components/triage/TriageEmptyState";
import { MockEmailButton } from "@/components/triage/MockEmailButton";
import { Button } from "@/components/ui/button";
import { mockDecisions } from "@/lib/mock-triage-data";
import { staggerContainer, staggerItem } from "@/lib/variants";
import type { FilterTab, SortOption, TriageDecisionDisplay } from "@/types";
import { useRouter } from "next/navigation";

const ITEMS_PER_PAGE = 5;

function filterMockData(
  decisions: TriageDecisionDisplay[],
  filter: FilterTab,
  search: string,
  sort: SortOption,
): TriageDecisionDisplay[] {
  let filtered = decisions;

  if (filter === "failed") {
    return [];
  }

  if (filter === "pending") {
    filtered = filtered.filter(
      (d) => d.action === "escalate" && d.escalationStatus === "pending",
    );
  } else if (filter !== "all") {
    filtered = filtered.filter((d) => d.action === filter);
  }

  if (search.trim()) {
    const q = search.toLowerCase();
    filtered = filtered.filter(
      (d) =>
        d.subject.toLowerCase().includes(q) ||
        d.fromName.toLowerCase().includes(q) ||
        d.fromEmail.toLowerCase().includes(q),
    );
  }

  const sorted = [...filtered];
  if (sort === "newest") {
    sorted.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
  } else if (sort === "oldest") {
    sorted.sort(
      (a, b) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
    );
  } else if (sort === "priority") {
    const priorityOrder: Record<string, number> = {
      urgent: 0,
      high: 1,
      medium: 2,
      low: 3,
    };
    sorted.sort((a, b) => {
      const pa = a.priority ? (priorityOrder[a.priority] ?? 99) : 99;
      const pb = b.priority ? (priorityOrder[b.priority] ?? 99) : 99;
      return pa - pb;
    });
  }

  return sorted;
}

function TriageFeedInner() {
  const router = useRouter();
  const [activeFilter, setActiveFilter] = useState<FilterTab>("all");
  const [sortBy, setSortBy] = useState<SortOption>("newest");
  const [searchQuery, setSearchQuery] = useState("");
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE);

  const decisions = useQuery(api.triage.getTriageFeed, {
    filter: activeFilter === "all" ? undefined : activeFilter,
    sortBy,
    search: searchQuery || undefined,
  });
  const triageStats = useQuery(api.triage.getTriageStats);
  const connection = useQuery(api.inboxConnections.getConnection);
  const isLoading = decisions === undefined || connection === undefined || triageStats === undefined;

  const connected = !!connection;
  const hasRealData = decisions && decisions.length > 0;

  const showMock = !hasRealData && !connected;

  const displayData: TriageDecisionDisplay[] = hasRealData
    ? (decisions as TriageDecisionDisplay[])
    : showMock
      ? filterMockData(mockDecisions, activeFilter, searchQuery, sortBy)
      : [];

  const visible = displayData.slice(0, visibleCount);
  const hasMore = visibleCount < displayData.length;

  const handleShowMore = () => {
    setVisibleCount((prev) => prev + ITEMS_PER_PAGE);
  };

  const handleFilterChange = (filter: FilterTab) => {
    setActiveFilter(filter);
    setVisibleCount(ITEMS_PER_PAGE);
  };

  return (
    <div className="space-y-6">
      <TriageStatsBar
        emailsToday={triageStats?.emailsToday ?? 0}
        autoReplied={triageStats?.autoReplied ?? 0}
        escalationsPending={triageStats?.escalationsPending ?? 0}
      />

      <DecisionFilters
        activeFilter={activeFilter}
        onFilterChange={handleFilterChange}
        sortBy={sortBy}
        onSortChange={setSortBy}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <DecisionCardSkeleton key={i} />
          ))}
        </div>
      ) : displayData.length > 0 ? (
        <>
          <motion.div
            className="space-y-3"
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
          >
            {visible.map((decision) => (
              <motion.div key={decision.id} variants={staggerItem}>
                <DecisionCard
                  decision={decision}
                  onClick={() => router.push(`/dashboard/decisions/${decision.id}`)}
                />
              </motion.div>
            ))}
          </motion.div>

          {hasMore && (
            <div className="flex justify-center pt-2">
              <Button variant="outline" size="sm" onClick={handleShowMore}>
                Show More
              </Button>
            </div>
          )}
        </>
      ) : (
        <TriageEmptyState
          hasConnection={connected}
          connectionLabel={connection?.email ?? null}
        />
      )}

      <MockEmailButton />
    </div>
  );
}

export function TriageFeed() {
  return (
    <FeedErrorBoundary>
      <TriageFeedInner />
    </FeedErrorBoundary>
  );
}
