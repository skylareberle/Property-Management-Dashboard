<template>
  <div class="space-y-8">
    <header class="flex items-center justify-between">
      <div>
        <h1 class="text-3xl font-bold tracking-tight text-slate-900">Income Records</h1>
        <p class="mt-2 text-slate-600">Comprehensive list of all income across your properties.</p>
      </div>
      <button 
        @click="showForm = true"
        class="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all hover:bg-emerald-500"
      >
        <Plus class="h-4 w-4" />
        Add Income
      </button>
    </header>

    <div v-if="loading" class="flex h-64 items-center justify-center">
      <div class="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent"></div>
    </div>

    <div v-else-if="error" class="rounded-xl border border-red-200 bg-red-50 p-6 text-red-700 text-center">
      <p class="font-medium">{{ error }}</p>
      <button @click="fetchAllIncome" class="mt-4 text-sm font-semibold underline">Try again</button>
    </div>

    <div v-else class="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div class="overflow-x-auto">
        <table class="w-full text-left text-sm">
          <thead class="bg-slate-50 text-slate-500">
            <tr>
              <th class="px-6 py-4 font-semibold">ID</th>
              <th class="px-6 py-4 font-semibold">Property</th>
              <th class="px-6 py-4 font-semibold">Date</th>
              <th class="px-6 py-4 font-semibold">Description</th>
              <th class="px-6 py-4 font-semibold text-right">Amount</th>
              <th class="px-6 py-4 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            <tr v-for="item in allIncome" :key="item.income_id" class="hover:bg-slate-50 transition-colors">
              <td class="px-6 py-4 text-slate-400 font-mono">{{ item.income_id }}</td>
              <td class="px-6 py-4 font-medium text-slate-900">{{ item.propertyName }}</td>
              <td class="px-6 py-4 text-slate-600">{{ item.date }}</td>
              <td class="px-6 py-4 text-slate-600">{{ item.description || '-' }}</td>
              <td class="px-6 py-4 text-right font-mono text-emerald-600 font-bold">${{ item.amount.toLocaleString() }}</td>
              <td class="px-6 py-4 text-right">
                <div class="flex justify-end gap-2">
                  <button @click="viewProperty(item.propertyId)" class="text-slate-400 hover:text-indigo-600" title="View Property">
                    <ExternalLink class="h-4 w-4" />
                  </button>
                  <button @click="confirmDelete(item)" class="text-slate-400 hover:text-red-600" title="Delete Record">
                    <Trash2 class="h-4 w-4" />
                  </button>
                </div>
              </td>
            </tr>
            <tr v-if="allIncome.length === 0">
              <td colspan="6" class="px-6 py-12 text-center text-slate-500 italic">
                <div class="flex flex-col items-center gap-2">
                  <TrendingUp class="h-8 w-8 text-slate-300" />
                  <p>No income records found.</p>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Modal for adding income -->
    <div v-if="showForm" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <div class="w-full max-w-md rounded-2xl bg-white p-8 shadow-2xl">
        <div class="flex items-center justify-between mb-6">
          <h2 class="text-2xl font-bold text-slate-900">Add Income Record</h2>
          <button @click="showForm = false" class="text-slate-400 hover:text-slate-600">
            <X class="h-6 w-6" />
          </button>
        </div>

        <form @submit.prevent="handleSubmit" class="space-y-4">
          <div class="space-y-1">
            <label class="text-sm font-medium text-slate-700">Property</label>
            <select v-model="selectedPropertyId" required class="w-full rounded-lg border border-slate-200 px-3 py-2 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500">
              <option value="" disabled>Select a property</option>
              <option v-for="prop in properties" :key="prop.property_id" :value="prop.property_id">
                {{ prop.name }}
              </option>
            </select>
          </div>

          <div class="space-y-1">
            <label class="text-sm font-medium text-slate-700">Amount</label>
            <input v-model.number="newIncome.amount" type="number" step="0.01" required class="w-full rounded-lg border border-slate-200 px-3 py-2 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500" />
          </div>

          <div class="space-y-1">
            <label class="text-sm font-medium text-slate-700">Date</label>
            <input v-model="newIncome.date" type="date" required class="w-full rounded-lg border border-slate-200 px-3 py-2 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500" />
          </div>

          <div class="space-y-1">
            <label class="text-sm font-medium text-slate-700">Description</label>
            <textarea v-model="newIncome.description" rows="3" class="w-full rounded-lg border border-slate-200 px-3 py-2 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"></textarea>
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
              class="flex-1 rounded-lg bg-emerald-600 py-2 text-sm font-semibold text-white shadow-sm hover:bg-emerald-500 disabled:opacity-50"
            >
              {{ submitting ? 'Saving...' : 'Create Record' }}
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
import { useRouter } from 'vue-router';
import { Plus, Trash2, X, TrendingUp, ExternalLink } from 'lucide-vue-next';
import { propertyService, incomeService, type Property, type Income } from '../services/api';

interface ExtendedIncome extends Income {
  propertyName: string;
  propertyId: number;
}

const router = useRouter();
const allIncome = ref<ExtendedIncome[]>([]);
const properties = ref<Property[]>([]);
const loading = ref(true);
const error = ref<string | null>(null);
const showForm = ref(false);
const submitting = ref(false);
const formError = ref<string | null>(null);

const selectedPropertyId = ref<number | ''>('');
const newIncome = ref<Income>({
  income_id: 0,
  amount: 0,
  date: new Date().toISOString().split('T')[0],
  description: ''
});

const fetchAllIncome = async () => {
  loading.value = true;
  error.value = null;
  try {
    const propsRes = await propertyService.getAll();
    properties.value = propsRes.data;
    
    const incomePromises = properties.value.map(async (prop) => {
      const res = await incomeService.getByProperty(prop.property_id);
      return res.data.map(inc => ({
        ...inc,
        propertyName: prop.name,
        propertyId: prop.property_id
      }));
    });
    
    const results = await Promise.all(incomePromises);
    allIncome.value = results.flat().sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  } catch (err) {
    console.error(err);
    error.value = 'Failed to load income records. Please check your connection.';
  } finally {
    loading.value = false;
  }
};

const handleSubmit = async () => {
  if (selectedPropertyId.value === '') {
    formError.value = 'Please select a property.';
    return;
  }
  
  submitting.value = true;
  formError.value = null;
  try {
    // Auto-generate income_id
    const maxId = allIncome.value.reduce((max, item) => Math.max(max, item.income_id), 0);
    newIncome.value.income_id = maxId + 1;

    await incomeService.create(selectedPropertyId.value, newIncome.value);
    await fetchAllIncome();
    showForm.value = false;
    // Reset form
    newIncome.value = {
      income_id: 0,
      amount: 0,
      date: new Date().toISOString().split('T')[0],
      description: ''
    };
    selectedPropertyId.value = '';
  } catch (err) {
    console.error(err);
    formError.value = 'Failed to create income record. Ensure ID is unique.';
  } finally {
    submitting.value = false;
  }
};

const confirmDelete = async (item: ExtendedIncome) => {
  if (confirm(`Are you sure you want to delete this income record for ${item.propertyName}?`)) {
    try {
      await incomeService.delete(item.income_id);
      await fetchAllIncome();
    } catch (err) {
      console.error(err);
      alert('Failed to delete income record.');
    }
  }
};

const viewProperty = (id: number) => {
  router.push(`/properties/${id}`);
};

onMounted(fetchAllIncome);
</script>
