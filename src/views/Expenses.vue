<template>
  <div class="space-y-8">
    <header class="flex items-center justify-between">
      <div>
        <h1 class="text-3xl font-bold tracking-tight text-slate-900">Expense Records</h1>
        <p class="mt-2 text-slate-600">Comprehensive list of all expenses across your properties.</p>
      </div>
      <button 
        @click="showForm = true"
        class="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all hover:bg-indigo-500"
      >
        <Plus class="h-4 w-4" />
        Add Expense
      </button>
    </header>

    <div v-if="loading" class="flex h-64 items-center justify-center">
      <div class="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent"></div>
    </div>

    <div v-else-if="error" class="rounded-xl border border-red-200 bg-red-50 p-6 text-red-700 text-center">
      <p class="font-medium">{{ error }}</p>
      <button @click="fetchAllExpenses" class="mt-4 text-sm font-semibold underline">Try again</button>
    </div>

    <div v-else class="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div class="overflow-x-auto">
        <table class="w-full text-left text-sm">
          <thead class="bg-slate-50 text-slate-500">
            <tr>
              <th class="px-6 py-4 font-semibold">ID</th>
              <th class="px-6 py-4 font-semibold">Property</th>
              <th class="px-6 py-4 font-semibold">Date</th>
              <th class="px-6 py-4 font-semibold">Category</th>
              <th class="px-6 py-4 font-semibold">Vendor</th>
              <th class="px-6 py-4 font-semibold text-right">Amount</th>
              <th class="px-6 py-4 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            <tr v-for="item in allExpenses" :key="item.expense_id" class="hover:bg-slate-50 transition-colors">
              <td class="px-6 py-4 text-slate-400 font-mono">{{ item.expense_id }}</td>
              <td class="px-6 py-4 font-medium text-slate-900">{{ item.propertyName }}</td>
              <td class="px-6 py-4 text-slate-600">{{ item.date }}</td>
              <td class="px-6 py-4">
                <span class="inline-flex items-center rounded-md bg-slate-100 px-2 py-1 text-xs font-medium text-slate-600">
                  {{ item.category }}
                </span>
              </td>
              <td class="px-6 py-4 text-slate-600">{{ item.vendor || '-' }}</td>
              <td class="px-6 py-4 text-right font-mono text-red-600 font-bold">${{ item.amount.toLocaleString() }}</td>
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
            <tr v-if="allExpenses.length === 0">
              <td colspan="7" class="px-6 py-12 text-center text-slate-500 italic">
                <div class="flex flex-col items-center gap-2">
                  <TrendingDown class="h-8 w-8 text-slate-300" />
                  <p>No expense records found.</p>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Modal for adding expense -->
    <div v-if="showForm" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <div class="w-full max-w-md rounded-2xl bg-white p-8 shadow-2xl">
        <div class="flex items-center justify-between mb-6">
          <h2 class="text-2xl font-bold text-slate-900">Add Expense Record</h2>
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

          <div class="grid grid-cols-2 gap-4">
            <div class="space-y-1">
              <label class="text-sm font-medium text-slate-700">Expense ID</label>
              <input v-model.number="newExpense.expense_id" type="number" required class="w-full rounded-lg border border-slate-200 px-3 py-2 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500" />
            </div>
            <div class="space-y-1">
              <label class="text-sm font-medium text-slate-700">Amount</label>
              <input v-model.number="newExpense.amount" type="number" step="0.01" required class="w-full rounded-lg border border-slate-200 px-3 py-2 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500" />
            </div>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div class="space-y-1">
              <label class="text-sm font-medium text-slate-700">Date</label>
              <input v-model="newExpense.date" type="date" required class="w-full rounded-lg border border-slate-200 px-3 py-2 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500" />
            </div>
            <div class="space-y-1">
              <label class="text-sm font-medium text-slate-700">Category</label>
              <input v-model="newExpense.category" type="text" required class="w-full rounded-lg border border-slate-200 px-3 py-2 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500" />
            </div>
          </div>

          <div class="space-y-1">
            <label class="text-sm font-medium text-slate-700">Vendor</label>
            <input v-model="newExpense.vendor" type="text" class="w-full rounded-lg border border-slate-200 px-3 py-2 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500" />
          </div>

          <div class="space-y-1">
            <label class="text-sm font-medium text-slate-700">Description</label>
            <textarea v-model="newExpense.description" rows="3" class="w-full rounded-lg border border-slate-200 px-3 py-2 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"></textarea>
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
import { Plus, Trash2, X, TrendingDown, ExternalLink } from 'lucide-vue-next';
import { propertyService, expenseService, type Property, type Expense } from '../services/api';

interface ExtendedExpense extends Expense {
  propertyName: string;
  propertyId: number;
}

const router = useRouter();
const allExpenses = ref<ExtendedExpense[]>([]);
const properties = ref<Property[]>([]);
const loading = ref(true);
const error = ref<string | null>(null);
const showForm = ref(false);
const submitting = ref(false);
const formError = ref<string | null>(null);

const selectedPropertyId = ref<number | ''>('');
const newExpense = ref<Expense>({
  expense_id: 0,
  amount: 0,
  date: new Date().toISOString().split('T')[0],
  category: '',
  vendor: '',
  description: ''
});

const fetchAllExpenses = async () => {
  loading.value = true;
  error.value = null;
  try {
    const propsRes = await propertyService.getAll();
    properties.value = propsRes.data;
    
    const expensePromises = properties.value.map(async (prop) => {
      const res = await expenseService.getByProperty(prop.property_id);
      return res.data.map(exp => ({
        ...exp,
        propertyName: prop.name,
        propertyId: prop.property_id
      }));
    });
    
    const results = await Promise.all(expensePromises);
    allExpenses.value = results.flat().sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  } catch (err) {
    console.error(err);
    error.value = 'Failed to load expense records. Please check your connection.';
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
    await expenseService.create(selectedPropertyId.value, newExpense.value);
    await fetchAllExpenses();
    showForm.value = false;
    // Reset form
    newExpense.value = {
      expense_id: 0,
      amount: 0,
      date: new Date().toISOString().split('T')[0],
      category: '',
      vendor: '',
      description: ''
    };
    selectedPropertyId.value = '';
  } catch (err) {
    console.error(err);
    formError.value = 'Failed to create expense record. Ensure ID is unique.';
  } finally {
    submitting.value = false;
  }
};

const confirmDelete = async (item: ExtendedExpense) => {
  if (confirm(`Are you sure you want to delete this expense record for ${item.propertyName}?`)) {
    try {
      await expenseService.delete(item.expense_id);
      await fetchAllExpenses();
    } catch (err) {
      console.error(err);
      alert('Failed to delete expense record.');
    }
  }
};

const viewProperty = (id: number) => {
  router.push(`/properties/${id}`);
};

onMounted(fetchAllExpenses);
</script>
