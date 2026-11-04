import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { Button } from "@/components/ui/button";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { ProjectFormDialog } from "@/features/projects/components/project-form-dialog";

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
  it("shows validation errors, then an honest not-saved notice on valid input", async () => {
    const user = userEvent.setup();
    render(<ProjectFormDialog />);

    await user.click(screen.getByRole("button", { name: /new project/i }));
    const dialog = await screen.findByRole("dialog", { name: "New project" });
    expect(dialog).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Create project" }));
    expect(await screen.findByText("Name must be at least 2 characters.")).toBeInTheDocument();

    await user.type(screen.getByLabelText(/name/i), "Atlas");
    await user.click(screen.getByRole("button", { name: "Create project" }));
    expect(await screen.findByText("Not saved")).toBeInTheDocument();
  });
});
