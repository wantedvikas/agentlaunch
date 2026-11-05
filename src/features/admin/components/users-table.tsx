import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import type { AdminUser } from "../queries";

const dateFmt = new Intl.DateTimeFormat("en", { dateStyle: "medium", timeZone: "UTC" });

export function UsersTable({ users }: { users: AdminUser[] }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>User</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="hidden sm:table-cell">Joined</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {users.map((u) => (
          <TableRow key={u.id}>
            <TableCell className="max-w-64">
              <p className="truncate font-medium">{u.email}</p>
              {u.display_name && (
                <p className="truncate text-xs text-muted-foreground">{u.display_name}</p>
              )}
            </TableCell>
            <TableCell>
              <div className="flex flex-wrap gap-1">
                {u.is_admin && <Badge variant="accent">Admin</Badge>}
                {u.is_paying && <Badge variant="success">Paying</Badge>}
                {!u.is_admin && !u.is_paying && <Badge variant="secondary">Free</Badge>}
              </div>
            </TableCell>
            <TableCell className="hidden whitespace-nowrap text-muted-foreground sm:table-cell">
              <time dateTime={u.created_at}>{dateFmt.format(new Date(u.created_at))}</time>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
