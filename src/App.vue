<template>
  <div :class="['min-h-screen p-6 flex flex-col items-center transition-colors duration-300', darkMode ? 'bg-gray-900 text-white' : 'bg-gradient-to-r from-blue-100 to-blue-300 text-blue-900']">
    <h1 class="text-4xl font-bold mb-6 drop-shadow-lg">Explorador de Países 🌍</h1>

    <!-- Toggle switch -->
    <label class="flex items-center space-x-3 mb-4 cursor-pointer select-none">
      <span>Modo Claro</span>
      <input type="checkbox" class="toggle-checkbox hidden" v-model="darkMode" />
      <div class="toggle-slot w-12 h-6 bg-gray-300 rounded-full relative transition-colors duration-300">
        <div
          class="toggle-button absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-md transform transition-transform duration-300"
          :class="darkMode ? 'translate-x-6' : 'translate-x-0'"
        ></div>
      </div>
      <span>Modo Oscuro</span>
    </label>

    <!-- Botón exportar CSV -->
    <button
      @click="exportToCsv"
      class="mb-4 px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
    >
      Exportar a CSV
    </button>

    <input
      v-model="searchText"
      @input="onFilterTextBoxChanged"
      type="text"
      placeholder="Buscar país, capital o región..."
      :class="['mb-4 p-2 w-full max-w-3xl rounded border focus:outline-none focus:ring-2', darkMode ? 'bg-gray-800 border-gray-600 placeholder-gray-400 text-white focus:ring-blue-500' : 'bg-white border-gray-300 placeholder-gray-500 text-black focus:ring-blue-500']"
    />

    <div :class="['w-full max-w-6xl rounded-lg shadow-lg p-4 mb-6', darkMode ? 'bg-gray-800' : 'bg-white']">
      <div
        :class="[darkMode ? 'ag-theme-alpine ag-theme-dark' : 'ag-theme-alpine']"
        style="height: 600px; width: 100%; border-radius: 8px; overflow: hidden;"
      >
        <AgGridVue
          ref="agGrid"
          :columnDefs="columnDefs"
          :rowData="rowData"
          :quickFilterText="searchText"
          :animateRows="true"
          :pagination="true"
          :paginationPageSize="15"
          @grid-ready="onGridReady"
          @rowClicked="onRowClicked"
          :localeText="localeText"
          style="width: 100%; height: 100%;"
        />
      </div>
    </div>

    <div v-if="selectedCountry" :class="['max-w-6xl rounded-lg shadow-lg p-6 w-full', darkMode ? 'bg-gray-800 text-white' : 'bg-white text-black']">
      <h2 class="text-2xl font-semibold mb-4">{{ selectedCountry.name.common }}</h2>
      <img
        :src="selectedCountry.flags.svg || selectedCountry.flags.png"
        alt="Bandera"
        class="w-40 mb-4 rounded"
      />
      <p><strong>Área (km²):</strong> {{ selectedCountry.area?.toLocaleString() || 'N/A' }}</p>
      <p><strong>Subregión:</strong> {{ selectedCountry.subregion || 'N/A' }}</p>
      <p>
        <strong>Moneda:</strong>
        {{
          selectedCountry.currencies
            ? Object.values(selectedCountry.currencies).map(c => c.name).join(', ')
            : 'N/A'
        }}
      </p>
      <p>
        <strong>Idiomas:</strong>
        {{
          selectedCountry.languages
            ? Object.values(selectedCountry.languages).join(', ')
            : 'N/A'
        }}
      </p>
    </div>

    <footer :class="['mt-8', darkMode ? 'text-gray-400' : 'text-blue-800']">
      Datos proporcionados por
      <a href="https://restcountries.com" target="_blank" :class="['underline', darkMode ? 'hover:text-gray-200' : 'hover:text-blue-600']"
        >REST Countries API</a
      >
    </footer>
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue'
import { AgGridVue } from 'ag-grid-vue3'
import 'ag-grid-community/styles/ag-grid.css'
import 'ag-grid-community/styles/ag-theme-alpine.css'

import { ModuleRegistry, AllCommunityModules } from 'ag-grid-community'
ModuleRegistry.registerModules(AllCommunityModules)

const continentOptions = ['Asia', 'Europe', 'Africa', 'Oceania', 'Americas']

const darkMode = ref(false)

// Carga el modo guardado en localStorage (si existe)
onMounted(() => {
  const savedMode = localStorage.getItem('darkMode')
  if (savedMode !== null) {
    darkMode.value = savedMode === 'true'
  }
})

// Guarda el modo en localStorage cada vez que cambia
watch(darkMode, (newVal) => {
  localStorage.setItem('darkMode', newVal)
})

