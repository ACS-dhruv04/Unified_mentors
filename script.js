// Recipe Book Application
class RecipeBook {
    constructor() {
        this.recipes = this.loadRecipes();
        this.currentRecipeId = null;
        this.init();
    }

    init() {
        this.bindEvents();
        this.renderRecipes();
        this.updateRecipeCount();
    }

    // Event Binding
    bindEvents() {
        // Tab switching
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.switchTab(e.target.dataset.tab));
        });

        // Form submission
        document.getElementById('recipe-form').addEventListener('submit', (e) => this.handleFormSubmit(e));

        // Image upload preview
        document.getElementById('recipe-image').addEventListener('change', (e) => this.handleImageUpload(e));

        // Search functionality
        document.getElementById('search-btn').addEventListener('click', () => this.performSearch());
        document.getElementById('search-input').addEventListener('keyup', (e) => {
            if (e.key === 'Enter') this.performSearch();
        });
        document.getElementById('search-input').addEventListener('input', () => this.performSearch());

        // Filters
        document.getElementById('category-filter').addEventListener('change', () => this.renderRecipes());
        document.getElementById('sort-recipes').addEventListener('change', () => this.renderRecipes());
        document.getElementById('search-category').addEventListener('change', () => this.performSearch());

        // Modal events
        document.getElementById('recipe-modal').addEventListener('click', (e) => {
            if (e.target.id === 'recipe-modal') this.closeModal();
        });
        document.querySelector('.close').addEventListener('click', () => this.closeModal());

        // ESC key to close modal
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') this.closeModal();
        });
    }

    // Tab Management
    switchTab(tabName) {
        // Update tab buttons
        document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');

        // Update tab content
        document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
        document.getElementById(tabName).classList.add('active');

        // Refresh content based on tab
        if (tabName === 'view-recipes') {
            this.renderRecipes();
        } else if (tabName === 'search-recipes') {
            this.performSearch();
        }
    }

    // Form Handling
    async handleFormSubmit(e) {
        e.preventDefault();
        
        if (this.validateForm()) {
            const recipe = await this.getFormData();
            this.saveRecipe(recipe);
            this.resetForm();
            this.showMessage('Recipe saved successfully!', 'success');
            this.switchTab('view-recipes');
        }
    }

    validateForm() {
        let isValid = true;
        
        // Clear previous errors
        document.querySelectorAll('.error-message').forEach(error => error.textContent = '');

        // Validate recipe name
        const name = document.getElementById('recipe-name').value.trim();
        if (!name) {
            document.getElementById('name-error').textContent = 'Recipe name is required';
            isValid = false;
        }

        // Validate ingredients
        const ingredients = document.getElementById('recipe-ingredients').value.trim();
        if (!ingredients) {
            document.getElementById('ingredients-error').textContent = 'Ingredients are required';
            isValid = false;
        }

        // Validate preparation steps
        const steps = document.getElementById('recipe-steps').value.trim();
        if (!steps) {
            document.getElementById('steps-error').textContent = 'Preparation steps are required';
            isValid = false;
        }

        return isValid;
    }

    async getFormData() {
        const imageInput = document.getElementById('recipe-image');
        const imageFile = imageInput.files[0];
        let imageDataURL = null;
        
        // Convert image to data URL if file exists
        if (imageFile) {
            imageDataURL = await this.getImageDataURL(imageFile);
        }
        
        return {
            id: Date.now().toString(),
            name: document.getElementById('recipe-name').value.trim(),
            ingredients: document.getElementById('recipe-ingredients').value.trim(),
            steps: document.getElementById('recipe-steps').value.trim(),
            category: document.getElementById('recipe-category').value,
            prepTime: document.getElementById('prep-time').value,
            image: imageDataURL,
            dateAdded: new Date().toISOString()
        };
    }

    async getImageDataURL(file) {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target.result);
            reader.readAsDataURL(file);
        });
    }

    saveRecipe(recipe) {
        this.recipes.push(recipe);
        this.saveToStorage();
        this.renderRecipes();
        console.log('Recipe saved:', recipe); // Debug log
        console.log('Total recipes:', this.recipes.length); // Debug log
    }

    resetForm() {
        document.getElementById('recipe-form').reset();
        document.getElementById('image-preview').innerHTML = '';
        document.querySelectorAll('.error-message').forEach(error => error.textContent = '');
    }

    // Image Upload Handling
    handleImageUpload(e) {
        const file = e.target.files[0];
        const preview = document.getElementById('image-preview');
        
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                preview.innerHTML = `<img src="${e.target.result}" alt="Recipe preview">`;
            };
            reader.readAsDataURL(file);
        } else {
            preview.innerHTML = '';
        }
    }

    // Recipe Rendering
    renderRecipes() {
        const container = document.getElementById('recipes-container');
        const categoryFilter = document.getElementById('category-filter').value;
        const sortBy = document.getElementById('sort-recipes').value;
        
        let filteredRecipes = this.recipes.slice();

        // Apply category filter
        if (categoryFilter) {
            filteredRecipes = filteredRecipes.filter(recipe => recipe.category === categoryFilter);
        }

        // Apply sorting
        filteredRecipes.sort((a, b) => {
            switch (sortBy) {
                case 'newest':
                    return new Date(b.dateAdded) - new Date(a.dateAdded);
                case 'oldest':
                    return new Date(a.dateAdded) - new Date(b.dateAdded);
                case 'name':
                    return a.name.localeCompare(b.name);
                case 'prep-time':
                    return (parseInt(a.prepTime) || 0) - (parseInt(b.prepTime) || 0);
                default:
                    return 0;
            }
        });

        if (filteredRecipes.length === 0) {
            container.innerHTML = `
                <div class="no-recipes">
                    <i class="fas fa-utensils"></i>
                    <p>No recipes found. ${categoryFilter ? 'Try a different category or ' : ''}Start by adding your first recipe!</p>
                </div>
            `;
        } else {
            container.innerHTML = filteredRecipes.map(recipe => this.createRecipeCard(recipe)).join('');
        }

        this.updateRecipeCount();
    }

    createRecipeCard(recipe) {
        const ingredientsList = recipe.ingredients.split('\n').slice(0, 3);
        const ingredientsPreview = ingredientsList.join(', ') + (recipe.ingredients.split('\n').length > 3 ? '...' : '');
        
        return `
            <div class="recipe-card" data-recipe-id="${recipe.id}">
                <div class="recipe-image">
                    ${recipe.image ? `<img src="${recipe.image}" alt="${recipe.name}">` : '<i class="fas fa-utensils"></i>'}
                </div>
                <div class="recipe-details">
                    <h3 class="recipe-title">${this.escapeHtml(recipe.name)}</h3>
                    <div class="recipe-meta">
                        ${recipe.category ? `<span class="recipe-category">${recipe.category}</span>` : ''}
                        ${recipe.prepTime ? `<span><i class="fas fa-clock"></i> ${recipe.prepTime} min</span>` : ''}
                    </div>
                    <div class="recipe-preview">
                        <strong>Ingredients:</strong> ${this.escapeHtml(ingredientsPreview)}
                    </div>
                    <div class="recipe-actions">
                        <button class="btn-view" onclick="app.viewRecipe('${recipe.id}')">
                            <i class="fas fa-eye"></i> View Details
                        </button>
                        <button class="btn-delete" onclick="app.deleteRecipe('${recipe.id}')">
                            <i class="fas fa-trash"></i> Delete
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    // Search Functionality
    performSearch() {
        const searchInput = document.getElementById('search-input').value.trim().toLowerCase();
        const categoryFilter = document.getElementById('search-category').value;
        const resultsContainer = document.getElementById('search-results');

        if (!searchInput && !categoryFilter) {
            resultsContainer.innerHTML = `
                <div class="search-placeholder">
                    <i class="fas fa-search"></i>
                    <p>Enter keywords to search for recipes</p>
                </div>
            `;
            return;
        }

        let searchResults = this.recipes.filter(recipe => {
            const matchesText = !searchInput || 
                recipe.name.toLowerCase().includes(searchInput) ||
                recipe.ingredients.toLowerCase().includes(searchInput) ||
                recipe.steps.toLowerCase().includes(searchInput) ||
                (recipe.category && recipe.category.toLowerCase().includes(searchInput));

            const matchesCategory = !categoryFilter || recipe.category === categoryFilter;

            return matchesText && matchesCategory;
        });

        if (searchResults.length === 0) {
            resultsContainer.innerHTML = `
                <div class="no-recipes">
                    <i class="fas fa-search"></i>
                    <p>No recipes found matching your search criteria.</p>
                </div>
            `;
        } else {
            resultsContainer.innerHTML = searchResults.map(recipe => this.createRecipeCard(recipe)).join('');
        }
    }

    // Recipe Actions
    viewRecipe(recipeId) {
        const recipe = this.recipes.find(r => r.id === recipeId);
        if (!recipe) return;

        const modalContent = document.getElementById('modal-recipe-content');
        modalContent.innerHTML = this.createRecipeModal(recipe);
        
        document.getElementById('recipe-modal').style.display = 'block';
        document.body.style.overflow = 'hidden';
    }

    createRecipeModal(recipe) {
        const ingredientsList = recipe.ingredients.split('\n').filter(ingredient => ingredient.trim());
        
        return `
            <div class="modal-recipe-image">
                ${recipe.image ? `<img src="${recipe.image}" alt="${recipe.name}">` : '<i class="fas fa-utensils"></i>'}
            </div>
            <div class="modal-recipe-details">
                <h2 class="modal-recipe-title">${this.escapeHtml(recipe.name)}</h2>
                <div class="modal-recipe-meta">
                    ${recipe.category ? `
                        <div class="modal-meta-item">
                            <i class="fas fa-tag"></i>
                            <span class="recipe-category">${recipe.category}</span>
                        </div>
                    ` : ''}
                    ${recipe.prepTime ? `
                        <div class="modal-meta-item">
                            <i class="fas fa-clock"></i>
                            <span>${recipe.prepTime} minutes</span>
                        </div>
                    ` : ''}
                    <div class="modal-meta-item">
                        <i class="fas fa-calendar"></i>
                        <span>Added ${new Date(recipe.dateAdded).toLocaleDateString()}</span>
                    </div>
                </div>
                
                <div class="modal-section">
                    <h3><i class="fas fa-list-ul"></i> Ingredients</h3>
                    <div class="modal-ingredients">
                        <ul>
                            ${ingredientsList.map(ingredient => `<li>${this.escapeHtml(ingredient.trim())}</li>`).join('')}
                        </ul>
                    </div>
                </div>
                
                <div class="modal-section">
                    <h3><i class="fas fa-clipboard-list"></i> Preparation Steps</h3>
                    <div class="modal-steps">
                        <p>${this.escapeHtml(recipe.steps)}</p>
                    </div>
                </div>
            </div>
        `;
    }

    deleteRecipe(recipeId) {
        if (confirm('Are you sure you want to delete this recipe? This action cannot be undone.')) {
            this.recipes = this.recipes.filter(recipe => recipe.id !== recipeId);
            this.saveToStorage();
            this.renderRecipes();
            this.showMessage('Recipe deleted successfully!', 'success');
            
            // Refresh search results if on search tab
            if (document.getElementById('search-recipes').classList.contains('active')) {
                this.performSearch();
            }
        }
    }

    closeModal() {
        document.getElementById('recipe-modal').style.display = 'none';
        document.body.style.overflow = 'auto';
    }

    // Storage Management
    saveToStorage() {
        try {
            localStorage.setItem('recipeBook', JSON.stringify(this.recipes));
        } catch (error) {
            console.error('Error saving to localStorage:', error);
            this.showMessage('Error saving recipes. Please try again.', 'error');
        }
    }

    loadRecipes() {
        try {
            const saved = localStorage.getItem('recipeBook');
            return saved ? JSON.parse(saved) : this.getDefaultRecipes();
        } catch (error) {
            console.error('Error loading from localStorage:', error);
            return this.getDefaultRecipes();
        }
    }

    getDefaultRecipes() {
        return [
            {
                id: 'demo1',
                name: 'Classic Chocolate Chip Cookies',
                ingredients: `2 1/4 cups all-purpose flour
1 tsp baking soda
1 tsp salt
1 cup butter, softened
3/4 cup granulated sugar
3/4 cup brown sugar
2 large eggs
2 tsp vanilla extract
2 cups chocolate chips`,
                steps: `1. Preheat oven to 375°F (190°C).

2. In a bowl, whisk together flour, baking soda, and salt.

3. In a large bowl, cream together butter and both sugars until light and fluffy.

4. Beat in eggs one at a time, then add vanilla.

5. Gradually mix in flour mixture until just combined.

6. Stir in chocolate chips.

7. Drop rounded tablespoons of dough onto ungreased baking sheets.

8. Bake for 9-11 minutes or until golden brown.

9. Cool on baking sheet for 2 minutes before transferring to wire rack.`,
                category: 'dessert',
                prepTime: '45',
                image: null,
                dateAdded: new Date().toISOString()
            }
        ];
    }

    // Utility Functions
    updateRecipeCount() {
        const count = this.recipes.length;
        const countElements = document.querySelectorAll('.recipe-count');
        countElements.forEach(el => el.textContent = count);
    }

    showMessage(text, type = 'success') {
        const container = document.getElementById('message-container');
        const message = document.createElement('div');
        message.className = `message ${type}`;
        message.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
            ${text}
        `;
        
        container.appendChild(message);
        
        setTimeout(() => {
            message.style.animation = 'slideOut 0.3s ease-in forwards';
            setTimeout(() => container.removeChild(message), 300);
        }, 3000);
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // Export/Import Functions (Bonus Features)
    exportRecipes() {
        const dataStr = JSON.stringify(this.recipes, null, 2);
        const dataBlob = new Blob([dataStr], {type: 'application/json'});
        const url = URL.createObjectURL(dataBlob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = 'my-recipes.json';
        link.click();
        
        URL.revokeObjectURL(url);
        this.showMessage('Recipes exported successfully!', 'success');
    }

    importRecipes(event) {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const importedRecipes = JSON.parse(e.target.result);
                if (Array.isArray(importedRecipes)) {
                    // Add unique IDs to imported recipes to avoid conflicts
                    importedRecipes.forEach(recipe => {
                        recipe.id = Date.now().toString() + Math.random().toString(36).substr(2, 9);
                        recipe.dateAdded = new Date().toISOString();
                    });
                    
                    this.recipes = [...this.recipes, ...importedRecipes];
                    this.saveToStorage();
                    this.renderRecipes();
                    this.showMessage(`${importedRecipes.length} recipes imported successfully!`, 'success');
                } else {
                    throw new Error('Invalid file format');
                }
            } catch (error) {
                this.showMessage('Error importing recipes. Please check the file format.', 'error');
            }
        };
        reader.readAsText(file);
    }
}

// Add CSS animation for message slideOut
const style = document.createElement('style');
style.textContent = `
    @keyframes slideOut {
        to { transform: translateX(100%); opacity: 0; }
    }
`;
document.head.appendChild(style);

// Initialize the application
const app = new RecipeBook();

// Add keyboard shortcuts
document.addEventListener('keydown', (e) => {
    if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
            case '1':
                e.preventDefault();
                app.switchTab('add-recipe');
                break;
            case '2':
                e.preventDefault();
                app.switchTab('view-recipes');
                break;
            case '3':
                e.preventDefault();
                app.switchTab('search-recipes');
                break;
        }
    }
});

// Service Worker Registration (for future PWA capabilities)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        // Service worker registration would go here for offline functionality
    });
}