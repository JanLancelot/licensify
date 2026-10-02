import React from "react";
import { beforeEach, expect, it, vi } from "vitest";
import { render, screen, fireEvent, waitFor, within } from "@/test/test-utils";
import { getFunctionName } from "convex/server";
import AnnouncementsPage from "./page";

const mocks = vi.hoisted(() => ({ rows: [] as any[], save: vi.fn(), status: vi.fn(), pagination: "Exhausted", loadMore: vi.fn() }));
vi.mock("convex/react", () => ({
  usePaginatedQuery: () => ({ results: mocks.rows, status: mocks.pagination, loadMore: mocks.loadMore }),
  useMutation: (ref: any) => getFunctionName(ref).endsWith("saveDraft") ? mocks.save : mocks.status,
}));
const draft = { _id: "announcement_1", title: "New review materials", body: "A new set of materials is ready.", status: "draft", updatedAt: 1000 };
beforeEach(() => { vi.clearAllMocks(); mocks.rows = []; mocks.pagination = "Exhausted"; mocks.save.mockResolvedValue("announcement_1"); mocks.status.mockResolvedValue(undefined); });

it("starts empty without creating or publishing anything", () => {
  render(<AnnouncementsPage />);
  expect(screen.getByText("No announcements yet")).toBeInTheDocument();
  expect(mocks.save).not.toHaveBeenCalled();
  expect(mocks.status).not.toHaveBeenCalled();
});

it("previews unsaved content and saves it only as a draft", async () => {
  render(<AnnouncementsPage />);
  fireEvent.click(screen.getByRole("button", { name: "Create announcement" }));
  expect(screen.getByRole("button", { name: "Save Draft" })).toBeDisabled();
  fireEvent.change(screen.getByLabelText("Title"), { target: { value: "Update" } });
  fireEvent.change(screen.getByLabelText("Message"), { target: { value: "Details" } });
  fireEvent.click(screen.getByRole("button", { name: "Preview" }));
  expect(within(screen.getByRole("region", { name: "Announcement preview" })).getByText("Details")).toBeInTheDocument();
  expect(mocks.save).not.toHaveBeenCalled();
  fireEvent.click(screen.getByRole("button", { name: "Save Draft" }));
  await waitFor(() => expect(mocks.save).toHaveBeenCalledWith({ id: undefined, expectedUpdatedAt: undefined, title: "Update", body: "Details" }));
  expect(mocks.status).not.toHaveBeenCalled();
});

it("requires an explicit publish action after reviewing the saved draft", async () => {
  mocks.rows = [draft]; render(<AnnouncementsPage />);
  fireEvent.click(screen.getByRole("button", { name: "Publish" }));
  expect(mocks.status).not.toHaveBeenCalled();
  fireEvent.click(screen.getByRole("button", { name: "Publish announcement" }));
  await waitFor(() => expect(mocks.status).toHaveBeenCalledWith({ id: draft._id, expectedUpdatedAt: 1000, status: "published" }));
});

it("shows mutation failures and preserves editor content for retry", async () => {
  mocks.rows = [draft]; mocks.save.mockRejectedValue(new Error("This announcement changed."));
  render(<AnnouncementsPage />);
  fireEvent.click(screen.getByRole("button", { name: "Edit" }));
  fireEvent.click(screen.getByRole("button", { name: "Save Draft" }));
  expect(await screen.findByRole("alert")).toHaveTextContent("This announcement changed.");
  expect(screen.getByLabelText("Title")).toHaveValue(draft.title);
});

it("unpublishes live content and does not allow editing it directly", async () => {
  mocks.rows = [{ ...draft, status: "published" }]; render(<AnnouncementsPage />);
  expect(screen.queryByRole("button", { name: "Edit" })).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole("button", { name: "Unpublish" }));
  await waitFor(() => expect(mocks.status).toHaveBeenCalledWith({ id: draft._id, expectedUpdatedAt: 1000, status: "draft" }));
});

it("shows loading and supports loading more announcements", () => {
  mocks.pagination = "LoadingFirstPage";
  const { rerender } = render(<AnnouncementsPage />);
  expect(screen.getByRole("status")).toHaveTextContent("Loading announcements");
  expect(screen.queryByText("No announcements yet")).not.toBeInTheDocument();
  mocks.rows = [draft]; mocks.pagination = "CanLoadMore";
  rerender(<AnnouncementsPage />);
  fireEvent.click(screen.getByRole("button", { name: "Load more" }));
  expect(mocks.loadMore).toHaveBeenCalledWith(20);
});
