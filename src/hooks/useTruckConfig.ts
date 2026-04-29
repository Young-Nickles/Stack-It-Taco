/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "../lib/firebase";
import { handleFirestoreError, OperationType } from "../lib/firestoreUtils";

interface ScheduleItem {
  day: string;
  place: string;
  time: string;
}

export interface TruckConfig {
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

export function useTruckConfig() {
  const [config, setConfig] = useState<TruckConfig>(DEFAULT_CONFIG);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onSnapshot(doc(db, "config", "truck"), (snapshot) => {
      if (snapshot.exists()) {
        setConfig(snapshot.data() as TruckConfig);
      }
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, "config/truck");
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return { config, loading };
}
