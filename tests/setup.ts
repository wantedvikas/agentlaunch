import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach, vi } from "vitest";

afterEach(() => cleanup());

// `server-only` throws outside Next's server bundle; unit tests import server modules directly.
vi.mock("server-only", () => ({}));
