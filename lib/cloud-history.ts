import {
  addDoc,
  collection,
  getDocs,
  limit,
  orderBy,
  query,
} from "firebase/firestore";
import { firebaseDb, isFirebaseConfigured } from "@/lib/firebase";
import type { InterviewSession } from "@/lib/interview-history";
import type { AptitudeSession } from "@/lib/aptitude-history";

const MAX_CLOUD_ITEMS = 100;

function ensureCloudReady() {
  if (!isFirebaseConfigured || !firebaseDb) {
    throw new Error("Firebase is not configured.");
  }
}

type InterviewPayload = Omit<InterviewSession, "id" | "createdAt">;
type AptitudePayload = Omit<AptitudeSession, "id" | "createdAt">;

export async function saveInterviewSessionCloud(
  uid: string,
  session: InterviewPayload
): Promise<void> {
  ensureCloudReady();
  await addDoc(collection(firebaseDb!, "users", uid, "interviewHistory"), {
    ...session,
    createdAt: new Date().toISOString(),
  });
}

export async function saveAptitudeSessionCloud(
  uid: string,
  session: AptitudePayload
): Promise<void> {
  ensureCloudReady();
  await addDoc(collection(firebaseDb!, "users", uid, "aptitudeHistory"), {
    ...session,
    createdAt: new Date().toISOString(),
  });
}

export async function getInterviewHistoryCloud(uid: string): Promise<InterviewSession[]> {
  ensureCloudReady();
  const ref = collection(firebaseDb!, "users", uid, "interviewHistory");
  const q = query(ref, orderBy("createdAt", "desc"), limit(MAX_CLOUD_ITEMS));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...(doc.data() as Omit<InterviewSession, "id">),
  }));
}

export async function getAptitudeHistoryCloud(uid: string): Promise<AptitudeSession[]> {
  ensureCloudReady();
  const ref = collection(firebaseDb!, "users", uid, "aptitudeHistory");
  const q = query(ref, orderBy("createdAt", "desc"), limit(MAX_CLOUD_ITEMS));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...(doc.data() as Omit<AptitudeSession, "id">),
  }));
}
