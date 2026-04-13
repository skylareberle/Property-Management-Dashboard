<template>
  <div class="space-y-8">
    <header>
      <h1 class="text-3xl font-bold tracking-tight text-slate-900">Tenants</h1>
      <p class="mt-2 text-slate-600">Overview of all current tenants and their properties.</p>
    </header>

    <div v-if="loading" class="flex h-64 items-center justify-center">
      <div class="h-8 w-8 animate-spin rounded-full border-4 border-purdue-gold border-t-transparent"></div>
    </div>

    <div v-else-if="error" class="rounded-xl border border-red-200 bg-red-50 p-6 text-red-700 text-center">
      <p class="font-medium">{{ error }}</p>
      <button @click="fetchTenants" class="mt-4 text-sm font-semibold underline">Try again</button>
    </div>

    <div v-else class="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <table class="w-full text-left text-sm">
        <thead class="bg-slate-50 text-slate-500">
          <tr>
            <th class="px-6 py-4 font-semibold">Tenant Name</th>
            <th class="px-6 py-4 font-semibold">Property Occupied</th>
            <th class="px-6 py-4 font-semibold text-right">Actions</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-100">
          <tr v-for="tenant in tenants" :key="tenant.tenant_name" class="hover:bg-slate-50 transition-colors">
            <td class="px-6 py-4">
              <div class="flex items-center gap-3">
                <div class="flex h-8 w-8 items-center justify-center rounded-full bg-purdue-gold/10 text-purdue-black">
                  <User class="h-4 w-4" />
                </div>
                <span class="font-medium text-slate-900">{{ tenant.tenant_name }}</span>
              </div>
            </td>
            <td class="px-6 py-4 text-slate-600">{{ tenant.property_name }}</td>
            <td class="px-6 py-4 text-right">
              <button class="text-sm font-semibold text-purdue-black hover:text-purdue-grey">
                View Lease
              </button>
            </td>
          </tr>
          <tr v-if="tenants.length === 0">
            <td colspan="3" class="px-6 py-12 text-center text-slate-500 italic">
              <div class="flex flex-col items-center gap-2">
                <Users class="h-8 w-8 text-slate-300" />
                <p>No active tenants found.</p>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { User, Users } from 'lucide-vue-next';
import { tenantService, type Tenant } from '../services/api';

const tenants = ref<Tenant[]>([]);
const loading = ref(true);
const error = ref<string | null>(null);

const fetchTenants = async () => {
  loading.value = true;
  error.value = null;
  try {
    const res = await tenantService.getAll();
    tenants.value = res.data;
  } catch (err) {
    console.error(err);
    error.value = 'Failed to load tenants list.';
  } finally {
    loading.value = false;
  }
};

onMounted(fetchTenants);
</script>
