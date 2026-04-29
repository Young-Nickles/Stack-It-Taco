/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { 
  collection, 
  onSnapshot, 
  addDoc, 
  deleteDoc, 
  doc, 
  query, 
  orderBy,
  serverTimestamp
} from "firebase/firestore";
import { db, auth, login } from "../lib/firebase";
import { handleFirestoreError, OperationType } from "../lib/firestoreUtils";
import { motion, AnimatePresence } from "motion/react";
import { Star, MessageSquare, Trash2, Send, LogIn, Loader2 } from "lucide-react";

interface Review {
  id: string;
  name: string;
  rating: number;
  comment: string;
  createdAt: any;
}

export function ReviewsSection() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");

  useEffect(() => {
    const q = query(collection(db, "reviews"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Review[];
      setReviews(data);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, "reviews");
    });

    const authUnsubscribe = auth.onAuthStateChanged((u) => {
      setUser(u);
      setIsAdmin(u?.email === "outgame954@gmail.com");
    });

    return () => {
      unsubscribe();
      authUnsubscribe();
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (rating < 1 || rating > 5 || !comment.trim()) return;

    setSubmitting(true);
    try {
      await addDoc(collection(db, "reviews"), {
        name: user.displayName || "Anonymous User",
        rating,
        comment: comment.trim(),
        createdAt: serverTimestamp()
      });
      setComment("");
      setRating(5);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, "reviews");
    } finally {
      setSubmitting(false);
    }
  };

  const deleteReview = async (id: string) => {
    if (!window.confirm("Delete this review?")) return;
    try {
      await deleteDoc(doc(db, "reviews", id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `reviews/${id}`);
    }
  };

  return (
    <section id="reviews" className="py-24 px-4 bg-zinc-50 border-t-2 border-black">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start mb-16 gap-8">
          <div>
            <h2 className="font-display text-6xl md:text-8xl uppercase tracking-tighter mb-4">
              Real <br /> <span className="text-neon-orange">Feedback</span>
            </h2>
            <p className="font-mono text-xl text-zinc-600 max-w-lg">
              Don't just take our word for it. Hear from the stackers themselves.
            </p>
          </div>

          <div className="w-full md:w-[400px] bg-white border-2 border-black p-8 brutal-shadow">
            {!user ? (
              <div className="text-center space-y-4">
                <MessageSquare className="mx-auto text-zinc-300" size={48} />
                <p className="font-mono text-sm uppercase font-bold">Sign in to leave a review</p>
                <button 
                  onClick={login}
                  className="brutal-btn w-full flex items-center justify-center gap-2"
                >
                  <LogIn size={20} /> Login with Google
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="flex justify-between items-center">
                  <span className="font-mono text-xs uppercase font-bold">Rate Your Stack</span>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map(star => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        className={`transition-colors ${star <= rating ? "text-neon-orange" : "text-zinc-200"}`}
                      >
                        <Star size={24} fill={star <= rating ? "currentColor" : "none"} />
                      </button>
                    ))}
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="font-mono text-xs uppercase font-bold">Comment</label>
                  <textarea
                    required
                    value={comment}
                    onChange={e => setComment(e.target.value)}
                    className="w-full p-4 border-2 border-black font-mono text-sm min-h-[100px] outline-none focus:border-neon-orange"
                    placeholder="Tell us about your taco..."
                  />
                </div>
                <button 
                  type="submit" 
                  disabled={submitting}
                  className="brutal-btn w-full flex items-center justify-center gap-2 bg-neon-yellow disabled:opacity-50"
                >
                  {submitting ? <Loader2 className="animate-spin" size={20} /> : <Send size={20} />}
                  Post Review
                </button>
              </form>
            )}
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="animate-spin text-neon-orange" size={48} />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <AnimatePresence mode="popLayout">
              {reviews.map((review) => (
                <motion.div
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  key={review.id}
                  className="bg-white border-2 border-black p-8 brutal-shadow relative group"
                >
                  <div className="flex gap-1 mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star 
                        key={i} 
                        size={16} 
                        className={i < review.rating ? "text-neon-orange" : "text-zinc-200"}
                        fill={i < review.rating ? "currentColor" : "none"}
                      />
                    ))}
                  </div>
                  <p className="font-mono text-base italic text-zinc-700 mb-6 leading-relaxed">
                    "{review.comment}"
                  </p>
                  <div className="flex justify-between items-end border-t border-black/10 pt-4">
                    <div>
                      <p className="font-display text-xl uppercase">{review.name}</p>
                      <p className="font-mono text-[10px] uppercase text-zinc-400">
                        {review.createdAt?.toDate().toLocaleDateString()}
                      </p>
                    </div>
                    {isAdmin && (
                      <button 
                        onClick={() => deleteReview(review.id)}
                        className="p-2 text-zinc-300 hover:text-red-500 transition-colors"
                      >
                        <Trash2 size={18} />
                      </button>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {reviews.length === 0 && !loading && (
              <div className="col-span-full py-20 text-center border-2 border-dashed border-black/10">
                <p className="font-mono text-zinc-400 italic">No reviews yet. Be the first to shout it out!</p>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
