import { createRouter, createWebHistory } from 'vue-router';
import Dashboard from '../views/Dashboard.vue';
import Properties from '../views/Properties.vue';
import PropertyDetail from '../views/PropertyDetail.vue';
import Tenants from '../views/Tenants.vue';
import Income from '../views/Income.vue';
import Expenses from '../views/Expenses.vue';

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', name: 'dashboard', component: Dashboard },
    { path: '/properties', name: 'properties', component: Properties },
    { path: '/properties/:id', name: 'property-detail', component: PropertyDetail },
    { path: '/tenants', name: 'tenants', component: Tenants },
    { path: '/income', name: 'income', component: Income },
    { path: '/expenses', name: 'expenses', component: Expenses },
  ],
});

export default router;
