<template>
  <div id="app">
    <Header />
    <router-view /> 
    <Footer />
  </div>
</template>

<script>
import Header from './components/Header.vue';
import Footer from './components/Footer.vue';

export default {
  name: 'App',
  components: {
    Header,
    Footer,
  },
};
</script>

<style>
/* Global styles (optional) */
body {
  margin: 0;
  font-family: Arial, sans-serif;
}
</style>
