<template>
  <div class="weather-display">
    <h2>Current Weather Conditions</h2>
    <ul>
      <li><strong>Wind Speed:</strong> {{ weatherData.windSpeed }} mph</li>
      <li><strong>Humidity:</strong> {{ weatherData.humidity }}%</li>
      <li><strong>Rain Chance:</strong> {{ weatherData.rainChance }}%</li>
      <li><strong>Cloud Coverage:</strong> {{ weatherData.cloudCoverage }}%</li>
    </ul>
  </div>
</template>

<script>
export default {
  name: 'WeatherDisplay',
  props: {
    weatherData: {
      type: Object,
      required: true
    }
  }
}
</script>

<style scoped>
.weather-display {
  border: 1px solid #ccc;
  padding: 1rem;
  border-radius: 10px;
  background-color: #f9f9f9;
  width: 300px;
}

ul {
  list-style: none;
  padding: 0;
}

li {
  margin-bottom: 0.5rem;
}
</style>
