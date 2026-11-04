import { Pencil } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import type { Project } from "../queries";
import { statusLabels } from "../schema";

import { DeleteProjectButton } from "./delete-project-button";
import { ProjectFormDialog } from "./project-form-dialog";

const statusVariant = { active: "success", paused: "warning", archived: "secondary" } as const;
const dateFmt = new Intl.DateTimeFormat("en", { dateStyle: "medium", timeZone: "UTC" });

export function ProjectsTable({ projects }: { projects: Project[] }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="hidden sm:table-cell">Updated</TableHead>
          <TableHead className="w-0 text-right">
            <span className="sr-only">Actions</span>
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {projects.map((p) => (
          <TableRow key={p.id}>
            <TableCell className="max-w-64">
              <p className="truncate font-medium">{p.name}</p>
              {p.description && (
                <p className="truncate text-xs text-muted-foreground">{p.description}</p>
              )}
            </TableCell>
            <TableCell>
              <Badge variant={statusVariant[p.status]}>{statusLabels[p.status]}</Badge>
            </TableCell>
            <TableCell className="hidden whitespace-nowrap text-muted-foreground sm:table-cell">
              <time dateTime={p.updated_at}>{dateFmt.format(new Date(p.updated_at))}</time>
            </TableCell>
            <TableCell>
              <div className="flex justify-end gap-1">
                <ProjectFormDialog project={p}>
                  <Button variant="ghost" size="sm" aria-label={`Edit ${p.name}`}>
                    <Pencil aria-hidden />
                  </Button>
                </ProjectFormDialog>
                <DeleteProjectButton id={p.id} name={p.name} />
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
