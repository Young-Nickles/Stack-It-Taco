/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { MapPin, Navigation, Clock, Calendar, Edit2, Check, X, Plus, Trash2 } from "lucide-react";
import { db, auth } from "../lib/firebase";
import { doc, onSnapshot, setDoc, getDocFromServer } from "firebase/firestore";
import { handleFirestoreError, OperationType } from "../lib/firestoreUtils";

interface ScheduleItem {
  day: string;
  place: string;
  time: string;
}

interface TruckConfig {
  address: string;
  locationName: string;
  waitTime: string;
  nextPopUp: string;
  heroTitle1: string;
  heroTitle2: string;
  heroDescription: string;
  aboutTitle: string;
  aboutText: string;
  schedule: ScheduleItem[];
}

const DEFAULT_CONFIG: TruckConfig = {
  address: "Arts District, Los Angeles, CA",
  locationName: "Arts District Central Square",
  waitTime: "12 Mins",
  nextPopUp: "This SAT",
  heroTitle1: "We Stack",
  heroTitle2: "You Eat",
  heroDescription: "The food truck that lets you direct the masterpiece. Fresh corn tortillas, slow-braised meats, and salsas made 10 minutes ago.",
  aboutTitle: "Watch the Magic Happen",
  aboutText: "We don't hide behind a curtain. Our assembly line is your stage. From the moment the tortilla hits the flat-top to the final drizzle of our ghost-burn salsa, you're in charge.",
  schedule: [
    { day: "Mon-Tue", place: "Arts District", time: "11am - 8pm" },
    { day: "Wed-Thu", place: "Tech Hub Plaza", time: "11am - 7pm" },
    { day: "Fri-Sat", place: "Central Brewery", time: "2pm - 11pm" },
    { day: "Sun", place: "Closed", time: "--" }
  ]
};

