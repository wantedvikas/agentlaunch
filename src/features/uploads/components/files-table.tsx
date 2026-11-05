"use client";

import { Download, Trash2 } from "lucide-react";
import * as React from "react";

import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "@/components/ui/toast";

import { deleteFile } from "../actions";
import type { StoredFile } from "../queries";

const sizeFmt = (bytes: number) =>
  bytes < 1024
    ? `${bytes} B`
    : bytes < 1024 ** 2
      ? `${(bytes / 1024).toFixed(1)} KB`
      : `${(bytes / 1024 ** 2).toFixed(1)} MB`;

export function FilesTable({ files }: { files: StoredFile[] }) {
  const [pendingPath, setPendingPath] = React.useState<string | null>(null);

  async function remove(file: StoredFile) {
    setPendingPath(file.path);
    const result = await deleteFile(file.path);
    setPendingPath(null);
    toast(
      result.ok
        ? { title: "File deleted", variant: "success" }
        : { title: "Delete failed", description: result.error, variant: "error" },
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead className="hidden sm:table-cell">Size</TableHead>
          <TableHead className="w-0 text-right">
            <span className="sr-only">Actions</span>
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {files.map((f) => (
          <TableRow key={f.path}>
            <TableCell className="max-w-64">
              <p className="truncate font-medium">{f.name}</p>
              <p className="text-xs text-muted-foreground">{f.type}</p>
            </TableCell>
            <TableCell className="hidden whitespace-nowrap text-muted-foreground sm:table-cell">
              {sizeFmt(f.size)}
            </TableCell>
            <TableCell>
              <div className="flex justify-end gap-1">
                {f.url && (
                  <Button asChild variant="ghost" size="sm">
                    {/* Signed link, valid for 60 seconds; reload the page for a fresh one. */}
                    <a
                      href={f.url}
                      target="_blank"
                      rel="noreferrer"
                      aria-label={`Download ${f.name}`}
                    >
                      <Download aria-hidden />
                    </a>
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  aria-label={`Delete ${f.name}`}
                  loading={pendingPath === f.path}
                  onClick={() => remove(f)}
                >
                  {pendingPath !== f.path && <Trash2 aria-hidden />}
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
