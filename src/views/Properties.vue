<template>
  <div class="space-y-8">
    <header class="flex items-center justify-between">
      <div>
        <h1 class="text-3xl font-bold tracking-tight text-slate-900">Properties</h1>
        <p class="mt-2 text-slate-600">Manage your real estate assets.</p>
      </div>
      <button 
        @click="showForm = true"
        class="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
      >
        <Plus class="h-4 w-4" />
        Add Property
      </button>
    </header>

    <div v-if="loading" class="flex h-64 items-center justify-center">
      <div class="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent"></div>
    </div>

    <div v-else-if="error" class="rounded-xl border border-red-200 bg-red-50 p-6 text-red-700 text-center">
      <p class="font-medium">{{ error }}</p>
      <button @click="fetchProperties" class="mt-4 text-sm font-semibold underline">Try again</button>
    </div>

    <div v-else class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      <div 
        v-for="prop in properties" 
        :key="prop.property_id"
        class="group relative flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white transition-all hover:shadow-lg"
      >
        <div class="aspect-video w-full bg-slate-100 p-8 flex items-center justify-center text-slate-300">
          <Building2 class="h-16 w-16" />
        </div>
        <div class="flex flex-1 flex-col p-6">
          <div class="flex items-start justify-between">
            <div>
              <h3 class="text-lg font-bold text-slate-900">{{ prop.name }}</h3>
              <p class="text-sm text-slate-500">{{ prop.address }}, {{ prop.city }}</p>
            </div>
            <span class="inline-flex items-center rounded-md bg-indigo-50 px-2 py-1 text-xs font-medium text-indigo-700 ring-1 ring-inset ring-indigo-700/10">
              {{ prop.property_type }}
            </span>
          </div>
          
          <div class="mt-6 grid grid-cols-2 gap-4 border-t border-slate-100 pt-6">
            <div>
              <p class="text-xs font-medium uppercase tracking-wider text-slate-400">Monthly Rent</p>
              <p class="mt-1 text-lg font-bold text-slate-900">${{ prop.monthly_rent }}</p>
            </div>
            <div>
              <p class="text-xs font-medium uppercase tracking-wider text-slate-400">Status</p>
              <p class="mt-1 text-sm font-medium" :class="prop.tenant_name ? 'text-emerald-600' : 'text-amber-600'">
                {{ prop.tenant_name ? 'Occupied' : 'Vacant' }}
              </p>
            </div>
          </div>

          <div class="mt-6 flex gap-3">
            <router-link 
              :to="`/properties/${prop.property_id}`"
              class="flex-1 rounded-lg border border-slate-200 py-2 text-center text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
            >
              View Details
            </router-link>
            <button 
              @click="confirmDelete(prop)"
              class="rounded-lg border border-red-100 p-2 text-red-600 transition-colors hover:bg-red-50"
            >
              <Trash2 class="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      <div v-if="properties.length === 0" class="col-span-full flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 py-20">
        <div class="rounded-full bg-slate-50 p-4">
          <Building2 class="h-8 w-8 text-slate-400" />
        </div>
        <h3 class="mt-4 text-sm font-semibold text-slate-900">No properties</h3>
        <p class="mt-1 text-sm text-slate-500">Get started by creating a new property.</p>
        <button 
          @click="showForm = true"
          class="mt-6 text-sm font-semibold text-indigo-600 hover:text-indigo-500"
        >
          Add your first property
        </button>
      </div>
    </div>

    <!-- Modal for adding property -->
    <div v-if="showForm" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <div class="w-full max-w-lg rounded-2xl bg-white p-8 shadow-2xl">
        <div class="flex items-center justify-between mb-6">
          <h2 class="text-2xl font-bold text-slate-900">Add New Property</h2>
          <button @click="showForm = false" class="text-slate-400 hover:text-slate-600">
            <X class="h-6 w-6" />
          </button>
        </div>

        <form @submit.prevent="handleSubmit" class="space-y-4">
          <div class="grid grid-cols-2 gap-4">
            <div class="space-y-1">
              <label class="text-sm font-medium text-slate-700">Property ID</label>
              <input v-model.number="newProp.property_id" type="number" required class="w-full rounded-lg border border-slate-200 px-3 py-2 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500" />
            </div>
            <div class="space-y-1">
              <label class="text-sm font-medium text-slate-700">Name</label>
              <input v-model="newProp.name" type="text" required class="w-full rounded-lg border border-slate-200 px-3 py-2 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500" />
            </div>
          </div>

          <div class="space-y-1">
            <label class="text-sm font-medium text-slate-700">Address</label>
            <input v-model="newProp.address" type="text" required class="w-full rounded-lg border border-slate-200 px-3 py-2 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500" />
          </div>

          <div class="grid grid-cols-3 gap-4">
            <div class="space-y-1">
              <label class="text-sm font-medium text-slate-700">City</label>
              <input v-model="newProp.city" type="text" required class="w-full rounded-lg border border-slate-200 px-3 py-2 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500" />
            </div>
            <div class="space-y-1">
              <label class="text-sm font-medium text-slate-700">State</label>
              <input v-model="newProp.state" type="text" required class="w-full rounded-lg border border-slate-200 px-3 py-2 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500" />
            </div>
            <div class="space-y-1">
              <label class="text-sm font-medium text-slate-700">Postal Code</label>
              <input v-model="newProp.postal_code" type="text" required class="w-full rounded-lg border border-slate-200 px-3 py-2 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500" />
            </div>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div class="space-y-1">
              <label class="text-sm font-medium text-slate-700">Type</label>
              <select v-model="newProp.property_type" required class="w-full rounded-lg border border-slate-200 px-3 py-2 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500">
                <option value="Single Family">Single Family</option>
                <option value="Multi Family">Multi Family</option>
                <option value="Apartment">Apartment</option>
                <option value="Commercial">Commercial</option>
              </select>
            </div>
            <div class="space-y-1">
              <label class="text-sm font-medium text-slate-700">Monthly Rent</label>
              <input v-model.number="newProp.monthly_rent" type="number" required class="w-full rounded-lg border border-slate-200 px-3 py-2 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500" />
            </div>
          </div>

          <div class="space-y-1">
            <label class="text-sm font-medium text-slate-700">Tenant Name (Optional)</label>
            <input v-model="newProp.tenant_name" type="text" class="w-full rounded-lg border border-slate-200 px-3 py-2 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500" />
          </div>

          <div class="flex gap-3 pt-4">
            <button 
              type="button" 
              @click="showForm = false"
              class="flex-1 rounded-lg border border-slate-200 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button 
              type="submit"
              :disabled="submitting"
              class="flex-1 rounded-lg bg-indigo-600 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 disabled:opacity-50"
            >
              {{ submitting ? 'Saving...' : 'Create Property' }}
            </button>
          </div>
          <p v-if="formError" class="mt-2 text-sm text-red-600 text-center">{{ formError }}</p>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { Plus, Building2, Trash2, X } from 'lucide-vue-next';
