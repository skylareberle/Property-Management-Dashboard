<template>
  <div class="space-y-8">
    <div v-if="loading" class="flex h-64 items-center justify-center">
      <div class="h-8 w-8 animate-spin rounded-full border-4 border-purdue-gold border-t-transparent"></div>
    </div>

    <div v-else-if="error" class="rounded-xl border border-red-200 bg-red-50 p-6 text-red-700 text-center">
      <p class="font-medium">{{ error }}</p>
      <router-link to="/properties" class="mt-4 inline-block text-sm font-semibold underline">Back to properties</router-link>
    </div>

    <template v-else-if="property">
      <header class="flex items-start justify-between">
        <div>
          <router-link to="/properties" class="mb-4 inline-flex items-center gap-1 text-sm font-medium text-slate-500 hover:text-purdue-gold">
            <ChevronLeft class="h-4 w-4" />
            Back to Properties
          </router-link>
          <h1 class="text-3xl font-bold tracking-tight text-purdue-black">{{ property.name }}</h1>
          <p class="mt-2 text-slate-600">{{ property.address }}, {{ property.city }}, {{ property.state }} {{ property.postal_code }}</p>
        </div>
        <div class="flex gap-3">
          <button 
            @click="showIncomeForm = true"
            class="inline-flex items-center gap-2 rounded-lg bg-purdue-black px-4 py-2 text-sm font-semibold text-purdue-white shadow-sm hover:bg-purdue-grey"
          >
            <Plus class="h-4 w-4" />
            Add Income
          </button>
          <button 
            @click="showExpenseForm = true"
            class="inline-flex items-center gap-2 rounded-lg bg-purdue-black px-4 py-2 text-sm font-semibold text-purdue-white shadow-sm hover:bg-purdue-grey"
          >
            <Plus class="h-4 w-4" />
            Add Expense
          </button>
        </div>
      </header>

      <div class="grid gap-8 lg:grid-cols-3">
        <!-- Property Info Card -->
        <div class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 class="text-lg font-bold text-slate-900 mb-6">Property Details</h2>
          <dl class="space-y-4">
            <div>
              <dt class="text-xs font-medium uppercase tracking-wider text-slate-400">Property Type</dt>
              <dd class="mt-1 text-slate-900 font-medium">{{ property.property_type }}</dd>
            </div>
            <div>
              <dt class="text-xs font-medium uppercase tracking-wider text-slate-400">Monthly Rent</dt>
              <dd class="mt-1 text-slate-900 font-medium">${{ property.monthly_rent }}</dd>
            </div>
            <div>
              <dt class="text-xs font-medium uppercase tracking-wider text-slate-400">Current Tenant</dt>
              <dd class="mt-1 text-slate-900 font-medium">{{ property.tenant_name || 'Vacant' }}</dd>
            </div>
          </dl>
        </div>

        <!-- Financial Summary -->
        <div class="lg:col-span-2 grid gap-6 sm:grid-cols-2">
          <div class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div class="flex items-center justify-between">
              <p class="text-sm font-medium text-slate-500">Total Income</p>
              <TrendingUp class="h-5 w-5 text-emerald-600" />
            </div>
            <p class="mt-2 text-3xl font-bold text-slate-900">${{ totalIncome.toLocaleString() }}</p>
          </div>
          <div class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div class="flex items-center justify-between">
              <p class="text-sm font-medium text-slate-500">Total Expenses</p>
              <TrendingDown class="h-5 w-5 text-red-600" />
            </div>
            <p class="mt-2 text-3xl font-bold text-slate-900">${{ totalExpenses.toLocaleString() }}</p>
          </div>
          <div class="sm:col-span-2 rounded-2xl border border-purdue-black bg-purdue-black p-6 shadow-sm text-purdue-white">
            <div class="flex items-center justify-between">
              <p class="text-sm font-medium text-purdue-grey">Net Cash Flow</p>
              <DollarSign class="h-5 w-5 text-purdue-gold" />
            </div>
            <p class="mt-2 text-3xl font-bold">${{ (totalIncome - totalExpenses).toLocaleString() }}</p>
          </div>
        </div>
      </div>

      <div class="grid gap-8 lg:grid-cols-2">
        <!-- Income Table -->
        <section class="space-y-4">
          <h2 class="text-xl font-bold text-slate-900">Income History</h2>
          <div class="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            <table class="w-full text-left text-sm">
              <thead class="bg-slate-50 text-slate-500">
                <tr>
                  <th class="px-6 py-3 font-medium">Date</th>
                  <th class="px-6 py-3 font-medium">Description</th>
                  <th class="px-6 py-3 font-medium text-right">Amount</th>
                  <th class="px-6 py-3"></th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100">
                <tr v-for="inc in income" :key="inc.income_id" class="hover:bg-slate-50">
                  <td class="px-6 py-4 text-slate-600">{{ inc.date }}</td>
                  <td class="px-6 py-4 text-slate-900">{{ inc.description || '-' }}</td>
                  <td class="px-6 py-4 text-right font-mono text-emerald-600 font-bold">${{ inc.amount }}</td>
                  <td class="px-6 py-4 text-right">
                    <button @click="deleteIncome(inc.income_id)" class="text-slate-400 hover:text-red-600">
                      <Trash2 class="h-4 w-4" />
                    </button>
                  </td>
                </tr>
                <tr v-if="income.length === 0">
                  <td colspan="4" class="px-6 py-8 text-center text-slate-500 italic">No income records found.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <!-- Expenses Table -->
        <section class="space-y-4">
          <h2 class="text-xl font-bold text-slate-900">Expense History</h2>
          <div class="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            <table class="w-full text-left text-sm">
              <thead class="bg-slate-50 text-slate-500">
                <tr>
                  <th class="px-6 py-3 font-medium">Date</th>
                  <th class="px-6 py-3 font-medium">Category</th>
                  <th class="px-6 py-3 font-medium text-right">Amount</th>
                  <th class="px-6 py-3"></th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100">
                <tr v-for="exp in expenses" :key="exp.expense_id" class="hover:bg-slate-50">
                  <td class="px-6 py-4 text-slate-600">{{ exp.date }}</td>
                  <td class="px-6 py-4">
                    <span class="inline-flex items-center rounded-md bg-purdue-gold/10 px-2 py-1 text-xs font-medium text-purdue-black">
                      {{ exp.category }}
                    </span>
                  </td>
                  <td class="px-6 py-4 text-right font-mono text-red-600 font-bold">${{ exp.amount }}</td>
                  <td class="px-6 py-4 text-right">
                    <button @click="deleteExpense(exp.expense_id)" class="text-slate-400 hover:text-red-600">
                      <Trash2 class="h-4 w-4" />
                    </button>
                  </td>
                </tr>
                <tr v-if="expenses.length === 0">
                  <td colspan="4" class="px-6 py-8 text-center text-slate-500 italic">No expense records found.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </template>

    <!-- Income Form Modal -->
    <div v-if="showIncomeForm" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <div class="w-full max-w-md rounded-2xl bg-white p-8 shadow-2xl">
        <div class="flex items-center justify-between mb-6">
          <h2 class="text-2xl font-bold text-slate-900">Add Income</h2>
          <button @click="showIncomeForm = false" class="text-slate-400 hover:text-slate-600">
            <X class="h-6 w-6" />
          </button>
        </div>
        <form @submit.prevent="handleIncomeSubmit" class="space-y-4">
          <div class="space-y-1">
            <label class="text-sm font-medium text-slate-700">Amount</label>
            <input v-model.number="newIncome.amount" type="number" step="0.01" required class="w-full rounded-lg border border-slate-200 px-3 py-2 focus:border-purdue-gold focus:ring-1 focus:ring-purdue-gold" />
          </div>
          <div class="space-y-1">
            <label class="text-sm font-medium text-slate-700">Date</label>
            <input v-model="newIncome.date" type="date" required class="w-full rounded-lg border border-slate-200 px-3 py-2 focus:border-purdue-gold focus:ring-1 focus:ring-purdue-gold" />
          </div>
          <div class="space-y-1">
            <label class="text-sm font-medium text-slate-700">Description</label>
            <textarea v-model="newIncome.description" class="w-full rounded-lg border border-slate-200 px-3 py-2 focus:border-purdue-gold focus:ring-1 focus:ring-purdue-gold"></textarea>
          </div>
          <div class="flex gap-3 pt-4">
            <button type="button" @click="showIncomeForm = false" class="flex-1 rounded-lg border border-slate-200 py-2 text-sm font-semibold">Cancel</button>
            <button type="submit" :disabled="submitting" class="flex-1 rounded-lg bg-purdue-black py-2 text-sm font-semibold text-purdue-white hover:bg-purdue-grey">Save</button>
          </div>
        </form>
      </div>
    </div>

    <!-- Expense Form Modal -->
    <div v-if="showExpenseForm" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <div class="w-full max-w-md rounded-2xl bg-white p-8 shadow-2xl">
        <div class="flex items-center justify-between mb-6">
          <h2 class="text-2xl font-bold text-slate-900">Add Expense</h2>
          <button @click="showExpenseForm = false" class="text-slate-400 hover:text-slate-600">
            <X class="h-6 w-6" />
          </button>
        </div>
        <form @submit.prevent="handleExpenseSubmit" class="space-y-4">
          <div class="space-y-1">
            <label class="text-sm font-medium text-slate-700">Amount</label>
            <input v-model.number="newExpense.amount" type="number" step="0.01" required class="w-full rounded-lg border border-slate-200 px-3 py-2 focus:border-purdue-gold focus:ring-1 focus:ring-purdue-gold" />
          </div>
          <div class="space-y-1">
            <label class="text-sm font-medium text-slate-700">Date</label>
            <input v-model="newExpense.date" type="date" required class="w-full rounded-lg border border-slate-200 px-3 py-2 focus:border-purdue-gold focus:ring-1 focus:ring-purdue-gold" />
          </div>
          <div class="space-y-1">
            <label class="text-sm font-medium text-slate-700">Category</label>
            <input v-model="newExpense.category" type="text" required class="w-full rounded-lg border border-slate-200 px-3 py-2 focus:border-purdue-gold focus:ring-1 focus:ring-purdue-gold" />
          </div>
          <div class="space-y-1">
            <label class="text-sm font-medium text-slate-700">Vendor</label>
            <input v-model="newExpense.vendor" type="text" class="w-full rounded-lg border border-slate-200 px-3 py-2 focus:border-purdue-gold focus:ring-1 focus:ring-purdue-gold" />
          </div>
          <div class="space-y-1">
            <label class="text-sm font-medium text-slate-700">Description</label>
            <textarea v-model="newExpense.description" class="w-full rounded-lg border border-slate-200 px-3 py-2 focus:border-purdue-gold focus:ring-1 focus:ring-purdue-gold"></textarea>
          </div>
          <div class="flex gap-3 pt-4">
            <button type="button" @click="showExpenseForm = false" class="flex-1 rounded-lg border border-slate-200 py-2 text-sm font-semibold">Cancel</button>
            <button type="submit" :disabled="submitting" class="flex-1 rounded-lg bg-purdue-black py-2 text-sm font-semibold text-purdue-white hover:bg-purdue-grey">Save</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRoute } from 'vue-router';
