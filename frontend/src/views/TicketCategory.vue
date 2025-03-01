<template>
    <div class="container">
      <h2>Category Management</h2>
  
      <!-- Category List -->
      <div v-if="categories.length">
        <h4>Existing Categories:</h4>
        <ul class="list-group">
          <li v-for="category in categories" :key="category.id" class="list-group-item d-flex justify-content-between align-items-center">
            {{ category.name }}
            <div>
              <button class="btn btn-warning btn-sm me-2" @click="editCategory(category)">Edit</button>
              <button class="btn btn-danger btn-sm" @click="deleteCategory(category.id)">Delete</button>
            </div>
          </li>
        </ul>
      </div>
  
      <!-- Add New Category -->
      <div class="mt-4">
        <h4>{{ editing ? "Edit Category" : "Add Category" }}</h4>
        <input v-model="categoryName" class="form-control" placeholder="Enter category name" />
        <button v-if="editing" class="btn btn-primary mt-2" @click="updateCategory">Update</button>
        <button v-else class="btn btn-success mt-2" @click="addCategory">Add</button>
        <button v-if="editing" class="btn btn-secondary mt-2 ms-2" @click="cancelEdit">Cancel</button>
      </div>
    </div>
  </template>
  
  <script>
  import axios from "axios";
  
  export default {
    data() {
      return {
        categories: [],
        categoryName: "",
        editing: false,
        editingId: null,
        token: localStorage.getItem("accessToken"), // Token Retrieve
        userRole: localStorage.getItem("userRole"), // Role Retrieve
      };
    },
    methods: {
      async fetchCategories() {
        try {
            
            this.token = localStorage.getItem("accessToken");
            this.userRole = localStorage.getItem("userRole");
            
            console.log("Current role:", this.userRole);
            
            if (this.userRole !== "admin") {
            console.log("Access denied condition triggered:", { role: this.userRole, comparison: this.userRole !== "admin" });
            alert("Access Denied! Only Admin can manage categories.");
            this.$router.push("/dashboard");
            return;
            }
  
          const res = await axios.get("/api/tickets/categories", {
            headers: { Authorization: `Bearer ${this.token}` }, // Token Send
          });
  
          // Make sure we're accessing the correct property from the response
          this.categories = res.data.categorie;
        } catch (error) {
          console.error("Error fetching categories:", error);
          alert("Failed to load categories.");
        }
      },
      async addCategory() {
        try {
          if (!this.categoryName.trim()) {
            alert("Category name cannot be empty!");
            return;
          }
  
          const res = await axios.post(
            "/api/tickets/categories",
            { name: this.categoryName },
            { headers: { Authorization: `Bearer ${this.token}` } }
          );
  
          alert("Category added successfully!");
          this.categoryName = "";
          this.fetchCategories();
        } catch (error) {
          console.error("Error adding category:", error);
          alert(error.response?.data?.error || "Failed to add category.");
        }
      },
      editCategory(category) {
        this.categoryName = category.name;
        this.editing = true;
        this.editingId = category.id;
      },
      cancelEdit() {
        this.editing = false;
        this.editingId = null;
        this.categoryName = "";
      },
      async updateCategory() {
        try {
          if (!this.categoryName.trim()) {
            alert("Category name cannot be empty!");
            return;
          }
  
          await axios.put(
            `/api/tickets/categories/${this.editingId}`,
            { name: this.categoryName },
            { headers: { Authorization: `Bearer ${this.token}` } }
          );
  
          alert("Category updated successfully!");
          this.categoryName = "";
          this.editing = false;
          this.editingId = null;
          this.fetchCategories();
        } catch (error) {
          console.error("Error updating category:", error);
          alert(error.response?.data?.error || "Failed to update category.");
        }
      },
      async deleteCategory(id) {
        if (!confirm("Are you sure you want to delete this category?")) return;
  
        try {
          
          await axios.delete(`/api/tickets/categories/${id}`, {
            headers: { Authorization: `Bearer ${this.token}` },
          });
  
          alert("Category deleted successfully!");
          this.fetchCategories();
        } catch (error) {
          console.error("Error deleting category:", error);
          alert(error.response?.data?.error || "Failed to delete category.");
        }
      },
    },
    created() {
        this.fetchCategories();
    }
  };
  </script>
  
  <style>
  .container {
    max-width: 600px;
    margin-top: 20px;
  }
  </style>