import { propertyService, type Property } from '../services/api';

const properties = ref<Property[]>([]);
const loading = ref(true);
const error = ref<string | null>(null);
const showForm = ref(false);
const submitting = ref(false);
const formError = ref<string | null>(null);

const newProp = ref<Property>({
  property_id: 0,
  name: '',
  address: '',
  city: '',
  state: '',
  postal_code: '',
  property_type: 'Single Family',
  tenant_name: null,
  monthly_rent: 0
});

const fetchProperties = async () => {
  loading.value = true;
  error.value = null;
  try {
    const res = await propertyService.getAll();
    properties.value = res.data;
  } catch (err) {
    console.error(err);
    error.value = 'Failed to load properties.';
  } finally {
    loading.value = false;
  }
};

const handleSubmit = async () => {
  submitting.value = true;
  formError.value = null;
  try {
    await propertyService.create(newProp.value);
    await fetchProperties();
    showForm.value = false;
    // Reset form
    newProp.value = {
      property_id: 0,
      name: '',
      address: '',
      city: '',
      state: '',
      postal_code: '',
      property_type: 'Single Family',
      tenant_name: null,
      monthly_rent: 0
    };
  } catch (err) {
    console.error(err);
    formError.value = 'Failed to create property. Make sure the ID is unique.';
  } finally {
    submitting.value = false;
  }
};

const confirmDelete = async (prop: Property) => {
  if (confirm(`Are you sure you want to delete ${prop.name}?`)) {
    try {
      await propertyService.delete(prop.property_id);
      await fetchProperties();
    } catch (err) {
      console.error(err);
      alert('Failed to delete property.');
    }
  }
};

onMounted(fetchProperties);
</script>
