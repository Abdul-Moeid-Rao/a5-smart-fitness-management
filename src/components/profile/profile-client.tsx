"use client";

import * as React from "react";
import { Camera, Loader2, Save, UploadCloud } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatDate, initials } from "@/lib/utils";

interface ProfileUser {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
  phone: string | null;
  bio: string | null;
  plan: string;
  role: string;
  createdAt: Date | string;
}

interface ProfileClientProps {
  user: ProfileUser;
  stats: { totalUsers: number; activeSessions: number };
}

export function ProfileClient({ user, stats }: ProfileClientProps) {
  const [name, setName] = React.useState(user.name ?? "");
  const [phone, setPhone] = React.useState(user.phone ?? "");
  const [bio, setBio] = React.useState(user.bio ?? "");
  const [image, setImage] = React.useState(user.image ?? "");
  const [saving, setSaving] = React.useState(false);
  const [uploading, setUploading] = React.useState(false);

  async function handleAvatarUpload(file: File) {
    setUploading(true);
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: form });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      setImage(json.data.url);
      toast.success("Avatar uploaded");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  async function saveProfile() {
    setSaving(true);
    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, phone: phone || null, bio: bio || null, image }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      toast.success("Profile updated");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Update failed");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight text-slate-900">Profile</h1>
        <p className="text-sm text-slate-500">Your account details and public information.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-1">
          <Card>
            <CardContent className="flex flex-col items-center gap-4 p-6 text-center">
              <div className="relative">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={image || undefined} alt={name} />
                  <AvatarFallback>{initials(name)}</AvatarFallback>
                </Avatar>
                <label className="absolute -bottom-1 -right-1 flex h-7 w-7 cursor-pointer items-center justify-center rounded-full bg-blue-600 text-white shadow-sm hover:bg-blue-700">
                  {uploading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Camera className="h-3.5 w-3.5" />}
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) void handleAvatarUpload(file);
                    }}
                  />
                </label>
              </div>
              <div>
                <p className="text-base font-semibold text-slate-900">{user.name}</p>
                <p className="text-sm text-slate-500">{user.email}</p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="blue" className="capitalize">{user.role}</Badge>
                <Badge variant="outline" className="capitalize">{user.plan} plan</Badge>
              </div>
              <p className="text-xs text-slate-400">Member since {formatDate(user.createdAt)}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Platform stats</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-3">
              <div className="rounded-md bg-slate-50 p-3 text-center">
                <p className="text-lg font-semibold text-slate-900">{stats.totalUsers.toLocaleString()}</p>
                <p className="text-xs text-slate-500">Total users</p>
              </div>
              <div className="rounded-md bg-slate-50 p-3 text-center">
                <p className="text-lg font-semibold text-slate-900">{stats.activeSessions}</p>
                <p className="text-xs text-slate-500">Your sessions</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Edit profile</CardTitle>
            <CardDescription>
              Update your name, contact details and a short bio.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="profile-name">Full name</Label>
              <Input id="profile-name" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="profile-email">Email</Label>
              <Input id="profile-email" value={user.email} disabled />
              <p className="text-xs text-slate-400">Email cannot be changed from the profile.</p>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="profile-phone">Phone</Label>
              <Input
                id="profile-phone"
                placeholder="+1 555 000 1234"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="profile-bio">Bio</Label>
              <Textarea
                id="profile-bio"
                rows={4}
                placeholder="Tell us about your fitness journey…"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
              />
              <p className="text-xs text-slate-400">{bio.length}/600 characters</p>
            </div>
            <div className="flex items-center justify-between rounded-md border border-dashed p-3">
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <UploadCloud className="h-4 w-4" />
                Avatar updated via <code className="rounded bg-slate-100 px-1">/api/upload</code>
              </div>
              <Button onClick={saveProfile} disabled={saving}>
                <Save className="h-4 w-4" />
                {saving ? "Saving…" : "Save changes"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