export function TruckLocation() {
  const [config, setConfig] = useState<TruckConfig>(DEFAULT_CONFIG);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<TruckConfig>(DEFAULT_CONFIG);

  useEffect(() => {
    const unsubscribe = onSnapshot(doc(db, "config", "truck"), (snapshot) => {
      if (snapshot.exists()) {
        setConfig(snapshot.data() as TruckConfig);
      }
    }, (error) => {
      // Only report error if it's not a missing document (which we handle)
      handleFirestoreError(error, OperationType.GET, "config/truck");
    });

    const authUnsubscribe = auth.onAuthStateChanged(async (user) => {
      const isUserAdmin = user?.email === "outgame954@gmail.com";
      setIsAdmin(isUserAdmin);

      // Initialize config if it doesn't exist and current user is Admin
      if (isUserAdmin) {
        try {
          const configDoc = await getDocFromServer(doc(db, "config", "truck"));
          if (!configDoc.exists()) {
            await setDoc(doc(db, "config", "truck"), DEFAULT_CONFIG);
          }
        } catch (e) {
          console.error("Admin failed to check/init config:", e);
        }
      }
    });

    return () => {
      unsubscribe();
      authUnsubscribe();
    };
  }, []);

  const handleSave = async () => {
    try {
      await setDoc(doc(db, "config", "truck"), editData);
      setIsEditing(false);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, "config/truck");
    }
  };

  const startEdit = () => {
    setEditData(config);
    setIsEditing(true);
  };

  const addScheduleItem = () => {
    setEditData({
      ...editData,
      schedule: [...editData.schedule, { day: "", place: "", time: "" }]
    });
  };

  const updateScheduleItem = (index: number, field: keyof ScheduleItem, value: string) => {
    const newSchedule = [...editData.schedule];
    newSchedule[index] = { ...newSchedule[index], [field]: value };
    setEditData({ ...editData, schedule: newSchedule });
  };

  const removeScheduleItem = (index: number) => {
    setEditData({
      ...editData,
      schedule: editData.schedule.filter((_, i) => i !== index)
    });
  };

  return (
    <section id="location" className="py-24 px-4 bg-white border-t-2 border-black">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-start mb-12">
          <div>
            <h2 className="font-display text-6xl md:text-8xl uppercase tracking-tighter mb-4">
              Catch the <br /> <span className="text-neon-orange">Truck</span>
            </h2>
            <p className="font-mono text-xl text-zinc-600 max-w-lg">
              We're on the move, but never hard to find.
            </p>
          </div>
          {isAdmin && !isEditing && (
            <button onClick={startEdit} className="brutal-btn bg-neon-yellow flex items-center gap-2">
              <Edit2 size={20} /> Edit Location
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          <div className="space-y-12">
            {!isEditing ? (
              <>
                <div className="space-y-6">
                  <h3 className="font-mono text-xs uppercase tracking-[0.3em] font-black text-neon-orange">Current Schedule</h3>
                  <div className="border-t-2 border-black">
                    {config.schedule.map((item, i) => (
                      <div key={i} className="flex justify-between items-center py-4 border-b border-black/10 group hover:bg-zinc-50 px-2 transition-colors">
                        <div className="font-display text-2xl uppercase">{item.day}</div>
                        <div className="text-right">
                          <div className="font-mono font-bold">{item.place}</div>
                          <div className="font-mono text-xs text-zinc-500 uppercase">{item.time}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col gap-4">
                   <div className="flex items-center gap-2 text-zinc-500">
                      <MapPin size={20} className="text-neon-orange" />
                      <span className="font-mono font-bold uppercase tracking-widest">{config.locationName}</span>
                   </div>
                   <a 
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(config.address)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="brutal-btn w-full md:w-auto flex items-center justify-center gap-2 text-black"
                   >
                    <Navigation size={20} /> Get Directions
                  </a>
                </div>
              </>
            ) : (
              <div className="space-y-8 bg-zinc-50 p-8 border-2 border-black brutal-shadow">
                <div className="flex justify-between items-center">
                  <h3 className="font-display text-3xl uppercase">Admin Editor</h3>
                  <div className="flex gap-2">
                    <button onClick={handleSave} className="p-2 border-2 border-black bg-neon-yellow hover:bg-black hover:text-white"><Check /></button>
                    <button onClick={() => setIsEditing(false)} className="p-2 border-2 border-black hover:bg-black hover:text-white"><X /></button>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="font-mono text-[10px] uppercase font-bold text-zinc-500">Google Map Address</label>
                    <input 
                      className="w-full p-2 border-2 border-black font-mono"
                      value={editData.address}
                      onChange={e => setEditData({...editData, address: e.target.value})}
                      placeholder="Street Address, City, State"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-mono text-[10px] uppercase font-bold text-zinc-500">Display Name</label>
                    <input 
                      className="w-full p-2 border-2 border-black font-mono"
                      value={editData.locationName}
                      onChange={e => setEditData({...editData, locationName: e.target.value})}
                    />
                  </div>
                </div>

                <div className="space-y-4 border-t-2 border-black pt-4">
                   <h4 className="font-display text-xl uppercase">Main Content</h4>
                   <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="font-mono text-[10px] uppercase font-bold text-zinc-500">Hero Row 1</label>
                        <input className="w-full p-2 border-2 border-black font-mono text-sm" value={editData.heroTitle1} onChange={e => setEditData({...editData, heroTitle1: e.target.value})} />
                      </div>
                      <div className="space-y-1">
                        <label className="font-mono text-[10px] uppercase font-bold text-zinc-500">Hero Row 2</label>
                        <input className="w-full p-2 border-2 border-black font-mono text-sm" value={editData.heroTitle2} onChange={e => setEditData({...editData, heroTitle2: e.target.value})} />
                      </div>
                   </div>
                   <div className="space-y-1">
                      <label className="font-mono text-[10px] uppercase font-bold text-zinc-500">Hero Description</label>
                      <textarea className="w-full p-2 border-2 border-black font-mono text-xs" rows={2} value={editData.heroDescription} onChange={e => setEditData({...editData, heroDescription: e.target.value})} />
                   </div>
                   <div className="space-y-1">
                      <label className="font-mono text-[10px] uppercase font-bold text-zinc-500">About Title</label>
                      <input className="w-full p-2 border-2 border-black font-mono text-sm" value={editData.aboutTitle} onChange={e => setEditData({...editData, aboutTitle: e.target.value})} />
                   </div>
                   <div className="space-y-1">
                      <label className="font-mono text-[10px] uppercase font-bold text-zinc-500">About Text</label>
                      <textarea className="w-full p-2 border-2 border-black font-mono text-xs" rows={3} value={editData.aboutText} onChange={e => setEditData({...editData, aboutText: e.target.value})} />
                   </div>
                </div>

                <div className="space-y-4">
                   <label className="font-mono text-[10px] uppercase font-bold text-zinc-500">Live Status</label>
                   <div className="grid grid-cols-2 gap-4">
                      <input 
                        className="w-full p-2 border-2 border-black font-mono text-sm"
                        value={editData.waitTime}
                        onChange={e => setEditData({...editData, waitTime: e.target.value})}
                        placeholder="Wait Time (e.g. 15 Mins)"
                      />
                      <input 
                        className="w-full p-2 border-2 border-black font-mono text-sm"
                        value={editData.nextPopUp}
                        onChange={e => setEditData({...editData, nextPopUp: e.target.value})}
                        placeholder="Next Pop Up"
                      />
                   </div>
                </div>

                <div className="space-y-4">
                   <div className="flex justify-between items-center">
                    <label className="font-mono text-[10px] uppercase font-bold text-zinc-500">Weekly Schedule</label>
                    <button onClick={addScheduleItem} className="p-1 border-2 border-black hover:bg-black hover:text-white transition-colors"><Plus size={16} /></button>
                   </div>
                   <div className="space-y-2">
                    {editData.schedule.map((item, i) => (
                      <div key={i} className="flex gap-2 items-center">
                        <input className="flex-1 p-2 border-2 border-black font-mono text-xs" value={item.day} onChange={e => updateScheduleItem(i, 'day', e.target.value)} placeholder="Mon-Tue" />
                        <input className="flex-1 p-2 border-2 border-black font-mono text-xs" value={item.place} onChange={e => updateScheduleItem(i, 'place', e.target.value)} placeholder="Location" />
                        <input className="flex-1 p-2 border-2 border-black font-mono text-xs" value={item.time} onChange={e => updateScheduleItem(i, 'time', e.target.value)} placeholder="Time" />
                        <button onClick={() => removeScheduleItem(i)} className="text-red-500"><Trash2 size={16} /></button>
                      </div>
                    ))}
                   </div>
                </div>
              </div>
            )}
          </div>

          <div className="relative">
            {/* Real Embedded Map */}
            <div className="aspect-square bg-zinc-100 border-2 border-black brutal-shadow relative overflow-hidden group">
              <iframe
                title="map"
                width="100%"
                height="100%"
                frameBorder="0"
                scrolling="no"
                marginHeight={0}
                marginWidth={0}
                src={`https://maps.google.com/maps?q=${encodeURIComponent(config.address)}&t=&z=14&ie=UTF8&iwloc=&output=embed`}
                className="contrast-110"
              />
            </div>

            <div className="mt-8 grid grid-cols-2 gap-4">
              <div className="p-4 border border-black bg-white flex items-center gap-3">
                <Clock className="text-neon-orange" size={24} />
                <div>
                  <p className="font-mono text-[10px] uppercase text-zinc-500">Wait Time</p>
                  <p className="font-display uppercase text-lg">{config.waitTime}</p>
                </div>
              </div>
              <div className="p-4 border border-black bg-white flex items-center gap-3">
                <Calendar className="text-neon-orange" size={24} />
                <div>
                  <p className="font-mono text-[10px] uppercase text-zinc-500">Pop Up</p>
                  <p className="font-display uppercase text-lg">{config.nextPopUp}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
