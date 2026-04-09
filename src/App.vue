<template>
  <div class="min-h-screen bg-slate-50 font-sans text-slate-900">
    <nav class="sticky top-0 z-50 border-b border-slate-200 bg-white/80 backdrop-blur-md">
      <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div class="flex h-16 items-center justify-between">
          <div class="flex items-center gap-2">
            <div class="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-white">
              <Building2 class="h-5 w-5" />
            </div>
            <span class="text-xl font-bold tracking-tight text-slate-900">Property Management Database</span>
          </div>
          <div class="flex items-center gap-6">
            <router-link 
              to="/" 
              class="text-sm font-medium text-slate-600 transition-colors hover:text-indigo-600"
              active-class="text-indigo-600"
            >
              Dashboard
            </router-link>
            <router-link 
              to="/properties" 
              class="text-sm font-medium text-slate-600 transition-colors hover:text-indigo-600"
              active-class="text-indigo-600"
            >
              Properties
            </router-link>
            <router-link 
              to="/tenants" 
              class="text-sm font-medium text-slate-600 transition-colors hover:text-indigo-600"
              active-class="text-indigo-600"
            >
              Tenants
            </router-link>
            <router-link 
              to="/income" 
              class="text-sm font-medium text-slate-600 transition-colors hover:text-indigo-600"
              active-class="text-indigo-600"
            >
              Income
            </router-link>
            <router-link 
              to="/expenses" 
              class="text-sm font-medium text-slate-600 transition-colors hover:text-indigo-600"
              active-class="text-indigo-600"
            >
              Expenses
            </router-link>
          </div>
        </div>
      </div>
    </nav>

    <main class="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <router-view v-slot="{ Component }">
        <transition
          enter-active-class="transition duration-200 ease-out"
          enter-from-class="translate-y-4 opacity-0"
          enter-to-class="translate-y-0 opacity-100"
          leave-active-class="transition duration-150 ease-in"
          leave-from-class="opacity-100"
          leave-to-class="opacity-0"
          mode="out-in"
        >
          <component :is="Component" />
        </transition>
      </router-view>
    </main>
  </div>
</template>

<script setup lang="ts">
import { Building2 } from 'lucide-vue-next';
</script>
