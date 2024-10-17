import { createRouter, createWebHistory } from 'vue-router';

export const routes = [
  {
    path: '/a',
    component: () => import('@/views/a.vue'),
    meta: {
      name: 'A',
    },
  },
  {
    path: '/b',
    component: () => import('@/views/b.vue'),
    meta: {
      name: 'B',
    },
  },
];
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: '/a',
    },
    ...routes,
    {
      path: '/:pathMatch(.*)*',
      redirect: '/a',
    },
  ],
});

export default router;