import { ChevronLeft, Plus, Trash2, X, TrendingUp, TrendingDown, DollarSign } from 'lucide-vue-next';
import { propertyService, incomeService, expenseService, type Property, type Income, type Expense } from '../services/api';

const route = useRoute();
const propertyId = route.params.id as string;

const property = ref<Property | null>(null);
const income = ref<Income[]>([]);
const expenses = ref<Expense[]>([]);
const loading = ref(true);
const error = ref<string | null>(null);
const submitting = ref(false);

const showIncomeForm = ref(false);
const showExpenseForm = ref(false);

const newIncome = ref<Income>({
  income_id: 0,
  amount: 0,
  date: new Date().toISOString().split('T')[0],
  description: ''
});

const newExpense = ref<Expense>({
  expense_id: 0,
  amount: 0,
  date: new Date().toISOString().split('T')[0],
  category: '',
  vendor: '',
  description: ''
});

const totalIncome = computed(() => income.value.reduce((sum, i) => sum + i.amount, 0));
const totalExpenses = computed(() => expenses.value.reduce((sum, e) => sum + e.amount, 0));

const fetchData = async () => {
  loading.value = true;
  error.value = null;
  try {
    const [propRes, incRes, expRes] = await Promise.all([
      propertyService.getOne(propertyId),
      incomeService.getByProperty(propertyId),
      expenseService.getByProperty(propertyId)
    ]);
    property.value = propRes.data;
    income.value = incRes.data;
    expenses.value = expRes.data;
  } catch (err) {
    console.error(err);
    error.value = 'Failed to load property details.';
  } finally {
    loading.value = false;
  }
};

