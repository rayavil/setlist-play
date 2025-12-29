import { createRouter, createWebHistory } from "vue-router";
import HomeView from "../views/HomeView.vue";
import SetlistView from "../views/SetlistView.vue";
import LoginView from "../views/LoginView.vue";
import ResetPasswordView from "../views/ResetPasswordView.vue";
import HelpView from "../views/HelpView.vue";
import SongLibraryView from "../views/SongLibraryView.vue";

import { supabase } from "../lib/supabase";

import AdminLayout from "../layouts/AdminLayout.vue";
import AdminView from "../views/AdminView.vue";
import AdminUsers from "../views/AdminUsers.vue";
import AdminSongs from "../views/AdminSongs.vue";

const routes = [
  { path: "/", component: HomeView },
  { path: "/help", component: HelpView },
  { path: "/login", component: LoginView },
  { path: "/reset-password", component: ResetPasswordView },
  { path: "/setlist/:id", component: SetlistView, props: true },
  { path: "/library", component: SongLibraryView },
  {
    path: "/admin",
    component: AdminLayout,
    meta: { requiresAdmin: true },
    children: [
      { path: "", component: AdminView },
      { path: "users", component: AdminUsers },
      { path: "songs", component: AdminSongs },
    ],
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach(async (to, from, next) => {
  if (to.meta.requiresAdmin) {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) return next("/login");

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", session.user.id)
      .single();

    if (profile?.role === 'admin' || profile?.role === 'super_admin') {
      next();
    } else {
      next("/"); // Not authorized
    }
  } else {
    next();
  }
});

export default router;
