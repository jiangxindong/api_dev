<template>
  <div>
    <h1>{{ data }}</h1>
  </div>
</template>

<script>
import ApiService from "./common/services";

export default {
  data() {
    return {
      data: "",
    };
  },
};
</script>

<style>
</style>