import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Plus, Pencil, Trash2, FolderPlus, FileText, Layers,
  Search, Eye, EyeOff, GripVertical, ChevronDown, ChevronRight
} from "lucide-react";

// ─── Types ───────────────────────────────────────────────────
interface Category {
  id: string;
  name: string;
  slug: string;
  parent_id: string | null;
  order_index: number | null;
  created_at: string;
}

interface Article {
  id: string;
  title: string;
  slug: string;
  summary: string | null;
  tags: string[] | null;
  category_id: string | null;
  is_published: boolean | null;
  created_at: string;
  updated_at: string;
}

interface Section {
  id: string;
  article_id: string;
  title: string;
  content: string;
  level: number | null;
  order_index: number;
  created_at: string;
}

// ─── Main Component ──────────────────────────────────────────
export default function LibraryManagement() {
  const [tab, setTab] = useState("articles");
  const [categories, setCategories] = useState<Category[]>([]);
  const [articles, setArticles] = useState<Article[]>([]);
  const [sections, setSections] = useState<Section[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // Dialog states
  const [categoryDialog, setCategoryDialog] = useState(false);
  const [articleDialog, setArticleDialog] = useState(false);
  const [sectionDialog, setSectionDialog] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState<{ type: string; id: string; name: string } | null>(null);

  // Edit states
  const [editCategory, setEditCategory] = useState<Category | null>(null);
  const [editArticle, setEditArticle] = useState<Article | null>(null);
  const [editSection, setEditSection] = useState<Section | null>(null);

  // Expanded article for sections
  const [expandedArticleId, setExpandedArticleId] = useState<string | null>(null);

  // ─── Fetch Data ──────────────────────────────────────────
  const fetchAll = useCallback(async () => {
    setLoading(true);
    const [catRes, artRes] = await Promise.all([
      supabase.from("medical_library_categories").select("*").order("order_index"),
      supabase.from("medical_library_articles").select("*").order("created_at", { ascending: false }),
    ]);
    if (catRes.data) setCategories(catRes.data);
    if (artRes.data) setArticles(artRes.data);
    setLoading(false);
  }, []);

  const fetchSections = useCallback(async (articleId: string) => {
    const { data } = await supabase
      .from("medical_library_sections")
      .select("*")
      .eq("article_id", articleId)
      .order("order_index");
    if (data) setSections(data);
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  useEffect(() => {
    if (expandedArticleId) fetchSections(expandedArticleId);
    else setSections([]);
  }, [expandedArticleId, fetchSections]);

  // ─── Category CRUD ───────────────────────────────────────
  const handleSaveCategory = async (formData: FormData) => {
    const name = formData.get("name") as string;
    const slug = formData.get("slug") as string;
    const parent_id = (formData.get("parent_id") as string) || null;
    const order_index = parseInt(formData.get("order_index") as string) || 0;

    if (!name || !slug) { toast.error("Name and slug are required"); return; }

    if (editCategory) {
      const { error } = await supabase.from("medical_library_categories")
        .update({ name, slug, parent_id: parent_id === "none" ? null : parent_id, order_index })
        .eq("id", editCategory.id);
      if (error) { toast.error(error.message); return; }
      toast.success("Category updated");
    } else {
      const { error } = await supabase.from("medical_library_categories")
        .insert({ name, slug, parent_id: parent_id === "none" ? null : parent_id, order_index });
      if (error) { toast.error(error.message); return; }
      toast.success("Category created");
    }
    setCategoryDialog(false);
    setEditCategory(null);
    fetchAll();
  };

  // ─── Article CRUD ────────────────────────────────────────
  const handleSaveArticle = async (formData: FormData) => {
    const title = formData.get("title") as string;
    const slug = formData.get("slug") as string;
    const summary = (formData.get("summary") as string) || null;
    const tagsRaw = (formData.get("tags") as string) || "";
    const tags = tagsRaw.split(",").map(t => t.trim()).filter(Boolean);
    const category_id = (formData.get("category_id") as string) || null;
    const is_published = formData.get("is_published") === "true";

    if (!title || !slug) { toast.error("Title and slug are required"); return; }

    if (editArticle) {
      const { error } = await supabase.from("medical_library_articles")
        .update({ title, slug, summary, tags, category_id: category_id === "none" ? null : category_id, is_published })
        .eq("id", editArticle.id);
      if (error) { toast.error(error.message); return; }
      toast.success("Article updated");
    } else {
      const { error } = await supabase.from("medical_library_articles")
        .insert({ title, slug, summary, tags, category_id: category_id === "none" ? null : category_id, is_published });
      if (error) { toast.error(error.message); return; }
      toast.success("Article created");
    }
    setArticleDialog(false);
    setEditArticle(null);
    fetchAll();
  };

  // ─── Section CRUD ────────────────────────────────────────
  const handleSaveSection = async (formData: FormData) => {
    const title = formData.get("title") as string;
    const content = formData.get("content") as string;
    const level = parseInt(formData.get("level") as string) || 1;
    const order_index = parseInt(formData.get("order_index") as string) || 0;

    if (!title || !content) { toast.error("Title and content are required"); return; }

    if (editSection) {
      const { error } = await supabase.from("medical_library_sections")
        .update({ title, content, level, order_index })
        .eq("id", editSection.id);
      if (error) { toast.error(error.message); return; }
      toast.success("Section updated");
    } else {
      if (!expandedArticleId) { toast.error("No article selected"); return; }
      const { error } = await supabase.from("medical_library_sections")
        .insert({ article_id: expandedArticleId, title, content, level, order_index });
      if (error) { toast.error(error.message); return; }
      toast.success("Section created");
    }
    setSectionDialog(false);
    setEditSection(null);
    if (expandedArticleId) fetchSections(expandedArticleId);
  };

  // ─── Delete ──────────────────────────────────────────────
  const handleDelete = async () => {
    if (!deleteDialog) return;
    const { type, id } = deleteDialog;
    const table = type === "category" ? "medical_library_categories"
      : type === "article" ? "medical_library_articles"
      : "medical_library_sections";

    const { error } = await supabase.from(table).delete().eq("id", id);
    if (error) { toast.error(error.message); return; }
    toast.success(`${type} deleted`);
    setDeleteDialog(null);
    if (type === "section" && expandedArticleId) fetchSections(expandedArticleId);
    else fetchAll();
  };

  // ─── Toggle Publish ──────────────────────────────────────
  const togglePublish = async (article: Article) => {
    const { error } = await supabase.from("medical_library_articles")
      .update({ is_published: !article.is_published })
      .eq("id", article.id);
    if (error) { toast.error(error.message); return; }
    toast.success(article.is_published ? "Unpublished" : "Published");
    fetchAll();
  };

  // ─── Helpers ─────────────────────────────────────────────
  const getCategoryName = (id: string | null) => categories.find(c => c.id === id)?.name || "—";

  const filteredArticles = search
    ? articles.filter(a => a.title.toLowerCase().includes(search.toLowerCase()) || a.slug.toLowerCase().includes(search.toLowerCase()))
    : articles;

  const filteredCategories = search
    ? categories.filter(c => c.name.toLowerCase().includes(search.toLowerCase()))
    : categories;

  // ─── Render ──────────────────────────────────────────────
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Medical Library</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage categories, articles, and sections</p>
        </div>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <TabsList>
            <TabsTrigger value="articles" className="gap-2"><FileText className="h-4 w-4" />Articles ({articles.length})</TabsTrigger>
            <TabsTrigger value="categories" className="gap-2"><FolderPlus className="h-4 w-4" />Categories ({categories.length})</TabsTrigger>
          </TabsList>

          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search..." className="pl-9 w-60" />
            </div>
            {tab === "articles" && (
              <Button onClick={() => { setEditArticle(null); setArticleDialog(true); }} size="sm">
                <Plus className="h-4 w-4 mr-1" />Add Article
              </Button>
            )}
            {tab === "categories" && (
              <Button onClick={() => { setEditCategory(null); setCategoryDialog(true); }} size="sm">
                <Plus className="h-4 w-4 mr-1" />Add Category
              </Button>
            )}
          </div>
        </div>

        {/* ─── Articles Tab ───────────────────────────────── */}
        <TabsContent value="articles" className="mt-4">
          <div className="rounded-lg border border-border bg-card">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-8" />
                  <TableHead>Title</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Tags</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">Loading...</TableCell></TableRow>
                ) : filteredArticles.length === 0 ? (
                  <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">No articles found</TableCell></TableRow>
                ) : filteredArticles.map(article => (
                  <>
                    <TableRow key={article.id} className="group">
                      <TableCell>
                        <button onClick={() => setExpandedArticleId(prev => prev === article.id ? null : article.id)}>
                          {expandedArticleId === article.id
                            ? <ChevronDown className="h-4 w-4 text-muted-foreground" />
                            : <ChevronRight className="h-4 w-4 text-muted-foreground" />}
                        </button>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{article.title}</div>
                        <div className="text-xs text-muted-foreground">{article.slug}</div>
                      </TableCell>
                      <TableCell className="text-sm">{getCategoryName(article.category_id)}</TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {article.tags?.slice(0, 3).map(tag => (
                            <Badge key={tag} variant="secondary" className="text-[10px]">{tag}</Badge>
                          ))}
                          {(article.tags?.length || 0) > 3 && <Badge variant="outline" className="text-[10px]">+{article.tags!.length - 3}</Badge>}
                        </div>
                      </TableCell>
                      <TableCell>
                        <button onClick={() => togglePublish(article)}>
                          {article.is_published
                            ? <Badge className="bg-green-600/20 text-green-600 hover:bg-green-600/30 cursor-pointer"><Eye className="h-3 w-3 mr-1" />Published</Badge>
                            : <Badge variant="outline" className="text-muted-foreground hover:bg-muted cursor-pointer"><EyeOff className="h-3 w-3 mr-1" />Draft</Badge>}
                        </button>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">{new Date(article.created_at).toLocaleDateString()}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { setEditArticle(article); setArticleDialog(true); }}>
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => setDeleteDialog({ type: "article", id: article.id, name: article.title })}>
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>

                    {/* Expanded Sections */}
                    {expandedArticleId === article.id && (
                      <TableRow key={`${article.id}-sections`}>
                        <TableCell colSpan={7} className="bg-muted/30 p-4">
                          <div className="flex items-center justify-between mb-3">
                            <h4 className="text-sm font-semibold flex items-center gap-2">
                              <Layers className="h-4 w-4 text-primary" />
                              Sections ({sections.length})
                            </h4>
                            <Button size="sm" variant="outline" onClick={() => { setEditSection(null); setSectionDialog(true); }}>
                              <Plus className="h-3.5 w-3.5 mr-1" />Add Section
                            </Button>
                          </div>
                          {sections.length === 0 ? (
                            <p className="text-sm text-muted-foreground text-center py-4">No sections yet. Add the first section.</p>
                          ) : (
                            <div className="space-y-1">
                              {sections.map(section => (
                                <div key={section.id} className="flex items-center gap-3 rounded-md border border-border bg-card px-3 py-2 group/section">
                                  <GripVertical className="h-4 w-4 text-muted-foreground/40" />
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                      <Badge variant="outline" className="text-[10px]">H{section.level || 1}</Badge>
                                      <span className="text-sm font-medium truncate">{section.title}</span>
                                    </div>
                                    <p className="text-xs text-muted-foreground truncate mt-0.5">{section.content.replace(/<[^>]*>/g, '').slice(0, 100)}...</p>
                                  </div>
                                  <div className="flex items-center gap-1 opacity-0 group-hover/section:opacity-100 transition-opacity">
                                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => { setEditSection(section); setSectionDialog(true); }}>
                                      <Pencil className="h-3 w-3" />
                                    </Button>
                                    <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => setDeleteDialog({ type: "section", id: section.id, name: section.title })}>
                                      <Trash2 className="h-3 w-3" />
                                    </Button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </TableCell>
                      </TableRow>
                    )}
                  </>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        {/* ─── Categories Tab ─────────────────────────────── */}
        <TabsContent value="categories" className="mt-4">
          <div className="rounded-lg border border-border bg-card">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Slug</TableHead>
                  <TableHead>Parent</TableHead>
                  <TableHead>Order</TableHead>
                  <TableHead>Articles</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">Loading...</TableCell></TableRow>
                ) : filteredCategories.length === 0 ? (
                  <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">No categories found</TableCell></TableRow>
                ) : filteredCategories.map(cat => (
                  <TableRow key={cat.id} className="group">
                    <TableCell className="font-medium">{cat.name}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{cat.slug}</TableCell>
                    <TableCell className="text-sm">{getCategoryName(cat.parent_id)}</TableCell>
                    <TableCell className="text-sm">{cat.order_index}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">{articles.filter(a => a.category_id === cat.id).length}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { setEditCategory(cat); setCategoryDialog(true); }}>
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => setDeleteDialog({ type: "category", id: cat.id, name: cat.name })}>
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
      </Tabs>

      {/* ─── Category Dialog ──────────────────────────────── */}
      <Dialog open={categoryDialog} onOpenChange={(o) => { setCategoryDialog(o); if (!o) setEditCategory(null); }}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editCategory ? "Edit Category" : "New Category"}</DialogTitle></DialogHeader>
          <form onSubmit={e => { e.preventDefault(); handleSaveCategory(new FormData(e.currentTarget)); }} className="space-y-4">
            <div>
              <label className="text-sm font-medium">Name *</label>
              <Input name="name" defaultValue={editCategory?.name || ""} required />
            </div>
            <div>
              <label className="text-sm font-medium">Slug *</label>
              <Input name="slug" defaultValue={editCategory?.slug || ""} required placeholder="e.g. cardiology" />
            </div>
            <div>
              <label className="text-sm font-medium">Parent Category</label>
              <select name="parent_id" defaultValue={editCategory?.parent_id || "none"} className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm">
                <option value="none">None (Root)</option>
                {categories.filter(c => c.id !== editCategory?.id).map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium">Order Index</label>
              <Input name="order_index" type="number" defaultValue={editCategory?.order_index ?? 0} />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setCategoryDialog(false)}>Cancel</Button>
              <Button type="submit">{editCategory ? "Update" : "Create"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ─── Article Dialog ───────────────────────────────── */}
      <Dialog open={articleDialog} onOpenChange={(o) => { setArticleDialog(o); if (!o) setEditArticle(null); }}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>{editArticle ? "Edit Article" : "New Article"}</DialogTitle></DialogHeader>
          <form onSubmit={e => { e.preventDefault(); handleSaveArticle(new FormData(e.currentTarget)); }} className="space-y-4">
            <div>
              <label className="text-sm font-medium">Title *</label>
              <Input name="title" defaultValue={editArticle?.title || ""} required />
            </div>
            <div>
              <label className="text-sm font-medium">Slug *</label>
              <Input name="slug" defaultValue={editArticle?.slug || ""} required placeholder="e.g. heart-failure" />
            </div>
            <div>
              <label className="text-sm font-medium">Summary</label>
              <Textarea name="summary" defaultValue={editArticle?.summary || ""} rows={2} />
            </div>
            <div>
              <label className="text-sm font-medium">Tags (comma separated)</label>
              <Input name="tags" defaultValue={editArticle?.tags?.join(", ") || ""} placeholder="cardiology, heart" />
            </div>
            <div>
              <label className="text-sm font-medium">Category</label>
              <select name="category_id" defaultValue={editArticle?.category_id || "none"} className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm">
                <option value="none">None</option>
                {categories.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium">Published</label>
              <select name="is_published" defaultValue={editArticle?.is_published ? "true" : "false"} className="rounded-md border border-border bg-background px-3 py-2 text-sm">
                <option value="true">Yes</option>
                <option value="false">No (Draft)</option>
              </select>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setArticleDialog(false)}>Cancel</Button>
              <Button type="submit">{editArticle ? "Update" : "Create"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ─── Section Dialog ───────────────────────────────── */}
      <Dialog open={sectionDialog} onOpenChange={(o) => { setSectionDialog(o); if (!o) setEditSection(null); }}>
        <DialogContent className="max-w-2xl">
          <DialogHeader><DialogTitle>{editSection ? "Edit Section" : "New Section"}</DialogTitle></DialogHeader>
          <form onSubmit={e => { e.preventDefault(); handleSaveSection(new FormData(e.currentTarget)); }} className="space-y-4">
            <div>
              <label className="text-sm font-medium">Title *</label>
              <Input name="title" defaultValue={editSection?.title || ""} required />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Heading Level</label>
                <select name="level" defaultValue={editSection?.level ?? 1} className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm">
                  <option value="1">H1 - Main Section</option>
                  <option value="2">H2 - Subsection</option>
                  <option value="3">H3 - Sub-subsection</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium">Order Index</label>
                <Input name="order_index" type="number" defaultValue={editSection?.order_index ?? sections.length} />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium">Content (HTML) *</label>
              <Textarea name="content" defaultValue={editSection?.content || ""} rows={12} required className="font-mono text-xs" />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setSectionDialog(false)}>Cancel</Button>
              <Button type="submit">{editSection ? "Update" : "Create"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ─── Delete Confirmation ──────────────────────────── */}
      <Dialog open={!!deleteDialog} onOpenChange={(o) => { if (!o) setDeleteDialog(null); }}>
        <DialogContent>
          <DialogHeader><DialogTitle>Delete {deleteDialog?.type}?</DialogTitle></DialogHeader>
          <p className="text-sm text-muted-foreground">
            Are you sure you want to delete <strong>"{deleteDialog?.name}"</strong>? This action cannot be undone.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialog(null)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDelete}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
