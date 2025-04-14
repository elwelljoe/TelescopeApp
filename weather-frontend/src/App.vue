<template>
  <div id="app">
    <WeatherDisplay :weatherData="weatherData" />
  </div>
</template>

<script>
import WeatherDisplay from './components/WeatherDisplay.vue'

export default {
  name: 'App',
  components: {
    WeatherDisplay
  },
  data() {
    return {
      weatherData: {
        windSpeed: 15,
        humidity: 78,
        rainChance: 42,
        cloudCoverage: 65
      }
    }
  }
}
</script>
