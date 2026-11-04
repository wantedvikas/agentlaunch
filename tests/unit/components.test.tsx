import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { Button } from "@/components/ui/button";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { createProject } from "@/features/projects/actions";
import { ProjectFormDialog } from "@/features/projects/components/project-form-dialog";

// Server actions can't run in jsdom; the real ones are covered by Playwright and pgTAP.
vi.mock("@/features/projects/actions", () => ({ createProject: vi.fn(), updateProject: vi.fn() }));

describe("Button", () => {
  it("is disabled and busy while loading", () => {
    render(<Button loading>Save</Button>);
    const btn = screen.getByRole("button", { name: "Save" });
    expect(btn).toBeDisabled();
    expect(btn).toHaveAttribute("aria-busy", "true");
  });
});

describe("FormField", () => {
  it("wires label, hint and error to the control", () => {
    const { rerender } = render(
      <FormField label="Name" hint="Shown publicly">
        <Input />
      </FormField>,
    );
    const input = screen.getByLabelText("Name");
    expect(input).toHaveAccessibleDescription("Shown publicly");
    expect(input).not.toHaveAttribute("aria-invalid");

    rerender(
      <FormField label="Name" hint="Shown publicly" error="Required">
        <Input />
      </FormField>,
    );
    expect(screen.getByLabelText("Name")).toHaveAttribute("aria-invalid", "true");
    expect(screen.getByLabelText("Name")).toHaveAccessibleDescription("Required");
  });
});

describe("ProjectFormDialog", () => {
  beforeEach(() => vi.mocked(createProject).mockReset());

  async function openDialog() {
    const user = userEvent.setup();
    render(
      <ProjectFormDialog>
        <Button>New project</Button>
      </ProjectFormDialog>,
    );
    await user.click(screen.getByRole("button", { name: "New project" }));
    await screen.findByRole("dialog", { name: "New project" });
    return user;
  }

  it("validates on the client before calling the server", async () => {
    const user = await openDialog();
    await user.click(screen.getByRole("button", { name: "Create project" }));
    expect(await screen.findByText("Name must be at least 2 characters.")).toBeInTheDocument();
    expect(createProject).not.toHaveBeenCalled();
  });

  it("submits trimmed values and closes on success", async () => {
    vi.mocked(createProject).mockResolvedValue({ ok: true });
    const user = await openDialog();
    await user.type(screen.getByLabelText(/^name/i), "  Atlas  ");
    await user.click(screen.getByRole("button", { name: "Create project" }));
    expect(createProject).toHaveBeenCalledWith({
      name: "Atlas",
      description: "",
      status: "active",
    });
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
  });

  it("shows the server's error and stays open", async () => {
    vi.mocked(createProject).mockResolvedValue({
      ok: false,
      error: "Your session has ended. Sign in again.",
    });
    const user = await openDialog();
    await user.type(screen.getByLabelText(/^name/i), "Atlas");
    await user.click(screen.getByRole("button", { name: "Create project" }));
    expect(await screen.findByText("Your session has ended. Sign in again.")).toBeInTheDocument();
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });
});
