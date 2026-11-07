import React from "react";
import { beforeEach, expect, it, vi } from "vitest";
import { render, screen, fireEvent, waitFor, within } from "@/test/test-utils";
import { getFunctionName } from "convex/server";
import { ConvexError } from "convex/values";
import AnnouncementsPage from "./page";

const mocks = vi.hoisted(() => ({ rows: [] as any[], save: vi.fn(), status: vi.fn(), remove: vi.fn(), pagination: "Exhausted", loadMore: vi.fn() }));
vi.mock("convex/react", () => ({
  usePaginatedQuery: () => ({ results: mocks.rows, status: mocks.pagination, loadMore: mocks.loadMore }),
  useMutation: (ref: any) => getFunctionName(ref).endsWith("saveDraft") ? mocks.save : getFunctionName(ref).endsWith("remove") ? mocks.remove : mocks.status,
}));
const draft = { _id: "announcement_1", title: "New review materials", body: "A new set of materials is ready.", status: "draft", updatedAt: 1000 };
beforeEach(() => { vi.clearAllMocks(); mocks.rows = []; mocks.pagination = "Exhausted"; mocks.save.mockResolvedValue("announcement_1"); mocks.status.mockResolvedValue(undefined); mocks.remove.mockResolvedValue(undefined); });

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

it("shows public conflict data and preserves unsaved editor content", async () => {
  const message = "This announcement changed. Close the editor and reopen it before trying again.";
  const error = new ConvexError(message);
  error.message = "Server Error";
  mocks.rows = [draft]; mocks.save.mockRejectedValue(error);
  render(<AnnouncementsPage />);
  fireEvent.click(screen.getByRole("button", { name: "Edit" }));
  fireEvent.click(screen.getByRole("button", { name: "Save Draft" }));
  expect(await screen.findByRole("alert")).toHaveTextContent(message);
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


it("shows public conflict data when publishing a stale preview", async () => {
  const message = "This announcement changed. Close the editor and reopen it before trying again.";
  const error = new ConvexError(message);
  error.message = "Server Error";
  mocks.rows = [draft]; mocks.status.mockRejectedValue(error);
  render(<AnnouncementsPage />);
  fireEvent.click(screen.getByRole("button", { name: "Publish" }));
  fireEvent.click(screen.getByRole("button", { name: "Publish announcement" }));
  expect(await screen.findByRole("alert")).toHaveTextContent(message);
  expect(screen.getByRole("dialog")).toBeInTheDocument();
});

it("uses a safe fallback for unexpected mutation failures", async () => {
  mocks.rows = [draft]; mocks.save.mockRejectedValue(new Error("Internal backend details"));
  render(<AnnouncementsPage />);
  fireEvent.click(screen.getByRole("button", { name: "Edit" }));
  fireEvent.click(screen.getByRole("button", { name: "Save Draft" }));
  expect(await screen.findByRole("alert")).toHaveTextContent("Unable to save. Please try again.");
  expect(screen.queryByText("Internal backend details")).not.toBeInTheDocument();
});


it.each(["draft", "archived", "published"])("requires confirmation before deleting a %s announcement", async status => {
  mocks.rows = [{ ...draft, status }];
  render(<AnnouncementsPage />);
  fireEvent.click(screen.getByRole("button", { name: "Delete" }));
  const dialog = screen.getByRole("dialog", { name: "Delete announcement" });
  expect(within(dialog).getByText(draft.title)).toBeInTheDocument();
  expect(dialog).toHaveTextContent("This cannot be undone.");
  if (status === "published") expect(dialog).toHaveTextContent("immediately removes it");
  expect(mocks.remove).not.toHaveBeenCalled();
  fireEvent.click(within(dialog).getByRole("button", { name: "Cancel" }));
  expect(mocks.remove).not.toHaveBeenCalled();
  fireEvent.click(screen.getByRole("button", { name: "Delete" }));
  fireEvent.click(screen.getByRole("button", { name: "Delete permanently" }));
  await waitFor(() => expect(mocks.remove).toHaveBeenCalledWith({ id: draft._id, expectedUpdatedAt: draft.updatedAt }));
  await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
});

it("keeps failed delete confirmations open and can reopen with the latest version", async () => {
  const message = "This announcement changed. Close the delete confirmation and reopen it before trying again.";
  mocks.rows = [draft]; mocks.remove.mockRejectedValueOnce(new ConvexError(message));
  const { rerender } = render(<AnnouncementsPage />);
  fireEvent.click(screen.getByRole("button", { name: "Delete" }));
  mocks.rows = [{ ...draft, title: "Updated announcement", updatedAt: 2000 }];
  rerender(<AnnouncementsPage />);
  fireEvent.click(screen.getByRole("button", { name: "Delete permanently" }));
  expect(await screen.findByRole("alert")).toHaveTextContent(message);
  expect(mocks.remove).toHaveBeenLastCalledWith({ id: draft._id, expectedUpdatedAt: 1000 });
  fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
  fireEvent.click(screen.getByRole("button", { name: "Delete" }));
  expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole("button", { name: "Delete permanently" }));
  await waitFor(() => expect(mocks.remove).toHaveBeenLastCalledWith({ id: draft._id, expectedUpdatedAt: 2000 }));
});

it("blocks repeat deletion and dismissal while a delete request is pending", async () => {
  let finish!: () => void;
  mocks.remove.mockReturnValue(new Promise<void>(resolve => { finish = resolve; }));
  mocks.rows = [draft]; render(<AnnouncementsPage />);
  fireEvent.click(screen.getByRole("button", { name: "Delete" }));
  fireEvent.click(screen.getByRole("button", { name: "Delete permanently" }));
  expect(screen.getByRole("button", { name: "Deleting…" })).toBeDisabled();
  expect(screen.getByRole("button", { name: "Cancel" })).toBeDisabled();
  fireEvent.click(screen.getByRole("button", { name: "Close modal" }));
  expect(screen.getByRole("dialog")).toBeInTheDocument();
  expect(mocks.remove).toHaveBeenCalledTimes(1);
  finish();
  await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
});
