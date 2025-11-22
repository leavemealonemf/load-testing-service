<template>
  <div class="container">
    <h1>⚡ Load Testing Service</h1>
    <p class="subtitle">Нагрузочное тестирование API эндпоинта /items</p>

    <div class="form-group">
      <label for="requestsCount">
        Количество запросов:
      </label>
      <input
        id="requestsCount"
        v-model.number="requestsCount"
        type="number"
        min="1"
        max="10000"
        :disabled="isRunning"
        placeholder="Например: 100"
      />
    </div>

    <div class="form-group">
      <label for="delayMs">
        Задержка между запросами (мс):
      </label>
      <input
        id="delayMs"
        v-model.number="delayMs"
        type="number"
        min="0"
        max="5000"
        :disabled="isRunning"
        placeholder="Например: 50"
      />
    </div>

    <div class="button-group">
      <button
        class="btn-primary"
        @click="startTest"
        :disabled="isRunning"
      >
        {{ isRunning ? '🔄 Тест выполняется...' : '🚀 Старт нагрузочного теста' }}
      </button>
      <button
        class="btn-danger"
        @click="stopTest"
        :disabled="!isRunning"
      >
        ⏹ Остановить тест
      </button>
    </div>

    <div v-if="hasResults" class="results">
      <div class="progress-container">
        <div class="progress-bar" :style="{ width: progressPercent + '%' }">
          {{ progressPercent }}%
        </div>
      </div>

      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-value">{{ stats.sent }}</div>
          <div class="stat-label">Отправлено</div>
        </div>
        <div class="stat-card success">
          <div class="stat-value">{{ stats.success }}</div>
          <div class="stat-label">Успешно</div>
        </div>
        <div class="stat-card error">
          <div class="stat-value">{{ stats.error }}</div>
          <div class="stat-label">Ошибок</div>
        </div>
        <div class="stat-card time">
          <div class="stat-value">{{ elapsedTime }}s</div>
          <div class="stat-label">Время выполнения</div>
        </div>
      </div>

      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-value">{{ averageResponseTime }}ms</div>
          <div class="stat-label">Среднее время ответа</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">{{ requestsPerSecond }}</div>
          <div class="stat-label">Запросов/сек</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">{{ minResponseTime }}ms</div>
          <div class="stat-label">Мин. время ответа</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">{{ maxResponseTime }}ms</div>
          <div class="stat-label">Макс. время ответа</div>
        </div>
      </div>

      <div style="text-align: center; margin-top: 20px;">
        <span
          class="status-badge"
          :class="{
            running: isRunning,
            completed: !isRunning && stats.sent > 0,
            idle: !isRunning && stats.sent === 0
          }"
        >
          {{ statusText }}
        </span>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onUnmounted } from 'vue';
import { $api } from './axios';

export default {
  name: 'App',
  setup() {
    const requestsCount = ref(100);
    const delayMs = ref(50);
    const isRunning = ref(false);
    const hasResults = ref(false);
    
    const stats = ref({
      sent: 0,
      success: 0,
      error: 0
    });
    
    const startTime = ref(null);
    const endTime = ref(null);
    const currentTime = ref(Date.now());
    const responseTimes = ref([]);
    
    let intervalId = null;
    let timeUpdateInterval = null;
    let shouldStop = false;

    const progressPercent = computed(() => {
      if (requestsCount.value === 0) return 0;
      return Math.round((stats.value.sent / requestsCount.value) * 100);
    });

    const elapsedTime = computed(() => {
      if (!startTime.value) return 0;
      const end = endTime.value || currentTime.value;
      return ((end - startTime.value) / 1000).toFixed(2);
    });

    const averageResponseTime = computed(() => {
      if (responseTimes.value.length === 0) return 0;
      const sum = responseTimes.value.reduce((a, b) => a + b, 0);
      return Math.round(sum / responseTimes.value.length);
    });

    const minResponseTime = computed(() => {
      if (responseTimes.value.length === 0) return 0;
      return Math.min(...responseTimes.value);
    });

    const maxResponseTime = computed(() => {
      if (responseTimes.value.length === 0) return 0;
      return Math.max(...responseTimes.value);
    });

    const requestsPerSecond = computed(() => {
      const elapsed = parseFloat(elapsedTime.value);
      if (elapsed === 0) return 0;
      return (stats.value.success / elapsed).toFixed(2);
    });

    const statusText = computed(() => {
      if (isRunning.value) return 'Тест выполняется';
      if (stats.value.sent > 0) return 'Тест завершён';
      return 'Готов к запуску';
    });

    async function makeRequest() {
      const requestStart = Date.now();
      try {
        await $api.get("items", {
          params: {
            limit: 10,
            offset: Math.floor(Math.random() * 1000)
          }
        });
        const responseTime = Date.now() - requestStart;
        responseTimes.value.push(responseTime);
        stats.value.success++;
        return true;
      } catch (error) {
        stats.value.error++;
        console.error('Request failed:', error.message);
        return false;
      }
    }

    async function startTest() {
      if (isRunning.value) return;
      
      isRunning.value = true;
      hasResults.value = true;
      shouldStop = false;
      stats.value = { sent: 0, success: 0, error: 0 };
      responseTimes.value = [];
      startTime.value = Date.now();
      endTime.value = null;

      timeUpdateInterval = setInterval(() => {
        currentTime.value = Date.now();
      }, 100);

      for (let i = 0; i < requestsCount.value; i++) {
        if (shouldStop) break;
        
        stats.value.sent++;
        makeRequest();
        
        if (i < requestsCount.value - 1 && delayMs.value > 0) {
          await new Promise(resolve => setTimeout(resolve, delayMs.value));
        }
      }

      await new Promise(resolve => setTimeout(resolve, 2000));
      
      endTime.value = Date.now();
      isRunning.value = false;
      
      if (timeUpdateInterval) {
        clearInterval(timeUpdateInterval);
        timeUpdateInterval = null;
      }
    }

    function stopTest() {
      shouldStop = true;
      isRunning.value = false;
      endTime.value = Date.now();
      
      if (timeUpdateInterval) {
        clearInterval(timeUpdateInterval);
        timeUpdateInterval = null;
      }
    }

    onUnmounted(() => {
      if (intervalId) clearInterval(intervalId);
      if (timeUpdateInterval) clearInterval(timeUpdateInterval);
    });

    return {
      requestsCount,
      delayMs,
      isRunning,
      hasResults,
      stats,
      progressPercent,
      elapsedTime,
      averageResponseTime,
      minResponseTime,
      maxResponseTime,
      requestsPerSecond,
      statusText,
      startTest,
      stopTest
    };
  }
};
</script>