const localeText = {
  equals: 'Igual a',
  notEqual: 'No igual a',
  lessThan: 'Menor que',
  lessThanOrEqual: 'Menor o igual que',
  greaterThan: 'Mayor que',
  greaterThanOrEqual: 'Mayor o igual que',
  inRange: 'En el rango',
  contains: 'Contiene',
  notContains: 'No contiene',
  startsWith: 'Empieza con',
  endsWith: 'Termina con',
  page: 'Página',
  more: 'Más',
  to: 'a',
  of: 'de',
  next: 'Siguiente',
  last: 'Último',
  first: 'Primero',
  previous: 'Anterior',
  loadingOoo: 'Cargando...',
  pageSize: 'Tamaño de página',
  applyFilter: 'Aplicar filtro...',
  clearFilter: 'Limpiar filtro',
  cancelFilter: 'Cancelar',
  columns: 'Columnas',
  filters: 'Filtros',
  sortAscending: 'Ordenar ascendente',
  sortDescending: 'Ordenar descendente',
  resetColumns: 'Reiniciar columnas',
  noRowsToShow: 'No hay datos para mostrar',
}

const columnDefs = ref([
  {
    field: 'name.common',
    headerName: 'País',
    sortable: true,
    filter: 'agTextColumnFilter',
    flex: 1,
    cellRenderer: (params) => {
      const flag = params.data.flags?.svg || params.data.flags?.png || ''
      const name = params.value || 'Sin nombre'
      const eDiv = document.createElement('div')
      eDiv.style.display = 'flex'
      eDiv.style.alignItems = 'center'
      eDiv.style.gap = '8px'

      const img = document.createElement('img')
      img.src = flag
      img.alt = 'Bandera'
      img.style.width = '25px'
      img.style.height = '18px'
      img.style.objectFit = 'cover'
      img.style.borderRadius = '3px'

      const span = document.createElement('span')
      span.textContent = name

      eDiv.appendChild(img)
      eDiv.appendChild(span)

      return eDiv
    }
  },
  {
    field: 'capital',
    headerName: 'Capital',
    valueGetter: (params) => (params.data.capital ? params.data.capital[0] : 'N/A'),
    sortable: true,
    filter: 'agTextColumnFilter',
    flex: 1,
  },
  {
    field: 'region',
    headerName: 'Continente',
    sortable: true,
    filter: 'agSetColumnFilter',
    filterParams: {
      values: continentOptions,
    },
    flex: 1,
  },
  {
    field: 'population',
    headerName: 'Población',
    sortable: true,
    filter: 'agNumberColumnFilter',
    filterParams: {
      filterOptions: ['inRange', 'equals', 'greaterThan', 'lessThan'],
      inRangeInclusive: true,
      suppressAndOrCondition: true,
    },
    flex: 1,
    valueFormatter: (params) => params.value.toLocaleString(),
  },
])

const rowData = ref([])
const searchText = ref('')
const selectedCountry = ref(null)
const agGridApi = ref(null)

onMounted(async () => {
  try {
    const res = await fetch('https://restcountries.com/v3.1/all')
    const data = await res.json()
    rowData.value = data
  } catch (e) {
    console.error('Error cargando países:', e)
  }
})

function onFilterTextBoxChanged() {
  // AG Grid maneja quickFilter automáticamente
}

function onRowClicked(event) {
  selectedCountry.value = event.data
}

function onGridReady(params) {
  agGridApi.value = params.api
}

function exportToCsv() {
  if (agGridApi.value) {
    agGridApi.value.exportDataAsCsv({
      fileName: 'explorador-paises.csv',
      columnKeys: ['name.common', 'capital', 'region', 'population'],
      allColumns: false,
      columnSeparator: ',',
      addBOM: true,
      suppressQuotes: true,
      processCellCallback: (params) => {
        if (params.column.getColId() === 'population') {
          return params.value ? params.value.toLocaleString() : ''
        }
        return params.value
      },
    })
  } else {
    console.warn('API de AG Grid no está lista para exportar')
  }
}
</script>

<style>
/* Toggle switch estilos */
.toggle-checkbox:checked + .toggle-slot {
  background-color: #4f46e5; /* Indigo-600 */
}

.toggle-checkbox:checked + .toggle-slot .toggle-button {
  transform: translateX(1.5rem);
}

/* Tema oscuro personalizado para AG Grid */
.ag-theme-alpine.ag-theme-dark {
  --ag-background-color: #1f2937;
  --ag-odd-row-background-color: #374151;
  --ag-row-hover-color: #2563eb;
  --ag-header-background-color: #111827;
  --ag-foreground-color: #f9fafb;
  --ag-header-foreground-color: #f9fafb;
  --ag-border-color: #4b5563;
  --ag-input-background-color: #374151;
  --ag-input-border-color: #4b5563;
  --ag-input-hover-border-color: #2563eb;
  --ag-selection-background-color: #2563eb;
  --ag-selection-foreground-color: white;
}
</style>
