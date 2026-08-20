"use client";

import * as React from "react";
import { MoreHorizontal, Plus, UploadCloud } from "lucide-react";
import { toast } from "sonner";
import { DataTable } from "@/components/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import type { ColumnDef } from "@tanstack/react-table";
import { formatDate, slugify, truncate } from "@/lib/utils";

interface ExerciseRow {
  id: string;
  name: string;
  slug: string;
  category: string;
  muscleGroup: string;
  difficulty: string;
  equipment: string | null;
  description: string;
  instructions: string;
  imageUrl: string | null;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
}

interface ArticleRow {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  status: string;
  coverImage: string | null;
  createdAt: string;
  publishedAt: string | null;
  author: { id: string; name: string | null } | null;
}

interface ListResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}

type TabKey = "exercises" | "articles";

export function ContentClient() {
  const [tab, setTab] = React.useState<TabKey>("exercises");

  const [exercises, setExercises] = React.useState<ExerciseRow[]>([]);
  const [exerciseTotal, setExerciseTotal] = React.useState(0);
  const [articles, setArticles] = React.useState<ArticleRow[]>([]);
  const [articleTotal, setArticleTotal] = React.useState(0);
  const [loading, setLoading] = React.useState(true);
  const [exPage, setExPage] = React.useState(1);
  const [arPage, setArPage] = React.useState(1);
  const [exSearch, setExSearch] = React.useState("");
  const [arSearch, setArSearch] = React.useState("");
  const [exDebounced, setExDebounced] = React.useState("");
  const [arDebounced, setArDebounced] = React.useState("");

  const [formOpen, setFormOpen] = React.useState(false);
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [saving, setSaving] = React.useState(false);
  const [uploading, setUploading] = React.useState(false);
  const [deleting, setDeleting] = React.useState<{ type: TabKey; id: string; name: string } | null>(null);

  const emptyExercise = {
    name: "",
    slug: "",
    category: "",
    muscleGroup: "",
    difficulty: "beginner",
    equipment: "",
    description: "",
    instructions: "",
    imageUrl: "",
    isPublished: true,
  };
  const emptyArticle = {
    title: "",
    slug: "",
    excerpt: "",
    content: "",
    coverImage: "",
    status: "draft",
    tags: "",
  };
  const [exForm, setExForm] = React.useState(emptyExercise);
  const [arForm, setArForm] = React.useState(emptyArticle);

  React.useEffect(() => {
    const t = setTimeout(() => setExDebounced(exSearch), 350);
    return () => clearTimeout(t);
  }, [exSearch]);
  React.useEffect(() => {
    const t = setTimeout(() => setArDebounced(arSearch), 350);
    return () => clearTimeout(t);
  }, [arSearch]);

  function loadExercises(page: number, search: string) {
    const params = new URLSearchParams({ page: String(page), pageSize: "10" });
    if (search) params.set("search", search);
    fetch(`/api/exercises?${params}`)
      .then((r) => r.json())
      .then((json: ListResponse<ExerciseRow> & { success: boolean }) => {
        if (!json.success) throw new Error("Failed to load exercises");
        setExercises(json.items);
        setExerciseTotal(json.total);
      })
      .catch((e) => toast.error(e.message))
      .finally(() => setLoading(false));
  }

  function loadArticles(page: number, search: string) {
    const params = new URLSearchParams({ page: String(page), pageSize: "10" });
    if (search) params.set("search", search);
    fetch(`/api/articles?${params}`)
      .then((r) => r.json())
      .then((json: ListResponse<ArticleRow> & { success: boolean }) => {
        if (!json.success) throw new Error("Failed to load articles");
        setArticles(json.items);
        setArticleTotal(json.total);
      })
      .catch((e) => toast.error(e.message))
      .finally(() => setLoading(false));
  }

  React.useEffect(() => {
    setLoading(true);
    loadExercises(exPage, exDebounced);
  }, [exPage, exDebounced]);

  React.useEffect(() => {
    setLoading(true);
    loadArticles(arPage, arDebounced);
  }, [arPage, arDebounced]);

  async function handleUpload(file: File, kind: "imageUrl" | "coverImage") {
    setUploading(true);
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: form });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      if (kind === "imageUrl") setExForm({ ...exForm, imageUrl: json.data.url });
      else setArForm({ ...arForm, coverImage: json.data.url });
      toast.success("Image uploaded");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  function openCreateExercise() {
    setEditingId(null);
    setExForm(emptyExercise);
    setFormOpen(true);
  }

  function openEditExercise(exercise: ExerciseRow) {
    setEditingId(exercise.id);
    setExForm({
      name: exercise.name,
      slug: exercise.slug,
      category: exercise.category,
      muscleGroup: exercise.muscleGroup,
      difficulty: exercise.difficulty,
      equipment: exercise.equipment ?? "",
      description: exercise.description,
      instructions: exercise.instructions,
      imageUrl: exercise.imageUrl ?? "",
      isPublished: exercise.isPublished,
    });
    setFormOpen(true);
  }

  function openCreateArticle() {
    setEditingId(null);
    setArForm(emptyArticle);
    setFormOpen(true);
  }

  function openEditArticle(article: ArticleRow) {
    setEditingId(article.id);
    setArForm({
      title: article.title,
      slug: article.slug,
      excerpt: article.excerpt ?? "",
      content: "",
      coverImage: article.coverImage ?? "",
      status: article.status,
      tags: "",
    });
    setFormOpen(true);
  }

  async function submitExercise() {
    setSaving(true);
    try {
      const res = await fetch(editingId ? `/api/exercises/${editingId}` : "/api/exercises", {
        method: editingId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...exForm, imageUrl: exForm.imageUrl || null }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      toast.success(editingId ? "Exercise updated" : "Exercise created");
      setFormOpen(false);
      loadExercises(1, exDebounced);
      setExPage(1);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  async function submitArticle() {
    setSaving(true);
    try {
      const res = await fetch(editingId ? `/api/articles/${editingId}` : "/api/articles", {
        method: editingId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: arForm.title,
          slug: arForm.slug,
          excerpt: arForm.excerpt,
          content: arForm.content,
          coverImage: arForm.coverImage || null,
          status: arForm.status,
          tags: arForm.tags
            ? arForm.tags.split(",").map((t) => t.trim()).filter(Boolean)
            : undefined,
        }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      toast.success(editingId ? "Article updated" : "Article created");
      setFormOpen(false);
      loadArticles(1, arDebounced);
      setArPage(1);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  async function confirmDelete() {
    if (!deleting) return;
    setSaving(true);
    try {
      const base = deleting.type === "exercises" ? "exercises" : "articles";
      const res = await fetch(`/api/${base}/${deleting.id}`, { method: "DELETE" });
      if (res.status === 204) {
        toast.success(`${deleting.name} deleted`);
        if (deleting.type === "exercises") loadExercises(1, exDebounced);
        else loadArticles(1, arDebounced);
        setDeleting(null);
      } else {
        const json = await res.json();
        throw new Error(json.error ?? "Delete failed");
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Delete failed");
    } finally {
      setSaving(false);
    }
  }

  const exerciseColumns: ColumnDef<ExerciseRow>[] = [
    {
      id: "name",
      header: "Exercise",
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          {row.original.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={row.original.imageUrl}
              alt={row.original.name}
              className="h-9 w-9 rounded-md object-cover"
            />
          ) : (
            <div className="flex h-9 w-9 items-center justify-center rounded-md bg-blue-50 text-xs font-semibold text-blue-600">
              {row.original.name.slice(0, 2).toUpperCase()}
            </div>
          )}
          <div>
            <p className="font-medium text-slate-900">{row.original.name}</p>
            <p className="text-xs text-slate-500">{row.original.muscleGroup}</p>
          </div>
        </div>
      ),
    },
    {
      id: "category",
      header: "Category",
      cell: ({ row }) => <Badge variant="secondary">{row.original.category}</Badge>,
    },
    {
      id: "difficulty",
      header: "Difficulty",
      cell: ({ row }) => (
        <Badge
          variant={
            row.original.difficulty === "advanced"
              ? "destructive"
              : row.original.difficulty === "intermediate"
                ? "warning"
                : "success"
          }
          className="capitalize"
        >
          {row.original.difficulty}
        </Badge>
      ),
    },
    {
      id: "published",
      header: "Status",
      cell: ({ row }) => (
        <Badge variant={row.original.isPublished ? "success" : "secondary"}>
          {row.original.isPublished ? "Published" : "Hidden"}
        </Badge>
      ),
    },
    {
      id: "updated",
      header: "Updated",
      cell: ({ row }) => <span className="text-sm text-slate-500">{formatDate(row.original.updatedAt)}</span>,
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon-sm" aria-label="Row actions">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => openEditExercise(row.original)}>Edit</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-destructive focus:text-destructive"
              onClick={() =>
                setDeleting({ type: "exercises", id: row.original.id, name: row.original.name })
              }
            >
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  const articleColumns: ColumnDef<ArticleRow>[] = [
    {
      id: "title",
      header: "Article",
      cell: ({ row }) => (
        <div>
          <p className="font-medium text-slate-900">{row.original.title}</p>
          <p className="text-xs text-slate-500">{truncate(row.original.excerpt ?? "", 90)}</p>
        </div>
      ),
    },
    {
      id: "status",
      header: "Status",
      cell: ({ row }) => (
        <Badge variant={row.original.status === "published" ? "success" : row.original.status === "archived" ? "secondary" : "warning"}>
          {row.original.status}
        </Badge>
      ),
    },
    { id: "author", header: "Author", cell: ({ row }) => <span className="text-sm text-slate-600">{row.original.author?.name ?? "—"}</span> },
    {
      id: "published",
      header: "Published",
      cell: ({ row }) => <span className="text-sm text-slate-500">{formatDate(row.original.publishedAt)}</span>,
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon-sm" aria-label="Row actions">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => openEditArticle(row.original)}>Edit</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-destructive focus:text-destructive"
              onClick={() =>
                setDeleting({ type: "articles", id: row.original.id, name: row.original.title })
              }
            >
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  const isExercise = tab === "exercises";

  return (
    <div className="mx-auto max-w-7xl space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-slate-900">Content Management</h1>
          <p className="text-sm text-slate-500">
            Manage exercises and articles from the admin panel — no hardcoding required.
          </p>
        </div>
        <Button onClick={isExercise ? openCreateExercise : openCreateArticle}>
          <Plus className="h-4 w-4" />
          Add {isExercise ? "exercise" : "article"}
        </Button>
      </div>

      <Tabs value={tab} onValueChange={(v) => setTab(v as TabKey)}>
        <TabsList>
          <TabsTrigger value="exercises">Exercises ({exerciseTotal})</TabsTrigger>
          <TabsTrigger value="articles">Articles ({articleTotal})</TabsTrigger>
        </TabsList>

        <TabsContent value="exercises" className="space-y-4">
          <Card className="p-3">
            <Input
              placeholder="Search exercises…"
              value={exSearch}
              onChange={(e) => setExSearch(e.target.value)}
              className="max-w-sm"
            />
          </Card>
          <DataTable
            columns={exerciseColumns}
            data={exercises}
            total={exerciseTotal}
            page={exPage}
            pageSize={10}
            onPageChange={setExPage}
            loading={loading}
          />
        </TabsContent>

        <TabsContent value="articles" className="space-y-4">
          <Card className="p-3">
            <Input
              placeholder="Search articles…"
              value={arSearch}
              onChange={(e) => setArSearch(e.target.value)}
              className="max-w-sm"
            />
          </Card>
          <DataTable
            columns={articleColumns}
            data={articles}
            total={articleTotal}
            page={arPage}
            pageSize={10}
            onPageChange={setArPage}
            loading={loading}
          />
        </TabsContent>
      </Tabs>

      <Dialog open={formOpen} onOpenChange={(open) => !open && setFormOpen(false)}>
        <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {isExercise
                ? editingId
                  ? "Edit exercise"
                  : "Add new exercise"
                : editingId
                  ? "Edit article"
                  : "Add new article"}
            </DialogTitle>
            <DialogDescription>
              Fields are validated on the server before saving.
            </DialogDescription>
          </DialogHeader>

          {isExercise ? (
            <div className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="ex-name">Name</Label>
                  <Input
                    id="ex-name"
                    value={exForm.name}
                    onChange={(e) =>
                      setExForm({
                        ...exForm,
                        name: e.target.value,
                        slug: exForm.slug === "" || exForm.slug === slugify(exForm.name) ? slugify(e.target.value) : exForm.slug,
                      })
                    }
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="ex-slug">Slug</Label>
                  <Input
                    id="ex-slug"
                    value={exForm.slug}
                    onChange={(e) => setExForm({ ...exForm, slug: slugify(e.target.value) })}
                  />
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label>Category</Label>
                  <Select
                    value={exForm.category}
                    onValueChange={(v) => setExForm({ ...exForm, category: v })}
                  >
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {["Strength", "Cardio", "Core", "Mobility", "HIIT", "Yoga"].map((c) => (
                        <SelectItem key={c} value={c}>{c}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>Muscle group</Label>
                  <Select
                    value={exForm.muscleGroup}
                    onValueChange={(v) => setExForm({ ...exForm, muscleGroup: v })}
                  >
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {["Chest", "Back", "Legs", "Shoulders", "Arms", "Core", "Hips", "Full Body", "Glutes"].map((m) => (
                        <SelectItem key={m} value={m}>{m}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label>Difficulty</Label>
                  <Select
                    value={exForm.difficulty}
                    onValueChange={(v) => setExForm({ ...exForm, difficulty: v })}
                  >
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="beginner">Beginner</SelectItem>
                      <SelectItem value="intermediate">Intermediate</SelectItem>
                      <SelectItem value="advanced">Advanced</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="ex-equipment">Equipment</Label>
                  <Input
                    id="ex-equipment"
                    placeholder="Barbell, Bench…"
                    value={exForm.equipment}
                    onChange={(e) => setExForm({ ...exForm, equipment: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="ex-desc">Description</Label>
                <Textarea
                  id="ex-desc"
                  rows={2}
                  value={exForm.description}
                  onChange={(e) => setExForm({ ...exForm, description: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="ex-instructions">Instructions</Label>
                <Textarea
                  id="ex-instructions"
                  rows={4}
                  placeholder="Step-by-step instructions, one per line…"
                  value={exForm.instructions}
                  onChange={(e) => setExForm({ ...exForm, instructions: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Thumbnail</Label>
                <div className="flex items-center gap-3">
                  {exForm.imageUrl && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={exForm.imageUrl} alt="Thumbnail" className="h-14 w-14 rounded-md object-cover" />
                  )}
                  <label className="inline-flex cursor-pointer items-center gap-2 rounded-md border border-dashed px-3 py-2 text-sm text-slate-500 hover:bg-slate-50">
                    <UploadCloud className="h-4 w-4" />
                    {uploading ? "Uploading…" : "Upload image"}
                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/webp"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) void handleUpload(file, "imageUrl");
                      }}
                    />
                  </label>
                </div>
              </div>
              <div className="flex items-center justify-between rounded-md border p-3">
                <div>
                  <p className="text-sm font-medium">Publish</p>
                  <p className="text-xs text-slate-500">Show this exercise in the public library</p>
                </div>
                <Switch
                  checked={exForm.isPublished}
                  onCheckedChange={(v) => setExForm({ ...exForm, isPublished: v })}
                />
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="ar-title">Title</Label>
                  <Input
                    id="ar-title"
                    value={arForm.title}
                    onChange={(e) =>
                      setArForm({
                        ...arForm,
                        title: e.target.value,
                        slug: arForm.slug === "" || arForm.slug === slugify(arForm.title) ? slugify(e.target.value) : arForm.slug,
                      })
                    }
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="ar-slug">Slug</Label>
                  <Input
                    id="ar-slug"
                    value={arForm.slug}
                    onChange={(e) => setArForm({ ...arForm, slug: slugify(e.target.value) })}
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="ar-excerpt">Excerpt</Label>
                <Textarea
                  id="ar-excerpt"
                  rows={2}
                  value={arForm.excerpt}
                  onChange={(e) => setArForm({ ...arForm, excerpt: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="ar-content">Content (Markdown)</Label>
                <Textarea
                  id="ar-content"
                  rows={8}
                  value={arForm.content}
                  onChange={(e) => setArForm({ ...arForm, content: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="ar-tags">Tags (comma separated)</Label>
                <Input
                  id="ar-tags"
                  placeholder="training, nutrition, recovery"
                  value={arForm.tags}
                  onChange={(e) => setArForm({ ...arForm, tags: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Cover image</Label>
                <div className="flex items-center gap-3">
                  {arForm.coverImage && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={arForm.coverImage} alt="Cover" className="h-14 w-24 rounded-md object-cover" />
                  )}
                  <label className="inline-flex cursor-pointer items-center gap-2 rounded-md border border-dashed px-3 py-2 text-sm text-slate-500 hover:bg-slate-50">
                    <UploadCloud className="h-4 w-4" />
                    {uploading ? "Uploading…" : "Upload cover"}
                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/webp"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) void handleUpload(file, "coverImage");
                      }}
                    />
                  </label>
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>Status</Label>
                <Select
                  value={arForm.status}
                  onValueChange={(v) => setArForm({ ...arForm, status: v })}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="published">Published</SelectItem>
                    <SelectItem value="archived">Archived</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setFormOpen(false)}>Cancel</Button>
            <Button onClick={isExercise ? submitExercise : submitArticle} disabled={saving}>
              {saving ? "Saving…" : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!deleting} onOpenChange={(open) => !open && setDeleting(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Delete {isExercise ? "exercise" : "article"}</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{deleting?.name}"? This cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleting(null)}>Cancel</Button>
            <Button variant="destructive" onClick={confirmDelete} disabled={saving}>
              {saving ? "Deleting…" : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
