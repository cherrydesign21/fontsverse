// ─── Persistent auth with localStorage ────────────────────────────────────
// Production upgrade path: swap localStorage calls for Supabase / PlanetScale

export type Role = "admin" | "user";

export interface StoredUser {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: Role;
  createdAt: string;
}

const USERS_KEY   = "fv_users_v2";
const SESSION_KEY = "fv_session_v2";

// ── seeded admin (always present) ─────────────────────────────────────────
const SEED_ADMIN: StoredUser = {
  id: "admin_seed_1",
  name: "Admin",
  email: "admin@fontsverse.app",
  passwordHash: _hash("admin123"),
  role: "admin",
  createdAt: "2026-01-01T00:00:00.000Z",
};

function _hash(plain: string): string {
  // Deterministic fake hash — replace with bcrypt on a real server
  return btoa("fv2026:" + plain);
}
function _check(plain: string, hash: string): boolean {
  return _hash(plain) === hash;
}

function getUsers(): StoredUser[] {
  if (typeof window === "undefined") return [SEED_ADMIN];
  try {
    const list: StoredUser[] = JSON.parse(localStorage.getItem(USERS_KEY) || "[]");
    // Always keep seeded admin in sync
    const withAdmin = list.filter(u => u.id !== SEED_ADMIN.id);
    withAdmin.unshift(SEED_ADMIN);
    return withAdmin;
  } catch {
    return [SEED_ADMIN];
  }
}

function saveUsers(users: StoredUser[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

// ── Public API ────────────────────────────────────────────────────────────
export function registerUser(
  name: string, email: string, password: string
): { ok: true; user: StoredUser } | { ok: false; error: string } {
  const n = name.trim(), e = email.trim().toLowerCase(), p = password;
  if (!n)               return { ok: false, error: "Name is required." };
  if (!e || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e))
                        return { ok: false, error: "Enter a valid email." };
  if (p.length < 6)     return { ok: false, error: "Password must be at least 6 characters." };

  const users = getUsers();
  if (users.find(u => u.email === e))
    return { ok: false, error: "An account with this email already exists. Try signing in." };

  const user: StoredUser = {
    id: `user_${Date.now()}`,
    name: n,
    email: e,
    passwordHash: _hash(p),
    role: "user",
    createdAt: new Date().toISOString(),
  };
  users.push(user);
  saveUsers(users);
  return { ok: true, user };
}

export function loginUser(
  email: string, password: string
): { ok: true; user: StoredUser } | { ok: false; error: string } {
  if (!email.trim() || !password)
    return { ok: false, error: "Email and password are required." };

  const users = getUsers();
  const user = users.find(u => u.email === email.trim().toLowerCase());
  if (!user)             return { ok: false, error: "No account found with this email." };
  if (!_check(password, user.passwordHash))
                        return { ok: false, error: "Incorrect password." };
  return { ok: true, user };
}

export function getSession(): StoredUser | null {
  if (typeof window === "undefined") return null;
  try { return JSON.parse(localStorage.getItem(SESSION_KEY) || "null"); }
  catch { return null; }
}

export function saveSession(u: StoredUser) {
  if (typeof window !== "undefined")
    localStorage.setItem(SESSION_KEY, JSON.stringify(u));
}

export function clearSession() {
  if (typeof window !== "undefined")
    localStorage.removeItem(SESSION_KEY);
}

export function updateStoredUser(id: string, patch: Partial<StoredUser>) {
  const users = getUsers();
  const i = users.findIndex(u => u.id === id);
  if (i === -1) return;
  users[i] = { ...users[i], ...patch };
  saveUsers(users);
}

export function getAllUsers(): StoredUser[] {
  return getUsers();
}
