<template>
  <header>
    <nav>
      <ul>
        <li><router-link to="/">Home</router-link></li>
        <li><router-link to="/tickets">Tickets</router-link></li>
        <li><router-link to="/profile">Profile</router-link></li>
      </ul>
    </nav>
  </header>
</template>

<script>
export default {
  name: "Header",
};
</script>

<style scoped>
header {
  background-color: #4CAF50;
  padding: 10px;
}
nav ul {
  list-style: none;
  display: flex;
  justify-content: space-around;
}
nav ul li {
  color: white;
}
</style>
