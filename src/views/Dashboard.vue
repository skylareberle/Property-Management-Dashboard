<template>
  <div class="space-y-8">
    <header>
      <h1 class="text-3xl font-bold tracking-tight text-slate-900">Dashboard</h1>
      <p class="mt-2 text-slate-600">Overview of your property portfolio.</p>
    </header>

    <div v-if="loading" class="flex h-64 items-center justify-center">
      <div class="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent"></div>
    </div>

    <div v-else-if="error" class="rounded-xl border border-red-200 bg-red-50 p-6 text-red-700">
      <div class="flex items-center gap-3">
        <AlertCircle class="h-5 w-5" />
        <p class="font-medium">{{ error }}</p>
      </div>
      <button @click="fetchData" class="mt-4 text-sm font-semibold underline hover:text-red-800">
        Try again
      </button>
    </div>

    <div v-else class="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
      <div class="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div class="flex items-center justify-between">
          <p class="text-sm font-medium text-slate-500">Total Properties</p>
          <Building class="h-5 w-5 text-indigo-600" />
        </div>
        <p class="mt-2 text-3xl font-bold text-slate-900">{{ properties.length }}</p>
      </div>

      <div class="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div class="flex items-center justify-between">
          <p class="text-sm font-medium text-slate-500">Total Tenants</p>
          <Users class="h-5 w-5 text-indigo-600" />
        </div>
        <p class="mt-2 text-3xl font-bold text-slate-900">{{ tenants.length }}</p>
      </div>

      <div class="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div class="flex items-center justify-between">
          <p class="text-sm font-medium text-slate-500">Monthly Revenue</p>
          <DollarSign class="h-5 w-5 text-emerald-600" />
        </div>
        <p class="mt-2 text-3xl font-bold text-slate-900">${{ totalMonthlyRent.toLocaleString() }}</p>
      </div>

      <div class="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div class="flex items-center justify-between">
          <p class="text-sm font-medium text-slate-500">Occupancy Rate</p>
          <PieChart class="h-5 w-5 text-indigo-600" />
        </div>
        <p class="mt-2 text-3xl font-bold text-slate-900">{{ occupancyRate }}%</p>
      </div>
    </div>

    <div v-if="!loading && !error" class="grid gap-8 lg:grid-cols-2">
      <section class="space-y-4">
        <h2 class="text-xl font-bold text-slate-900">Recent Properties</h2>
        <div class="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <table class="w-full text-left text-sm">
            <thead class="bg-slate-50 text-slate-500">
              <tr>
                <th class="px-6 py-3 font-medium">Name</th>
                <th class="px-6 py-3 font-medium">Type</th>
                <th class="px-6 py-3 font-medium text-right">Rent</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              <tr v-for="prop in properties.slice(0, 5)" :key="prop.property_id" class="hover:bg-slate-50 transition-colors cursor-pointer" @click="$router.push(`/properties/${prop.property_id}`)">
                <td class="px-6 py-4 font-medium text-slate-900">{{ prop.name }}</td>
                <td class="px-6 py-4 text-slate-600">{{ prop.property_type }}</td>
                <td class="px-6 py-4 text-right font-mono text-slate-600">${{ prop.monthly_rent }}</td>
              </tr>
              <tr v-if="properties.length === 0">
                <td colspan="3" class="px-6 py-8 text-center text-slate-500 italic">No properties found.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section class="space-y-4">
        <h2 class="text-xl font-bold text-slate-900">Recent Tenants</h2>
        <div class="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <table class="w-full text-left text-sm">
            <thead class="bg-slate-50 text-slate-500">
              <tr>
                <th class="px-6 py-3 font-medium">Tenant</th>
                <th class="px-6 py-3 font-medium">Property</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              <tr v-for="tenant in tenants.slice(0, 5)" :key="tenant.tenant_name" class="hover:bg-slate-50 transition-colors">
                <td class="px-6 py-4 font-medium text-slate-900">{{ tenant.tenant_name }}</td>
                <td class="px-6 py-4 text-slate-600">{{ tenant.property_name }}</td>
              </tr>
              <tr v-if="tenants.length === 0">
                <td colspan="2" class="px-6 py-8 text-center text-slate-500 italic">No tenants found.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { Building, Users, DollarSign, PieChart, AlertCircle } from 'lucide-vue-next';
import { propertyService, tenantService, type Property, type Tenant } from '../services/api';

const properties = ref<Property[]>([]);
const tenants = ref<Tenant[]>([]);
const loading = ref(true);
const error = ref<string | null>(null);

const totalMonthlyRent = computed(() => {
  return properties.value.reduce((sum, prop) => sum + prop.monthly_rent, 0);
});

const occupancyRate = computed(() => {
  if (properties.value.length === 0) return 0;
  const occupied = properties.value.filter(p => p.tenant_name).length;
  return Math.round((occupied / properties.value.length) * 100);
});

const fetchData = async () => {
  loading.value = true;
  error.value = null;
  try {
    const [propsRes, tenantsRes] = await Promise.all([
      propertyService.getAll(),
      tenantService.getAll()
    ]);
    properties.value = propsRes.data;
    tenants.value = tenantsRes.data;
  } catch (err) {
    console.error(err);
    error.value = 'Failed to load dashboard data. Please check your connection.';
  } finally {
    loading.value = false;
  }
};

onMounted(fetchData);
</script>