const handleIncomeSubmit = async () => {
  submitting.value = true;
  try {
    // Auto-generate income_id
    const maxId = income.value.reduce((max, item) => Math.max(max, item.income_id), 0);
    newIncome.value.income_id = maxId + 1;

    await incomeService.create(propertyId, newIncome.value);
    await fetchData();
    showIncomeForm.value = false;
    newIncome.value = { income_id: 0, amount: 0, date: new Date().toISOString().split('T')[0], description: '' };
  } catch (err) {
    console.error(err);
    alert('Failed to save income record.');
  } finally {
    submitting.value = false;
  }
};

const handleExpenseSubmit = async () => {
  submitting.value = true;
  try {
    // Auto-generate expense_id
    const maxId = expenses.value.reduce((max, item) => Math.max(max, item.expense_id), 0);
    newExpense.value.expense_id = maxId + 1;

    await expenseService.create(propertyId, newExpense.value);
    await fetchData();
    showExpenseForm.value = false;
    newExpense.value = { expense_id: 0, amount: 0, date: new Date().toISOString().split('T')[0], category: '', vendor: '', description: '' };
  } catch (err) {
    console.error(err);
    alert('Failed to save expense record.');
  } finally {
    submitting.value = false;
  }
};

const deleteIncome = async (id: number) => {
  if (confirm('Delete this income record?')) {
    try {
      await incomeService.delete(id);
      await fetchData();
    } catch (err) {
      console.error(err);
      alert('Failed to delete income record.');
    }
  }
};

const deleteExpense = async (id: number) => {
  if (confirm('Delete this expense record?')) {
    try {
      await expenseService.delete(id);
      await fetchData();
    } catch (err) {
      console.error(err);
      alert('Failed to delete expense record.');
    }
  }
};

onMounted(fetchData);
</script>
