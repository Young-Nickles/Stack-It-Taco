/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { 
  collection, 
  onSnapshot, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  serverTimestamp,
  query,
  orderBy
} from "firebase/firestore";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { db, auth, storage, login, logout } from "../lib/firebase";
import { handleFirestoreError, OperationType } from "../lib/firestoreUtils";
import { motion, AnimatePresence } from "motion/react";
import { Plus, Edit2, Trash2, Check, X, Camera, LogIn, LogOut, Upload, Loader2 } from "lucide-react";

interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  inStock: boolean;
  category?: string;
}

export function MenuSection() {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [loading, setLoading] = useState(true);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: 0,
    imageUrl: "",
    inStock: true,
    category: "Taco"
  });

  const [selectedCategory, setSelectedCategory] = useState("All");
  const categories = ["All", "Taco", "Sides", "Drinks", "Desserts"];

  useEffect(() => {
    const q = query(collection(db, "menu"), orderBy("name"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const menuData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as MenuItem[];
      setItems(menuData);
      setLoading(false);

      // Check for price sync request
      const churrosToUpdate = menuData.filter(item => 
        item.name.toLowerCase() === "churro" && item.price !== 5
      );
      churrosToUpdate.forEach(async (churro) => {
        try {
          await updateDoc(doc(db, "menu", churro.id), { price: 5 });
        } catch (e) {
          console.error("Sync price failed:", e);
        }
      });
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, "menu");
    });

    const authUnsubscribe = auth.onAuthStateChanged((user) => {
      // Simplified admin check for demo based on user email
      setIsAdmin(user?.email === "outgame954@gmail.com");
    });

    return () => {
      unsubscribe();
      authUnsubscribe();
    };
  }, []);

  const filteredItems = selectedCategory === "All" 
    ? items 
    : items.filter(item => item.category === selectedCategory);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isUploading) return;
    
    try {
      if (editingId) {
        await updateDoc(doc(db, "menu", editingId), {
          ...formData,
          updatedAt: serverTimestamp()
        });
        setEditingId(null);
      } else {
        await addDoc(collection(db, "menu"), {
          ...formData,
          updatedAt: serverTimestamp()
        });
        setIsAdding(false);
      }
      setFormData({ name: "", description: "", price: 0, imageUrl: "", inStock: true, category: "Taco" });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, "menu");
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this item?")) {
      try {
        await deleteDoc(doc(db, "menu", id));
      } catch (error) {
        handleFirestoreError(error, OperationType.DELETE, `menu/${id}`);
      }
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file type
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file');
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    const storageRef = ref(storage, `menu/${Date.now()}_${file.name}`);
    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on('state_changed', 
      (snapshot) => {
        const total = snapshot.totalBytes;
        const progress = total > 0 ? (snapshot.bytesTransferred / total) * 100 : 0;
        setUploadProgress(progress);
      }, 
      (error) => {
        console.error("Upload failed", error);
        setIsUploading(false);
        setUploadProgress(null);
        alert("Upload failed. Please try again.");
      }, 
      () => {
        getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
          setFormData(prev => ({ ...prev, imageUrl: downloadURL }));
          setIsUploading(false);
          setUploadProgress(null);
        });
      }
    );
  };

  const startEdit = (item: MenuItem) => {
    setEditingId(item.id);
    setFormData({
      name: item.name,
      description: item.description || "",
      price: item.price,
      imageUrl: item.imageUrl,
      inStock: item.inStock,
      category: item.category || "Taco"
    });
    setIsAdding(false);
  };

  return (
    <section id="full-menu" className="py-24 px-4 bg-white border-b-2 border-black">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
          <div>
            <h2 className="font-display text-6xl md:text-8xl uppercase tracking-tighter mb-4">
              The <span className="text-neon-orange">Menu</span>
            </h2>
            <p className="font-mono text-xl text-zinc-600 max-w-lg">
              Our signature stacks, pre-designed for maximum flavor. Available every day at the truck.
            </p>
          </div>

          <div className="flex gap-4">
            {isAdmin ? (
              <>
                <button 
                  onClick={() => setIsAdding(true)}
                  className="brutal-btn bg-neon-yellow flex items-center gap-2"
                >
                  <Plus size={20} /> Add Item
                </button>
                <button 
                  onClick={logout}
                  className="brutal-btn bg-black text-white flex items-center gap-2"
                >
                  <LogOut size={20} /> Logout
                </button>
              </>
            ) : (
              <button 
                onClick={login}
                className="font-mono text-xs uppercase tracking-widest text-zinc-400 hover:text-black transition-colors flex items-center gap-2"
              >
                <LogIn size={14} /> Admin Login
              </button>
            )}
          </div>
        </div>

        {/* Category Filters */}
        <div className="flex flex-wrap gap-3 mb-12">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`font-mono px-6 py-2 border-2 border-black transition-all ${
                selectedCategory === cat 
                  ? "bg-black text-white brutal-shadow-sm -translate-y-1" 
                  : "bg-white hover:bg-zinc-100"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Form Modal/Section */}
        <AnimatePresence>
          {(isAdding || editingId) && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="mb-12 p-8 border-4 border-black brutal-shadow bg-neon-yellow relative z-20"
            >
              <button 
                onClick={() => { setIsAdding(false); setEditingId(null); }}
                className="absolute top-4 right-4 p-2 hover:bg-white transition-colors"
              >
                <X />
              </button>
              <h3 className="font-display text-3xl uppercase mb-6">
                {editingId ? "Edit Item" : "Add New Item"}
              </h3>
              <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <label className="font-mono text-xs uppercase font-bold">Item Name</label>
                  <input 
                    required
                    type="text" 
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    className="w-full p-2 border-2 border-black font-mono focus:ring-0 focus:border-neon-orange outline-none"
                    placeholder="e.g. The Mega Stack"
                  />
                </div>
                <div className="space-y-2 lg:col-span-2">
                  <label className="font-mono text-xs uppercase font-bold">Description</label>
                  <input 
                    type="text" 
                    value={formData.description}
                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                    className="w-full p-2 border-2 border-black font-mono focus:ring-0 focus:border-neon-orange outline-none"
                    placeholder="Brief description of the item..."
                  />
                </div>
                <div className="space-y-2">
                  <label className="font-mono text-xs uppercase font-bold">Price ($)</label>
                  <input 
                    required
                    type="number" 
                    step="0.01"
                    value={isNaN(formData.price) ? "" : formData.price}
                    onChange={e => {
                      const val = parseFloat(e.target.value);
                      setFormData({ ...formData, price: isNaN(val) ? 0 : val });
                    }}
                    className="w-full p-2 border-2 border-black font-mono focus:ring-0 focus:border-neon-orange outline-none"
                  />
                </div>
                <div className="space-y-2">
                  <label className="font-mono text-xs uppercase font-bold">Image</label>
                  <div className="relative">
                    <input 
                      type="file" 
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                      id="image-upload"
                    />
                    <label 
                      htmlFor="image-upload"
                      className="w-full flex items-center justify-center gap-2 p-4 border-2 border-dashed border-black bg-white hover:bg-zinc-50 cursor-pointer transition-colors"
                    >
                      {isUploading ? (
                        <Loader2 className="animate-spin text-neon-orange" size={24} />
                      ) : (
                        <Upload size={24} />
                      )}
                      <span className="font-mono text-sm uppercase font-bold">
                        {isUploading ? "Uploading..." : "Upload Image"}
                      </span>
                    </label>
                  </div>
                  {uploadProgress !== null && (
                    <div className="w-full h-2 bg-black/10 mt-2">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${uploadProgress}%` }}
                        className="h-full bg-neon-orange"
                      />
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  <label className="font-mono text-xs uppercase font-bold">Category</label>
                  <select 
                    required
                    value={formData.category}
                    onChange={e => setFormData({ ...formData, category: e.target.value })}
                    className="w-full p-2 border-2 border-black font-mono focus:ring-0 focus:border-neon-orange outline-none bg-white"
                  >
                    {categories.filter(c => c !== "All").map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div className="flex items-center gap-4 pt-8">
                  <label className="font-mono text-xs uppercase font-bold flex items-center gap-2 cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={formData.inStock}
                      onChange={e => setFormData({ ...formData, inStock: e.target.checked })}
                      className="w-6 h-6 border-2 border-black checked:bg-neon-orange appearance-none cursor-pointer"
                    />
                    In Stock
                  </label>
                </div>
                <div className="lg:col-span-3 pt-4">
                  <button type="submit" className="brutal-btn w-full bg-black text-white hover:bg-neon-orange py-4 text-xl">
                    {editingId ? "Update Menu Item" : "Save to Menu"}
                  </button>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-96 bg-zinc-100 animate-pulse border-2 border-black" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredItems.map(item => (
              <motion.div 
                layout
                key={item.id}
                className={`relative border-2 border-black bg-white group hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-all ${!item.inStock ? 'opacity-60' : ''}`}
              >
                <div className="aspect-[4/3] overflow-hidden border-b-2 border-black relative bg-zinc-100">
                  {item.imageUrl && (
                    <img 
                      src={item.imageUrl} 
                      alt={item.name} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      referrerPolicy="no-referrer"
                    />
                  )}
                  {!item.inStock && (
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center pointer-events-none">
                      <span className="font-display text-4xl text-white uppercase -rotate-12 border-4 border-white px-4 py-2">Sold Out</span>
                    </div>
                  )}
                </div>
                
                <div className="p-6 space-y-4">
                  <div className="flex justify-between items-start">
                    <h3 className="font-display text-3xl uppercase tracking-tight">{item.name}</h3>
                    <p className="font-display text-2xl text-neon-orange">${item.price.toFixed(2)}</p>
                  </div>

                  {item.description && (
                    <p className="font-mono text-xs text-zinc-500 leading-relaxed">{item.description}</p>
                  )}
                  
                  {isAdmin && (
                    <div className="flex gap-2 pt-4 border-t border-black/10">
                      <button 
                        onClick={() => startEdit(item)}
                        className="flex-1 brutal-btn py-2 text-xs bg-neon-yellow flex items-center justify-center gap-2"
                      >
                        <Edit2 size={14} /> Edit
                      </button>
                      <button 
                        onClick={() => handleDelete(item.id)}
                        className="p-3 border-2 border-black hover:bg-red-500 hover:text-white transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
