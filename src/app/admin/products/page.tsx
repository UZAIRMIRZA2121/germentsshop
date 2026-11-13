"use client";

import { useState } from "react";
import { FolderPlus, Pencil, Plus, Trash2 } from "lucide-react";
import { ImageUploadField } from "@/components/admin/ImageUploadField";
import { Button } from "@/components/ui/Button";
import { PageLoader } from "@/components/ui/Feedback";
import { Input, Select, Textarea } from "@/components/ui/Field";
import { ConfirmDialog, Modal } from "@/components/ui/Modal";
import { SafeImage } from "@/components/ui/SafeImage";
import { useCatalog } from "@/context/CatalogContext";
import { useToast } from "@/context/ToastContext";
import { photo, unsplash } from "@/lib/data/images";
import { categoryService } from "@/lib/services/categoryService";
import { productService } from "@/lib/services/productService";
import type { Category, Product, ProductInput } from "@/lib/types";
import { formatPrice, slugify } from "@/lib/utils";

const DEFAULT_IMG = unsplash(photo.whiteTee, 900);

export default function AdminProductsPage() {
  const { products, categories, categoryName, ready } = useCatalog();
  const toast = useToast();

  const [tab, setTab] = useState<"products" | "categories">("products");

  // Product modal state
  const [prodModal, setProdModal] = useState(false);
  const [editingProd, setEditingProd] = useState<Product | null>(null);
  const [pForm, setPForm] = useState({
    name: "",
    sku: "",
    category: "",
    price: "",
    originalPrice: "",
    stock: "15",
    image: DEFAULT_IMG,
    sizes: "S, M, L, XL",
    shortDescription: "",
    description: "",
  });
  const [deleteProd, setDeleteProd] = useState<Product | null>(null);

  // Category modal state
  const [catModal, setCatModal] = useState(false);
  const [editingCat, setEditingCat] = useState<Category | null>(null);
  const [cForm, setCForm] = useState({
    name: "",
    description: "",
    image: unsplash(photo.boutique, 700, 800),
  });
  const [deleteCat, setDeleteCat] = useState<Category | null>(null);

  if (!ready) return <PageLoader label="Loading catalog…" />;

  const openNewProduct = () => {
    setEditingProd(null);
    setPForm({
      name: "",
      sku: `TL-NEW-${Math.floor(100 + Math.random() * 900)}`,
      category: categories[0]?.slug ?? "t-shirts",
      price: "2499",
      originalPrice: "",
      stock: "20",
      image: DEFAULT_IMG,
      sizes: "S, M, L, XL",
      shortDescription: "Modern everyday garment crafted from soft breathable fabric.",
      description: "Clean cut, durable stitching and comfortable fit for daily wear.",
    });
    setProdModal(true);
  };

  const openEditProduct = (p: Product) => {
    setEditingProd(p);
    setPForm({
      name: p.name,
      sku: p.sku,
      category: p.category,
      price: String(p.price),
      originalPrice: p.originalPrice ? String(p.originalPrice) : "",
      stock: String(p.stock),
      image: p.images[0] ?? DEFAULT_IMG,
      sizes: p.sizes.join(", "),
      shortDescription: p.shortDescription,
      description: p.description,
    });
    setProdModal(true);
  };

  const saveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    const price = Number(pForm.price);
    const stock = Number(pForm.stock);
    const original = pForm.originalPrice ? Number(pForm.originalPrice) : undefined;
    if (!pForm.name.trim() || !Number.isFinite(price) || price <= 0) {
      toast.error("Please enter a valid product name and price.");
      return;
    }

    const payload: ProductInput = {
      name: pForm.name.trim(),
      slug: slugify(pForm.name),
      sku: pForm.sku.trim() || "TL-ITEM",
      category: pForm.category || categories[0]?.slug || "t-shirts",
      shortDescription: pForm.shortDescription.trim() || pForm.name.trim(),
      description: pForm.description.trim() || pForm.shortDescription.trim() || pForm.name.trim(),
      price,
      originalPrice: original && original > price ? original : undefined,
      images: [pForm.image.trim() || DEFAULT_IMG],
      colors: editingProd?.colors ?? [{ name: "Black", hex: "#1c1c1c" }, { name: "White", hex: "#ffffff" }],
      sizes: pForm.sizes
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
      stock: Number.isFinite(stock) && stock >= 0 ? Math.floor(stock) : 0,
      rating: editingProd?.rating ?? 4.7,
      reviewCount: editingProd?.reviewCount ?? 1,
      tags: editingProd?.tags ?? ["new"],
      specifications: editingProd?.specifications ?? [
        { label: "Material", value: "Cotton blend" },
        { label: "Fit", value: "Regular fit" },
      ],
    };

    const res = editingProd
      ? await productService.update(editingProd.id, payload)
      : await productService.create(payload);

    if (!res.ok) {
      toast.error("Could not save product", { message: res.error });
      return;
    }
    toast.success(editingProd ? "Product updated" : "Product added");
    setProdModal(false);
  };

  const saveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cForm.name.trim()) {
      toast.error("Category name is required.");
      return;
    }
    const res = editingCat
      ? await categoryService.update(editingCat.id, cForm)
      : await categoryService.create(cForm);
    if (!res.ok) {
      toast.error("Could not save category", { message: res.error });
      return;
    }
    toast.success(editingCat ? "Category updated" : "Category added");
    setCatModal(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-semibold text-ink-900 sm:text-3xl">
            Products &amp; Categories
          </h1>
          <p className="mt-1 text-sm text-ink-500">
            Add, edit or delete demo products and categories. Changes appear immediately in the shop.
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => {
              setEditingCat(null);
              setCForm({ name: "", description: "", image: unsplash(photo.boutique, 700, 800) });
              setCatModal(true);
            }}
            leftIcon={<FolderPlus className="h-4 w-4" />}
          >
            New Category
          </Button>
          <Button onClick={openNewProduct} leftIcon={<Plus className="h-4 w-4" />}>
            Add Product
          </Button>
        </div>
      </div>

      {/* Sub-tabs */}
      <div className="flex gap-2 border-b border-ink-200 pb-3">
        <button
          type="button"
          onClick={() => setTab("products")}
          className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
            tab === "products" ? "bg-ink-900 text-white" : "text-ink-600 hover:bg-ink-100"
          }`}
        >
          Products ({products.length})
        </button>
        <button
          type="button"
          onClick={() => setTab("categories")}
          className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
            tab === "categories" ? "bg-ink-900 text-white" : "text-ink-600 hover:bg-ink-100"
          }`}
        >
          Categories ({categories.length})
        </button>
      </div>

      {tab === "products" ? (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-ink-200 bg-ink-50 text-xs font-semibold uppercase tracking-wider text-ink-500">
                <tr>
                  <th className="px-4 py-3.5">Product</th>
                  <th className="px-4 py-3.5">Category</th>
                  <th className="px-4 py-3.5">Price</th>
                  <th className="px-4 py-3.5">Stock</th>
                  <th className="px-4 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-100">
                {products.map((p) => (
                  <tr key={p.id} className="hover:bg-ink-50/50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <SafeImage
                          src={p.images[0]}
                          alt={p.name}
                          className="h-12 w-10 shrink-0 rounded-lg object-cover"
                        />
                        <div>
                          <p className="font-semibold text-ink-900">{p.name}</p>
                          <p className="text-xs text-ink-400">{p.sku}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-ink-600">{categoryName(p.category)}</td>
                    <td className="px-4 py-3 font-semibold text-ink-900">{formatPrice(p.price)}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                          p.stock <= 0
                            ? "bg-red-50 text-red-700"
                            : p.stock <= 5
                              ? "bg-amber-50 text-amber-800"
                              : "bg-emerald-50 text-emerald-700"
                        }`}
                      >
                        {p.stock} in stock
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="inline-flex gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => openEditProduct(p)}
                          aria-label={`Edit ${p.name}`}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-red-600 hover:bg-red-50"
                          onClick={() => setDeleteProd(p)}
                          aria-label={`Delete ${p.name}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((c) => {
            const count = products.filter((p) => p.category === c.slug).length;
            return (
              <div key={c.id} className="card flex items-start gap-4 p-4">
                <SafeImage
                  src={c.image}
                  alt={c.name}
                  className="h-16 w-16 shrink-0 rounded-xl object-cover"
                />
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-ink-900">{c.name}</p>
                  <p className="text-xs text-ink-400">{count} product(s)</p>
                  <p className="mt-1 line-clamp-2 text-xs text-ink-600">{c.description}</p>
                  <div className="mt-3 flex gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setEditingCat(c);
                        setCForm({ name: c.name, description: c.description, image: c.image });
                        setCatModal(true);
                      }}
                      className="text-xs font-semibold text-brand-600 hover:underline"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeleteCat(c)}
                      className="text-xs font-semibold text-red-600 hover:underline"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Product Modal */}
      <Modal
        open={prodModal}
        onClose={() => setProdModal(false)}
        title={editingProd ? "Edit Product" : "Add New Product"}
        size="lg"
      >
        <form onSubmit={saveProduct} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Product Name"
              required
              value={pForm.name}
              onChange={(e) => setPForm((f) => ({ ...f, name: e.target.value }))}
            />
            <Select
              label="Category"
              value={pForm.category}
              onChange={(e) => setPForm((f) => ({ ...f, category: e.target.value }))}
            >
              {categories.map((c) => (
                <option key={c.id} value={c.slug}>
                  {c.name}
                </option>
              ))}
            </Select>
            <Input
              label="Price (PKR)"
              required
              type="number"
              min={1}
              value={pForm.price}
              onChange={(e) => setPForm((f) => ({ ...f, price: e.target.value }))}
            />
            <Input
              label="Original Price (PKR)"
              optional
              type="number"
              min={0}
              value={pForm.originalPrice}
              onChange={(e) => setPForm((f) => ({ ...f, originalPrice: e.target.value }))}
            />
            <Input
              label="Stock"
              required
              type="number"
              min={0}
              value={pForm.stock}
              onChange={(e) => setPForm((f) => ({ ...f, stock: e.target.value }))}
            />
            <Input
              label="SKU"
              value={pForm.sku}
              onChange={(e) => setPForm((f) => ({ ...f, sku: e.target.value }))}
            />
          </div>
          <Input
            label="Sizes (comma separated)"
            value={pForm.sizes}
            onChange={(e) => setPForm((f) => ({ ...f, sizes: e.target.value }))}
          />
          <ImageUploadField
            label="Product Image"
            value={pForm.image}
            onChange={(url) => setPForm((f) => ({ ...f, image: url }))}
          />
          <Input
            label="Short Description"
            value={pForm.shortDescription}
            onChange={(e) => setPForm((f) => ({ ...f, shortDescription: e.target.value }))}
          />
          <Textarea
            label="Full Description"
            value={pForm.description}
            onChange={(e) => setPForm((f) => ({ ...f, description: e.target.value }))}
          />
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setProdModal(false)}>
              Cancel
            </Button>
            <Button type="submit">{editingProd ? "Save Changes" : "Create Product"}</Button>
          </div>
        </form>
      </Modal>

      {/* Category Modal */}
      <Modal
        open={catModal}
        onClose={() => setCatModal(false)}
        title={editingCat ? "Edit Category" : "New Category"}
      >
        <form onSubmit={saveCategory} className="space-y-4">
          <Input
            label="Category Name"
            required
            value={cForm.name}
            onChange={(e) => setCForm((f) => ({ ...f, name: e.target.value }))}
          />
          <Textarea
            label="Description"
            value={cForm.description}
            onChange={(e) => setCForm((f) => ({ ...f, description: e.target.value }))}
          />
          <ImageUploadField
            label="Category Image"
            value={cForm.image}
            onChange={(url) => setCForm((f) => ({ ...f, image: url }))}
          />
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setCatModal(false)}>
              Cancel
            </Button>
            <Button type="submit">{editingCat ? "Save Changes" : "Create Category"}</Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={!!deleteProd}
        title="Delete product?"
        message={`Remove "${deleteProd?.name}" from the demo catalog?`}
        confirmLabel="Delete"
        onCancel={() => setDeleteProd(null)}
        onConfirm={async () => {
          if (deleteProd) {
            await productService.remove(deleteProd.id);
            toast.info("Product deleted");
          }
          setDeleteProd(null);
        }}
      />

      <ConfirmDialog
        open={!!deleteCat}
        title="Delete category?"
        message={`Remove "${deleteCat?.name}"? Existing products in this category will remain in the catalog.`}
        confirmLabel="Delete"
        onCancel={() => setDeleteCat(null)}
        onConfirm={async () => {
          if (deleteCat) {
            await categoryService.remove(deleteCat.id);
            toast.info("Category deleted");
          }
          setDeleteCat(null);
        }}
      />
    </div>
  );
}

