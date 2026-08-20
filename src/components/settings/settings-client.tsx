"use client";

import * as React from "react";
import { Plus, Save, ShieldCheck, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { permissionGroups } from "@/lib/permissions";
import { maskKey, formatDate } from "@/lib/utils";

interface RoleRow {
  id: string;
  name: string;
  description: string | null;
  system: boolean;
  userCount: number;
  permissions: string[];
}

interface ApiKeyRow {
  id: string;
  name: string;
  key: string;
  permissions: string | null;
  status: string;
  createdAt: string;
  lastUsedAt: string | null;
}

export function SettingsClient() {
  const [roles, setRoles] = React.useState<RoleRow[]>([]);
  const [availablePermissions, setAvailablePermissions] = React.useState<{ key: string; name: string; group: string; description: string }[]>([]);
  const [apiKeys, setApiKeys] = React.useState<ApiKeyRow[]>([]);
  const [loading, setLoading] = React.useState(true);

  const [editing, setEditing] = React.useState<RoleRow | null>(null);
  const [draftPermissions, setDraftPermissions] = React.useState<string[]>([]);
  const [draftDescription, setDraftDescription] = React.useState("");
  const [saving, setSaving] = React.useState(false);

  const [createOpen, setCreateOpen] = React.useState(false);
  const [newName, setNewName] = React.useState("");
  const [newDescription, setNewDescription] = React.useState("");

  const [newKeyOpen, setNewKeyOpen] = React.useState(false);
  const [newKeyName, setNewKeyName] = React.useState("");
  const [createdKey, setCreatedKey] = React.useState<string | null>(null);

  function loadAll() {
    setLoading(true);
    Promise.all([
      fetch("/api/roles").then((r) => r.json()),
      fetch("/api/apikeys").then((r) => r.json()),
    ])
      .then(([rolesJson, keysJson]) => {
        if (!rolesJson.success) throw new Error(rolesJson.error);
        if (!keysJson.success) throw new Error(keysJson.error);
        setRoles(rolesJson.data.roles);
        setAvailablePermissions(rolesJson.data.availablePermissions);
        setApiKeys(keysJson.data.items);
      })
      .catch((e) => toast.error(e.message))
      .finally(() => setLoading(false));
  }

  React.useEffect(() => {
    loadAll();
  }, []);

  function openEdit(role: RoleRow) {
    setEditing(role);
    setDraftPermissions(role.permissions);
    setDraftDescription(role.description ?? "");
  }

  function togglePermission(key: string) {
    setDraftPermissions((prev) =>
      prev.includes(key) ? prev.filter((p) => p !== key) : [...prev, key]
    );
  }

  async function saveRole() {
    if (!editing) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/roles/${editing.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description: draftDescription, permissions: draftPermissions }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      toast.success("Role updated");
      setEditing(null);
      loadAll();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  async function createRole() {
    setSaving(true);
    try {
      const res = await fetch("/api/roles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newName, description: newDescription }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      toast.success("Role created");
      setCreateOpen(false);
      setNewName("");
      setNewDescription("");
      loadAll();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Create failed");
    } finally {
      setSaving(false);
    }
  }

  async function deleteRole(role: RoleRow) {
    setSaving(true);
    try {
      const res = await fetch(`/api/roles/${role.id}`, { method: "DELETE" });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      toast.success("Role deleted");
      loadAll();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Delete failed");
    } finally {
      setSaving(false);
    }
  }

  async function createApiKey() {
    setSaving(true);
    try {
      const res = await fetch("/api/apikeys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newKeyName }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      setCreatedKey(json.data.rawKey);
      setNewKeyName("");
      loadAll();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Create failed");
    } finally {
      setSaving(false);
    }
  }

  async function revokeKey(id: string) {
    try {
      const res = await fetch(`/api/apikeys/${id}`, { method: "DELETE" });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      toast.success("API key revoked");
      loadAll();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Revoke failed");
    }
  }

  const groups = permissionGroups();

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight text-slate-900">Settings</h1>
        <p className="text-sm text-slate-500">
          Manage roles, fine-grained permissions and API keys.
        </p>
      </div>

      <Tabs defaultValue="roles">
        <TabsList>
          <TabsTrigger value="roles">Roles & Permissions</TabsTrigger>
          <TabsTrigger value="apikeys">API Keys</TabsTrigger>
        </TabsList>

        <TabsContent value="roles" className="space-y-4">
          <div className="flex justify-end">
            <Button onClick={() => setCreateOpen(true)}>
              <Plus className="h-4 w-4" /> New role
            </Button>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {roles.map((role) => (
              <Card key={role.id} className="flex flex-col">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-md bg-blue-50">
                        <ShieldCheck className="h-4 w-4 text-blue-600" />
                      </div>
                      <div>
                        <CardTitle className="capitalize">{role.name}</CardTitle>
                        <p className="mt-1 text-xs text-slate-500">{role.userCount} user(s)</p>
                      </div>
                    </div>
                    <Badge variant={role.system ? "outline" : "blue"}>
                      {role.system ? "System" : "Custom"}
                    </Badge>
                  </div>
                  <CardDescription>{role.description}</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-1 flex-col gap-4">
                  <div className="flex flex-wrap gap-1.5">
                    {role.permissions.slice(0, 5).map((p) => (
                      <span
                        key={p}
                        className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium text-slate-600"
                      >
                        {p.split(".").pop()}
                      </span>
                    ))}
                    {role.permissions.length > 5 && (
                      <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] text-slate-500">
                        +{role.permissions.length - 5}
                      </span>
                    )}
                  </div>
                  <div className="mt-auto flex items-center gap-2">
                    <Button variant="outline" size="sm" className="flex-1" onClick={() => openEdit(role)}>
                      Edit permissions
                    </Button>
                    {!role.system && (
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        className="text-destructive hover:text-destructive"
                        onClick={() => deleteRole(role)}
                        aria-label="Delete role"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="apikeys" className="space-y-4">
          <div className="flex justify-end">
            <Button onClick={() => setNewKeyOpen(true)}>
              <Plus className="h-4 w-4" /> Create API key
            </Button>
          </div>
          <Card>
            <CardContent className="p-0">
              <div className="divide-y">
                {apiKeys.length === 0 && (
                  <p className="p-6 text-sm text-slate-500">No API keys yet. Create one to call the API programmatically.</p>
                )}
                {apiKeys.map((key) => (
                  <div key={key.id} className="flex items-center justify-between gap-4 p-4">
                    <div>
                      <p className="text-sm font-medium text-slate-900">{key.name}</p>
                      <p className="font-mono text-xs text-slate-500">{maskKey(key.key)}</p>
                      <p className="text-xs text-slate-400">Created {formatDate(key.createdAt)}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant={key.status === "active" ? "success" : "destructive"} className="capitalize">
                        {key.status}
                      </Badge>
                      {key.status === "active" && (
                        <Button variant="outline" size="sm" onClick={() => revokeKey(key.id)}>
                          Revoke
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={!!editing} onOpenChange={(open) => !open && setEditing(null)}>
        <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="capitalize">Edit {editing?.name} role</DialogTitle>
            <DialogDescription>
              Grant or revoke fine-grained permissions. Changes apply immediately via JWT role checks.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="role-desc">Description</Label>
              <Input
                id="role-desc"
                value={draftDescription}
                onChange={(e) => setDraftDescription(e.target.value)}
              />
            </div>
            <div className="space-y-5">
              {groups.map((group) => (
                <div key={group}>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
                    {group}
                  </p>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {availablePermissions
                      .filter((p) => p.group === group)
                      .map((permission) => {
                        const checked = draftPermissions.includes(permission.key);
                        return (
                          <label
                            key={permission.key}
                            className={cn(
                              "flex cursor-pointer items-start gap-2.5 rounded-md border p-2.5 transition-colors",
                              checked ? "border-blue-200 bg-blue-50" : "hover:bg-slate-50"
                            )}
                          >
                            <Checkbox
                              checked={checked}
                              onCheckedChange={() => togglePermission(permission.key)}
                              className="mt-0.5"
                            />
                            <div>
                              <p className="text-sm font-medium text-slate-900">{permission.name}</p>
                              <p className="text-xs text-slate-500">{permission.description}</p>
                            </div>
                          </label>
                        );
                      })}
                  </div>
                </div>
              ))}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditing(null)}>Cancel</Button>
            <Button onClick={saveRole} disabled={saving}>
              <Save className="h-4 w-4" />
              {saving ? "Saving…" : "Save role"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={createOpen} onOpenChange={(open) => !open && setCreateOpen(false)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create custom role</DialogTitle>
            <DialogDescription>Create the role first, then assign permissions.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="role-name">Role name</Label>
              <Input
                id="role-name"
                placeholder="coach"
                value={newName}
                onChange={(e) => setNewName(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-"))}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="role-desc-new">Description</Label>
              <Input
                id="role-desc-new"
                placeholder="What can this role do?"
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)}>Cancel</Button>
            <Button onClick={createRole} disabled={saving || !newName}>
              {saving ? "Creating…" : "Create role"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={newKeyOpen} onOpenChange={(open) => !open && setNewKeyOpen(false)}>
        <DialogContent>
          {createdKey ? (
            <>
              <DialogHeader>
                <DialogTitle>API key created</DialogTitle>
                <DialogDescription>
                  Copy this key now — you will not see it again.
                </DialogDescription>
              </DialogHeader>
              <div className="rounded-md border border-blue-200 bg-blue-50 p-3">
                <code className="break-all font-mono text-sm text-blue-700">{createdKey}</code>
              </div>
              <DialogFooter>
                <Button
                  onClick={() => {
                    navigator.clipboard.writeText(createdKey);
                    toast.success("Copied to clipboard");
                  }}
                >
                  Copy key
                </Button>
                <Button variant="outline" onClick={() => { setCreatedKey(null); setNewKeyOpen(false); }}>
                  Done
                </Button>
              </DialogFooter>
            </>
          ) : (
            <>
              <DialogHeader>
                <DialogTitle>Create API key</DialogTitle>
                <DialogDescription>
                  Use the key as a Bearer token against the REST API.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-1.5">
                <Label htmlFor="key-name">Key name</Label>
                <Input
                  id="key-name"
                  placeholder="Production CI"
                  value={newKeyName}
                  onChange={(e) => setNewKeyName(e.target.value)}
                />
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setNewKeyOpen(false)}>Cancel</Button>
                <Button onClick={createApiKey} disabled={saving || !newKeyName}>
                  {saving ? "Creating…" : "Generate key"}
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {loading && <p className="text-sm text-slate-400">Loading…</p>}
    </div>
  );
}
