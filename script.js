// Define the variables that need to be accessible globally
let addMealBtn, manageMealCategoriesBtn, bulkPriceUpdateBtn;
let mealCategoryFilter, mealSubcategoryFilter, mealSearch, mealsTable, noMealsMsg;
let mealModal, mealModalTitle, mealForm, mealIdInput, mealNameInput, mealDescriptionInput;
let mealPriceInput, mealCategorySelect, mealSubcategorySelect, cancelMealBtn;
let mealCategoryModal, modalTabs, modalTabContents;
let mealCategoryForm, mealCategoryFormTitle, mealCategoryIdInput, mealCategoryNameInput;
let mealCategoryDescInput, resetMealCategoryBtn, mealCategoriesTable, noMealCategoriesMsg;
let mealSubcategoryForm, mealSubcategoryFormTitle, mealSubcategoryIdInput, mealSubcategoryNameInput;
let mealSubcategoryDescInput, mealSubcategoryParentSelect, resetMealSubcategoryBtn;
let mealSubcategoriesTable, noMealSubcategoriesMsg;
let bulkPriceModal, bulkPriceForm, priceUpdateTypeRadios, priceUpdateOperationRadios;
let priceUpdateValue, priceUpdateSymbol, bulkUpdateFilter, bulkCategoryContainer;
let bulkSubcategoryContainer, bulkCategorySelect, bulkSubcategorySelect;
let previewText, affectedCount, cancelBulkPriceBtn;

// Global state variables for meal management
let currentMeals = [];
let currentMealCategories = [];
let currentMealSubcategories = [];
let currentMealId = null;
let currentMealCategoryId = null;
let currentMealSubcategoryId = null;

// Define functions that need to be available globally
let handleTabClick;
let updateBulkPricePreview;
let loadMealCategories, loadMealSubcategories, loadMeals;
let updateMealCategorySelects, updateMealSubcategorySelects;
let updateMealsTable, updateMealCategoriesTable, updateMealSubcategoriesTable;
let openMealModal, editMeal;
let openMealCategoryModal, editMealCategory, resetMealCategoryForm, confirmDeleteMealCategory;
let editMealSubcategory, resetMealSubcategoryForm, confirmDeleteMealSubcategory;
let openBulkPriceModal;

// Add this function definition at the top with other global functions
let updateSidebarVisibility;

// Function to show/hide sidebar based on current tab
updateSidebarVisibility = function() {
    try {
        const currentTab = document.querySelector('.tab-content.active').id;
        const sidebar = document.getElementById('sidebar');
        
        if (currentTab === 'add-credit') {
            sidebar.style.display = 'block';
            // Add animation
            sidebar.classList.add('visible');
        } else {
            sidebar.classList.remove('visible');
            // Use setTimeout to allow the animation to complete
            setTimeout(() => {
                sidebar.style.display = 'none';
            }, 300);
        }
    } catch (error) {
        console.error('Error in updateSidebarVisibility:', error);
    }
};

// Close any modal
function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'none';
    }
    
    // If it's the guest modal and we're in the credit flow
    if (modalId === 'guest-modal' && document.getElementById('step-guest').style.display === 'block') {
        // Refresh the guests list in case a new guest was added
        const categoryId = document.getElementById('credit-category-filter').value;
        loadCreditGuests(categoryId);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const tabs = document.querySelectorAll('nav ul li');
    const tabContents = document.querySelectorAll('.tab-content');
    const sidebar = document.getElementById('sidebar');
    const contentArea = document.getElementById('content');
    
    // Track state for all tabs
    let currentGuests = [];
    let currentCategories = [];
    let currentGuestId = null;
    let currentCategoryId = null;
    let deleteCallback = null;
    
    // Elements for guest management
    const addGuestBtn = document.getElementById('add-guest-btn');
    const manageCategoriesBtn = document.getElementById('manage-categories-btn');
    const categoryFilter = document.getElementById('category-filter');
    const guestSearch = document.getElementById('guest-search');
    const guestsTable = document.getElementById('guests-table');
    const noGuestsMsg = document.getElementById('no-guests-message');
    
    // Guest modal elements
    const guestModal = document.getElementById('guest-modal');
    const guestModalTitle = document.getElementById('guest-modal-title');
    const guestForm = document.getElementById('guest-form');
    const guestIdInput = document.getElementById('guest-id');
    const guestNameInput = document.getElementById('guest-name');
    const guestPhoneInput = document.getElementById('guest-phone');
    const guestEmailInput = document.getElementById('guest-email');
    const guestAddressInput = document.getElementById('guest-address');
    const guestCategorySelect = document.getElementById('guest-category');
    const cancelGuestBtn = document.getElementById('cancel-guest');
    
    // Category modal elements
    const categoryModal = document.getElementById('category-modal');
    const categoryForm = document.getElementById('category-form');
    const categoryFormTitle = document.getElementById('category-form-title');
    const categoryIdInput = document.getElementById('category-id');
    const categoryNameInput = document.getElementById('category-name');
    const categoryDescInput = document.getElementById('category-description');
    const resetCategoryBtn = document.getElementById('reset-category-form');
    const categoriesTable = document.getElementById('categories-table');
    const noCategoriesMsg = document.getElementById('no-categories-message');
    
    // Confirmation modal elements
    const confirmModal = document.getElementById('confirm-modal');
    const confirmTitle = document.getElementById('confirm-title');
    const confirmMessage = document.getElementById('confirm-message');
    const confirmActionBtn = document.getElementById('confirm-action');
    const cancelConfirmBtn = document.getElementById('cancel-confirm');
    
    // Initialize meal management elements 
    // Elements for meal management (assign to global variables)
    addMealBtn = document.getElementById('add-meal-btn');
    manageMealCategoriesBtn = document.getElementById('manage-meal-categories-btn');
    bulkPriceUpdateBtn = document.getElementById('bulk-price-update-btn');
    mealCategoryFilter = document.getElementById('credit-meal-category-filter');
    mealSubcategoryFilter = document.getElementById('credit-meal-subcategory-filter');
    mealSearch = document.getElementById('meal-search');
    mealsTable = document.getElementById('meals-table');
    noMealsMsg = document.getElementById('no-meals-message');
    
    // Meal modal elements
    mealModal = document.getElementById('meal-modal');
    mealModalTitle = document.getElementById('meal-modal-title');
    mealForm = document.getElementById('meal-form');
    mealIdInput = document.getElementById('meal-id');
    mealNameInput = document.getElementById('meal-name');
    mealDescriptionInput = document.getElementById('meal-description');
    mealPriceInput = document.getElementById('meal-price');
    mealCategorySelect = document.getElementById('meal-category');
    mealSubcategorySelect = document.getElementById('meal-subcategory');
    cancelMealBtn = document.getElementById('cancel-meal');
    // Meal category modal elements
    mealCategoryModal = document.getElementById('meal-category-modal');
    modalTabs = document.querySelectorAll('.modal-tab');
    modalTabContents = document.querySelectorAll('.modal-tab-content');
    
    // Category tab elements
    mealCategoryForm = document.getElementById('meal-category-form');
    mealCategoryFormTitle = document.getElementById('meal-category-form-title');
    mealCategoryIdInput = document.getElementById('meal-category-id');
    mealCategoryNameInput = document.getElementById('meal-category-name');
    mealCategoryDescInput = document.getElementById('meal-category-description');
    resetMealCategoryBtn = document.getElementById('reset-meal-category-form');
    mealCategoriesTable = document.getElementById('meal-categories-table');
    noMealCategoriesMsg = document.getElementById('no-meal-categories-message');
    
    // Subcategory tab elements
    mealSubcategoryForm = document.getElementById('meal-subcategory-form');
    mealSubcategoryFormTitle = document.getElementById('meal-subcategory-form-title');
    mealSubcategoryIdInput = document.getElementById('meal-subcategory-id');
    mealSubcategoryNameInput = document.getElementById('meal-subcategory-name');
    mealSubcategoryDescInput = document.getElementById('meal-subcategory-description');
    mealSubcategoryParentSelect = document.getElementById('meal-subcategory-parent');
    resetMealSubcategoryBtn = document.getElementById('reset-meal-subcategory-form');
    mealSubcategoriesTable = document.getElementById('meal-subcategories-table');
    noMealSubcategoriesMsg = document.getElementById('no-meal-subcategories-message');
    
    // Bulk price update modal elements
    bulkPriceModal = document.getElementById('bulk-price-modal');
    bulkPriceForm = document.getElementById('bulk-price-form');
    priceUpdateTypeRadios = document.getElementsByName('price-update-type');
    priceUpdateOperationRadios = document.getElementsByName('price-update-operation');
    priceUpdateValue = document.getElementById('price-update-value');
    priceUpdateSymbol = document.getElementById('price-update-symbol');
    bulkUpdateFilter = document.getElementById('bulk-update-filter');
    bulkCategoryContainer = document.getElementById('bulk-category-container');
    bulkSubcategoryContainer = document.getElementById('bulk-subcategory-container');
    bulkCategorySelect = document.getElementById('bulk-category');
    bulkSubcategorySelect = document.getElementById('bulk-subcategory');
    previewText = document.querySelector('.preview-text');
    affectedCount = document.getElementById('affected-count');
    cancelBulkPriceBtn = document.getElementById('cancel-bulk-price');
    
    // Settings elements
    const settingsIcon = document.getElementById('settings-icon');
    const settingsMenu = document.getElementById('settings-menu');
    const darkModeToggle = document.getElementById('dark-mode-toggle');

    settingsIcon.addEventListener('click', () => {
        settingsMenu.style.display = settingsMenu.style.display === 'none' ? 'block' : 'none';
    });

 
    
    // Wait for server status before initializing
    if (window.electron) {
        electron.receive('server-status', (status) => {
            console.log('Server status:', status);
            if (status.running) {
                // Initialize data when server is running
                initializeData();
            }
        });
    }
    
    // Initialize data
    async function initializeData() {
        await loadCategories();
    }
    
    // Show toast message
    function showToast(message, type = 'info') {
        const toastContainer = document.getElementById('toast-container');
        if (!toastContainer) return;
        
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        
        toast.innerHTML = `
            <div class="toast-icon">${getToastIcon(type)}</div>
            <div class="toast-message">${message}</div>
            <button class="toast-close">&times;</button>
        `;
        
        toastContainer.appendChild(toast);
        
        // Add event listener to close button
        const closeBtn = toast.querySelector('.toast-close');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                toast.classList.add('toast-hiding');
                setTimeout(() => {
                    toast.remove();
                }, 300);
            });
        }
        
        // Auto-remove toast after 5 seconds
        setTimeout(() => {
            if (toast.parentNode) {
                toast.classList.add('toast-hiding');
                setTimeout(() => {
                    if (toast.parentNode) {
                        toast.remove();
                    }
                }, 300);
            }
        }, 5000);
    }

    // Helper function to get toast icon based on type
    function getToastIcon(type) {
        switch (type) {
            case 'success':
                return '<i class="fas fa-check-circle"></i>';
            case 'error':
                return '<i class="fas fa-exclamation-circle"></i>';
            case 'warning':
                return '<i class="fas fa-exclamation-triangle"></i>';
            case 'info':
            default:
                return '<i class="fas fa-info-circle"></i>';
        }
    }
    
    // Load categories from server
    async function loadCategories() {
        try {
            currentCategories = await window.electron.api.get('/api/guest-categories');
            updateCategorySelects();
            if (document.querySelector('.tab-content.active').id === 'guest-management') {
                updateCategoriesTable();
            }
        } catch (error) {
            showToast('Error loading categories: ' + error.message, 'error');
        }
    }
    
    // Update category select elements
    function updateCategorySelects() {
        // Clear existing options except first one
        categoryFilter.innerHTML = '<option value="all">All Categories</option>';
        guestCategorySelect.innerHTML = '<option value="">-- Select Category --</option>';
        
        // Add options for each category
        currentCategories.forEach(category => {
            const filterOption = document.createElement('option');
            filterOption.value = category.id;
            filterOption.textContent = category.name;
            categoryFilter.appendChild(filterOption);
            
            const selectOption = document.createElement('option');
            selectOption.value = category.id;
            selectOption.textContent = category.name;
            guestCategorySelect.appendChild(selectOption);
        });
    }
    
    // Load guests from server
    async function loadGuests(categoryId = 'all') {
        try {
            let endpoint = '/api/guests';
            if (categoryId !== 'all') {
                endpoint = `/api/guests/category/${categoryId}`;
            }
            
            currentGuests = await window.electron.api.get(endpoint);
            updateGuestsTable();
        } catch (error) {
            showToast('Error loading guests: ' + error.message, 'error');
        }
    }
    
    // Update guests table
    function updateGuestsTable() {
        const tbody = guestsTable.querySelector('tbody');
        tbody.innerHTML = '';
        
        if (currentGuests.length === 0) {
            noGuestsMsg.style.display = 'block';
            guestsTable.style.display = 'none';
            return;
        }
        
        noGuestsMsg.style.display = 'none';
        guestsTable.style.display = 'table';
        
        // Filter guests by search term
        const searchTerm = guestSearch.value.toLowerCase().trim();
        const filteredGuests = searchTerm ? 
            currentGuests.filter(guest => 
                guest.name.toLowerCase().includes(searchTerm) || 
                (guest.email && guest.email.toLowerCase().includes(searchTerm)) ||
                (guest.phone && guest.phone.includes(searchTerm))
            ) : currentGuests;
        
        // Show or hide no results message
        if (filteredGuests.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="5" class="empty-row">No guests match your search criteria</td>
                </tr>
            `;
            return;
        }
        
        // Add rows for each guest
        filteredGuests.forEach(guest => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${guest.name}</td>
                <td>${guest.phone || '-'}</td>
                <td>${guest.email || '-'}</td>
                <td>${guest.category_name || 'Uncategorized'}</td>
                <td>
                    <div class="action-icons">
                        <i class="fas fa-edit edit-icon" data-id="${guest.id}" title="Edit Guest"></i>
                        <i class="fas fa-trash-alt delete-icon" data-id="${guest.id}" title="Delete Guest"></i>
                    </div>
                </td>
            `;
            
            // Add event listeners for edit and delete
            tr.querySelector('.edit-icon').addEventListener('click', () => editGuest(guest.id));
            tr.querySelector('.delete-icon').addEventListener('click', () => confirmDeleteGuest(guest.id, guest.name));
            
            tbody.appendChild(tr);
        });
    }
    
    // Update categories table
    function updateCategoriesTable() {
        const tbody = categoriesTable.querySelector('tbody');
        tbody.innerHTML = '';
        
        if (currentCategories.length === 0) {
            noCategoriesMsg.style.display = 'block';
            categoriesTable.style.display = 'none';
            return;
        }
        
        noCategoriesMsg.style.display = 'none';
        categoriesTable.style.display = 'table';
        
        // Add rows for each category
        currentCategories.forEach(category => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${category.name}</td>
                <td>${category.description || '-'}</td>
                <td>
                    <div class="action-icons">
                        <i class="fas fa-edit edit-icon" data-id="${category.id}" title="Edit Category"></i>
                        <i class="fas fa-trash-alt delete-icon" data-id="${category.id}" title="Delete Category"></i>
                    </div>
                </td>
            `;
            
            // Add event listeners for edit and delete
            tr.querySelector('.edit-icon').addEventListener('click', () => editCategory(category.id));
            tr.querySelector('.delete-icon').addEventListener('click', () => confirmDeleteCategory(category.id, category.name));
            
            tbody.appendChild(tr);
        });
    }
    
    // Open guest form modal
    function openGuestModal(isEdit = false) {
        // Reset form
        guestForm.reset();
        guestIdInput.value = '';
        
        // Set mode
        if (isEdit) {
            guestModalTitle.textContent = 'Edit Guest';
        } else {
            guestModalTitle.textContent = 'Add New Guest';
            currentGuestId = null;
        }
        
        // Open modal
        guestModal.style.display = 'block';
    }
    
    // Edit guest
    function editGuest(id) {
        const guest = currentGuests.find(g => g.id === id);
        if (!guest) return;
        
        currentGuestId = id;
        guestIdInput.value = id;
        guestNameInput.value = guest.name;
        guestPhoneInput.value = guest.phone || '';
        guestEmailInput.value = guest.email || '';
        guestAddressInput.value = guest.address || '';
        guestCategorySelect.value = guest.category_id || '';
        
        openGuestModal(true);
    }
    
    // Confirm delete guest
    function confirmDeleteGuest(id, name) {
        confirmTitle.textContent = 'Delete Guest';
        confirmMessage.textContent = `Are you sure you want to delete the guest "${name}"? This action cannot be undone.`;
        
        deleteCallback = async () => {
            try {
                await window.electron.api.delete(`/api/guests/${id}`);
                await loadGuests(categoryFilter.value);
                showToast('Guest deleted successfully', 'success');
            } catch (error) {
                showToast(error.message, 'error');
            }
        };
        
        confirmModal.style.display = 'block';
    }
    
    // Open category modal
    function openCategoryModal() {
        // Reset form first
        resetCategoryForm();
        
        // Ensure we load categories for the subcategory parent dropdown
        loadMealCategoriesForSubcategoryForm();
        
        categoryModal.style.display = 'block';
    }

    // Add this new function to load categories for the subcategory form
    function loadMealCategoriesForSubcategoryForm() {
        return fetch(`${API_BASE_URL}/api/meal-categories`)
            .then(response => response.json())
            .then(categories => {
                const select = document.getElementById('meal-subcategory-parent');
                select.innerHTML = '<option value="">-- Select Parent Category --</option>';
                
                categories.forEach(category => {
                    const option = document.createElement('option');
                    option.value = category.id;
                    option.textContent = category.name;
                    select.appendChild(option);
                });
                
                return categories; // Return for chaining
            })
            .catch(error => {
                console.error('Error loading meal categories for subcategory form:', error);
                showToast('Failed to load categories', 'error');
                return []; // Return empty array in case of error
            });
    }
    
    // Edit category
    function editCategory(id) {
        const category = currentCategories.find(c => c.id === id);
        if (!category) return;
        
        currentCategoryId = id;
        categoryIdInput.value = id;
        categoryNameInput.value = category.name;
        categoryDescInput.value = category.description || '';
        categoryFormTitle.textContent = 'Edit Category';
        
        if (!categoryModal.style.display || categoryModal.style.display === 'none') {
            openCategoryModal();
        }
    }
    
    // Reset category form
    function resetCategoryForm() {
        categoryForm.reset();
        categoryIdInput.value = '';
        currentCategoryId = null;
        categoryFormTitle.textContent = 'Add New Category';
    }
    
    // Confirm delete category
    function confirmDeleteCategory(id, name) {
        confirmTitle.textContent = 'Delete Category';
        confirmMessage.textContent = `Are you sure you want to delete the category "${name}"? This action cannot be undone.`;
        
        deleteCallback = async () => {
            try {
                await window.electron.api.delete(`/api/guest-categories/${id}`);
                await loadCategories();
                await loadGuests(categoryFilter.value);
                showToast('Category deleted successfully', 'success');
            } catch (error) {
                showToast(error.message, 'error');
            }
        };
        
        confirmModal.style.display = 'block';
    }
    
    // ===================
    // MEAL MANAGEMENT
    // ===================
    
    // Load meal-related data
    loadMealCategories = async function() {
        try {
            currentMealCategories = await window.electron.api.get('/api/meal-categories');
            updateMealCategorySelects();
            if (document.querySelector('.tab-content.active').id === 'meal-management') {
                updateMealCategoriesTable();
            }
        } catch (error) {
            showToast('Error loading meal categories: ' + error.message, 'error');
        }
    }

    loadMealSubcategories = async function(categoryId = null) {
        try {
            let endpoint = '/api/meal-subcategories';
            if (categoryId) {
                endpoint = `/api/meal-subcategories/category/${categoryId}`;
            }
            
            currentMealSubcategories = await window.electron.api.get(endpoint);
            updateMealSubcategorySelects();
            
            if (document.querySelector('.tab-content.active').id === 'meal-management' && 
                document.querySelector('.modal-tab-content.active')?.id === 'subcategories-tab') {
                updateMealSubcategoriesTable();
            }
        } catch (error) {
            showToast('Error loading meal subcategories: ' + error.message, 'error');
        }
    }

    loadMeals = async function(options = {}) {
        try {
            let endpoint = '/api/meals';
            
            if (options.categoryId && options.categoryId !== 'all') {
                endpoint = `/api/meals/category/${options.categoryId}`;
            } else if (options.subcategoryId && options.subcategoryId !== 'all') {
                endpoint = `/api/meals/subcategory/${options.subcategoryId}`;
            }
            
            currentMeals = await window.electron.api.get(endpoint);
            updateMealsTable();
        } catch (error) {
            showToast('Error loading meals: ' + error.message, 'error');
        }
    }

    // Update meal-related selects
    updateMealCategorySelects = function() {
        // Check if all the necessary elements are present
        if (!mealCategoryFilter || !mealCategorySelect || !mealSubcategoryParentSelect || !bulkCategorySelect) {
            console.log("Some meal category select elements are not found in the DOM");
            return;
        }
        
        // Clear existing options in all meal category selects
        const selects = [
            mealCategoryFilter, 
            mealCategorySelect, 
            mealSubcategoryParentSelect,
            bulkCategorySelect
        ];
        
        selects.forEach(select => {
            // Keep only the first option
            const firstOption = select.options[0];
            select.innerHTML = '';
            select.appendChild(firstOption);
            
            // Add options for each category
            currentMealCategories.forEach(category => {
                const option = document.createElement('option');
                option.value = category.id;
                option.textContent = category.name;
                select.appendChild(option);
            });
        });
    }

    updateMealSubcategorySelects = function(filterCategoryId = null) {
        // Check if all the necessary elements are present
        if (!mealSubcategoryFilter || !mealSubcategorySelect || !bulkSubcategorySelect) {
            console.log("Some meal subcategory select elements are not found in the DOM");
            return;
        }
        
        // Clear existing options in all subcategory selects
        const selects = [mealSubcategoryFilter, mealSubcategorySelect, bulkSubcategorySelect];
        
        selects.forEach(select => {
            // Keep only the first option
            const firstOption = select.options[0];
            select.innerHTML = '';
            select.appendChild(firstOption);
            
            // Filter subcategories if a category is specified
            const subcategories = filterCategoryId 
                ? currentMealSubcategories.filter(sub => sub.category_id == filterCategoryId)
                : currentMealSubcategories;
            
            // Add options for each subcategory
            subcategories.forEach(subcategory => {
                const option = document.createElement('option');
                option.value = subcategory.id;
                option.textContent = subcategory.name;
                select.appendChild(option);
            });
        });
    }

    // Update meal tables functions
    updateMealsTable = function() {
        const tbody = document.querySelector('#meals-table tbody');
        tbody.innerHTML = '';
        
        if (currentMeals.length === 0) {
            document.getElementById('no-meals-message').style.display = 'block';
            return;
        }
        
        document.getElementById('no-meals-message').style.display = 'none';
        
        currentMeals.forEach(meal => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td><input type="checkbox" class="meal-checkbox" data-id="${meal.id}"></td>
                <td>${meal.name}</td>
                <td>${meal.description || '-'}</td>
                <td>$${parseFloat(meal.price).toFixed(2)}</td>
                <td>${meal.category_name || '-'}</td>
                <td>${meal.subcategory_name || '-'}</td>
                <td>
                    <div class="action-icons">
                        <i class="fas fa-edit edit-icon" data-id="${meal.id}" title="Edit Meal"></i>
                        <i class="fas fa-trash-alt delete-icon" data-id="${meal.id}" data-name="${meal.name}" title="Delete Meal"></i>
                    </div>
                </td>
            `;
            
            // Attach event listeners
            tr.querySelector('.edit-icon').addEventListener('click', () => {
                editMeal(meal.id);
            });
            
            tr.querySelector('.delete-icon').addEventListener('click', () => {
                confirmDeleteMeal(meal.id, meal.name);
            });
            
            tbody.appendChild(tr);
        });
    };

    updateMealCategoriesTable = function() {
        const tbody = mealCategoriesTable.querySelector('tbody');
        tbody.innerHTML = '';
        
        if (currentMealCategories.length === 0) {
            noMealCategoriesMsg.style.display = 'block';
            mealCategoriesTable.style.display = 'none';
            return;
        }
        
        noMealCategoriesMsg.style.display = 'none';
        mealCategoriesTable.style.display = 'table';
        
        // Add rows for each category
        currentMealCategories.forEach(category => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${category.name}</td>
                <td>${category.description || '-'}</td>
                <td>
                    <div class="action-icons">
                        <i class="fas fa-edit edit-icon" data-id="${category.id}" title="Edit Category"></i>
                        <i class="fas fa-trash-alt delete-icon" data-id="${category.id}" title="Delete Category"></i>
                    </div>
                </td>
            `;
            
            // Add event listeners for edit and delete
            tr.querySelector('.edit-icon').addEventListener('click', () => editMealCategory(category.id));
            tr.querySelector('.delete-icon').addEventListener('click', () => confirmDeleteMealCategory(category.id, category.name));
            
            tbody.appendChild(tr);
        });
    };

    updateMealSubcategoriesTable = function() {
        const tbody = mealSubcategoriesTable.querySelector('tbody');
        tbody.innerHTML = '';
        
        if (currentMealSubcategories.length === 0) {
            noMealSubcategoriesMsg.style.display = 'block';
            mealSubcategoriesTable.style.display = 'none';
            return;
        }
        
        noMealSubcategoriesMsg.style.display = 'none';
        mealSubcategoriesTable.style.display = 'table';
        
        // Add rows for each subcategory
        currentMealSubcategories.forEach(subcategory => {
            // Find parent category name
            const parentCategory = currentMealCategories.find(c => c.id === subcategory.category_id);
            const parentName = parentCategory ? parentCategory.name : '-';
            
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${subcategory.name}</td>
                <td>${subcategory.description || '-'}</td>
                <td>${parentName}</td>
                <td>
                    <div class="action-icons">
                        <i class="fas fa-edit edit-icon" data-id="${subcategory.id}" title="Edit Subcategory"></i>
                        <i class="fas fa-trash-alt delete-icon" data-id="${subcategory.id}" title="Delete Subcategory"></i>
                    </div>
                </td>
            `;
            
            // Add event listeners for edit and delete
            tr.querySelector('.edit-icon').addEventListener('click', () => editMealSubcategory(subcategory.id));
            tr.querySelector('.delete-icon').addEventListener('click', () => confirmDeleteMealSubcategory(subcategory.id, subcategory.name));
            
            tbody.appendChild(tr);
        });
    };

    // Add the remaining meal management functions
    openMealModal = function(isEdit = false) {
        // Reset form
        mealForm.reset();
        mealIdInput.value = '';
        
        // Set mode
        if (isEdit) {
            mealModalTitle.textContent = 'Edit Meal';
        } else {
            mealModalTitle.textContent = 'Add New Meal';
            currentMealId = null;
        }
        
        // Open modal
        mealModal.style.display = 'block';
    };

    editMeal = function(id) {
        // Fetch the meal data first
        fetch(`http://localhost:3000/api/meals/${id}`)
            .then(response => {
                if (!response.ok) throw new Error('Failed to fetch meal data');
                return response.json();
            })
            .then(meal => {
                // Get the correct form element
                const mealForm = document.getElementById('meal-form');
                if (!mealForm) {
                    throw new Error('Meal form not found');
                }
                
                // Populate the form with meal data
                document.getElementById('meal-id').value = meal.id;
                document.getElementById('meal-name').value = meal.name;
                document.getElementById('meal-description').value = meal.description || '';
                document.getElementById('meal-price').value = meal.price;
                
                // Set the category and load subcategories
                const categorySelect = document.getElementById('meal-category');
                categorySelect.value = meal.category_id || '';
                
                // Load subcategories for this meal's category
                if (meal.category_id) {
                    loadSubcategoriesForMeal(meal.category_id, meal.subcategory_id);
                }
                
                // Update the modal title
                document.getElementById('meal-modal-title').textContent = 'Edit Meal';
                
                // Clean up any previous event listeners to avoid duplicates
                const newForm = mealForm.cloneNode(true);
                mealForm.parentNode.replaceChild(newForm, mealForm);
                
                // Add the submit event handler to the new form
                newForm.addEventListener('submit', function(e) {
                    e.preventDefault();
                    
                    // Directly get values from elements instead of using FormData
                    const mealData = {
                        name: document.getElementById('meal-name').value,
                        description: document.getElementById('meal-description').value,
                        price: document.getElementById('meal-price').value,
                        subcategory_id: document.getElementById('meal-subcategory').value || null
                    };
                    
                    // Make the PUT request with the correct URL
                    fetch(`http://localhost:3000/api/meals/${id}`, {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify(mealData)
                    })
                    .then(response => {
                        if (!response.ok) throw new Error('Failed to update meal');
                        return response.json();
                    })
                    .then(data => {
                        showToast('Meal updated successfully', 'success');
                        closeModal('meal-modal');
                        // Refresh your meals list
                        loadMeals({
                            categoryId: document.getElementById('meal-category-filter').value,
                            subcategoryId: document.getElementById('meal-subcategory-filter').value
                        });
                    })
                    .catch(error => {
                        console.error('Error saving meal:', error);
                        showToast('Error saving meal: ' + error.message, 'error');
                    });
                });

                // Show the modal
                document.getElementById('meal-modal').style.display = 'block';
            })
            .catch(error => {
                console.error('Error fetching meal:', error);
                showToast('Error fetching meal: ' + error.message, 'error');
            });
    };

    // Helper function to load subcategories for a meal
    function loadSubcategoriesForMeal(categoryId, subcategoryId) {
        return fetch(`${API_BASE_URL}/api/meal-subcategories/category/${categoryId}`)
            .then(response => {
                if (!response.ok) throw new Error('Failed to load subcategories');
                return response.json();
            })
            .then(subcategories => {
                const subcategorySelect = document.getElementById('meal-subcategory');
                subcategorySelect.innerHTML = '<option value="">-- Select Subcategory --</option>';
                
                subcategories.forEach(subcategory => {
                    const option = document.createElement('option');
                    option.value = subcategory.id;
                    option.textContent = subcategory.name;
                    subcategorySelect.appendChild(option);
                });
                
                // Set the subcategory select value if provided
                if (subcategoryId) {
                    subcategorySelect.value = subcategoryId;
                }
            });
    }

    confirmDeleteMeal = function(id, name) {
        // Set up the confirm modal
        confirmTitle.textContent = 'Delete Meal';
        confirmMessage.textContent = `Are you sure you want to delete the meal "${name}"? This action cannot be undone.`;
        
        // Define the delete callback
        deleteCallback = function() {
            // Use fetch instead of window.electron.api.delete
            fetch(`http://localhost:3000/api/meals/${id}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json'
                }
            })
            .then(response => {
                if (!response.ok) throw new Error('Failed to delete meal');
                return response.json();
            })
            .then(data => {
                showToast('Meal deleted successfully', 'success');
                closeModal('confirm-modal');
                
                // Refresh the meals list
                loadMeals({
                    categoryId: document.getElementById('meal-category-filter').value,
                    subcategoryId: document.getElementById('meal-subcategory-filter').value
                });
            })
            .catch(error => {
                console.error('Error deleting meal:', error);
                showToast('Error deleting meal: ' + error.message, 'error');
            });
        };
        
        // Make sure the confirm button has the correct event listener
        const confirmButton = document.getElementById('confirm-action');
        
        // Remove any existing event listeners to avoid duplicates
        const newConfirmButton = confirmButton.cloneNode(true);
        confirmButton.parentNode.replaceChild(newConfirmButton, confirmButton);
        
        // Add the event listener to the new button
        newConfirmButton.addEventListener('click', function() {
            deleteCallback();
        });
        
        // Show the confirm modal
        document.getElementById('confirm-modal').style.display = 'block';
    };

    openMealCategoryModal = function() {
        // Make sure the Categories tab is active
        modalTabs.forEach(tab => tab.classList.remove('active'));
        modalTabs[0].classList.add('active');
        modalTabContents.forEach(content => content.classList.remove('active'));
        modalTabContents[0].classList.add('active');
        
        // Reset the form
        resetMealCategoryForm();
        
        // Open the modal
        mealCategoryModal.style.display = 'block';
    };

    editMealCategory = function(id) {
        const category = currentMealCategories.find(c => c.id === id);
        if (!category) return;
        
        currentMealCategoryId = id;
        mealCategoryIdInput.value = id;
        mealCategoryNameInput.value = category.name;
        mealCategoryDescInput.value = category.description || '';
        mealCategoryFormTitle.textContent = 'Edit Category';
        
        // Open the modal if not already open
        if (!mealCategoryModal.style.display || categoryModal.style.display === 'none') {
            openMealCategoryModal();
        }
    };

    resetMealCategoryForm = function() {
        mealCategoryForm.reset();
        mealCategoryIdInput.value = '';
        currentMealCategoryId = null;
        mealCategoryFormTitle.textContent = 'Add New Category';
    };

    confirmDeleteMealCategory = function(id, name) {
        confirmTitle.textContent = 'Delete Meal Category';
        confirmMessage.textContent = `Are you sure you want to delete the category "${name}"? This will also delete all associated subcategories and meals. This action cannot be undone.`;
        
        deleteCallback = async () => {
            try {
                await window.electron.api.delete(`/api/meal-categories/${id}`);
                await loadMealCategories();
                await loadMealSubcategories();
                await loadMeals({ categoryId: 'all', subcategoryId: 'all' });
                showToast('Category deleted successfully', 'success');
            } catch (error) {
                showToast(error.message, 'error');
            }
        };
        
        confirmModal.style.display = 'block';
    };

    editMealSubcategory = function(id) {
        // Reset the form first
        document.getElementById('meal-subcategory-form').reset();
        document.getElementById('meal-subcategory-form-title').textContent = 'Edit Subcategory';
        
        // Fetch the subcategory data
        fetch(`${API_BASE_URL}/api/meal-subcategories/${id}`)
            .then(response => response.json())
            .then(subcategory => {
                document.getElementById('meal-subcategory-id').value = subcategory.id;
                document.getElementById('meal-subcategory-name').value = subcategory.name;
                document.getElementById('meal-subcategory-description').value = subcategory.description || '';
                
                // Make sure we load categories first before setting the selected value
                loadMealCategoriesForSubcategoryForm().then(() => {
                    document.getElementById('meal-subcategory-parent').value = subcategory.category_id;
                });
            })
            .catch(error => {
                console.error('Error loading subcategory data:', error);
                showToast('Failed to load subcategory data', 'error');
            });
    }

    resetMealSubcategoryForm = function() {
        mealSubcategoryForm.reset();
        mealSubcategoryIdInput.value = '';
        currentMealSubcategoryId = null;
        mealSubcategoryFormTitle.textContent = 'Add New Subcategory';
    };

    confirmDeleteMealSubcategory = function(id, name) {
        confirmTitle.textContent = 'Delete Meal Subcategory';
        confirmMessage.textContent = `Are you sure you want to delete the subcategory "${name}"? This will also delete all associated meals. This action cannot be undone.`;
        
        deleteCallback = async () => {
            try {
                await window.electron.api.delete(`/api/meal-subcategories/${id}`);
                await loadMealSubcategories();
                await loadMeals({ categoryId: 'all', subcategoryId: 'all' });
                showToast('Subcategory deleted successfully', 'success');
            } catch (error) {
                showToast(error.message, 'error');
            }
        };
        
        confirmModal.style.display = 'block';
    };

    openBulkPriceModal = function() {
        // Reset form fields
        bulkPriceForm.reset();
        priceUpdateValue.value = '';
        bulkUpdateFilter.value = 'all';
        bulkCategoryContainer.style.display = 'none';
        bulkSubcategoryContainer.style.display = 'none';
        
        // Initialize preview
        updateBulkPricePreview();
        
        // Open modal
        bulkPriceModal.style.display = 'block';
    };

    // Function to handle tab clicks
    handleTabClick = function(e) {
        // Remove active class from all tabs
        tabs.forEach(tab => tab.classList.remove('active'));
        
        // Add active class to clicked tab
        this.classList.add('active');
        
        // Get the data-tab attribute
        const tabId = this.getAttribute('data-tab');
        
        // Hide all tab contents
        tabContents.forEach(content => content.classList.remove('active'));
        
        // Show the selected tab content
        document.getElementById(tabId).classList.add('active');
        
        // Show sidebar only for 'home' and 'add-credit' tabs
        if (tabId === 'home' || tabId === 'add-credit') {
            sidebar.classList.add('visible');
            contentArea.classList.add('with-sidebar');
        } else {
            sidebar.classList.remove('visible');
            contentArea.classList.remove('with-sidebar');
        }
        
        // Load data for specific tabs
        if (tabId === 'guest-management') {
            loadGuests('all');
            loadCategories();
        } else if (tabId === 'meal-management') {
            loadMealCategories();
            loadMealSubcategories();
            loadMeals({ categoryId: 'all', subcategoryId: 'all' });
        }
        
        // Update sidebar visibility after tab switch
        updateSidebarVisibility();
    };
    
    // Add click event listeners to all tabs
    tabs.forEach(tab => {
        tab.addEventListener('click', handleTabClick);
    });
    
    // Add meal management event listeners
    if (addMealBtn && manageMealCategoriesBtn && bulkPriceUpdateBtn) {
        addMealBtn.addEventListener('click', () => openMealModal(false));
        manageMealCategoriesBtn.addEventListener('click', openMealCategoryModal);
        bulkPriceUpdateBtn.addEventListener('click', openBulkPriceModal);
        
        // Modal tab navigation
        modalTabs.forEach(tab => {
            tab.addEventListener('click', function() {
                const tabId = this.getAttribute('data-tab');
                
                // Update tab active state
                modalTabs.forEach(t => t.classList.remove('active'));
                this.classList.add('active');
                
                // Update content visibility
                modalTabContents.forEach(content => content.classList.remove('active'));
                document.getElementById(`${tabId}-tab`).classList.add('active');
            });
        });
        
        // Form submission handlers
        mealForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const mealData = {
                name: mealNameInput.value.trim(),
                description: mealDescriptionInput.value.trim(),
                price: parseFloat(mealPriceInput.value),
                category_id: mealCategorySelect.value,
                subcategory_id: mealSubcategorySelect.value || null
            };
            
            // Validate required fields
            if (!mealData.name) {
                showToast('Meal name is required', 'error');
                return;
            }
            
            if (isNaN(mealData.price) || mealData.price < 0) {
                showToast('Please enter a valid price', 'error');
                return;
            }
            
            if (!mealData.category_id) {
                showToast('Please select a category', 'error');
                return;
            }
            
            try {
                if (currentMealId) {
                    await window.electron.api.put(`/api/meals/${currentMealId}`, mealData);
                    showToast('Meal updated successfully', 'success');
                } else {
                    await window.electron.api.post('/api/meals', mealData);
                    showToast('Meal added successfully', 'success');
                }
                
                await loadMeals({
                    categoryId: mealCategoryFilter.value,
                    subcategoryId: mealSubcategoryFilter.value
                });
                closeModal(mealModal);
            } catch (error) {
                showToast(error.message, 'error');
            }
        });
        
        mealCategoryForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const categoryData = {
                name: mealCategoryNameInput.value.trim(),
                description: mealCategoryDescInput.value.trim()
            };
            
            try {
                if (currentMealCategoryId) {
                    await window.electron.api.put(`/api/meal-categories/${currentMealCategoryId}`, categoryData);
                    showToast('Category updated successfully', 'success');
                } else {
                    await window.electron.api.post('/api/meal-categories', categoryData);
                    showToast('Category added successfully', 'success');
                }
                
                await loadMealCategories();
                resetMealCategoryForm();
            } catch (error) {
                showToast(error.message, 'error');
            }
        });
        
        mealSubcategoryForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            if (!mealSubcategoryParentSelect.value) {
                showToast('Please select a parent category', 'error');
                return;
            }
            
            const subcategoryData = {
                name: mealSubcategoryNameInput.value.trim(),
                description: mealSubcategoryDescInput.value.trim(),
                category_id: mealSubcategoryParentSelect.value
            };
            
            try {
                if (currentMealSubcategoryId) {
                    await window.electron.api.put(`/api/meal-subcategories/${currentMealSubcategoryId}`, subcategoryData);
                    showToast('Subcategory updated successfully', 'success');
                } else {
                    await window.electron.api.post('/api/meal-subcategories', subcategoryData);
                    showToast('Subcategory added successfully', 'success');
                }
                
                await loadMealSubcategories();
                resetMealSubcategoryForm();
            } catch (error) {
                showToast(error.message, 'error');
            }
        });
        
        bulkPriceForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const updateData = {
                update_type: document.querySelector('input[name="price-update-type"]:checked').value,
                operation: document.querySelector('input[name="price-update-operation"]:checked').value,
                value: parseFloat(priceUpdateValue.value),
                filter: bulkUpdateFilter.value,
                categoryId: bulkUpdateFilter.value === 'category' ? bulkCategorySelect.value : null,
                subcategoryId: bulkUpdateFilter.value === 'subcategory' ? bulkSubcategorySelect.value : null
            };
            
            if (isNaN(updateData.value) || updateData.value <= 0) {
                showToast('Please enter a valid positive value', 'error');
                return;
            }
            
            if ((updateData.filter === 'category' && !updateData.categoryId) || 
                (updateData.filter === 'subcategory' && !updateData.subcategoryId)) {
                showToast('Please select a category or subcategory', 'error');
                return;
            }
            
            try {
                await window.electron.api.post('/api/meals/bulk-price-update', updateData);
                showToast('Prices updated successfully', 'success');
                
                await loadMeals({
                    categoryId: mealCategoryFilter.value,
                    subcategoryId: mealSubcategoryFilter.value
                });
                closeModal(bulkPriceModal);
            } catch (error) {
                showToast(error.message, 'error');
            }
        });
        
        // Reset form buttons
        resetMealCategoryBtn.addEventListener('click', (e) => {
            e.preventDefault();
            resetMealCategoryForm();
        });
        
        resetMealSubcategoryBtn.addEventListener('click', (e) => {
            e.preventDefault();
            resetMealSubcategoryForm();
        });
        
        // Category-specific events
        mealCategorySelect.addEventListener('change', () => {
            const selectedCategoryId = mealCategorySelect.value;
            updateMealSubcategorySelects(selectedCategoryId);
        });
        
        mealCategoryFilter.addEventListener('change', () => {
            const selectedCategoryId = mealCategoryFilter.value;
            updateMealSubcategorySelects(selectedCategoryId);
            loadMeals({
                categoryId: selectedCategoryId,
                subcategoryId: 'all'
            });
        });
        
        mealSubcategoryFilter.addEventListener('change', () => {
            loadMeals({
                categoryId: 'all',
                subcategoryId: mealSubcategoryFilter.value
            });
        });
        
        mealSearch.addEventListener('input', () => {
            updateMealsTable();
        });
        
        // Bulk price update filter changes
        bulkUpdateFilter.addEventListener('change', () => {
            bulkCategoryContainer.style.display = bulkUpdateFilter.value === 'category' ? 'block' : 'none';
            bulkSubcategoryContainer.style.display = bulkUpdateFilter.value === 'subcategory' ? 'block' : 'none';
            updateBulkPricePreview();
        });
        
        bulkCategorySelect.addEventListener('change', updateBulkPricePreview);
        bulkSubcategorySelect.addEventListener('change', updateBulkPricePreview);
        
        // Price update type and value changes
        priceUpdateTypeRadios.forEach(radio => {
            radio.addEventListener('change', updateBulkPricePreview);
        });
        
        priceUpdateOperationRadios.forEach(radio => {
            radio.addEventListener('change', updateBulkPricePreview);
        });
        
        priceUpdateValue.addEventListener('input', updateBulkPricePreview);
        
        // Cancel button for bulk price modal
        cancelBulkPriceBtn.addEventListener('click', () => closeModal(bulkPriceModal));
    }
    
    // Cancel buttons for other modals
    if (cancelMealBtn) cancelMealBtn.addEventListener('click', () => closeModal(mealModal));
    
    // Initialize with the first tab (home) as active
    tabs[0].click();

    addGuestBtn.addEventListener('click', () => openGuestModal(false));
    manageCategoriesBtn.addEventListener('click', openCategoryModal);

    // Ensure closeModal is defined before this point
    document.querySelectorAll('.close-modal').forEach(closeIcon => {
        closeIcon.addEventListener('click', (e) => {
            const modal = e.target.closest('.modal');
            if (modal) {
                closeModal(modal.id);
            }
        });
    });

    // Guest form submission
    guestForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const guestData = {
            name: guestNameInput.value.trim(),
            phone: guestPhoneInput.value.trim(),
            email: guestEmailInput.value.trim(),
            address: guestAddressInput.value.trim(),
            category_id: guestCategorySelect.value || null
        };

        if (!guestData.name) {
            showToast('Guest name is required', 'error');
            return;
        }

        try {
            if (currentGuestId) {
                await window.electron.api.put(`/api/guests/${currentGuestId}`, guestData);
                showToast('Guest updated successfully', 'success');
            } else {
                await window.electron.api.post('/api/guests', guestData);
                showToast('Guest added successfully', 'success');
            }

            await loadGuests(categoryFilter.value);
            closeModal('guest-modal');
        } catch (error) {
            showToast(error.message, 'error');
        }
    });

    // Category form submission
    categoryForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const categoryData = {
            name: categoryNameInput.value.trim(),
            description: categoryDescInput.value.trim()
        };

        if (!categoryData.name) {
            showToast('Category name is required', 'error');
            return;
        }

        try {
            if (currentCategoryId) {
                await window.electron.api.put(`/api/guest-categories/${currentCategoryId}`, categoryData);
                showToast('Category updated successfully', 'success');
            } else {
                await window.electron.api.post('/api/guest-categories', categoryData);
                showToast('Category added successfully', 'success');
            }

            await loadCategories();
            resetCategoryForm();
            closeModal('category-modal');
        } catch (error) {
            showToast(error.message, 'error');
        }
    });

    // Update sidebar visibility based on current tab
    const tabLinks = document.querySelectorAll('nav ul li');
    tabLinks.forEach(link => {
        link.addEventListener('click', function() {
            setTimeout(() => {
                updateSidebarVisibility();
            }, 1000); // Small delay to ensure tab change is complete
        });
    });
    
    // Initialize sidebar visibility on page load
    updateSidebarVisibility();
    
    // Set up event handlers for the credit flow
    setupDateStep();
    setupGuestStep();
    setupMealsStep();
    setupConfirmStep();
    setupSuccessStep();
    
    // Initialize credit flow when Add Credit tab is clicked
    document.querySelector('li[data-tab="add-credit"]').addEventListener('click', function() {
        initCreditFlow();
    });

    // Add event listener for guest search in the credit flow
    const guestSearchInput = document.getElementById('credit-guest-search');
    if (guestSearchInput) {
        guestSearchInput.addEventListener('input', debounce(function() {
            const searchTerm = this.value.toLowerCase().trim();
            loadCreditGuests('all', searchTerm);
        }, 300));
    }

    document.getElementById('credit-guest-search').addEventListener('input', async function() {
        const searchTerm = this.value.trim();
        if (searchTerm.length > 0) {
            try {
                const guests = await window.electron.api.get(`/api/guests?search=${searchTerm}`);
                if (guests.length > 0) {
                    const guest = guests[0]; // Assuming you want the first match
                    const credits = await window.electron.api.get(`/api/credits/guest/${guest.id}`);
                    displayGuestCredits(guest, credits);
                } else {
                    document.getElementById('guest-credits-container').innerHTML = '<p>No guests found.</p>';
                }
            } catch (error) {
                showToast('Error fetching guest credits: ' + error.message, 'error');
            }
        } else {
            document.getElementById('guest-credits-container').innerHTML = '';
        }
    });

    function displayGuestCredits(guest, credits) {
        const container = document.getElementById('guest-credits-container');
        container.innerHTML = `
            <h3>Credits for ${guest.name}</h3>
            <ul>
                ${credits.map(credit => `
                    <li>
                        Date: ${new Date(credit.date_credited).toLocaleDateString()} - Amount: $${credit.amount.toFixed(2)}
                    </li>
                `).join('')}
            </ul>
        `;
    }
});

// Global function implementation
updateBulkPricePreview = function() {
    if (!bulkUpdateFilter || !priceUpdateValue || !priceUpdateSymbol) {
        console.log("Bulk price update elements not found in the DOM");
        return;
    }
    
    const updateType = document.querySelector('input[name="price-update-type"]:checked').value;
    const operation = document.querySelector('input[name="price-update-operation"]:checked').value;
    const value = priceUpdateValue.value || '0';
    const filter = bulkUpdateFilter.value;
    
    // Update currency symbol
    priceUpdateSymbol.textContent = updateType === 'percentage' ? '%' : '$';
    
    // Build preview text
    let previewTextContent = `This will ${operation} `;
    
    if (filter === 'all') {
        previewTextContent += 'all meal prices ';
    } else if (filter === 'category') {
        const categoryName = bulkCategorySelect.options[bulkCategorySelect.selectedIndex]?.text || 'selected category';
        previewTextContent += `prices for meals in the ${categoryName} category `;
    } else { // subcategory
        const subcategoryName = bulkSubcategorySelect.options[bulkSubcategorySelect.selectedIndex]?.text || 'selected subcategory';
        previewTextContent += `prices for meals in the ${subcategoryName} subcategory `;
    }
    
    if (updateType === 'percentage') {
        previewTextContent += `by ${value}%`;
    } else { // fixed
        previewTextContent += `by $${value}`;
    }
    
    // Calculate affected meals count
    let affectedMeals = currentMeals;
    
    if (filter === 'category' && bulkCategorySelect.value) {
        affectedMeals = currentMeals.filter(meal => meal.category_id == bulkCategorySelect.value);
    } else if (filter === 'subcategory' && bulkSubcategorySelect.value) {
        affectedMeals = currentMeals.filter(meal => meal.subcategory_id == bulkSubcategorySelect.value);
    }
    
    // Update preview elements
    document.querySelector('.preview-text').textContent = previewTextContent;
    document.getElementById('affected-count').textContent = affectedMeals.length;
};

// Handle document clicks to close quick-edit price inputs when clicking elsewhere
document.addEventListener('click', (e) => {
    if (!e.target.classList.contains('quick-edit-price') && !e.target.classList.contains('price-cell')) {
        const activeEditCells = document.querySelectorAll('.quick-edit-active');
        activeEditCells.forEach(cell => {
            const originalPrice = cell.dataset.originalPrice;
            cell.innerHTML = `$${parseFloat(originalPrice).toFixed(2)}`;
            cell.classList.remove('quick-edit-active');
        });
    }
});

// Add this to the existing tab-switching code in your script.js
document.querySelectorAll('nav ul li').forEach(tab => {
    tab.addEventListener('click', function() {
        // ... your existing tab switching code ...
        
        // Update sidebar visibility after tab switch
        updateSidebarVisibility();
    });
});

// Add event listeners for guest modal in credit flow
document.querySelector('#guest-form').addEventListener('submit', function(e) {
    e.preventDefault();
    
    // ... your existing guest form handling ...
    
    // After successfully adding a guest in credit flow, refresh the guests grid
    const currentTab = document.querySelector('.tab-content.active').id;
    if (currentTab === 'add-credit') {
        loadGuestsForCreditFlow();
    }
});

// Modify the closeModal function to handle the guest modal in credit flow
function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'none';
    }
    
    // If it's the guest modal and we're in the credit flow
    if (modalId === 'guest-modal' && document.getElementById('step-guest').style.display === 'block') {
        // Refresh the guests list in case a new guest was added
        const categoryId = document.getElementById('credit-category-filter').value;
        loadCreditGuests(categoryId);
    }
}

// Replace the simulated saveCredit function with this implementation:
async function saveCredit() {
    try {
        // Get form data
        const guestId = document.getElementById('credit-guest-id')?.value;
        
        // If guestId element doesn't exist, try getting it from selectedGuest
        const guestIdValue = guestId || (selectedGuest ? selectedGuest.id : null);
        
        if (!guestIdValue) {
            showToast('No guest selected for this credit', 'error');
            return;
        }
        
        const date = document.getElementById('credit-date')?.value || new Date().toISOString().split('T')[0];
        const note = document.getElementById('credit-note')?.value || '';
        
        // Calculate total amount from selected meals
        let totalAmount = 0;
        
        if (!selectedMeals || selectedMeals.length === 0) {
            showToast('Please add at least one meal', 'error');
            return;
        }
        
        selectedMeals.forEach(meal => {
            const mealPrice = parseFloat(meal.price) || 0;
            const quantity = meal.quantity || 1;
            totalAmount += mealPrice * quantity;
        });
        
        // Round to 2 decimal places for consistency
        totalAmount = Math.round(totalAmount * 100) / 100;
        
        // Prepare the meals array with proper format including quantity
        const mealsForCredit = selectedMeals.map(meal => ({
            id: meal.id,
            price: parseFloat(meal.price),
            quantity: meal.quantity || 1
        }));
        
        console.log('Saving credit with data:', {
            guest_id: guestIdValue,
            date,
            note,
            total_amount: totalAmount,
            meals: mealsForCredit
        });
        
        // Prepare data for API
        const creditData = {
            guest_id: guestIdValue,
            date,
            note,
            total_amount: totalAmount,
            meals: mealsForCredit
        };
        
        // Use an absolute URL to your server instead of a relative URL
        const response = await fetch('http://localhost:3000/api/credits', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(creditData)
        });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to save credit');
        }
        
        const result = await response.json();
        showToast('Credit saved successfully!', 'success');
        resetCreditFlow();
        
        // If we're in the credit management tab, reload the data
        if (document.getElementById('credit-management-tab')?.classList.contains('active')) {
            loadGuestCredits('');
        }
        
    } catch (error) {
        console.error('Error saving credit:', error);
        showToast(`Error: ${error.message}`, 'error');
    }
}

// Add these to your global variables declaration at the top of the file
let setupGuestStep, setupMealsStep, setupConfirmStep, setupSuccessStep;
let goToGuestStep, loadGuestsForCreditFlow, renderGuestsGrid;
let goToMealsStep, loadMealsForCreditFlow, renderMealsGrid, updateSelectedMealsSummary;
let setupMealFilters, filterMeals, fillConfirmationDetails;
let selectedDate, selectedGuest, selectedMeals, updateCreditSidebar;
let loadMealCategoriesForCreditFlow, loadSubcategoriesForCreditFlow;

// Then implement these functions before they get called

// Initialize the credit flow
function initCreditFlow() {
    try {
        // Initialize key variables
        selectedMeals = [];
        selectedDate = null;
        selectedGuest = null;
        
        // Make sure sidebar is visible when Add Credit tab is selected
        document.getElementById('sidebar').style.display = 'block';
        
        setupDateStep();
        setupCreditFlowEventListeners();
        resetCreditFlow();
    } catch (error) {
        console.error('Error in initCreditFlow:', error);
    }
}

// Update the tab click handler to ensure proper initialization
document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('nav ul li').forEach(tab => {
        tab.addEventListener('click', function() {
            // First, hide all tab content
            document.querySelectorAll('.tab-content').forEach(content => {
                content.classList.remove('active');
            });
            
            // Then show the selected tab content
            const tabId = this.getAttribute('data-tab');
            const tabContent = document.getElementById(tabId);
            if (tabContent) {
                tabContent.classList.add('active');
            }
            
            // Handle sidebar visibility
            const sidebar = document.getElementById('sidebar');
            if (sidebar) {
                if (tabId === 'add-credit') {
                    sidebar.style.display = 'block';
                    initCreditFlow(); // Initialize the credit flow
                } else {
                    //sidebar.style.display = 'none';
                }
            }
            
            // Update active tab
            document.querySelectorAll('nav ul li').forEach(t => {
                t.classList.remove('active');
            });
            this.classList.add('active');
        });
    });
});

// Function to update the sidebar with current selections
updateCreditSidebar = function() {
    // Update date
    const sidebarDate = document.getElementById('sidebar-date');
    if (selectedDate) {
        const formattedDate = new Date(selectedDate).toLocaleDateString();
        sidebarDate.textContent = formattedDate;
    } else {
        sidebarDate.textContent = 'Not selected';
    }
    
    // Update guest
    const sidebarGuest = document.getElementById('sidebar-guest');
    if (selectedGuest) {
        sidebarGuest.textContent = selectedGuest.name;
    } else {
        sidebarGuest.textContent = 'Not selected';
    }
    
    // Update meals list
    const sidebarMealsList = document.getElementById('sidebar-meals-list');
    if (selectedMeals && selectedMeals.length > 0) {
        let mealsHTML = '';
        selectedMeals.forEach(meal => {
            mealsHTML += `<div class="sidebar-meal-item">
                <span class="meal-name">${meal.name}</span>
                <span class="meal-price">$${parseFloat(meal.price).toFixed(2)}</span>
            </div>`;
        });
        sidebarMealsList.innerHTML = mealsHTML;
    } else {
        sidebarMealsList.innerHTML = '<p class="empty-selection">No meals selected</p>';
    }
    
    // Update total
    const sidebarTotal = document.getElementById('sidebar-total');
    const total = selectedMeals ? selectedMeals.reduce((sum, meal) => sum + parseFloat(meal.price), 0) : 0;
    sidebarTotal.textContent = `$${total.toFixed(2)}`;
};

// Step 1: Date Selection
setupDateStep = function() {
    const dateInput = document.getElementById('credit-date');
    const nextBtn = document.getElementById('date-next-btn');
    
    dateInput.addEventListener('change', function() {
        // Set both variables to avoid confusion
        selectedDate = this.value;
        selectedCreditDate = this.value;
        updateCreditSidebar();
    });
    
    nextBtn.addEventListener('click', function() {
        if (dateInput.value) {
            // Set both variables to avoid confusion
            selectedDate = dateInput.value;
            selectedCreditDate = dateInput.value;
            goToGuestStep();
        } else {
            showToast('Please select a date', 'error');
        }
    });
};

// Go to guest selection step
goToGuestStep = function() {
    document.getElementById('step-date').style.display = 'none';
    document.getElementById('step-guest').style.display = 'block';
    
    // Load guests - use loadCreditGuests instead of loadGuestsForCreditFlow
    loadCreditGuests();
    
    updateCreditSidebar();
};

// Load categories for guest selection
loadCreditGuestCategories = async function() {
    try {
        const response = await fetch('http://localhost:3000/api/guest-categories');
        if (!response.ok) throw new Error('Failed to load guest categories');
        const categories = await response.json();
        const categorySelect = document.getElementById('credit-category-filter');
        
        // Clear existing options except the "All Categories" option
        while (categorySelect.options.length > 1) {
            categorySelect.remove(1);
        }
        
        // Add categories from the database
        categories.forEach(category => {
            const option = document.createElement('option');
            option.value = category.id;
            option.textContent = category.name;
            categorySelect.appendChild(option);
        });
    } catch (error) {
        showToast(error.message, 'error');
        console.error('Error loading guest categories:', error);
    }
}

// Load meals for guest selection
loadCreditMealCategories = async function() {
    try {
        const response = await fetch('http://localhost:3000/api/meal-categories');
        if (!response.ok) throw new Error('Failed to load meal categories');
        
        const categories = await response.json();
        const categorySelect = document.getElementById('credit-meal-category-filter');
        
        // Clear existing options except the "All Categories" option
        while (categorySelect.options.length > 1) {
            categorySelect.remove(1);
        }
        
        // Add categories from the database
        categories.forEach(category => {
            const option = document.createElement('option');
            option.value = category.id;
            option.textContent = category.name;
            categorySelect.appendChild(option);
        });
        
        // Initialize meal subcategories for the first category or "all"
        loadCreditMealSubcategories('all');
    } catch (error) {
        showToast(error.message, 'error');
        console.error('Error loading meal categories:', error);
    }
}

// Replace the loadCreditMealSubcategories function with this corrected version
async function loadCreditMealSubcategories(categoryId) {
    try {
        const subcategoryFilter = document.getElementById('credit-meal-subcategory-filter');
        
        if (!subcategoryFilter) return;
        
        subcategoryFilter.innerHTML = '<option value="all">All Subcategories</option>';
        
        if (categoryId === 'all') {
            return;
        }
        
        // Use absolute URL with API_BASE_URL
        const response = await fetch(`${API_BASE_URL}/api/meal-subcategories/category/${categoryId}`);
        const subcategories = await response.json();
        
        subcategories.forEach(subcategory => {
            const option = document.createElement('option');
            option.value = subcategory.id;
            option.textContent = subcategory.name;
            subcategoryFilter.appendChild(option);
        });
    } catch (error) {
        console.error('Error loading meal subcategories:', error);
    }
}

// Step 2: Guest Selection events
setupGuestStep = function() {
    try {
        // Back button
        const backToDateBtn = document.getElementById('back-to-date');
        if (backToDateBtn) {
            backToDateBtn.addEventListener('click', function() {
                document.getElementById('step-guest').style.display = 'none';
                document.getElementById('step-date').style.display = 'block';
            });
        }
        loadCreditGuestCategories()
        // Category filter change
        const categoryFilter = document.getElementById('credit-category-filter');
        
        if (categoryFilter) {
            categoryFilter.addEventListener('change', function() {
                loadCreditGuests(this.value);
            });
        }
        
        // Add new guest link
        const addNewGuestLink = document.getElementById('add-new-guest-link');
        if (addNewGuestLink) {
            addNewGuestLink.addEventListener('click', function(e) {
                e.preventDefault();
                // Open the guest modal (reuse the existing one from guest management)
                document.getElementById('guest-modal-title').textContent = 'Add New Guest';
                document.getElementById('guest-id').value = '';
                document.getElementById('guest-form').reset();
                document.getElementById('guest-modal').style.display = 'block';
            });
        }
    } catch (error) {
        console.error('Error in setupGuestStep:', error);
    }
};

// The remaining function implementations...
// Note: Implementing a few crucial ones below, but you'd need to add all of them

// Go to meals selection step
goToMealsStep = function() {
    if (!selectedGuest) {
        showToast('Please select a guest', 'error');
        return;
    }
    
    document.getElementById('step-guest').style.display = 'none';
    document.getElementById('step-meals').style.display = 'block';
    
    // Load meals
    loadMealsForCreditFlow();
    
    updateCreditSidebar();
};

// Step 3: Meals Selection events
setupMealsStep = function() {
    try {
        // Load meal categories and subcategories
        loadMealCategoriesForCreditFlow();

        // Back button
        const backToGuestBtn = document.getElementById('back-to-guest');
        if (backToGuestBtn) {
            backToGuestBtn.addEventListener('click', function() {
                document.getElementById('step-meals').style.display = 'none';
                document.getElementById('step-guest').style.display = 'block';
            });
        }
        
        // Complete button
        const completeCreditBtn = document.getElementById('complete-credit-btn');
        if (completeCreditBtn) {
            completeCreditBtn.addEventListener('click', function() {
                if (!selectedMeals || selectedMeals.length === 0) {
                    showToast('Please select at least one meal', 'error');
                    return;
                }
                
                goToConfirmStep();
            });
        }
        
        // Category change event
        const mealCategoryFilter = document.getElementById('credit-meal-category-filter');
        if (mealCategoryFilter) {
            mealCategoryFilter.addEventListener('change', function() {
                loadMealSubcategoriesForCreditFlow(this.value);
                loadCreditMeals();
            });
        }
        
        // Subcategory change event
        const mealSubcategoryFilter = document.getElementById('credit-meal-subcategory-filter');
        if (mealSubcategoryFilter) {
            mealSubcategoryFilter.addEventListener('change', function() {
                loadCreditMeals();
            });
        }
        
        // Meal search event
        const mealSearch = document.getElementById('credit-meal-search');
        if (mealSearch) {
            mealSearch.addEventListener('input', debounce(function() {
                loadCreditMeals();
            }, 300));
        }
    } catch (error) {
        console.error('Error in setupMealsStep:', error);
    }
};

// Step 4: Confirmation events
setupConfirmStep = function() {
    try {
        // Back button
        const backToMealsBtn = document.getElementById('back-to-meals');
        if (backToMealsBtn) {
            backToMealsBtn.addEventListener('click', function() {
                document.getElementById('step-confirm').style.display = 'none';
                document.getElementById('step-meals').style.display = 'block';
            });
        }
        
        // Cancel button
        const cancelCreditBtn = document.getElementById('cancel-credit');
        if (cancelCreditBtn) {
            cancelCreditBtn.addEventListener('click', function() {
                // Confirm cancel
                const confirmMessage = 'Are you sure you want to cancel? All selections will be lost.';
                
                if (confirm(confirmMessage)) {
                    initCreditFlow();
                }
            });
        }
        
        // Save credit button
        const saveCreditBtn = document.getElementById('save-credit-btn');
        if (saveCreditBtn) {
            saveCreditBtn.addEventListener('click', function() {
                saveCredit();
            });
        }
    } catch (error) {
        console.error('Error in setupConfirmStep:', error);
    }
};

// Success step events
setupSuccessStep = function() {
    try {
        // View credits button
        const viewCreditsBtn = document.getElementById('view-credits-btn');
        if (viewCreditsBtn) {
            viewCreditsBtn.addEventListener('click', function() {
                // Navigate to credit management tab
                const creditManagementTab = document.querySelector('li[data-tab="credit-management"]');
                if (creditManagementTab) {
                    creditManagementTab.click();
                }
            });
        }
        
        // Add another credit button
        const addAnotherCreditBtn = document.getElementById('add-another-credit-btn');
        if (addAnotherCreditBtn) {
            addAnotherCreditBtn.addEventListener('click', function() {
                resetCreditFlow(); // This will reset and take back to step 1
            });
        }
    } catch (error) {
        console.error('Error in setupSuccessStep:', error);
    }
};

// Add loadMealCategoriesForCreditFlow function
loadMealCategoriesForCreditFlow = async function() {
    try {
        const categorySelect = document.getElementById('credit-meal-category-filter');
        if (!categorySelect) return;
        
        categorySelect.innerHTML = '<option value="all">All Categories</option>';
        
        // Fetch categories from the server
        const response = await fetch(`${API_BASE_URL}/api/meal-categories`);
        const categories = await response.json();
        
        categories.forEach(category => {
            const option = document.createElement('option');
            option.value = category.id;
            option.textContent = category.name;
            categorySelect.appendChild(option);
        });
    } catch (error) {
        console.error('Error loading meal categories:', error);
        showToast('Failed to load meal categories', 'error');
    }
}

// Load meal subcategories for the credit flow
async function loadMealSubcategoriesForCreditFlow(categoryId = 'all') {
    try {
        console.log('Loading subcategories for credit flow, category:', categoryId); // Debugging
        const subcategorySelect = document.querySelector('#step-meals #credit-meal-subcategory-filter');
        if (!subcategorySelect) return;
        
        // Clear existing options
        subcategorySelect.innerHTML = '<option value="all">All Subcategories</option>';
        console.log('Cleared subcategory options for credit flow'); // Debugging
        
        if (categoryId === 'all') return;
        
        // Fetch subcategories from the server
        const response = await fetch(`${API_BASE_URL}/api/meal-subcategories/category/${categoryId}`);
        const subcategories = await response.json();
        
        console.log('Fetched subcategories for credit flow:', subcategories); // Debugging
        
        // Add options for each subcategory
        subcategories.forEach(subcategory => {
            const option = document.createElement('option');
            option.value = subcategory.id;
            option.textContent = subcategory.name;
            subcategorySelect.appendChild(option);
            console.log('Added subcategory option for credit flow:', subcategory.name); // Debugging
        });
    } catch (error) {
        console.error('Error loading meal subcategories for credit flow:', error);
        showToast('Failed to load meal subcategories', 'error');
    }
}

async function loadCreditGuests(categoryId = 'all', searchTerm = '') {
    try {
        const guestsGrid = document.getElementById('guests-grid');
        const noGuestsMessage = document.getElementById('no-credit-guests-message');
        
        if (!guestsGrid || !noGuestsMessage) return;
        
        guestsGrid.innerHTML = '<div class="loading"><i class="fas fa-spinner fa-spin"></i></div>';
        
        // Use absolute URL with API_BASE_URL
        let url;
        if (categoryId === 'all') {
            url = `${API_BASE_URL}/api/guests`;
        } else {
            url = `${API_BASE_URL}/api/guests/category/${categoryId}`;
        }
        
        const response = await fetch(url);
        const guests = await response.json();
        
        // Filter guests based on the search term
        const filteredGuests = guests.filter(guest => 
            guest.name.toLowerCase().includes(searchTerm) || 
            (guest.email && guest.email.toLowerCase().includes(searchTerm)) ||
            (guest.phone && guest.phone.includes(searchTerm))
        );
        
        if (filteredGuests.length === 0) {
            guestsGrid.innerHTML = '';
            noGuestsMessage.style.display = 'flex';
            return;
        }
        
        noGuestsMessage.style.display = 'none';
        guestsGrid.innerHTML = '';
        
        // Generate guest cards
        filteredGuests.forEach(guest => {
            const guestCard = document.createElement('div');
            guestCard.className = 'guest-card';
            guestCard.setAttribute('data-id', guest.id);
            
            guestCard.innerHTML = `
                <div class="guest-card-content">
                    <h4 class="guest-name">${guest.name}</h4>
                    <div class="guest-details">
                        ${guest.phone ? `<p><i class="fas fa-phone"></i> ${guest.phone}</p>` : ''}
                        ${guest.email ? `<p><i class="fas fa-envelope"></i> ${guest.email}</p>` : ''}
                    </div>
                    ${guest.category_name ? `<div class="guest-category">${guest.category_name}</div>` : ''}
                </div>
            `;
            
            guestsGrid.appendChild(guestCard);
            
            // Add click event to select guest
            guestCard.addEventListener('click', () => {
                selectGuest(guest);
            });
        });
    } catch (error) {
        console.error('Error loading guests:', error);
    }
}

// Handle guest selection
function selectGuest(guest) {
    // Remove selection from all cards
    document.querySelectorAll('.guest-card').forEach(card => {
        card.classList.remove('selected');
    });
    
    // Add selection to clicked card
    const selectedCard = document.querySelector(`.guest-card[data-id="${guest.id}"]`);
    if (selectedCard) {
        selectedCard.classList.add('selected');
    }
    
    // Store the selected guest in both variables to avoid confusion
    selectedCreditGuest = guest;
    selectedGuest = guest;  // Make sure both variables are set
    
    // Update the sidebar
    document.getElementById('sidebar-guest').textContent = guest.name;
    
    // Move to the next step (meals)
    document.getElementById('step-guest').style.display = 'none';
    document.getElementById('step-meals').style.display = 'block';
    
    // Load meals for selection
    loadCreditMeals();
}

let selectedCreditGuest = null;
let selectedCreditMeals = [];
let selectedCreditDate = '';

// Define a base URL for API requests
const API_BASE_URL = 'http://localhost:3000';

async function loadCreditMeals() {
    try {
        const mealsGrid = document.getElementById('meals-grid');
        const noMealsMessage = document.getElementById('no-credit-meals-message');
        
        if (!mealsGrid || !noMealsMessage) return;
        
        mealsGrid.innerHTML = '<div class="loading"><i class="fas fa-spinner fa-spin"></i></div>';
        
        // Get filter values
        const categoryId = document.getElementById('credit-meal-category-filter').value;
        const subcategoryId = document.getElementById('credit-meal-subcategory-filter').value;
        const searchTerm = document.getElementById('credit-meal-search').value.trim().toLowerCase();
        
        // Use absolute URL with API_BASE_URL
        const response = await fetch(`${API_BASE_URL}/api/meals`);
        const allMeals = await response.json();
        
        // Filter meals based on selected filters and search term
        const filteredMeals = allMeals.filter(meal => {
            // Check category filter
            const categoryMatch = categoryId === 'all' || meal.categoryId === categoryId;
            
            // Check subcategory filter
            const subcategoryMatch = subcategoryId === 'all' || meal.subcategoryId === subcategoryId;
            
            // Check search term
            const searchMatch = !searchTerm || 
                meal.name.toLowerCase().includes(searchTerm) ||
                (meal.description && meal.description.toLowerCase().includes(searchTerm));
            
            return categoryMatch && subcategoryMatch && searchMatch;
        });
        
        if (filteredMeals.length === 0) {
            mealsGrid.innerHTML = '';
            noMealsMessage.style.display = 'flex';
            return;
        }
        
        noMealsMessage.style.display = 'none';
        mealsGrid.innerHTML = '';
        
        // Generate meal cards for each meal
        filteredMeals.forEach(meal => {
            const mealCard = document.createElement('div');
            mealCard.className = 'meal-card';
            mealCard.setAttribute('data-id', meal.id);
            mealCard.setAttribute('data-name', meal.name);
            mealCard.setAttribute('data-price', meal.price);
            
            mealCard.innerHTML = `
                <div class="meal-card-content">
                    <h4 class="meal-name">${meal.name}</h4>
                    <p class="meal-description">${meal.description || 'No description available'}</p>
                    <div class="meal-category">
                        <span>${meal.categoryName || 'Uncategorized'}</span>
                        ${meal.subcategoryName ? `<span> > ${meal.subcategoryName}</span>` : ''}
                    </div>
                    <div class="meal-price">$${parseFloat(meal.price).toFixed(2)}</div>
                </div>
                <div class="meal-card-action">
                    <button class="add-meal-btn" title="Add this meal">
                        <i class="fas fa-plus"></i>
                    </button>
                </div>
            `;
            
            mealsGrid.appendChild(mealCard);
            
            // Add event listener to the add button
            const addBtn = mealCard.querySelector('.add-meal-btn');
            addBtn.addEventListener('click', () => {
                toggleMealSelection(meal);
            });
        });
    } catch (error) {
        console.error('Error loading meals:', error);
    }
}

// Function to toggle meal selection with quantity support
function toggleMealSelection(meal) {
        const uniqueId = `meal-${meal.id}`;
        
    // Check if meal is already in the selection
        const existingMealIndex = selectedMeals.findIndex(m => m.id === meal.id);
        
        if (existingMealIndex >= 0) {
        // Meal exists - increment the quantity
            selectedMeals[existingMealIndex].quantity = (selectedMeals[existingMealIndex].quantity || 1) + 1;
        showToast(`Added another ${meal.name} (${selectedMeals[existingMealIndex].quantity} total)`, 'success');
        } else {
        // Add new meal with quantity 1
            selectedMeals.push({
                ...meal,
            uniqueId,
                quantity: 1
            });
        showToast(`Added ${meal.name} to selection`, 'success');
        }
        
    // Update the UI
        updateSidebarMeals();
    updateTotalAmount();
}

updateSelectedMealsSummary = function() {
    const count = selectedCreditMeals.length;
    const total = selectedCreditMeals.reduce((sum, meal) => sum + Number(meal.price), 0);
    
    document.getElementById('selected-meals-count').textContent = count;
    document.getElementById('selected-meals-total').textContent = `$${total.toFixed(2)}`;
    document.getElementById('sidebar-total').textContent = `$${total.toFixed(2)}`;
};

function updateSidebarMeals() {
        const mealsList = document.getElementById('sidebar-meals-list');
    
    if (!mealsList) {
        console.error('Element sidebar-meals-list not found');
        return;
    }
    
    // Clear existing content
            mealsList.innerHTML = '';
            
            if (selectedMeals.length === 0) {
        // If no meals are selected, show the empty message
                mealsList.innerHTML = '<p class="empty-selection">No meals selected</p>';
        return;
    }
    
    // Create a list of selected meals
                selectedMeals.forEach(meal => {
        const mealPrice = parseFloat(meal.price) || 0;
        const quantity = meal.quantity || 1;
        const subtotal = mealPrice * quantity;
        
        const mealItem = document.createElement('div');
        mealItem.className = 'selected-meal-item';
        
        // Show quantity in the meal name if more than 1
        const quantityText = quantity > 1 ? ` (${quantity}x)` : '';
        
        mealItem.innerHTML = `
            <div class="meal-details">
                            <span class="meal-name">${meal.name}${quantityText}</span>
                <div class="meal-price">$${mealPrice.toFixed(2)} each</div>
                <div class="meal-subtotal">Subtotal: $${subtotal.toFixed(2)}</div>
                        </div>
            <div class="meal-actions">
                <button class="quantity-btn decrease" data-id="${meal.id}">-</button>
                <button class="quantity-btn increase" data-id="${meal.id}">+</button>
                <button class="remove-meal-btn" data-id="${meal.uniqueId}">×</button>
            </div>
        `;
        
        mealsList.appendChild(mealItem);
    });
    
    // Update the count in the meals grid
    const selectedMealsCount = document.getElementById('selected-meals-count');
    if (selectedMealsCount) {
        selectedMealsCount.textContent = selectedMeals.length;
    }
    
    // Setup quantity and remove buttons
    setupQuantityButtons();
    setupRemoveButtons();
}

// Function to setup the remove buttons
function setupRemoveButtons() {
    document.querySelectorAll('.remove-meal-btn').forEach(button => {
        button.addEventListener('click', (e) => {
            const mealId = e.currentTarget.dataset.id;
                        removeMealFromSelection(mealId);
                    });
                });
}

// Function to add quantity adjustment buttons
function setupQuantityButtons() {
    document.querySelectorAll('.quantity-btn').forEach(button => {
        button.addEventListener('click', (e) => {
            const action = e.currentTarget.classList.contains('increase') ? 'increase' : 'decrease';
            const mealId = parseInt(e.currentTarget.dataset.id);
            adjustMealQuantity(mealId, action);
        });
    });
}

// Function to adjust meal quantity
function adjustMealQuantity(mealId, action) {
    const mealIndex = selectedMeals.findIndex(m => m.id === mealId);
    if (mealIndex === -1) return;
    
            const meal = selectedMeals[mealIndex];
            
    if (action === 'increase') {
        meal.quantity = (meal.quantity || 1) + 1;
        showToast(`Added another ${meal.name}`, 'success');
    } else if (action === 'decrease') {
            if (meal.quantity > 1) {
            meal.quantity -= 1;
            showToast(`Removed one ${meal.name}`, 'info');
            } else {
            // If quantity would go to 0, remove the meal entirely
            removeMealFromSelection(meal.uniqueId);
            return;
        }
    }
    
            updateSidebarMeals();
    updateTotalAmount();
}

function prepareConfirmStep() {
    try {
        // Update date and guest information
        const confirmDate = document.getElementById('confirm-date');
        const confirmGuest = document.getElementById('confirm-guest');
        
        if (confirmDate) {
            // Use selectedDate (which is more reliable) or fallback to selectedCreditDate
            const dateStr = selectedDate || selectedCreditDate;
            if (dateStr) {
                // Make sure we have a valid date format YYYY-MM-DD
                const date = new Date(dateStr);
                if (!isNaN(date.getTime())) {
                    // Format the date for display
                    confirmDate.textContent = date.toLocaleDateString();
                } else {
                    confirmDate.textContent = dateStr; // Fallback to raw string
                }
            } else {
                confirmDate.textContent = "No date selected";
            }
        }
        
        if (confirmGuest) {
            // Use selectedGuest or fall back to selectedCreditGuest
            const guest = selectedGuest || selectedCreditGuest;
            if (guest && guest.name) {
                confirmGuest.textContent = guest.name;
            } else {
                confirmGuest.textContent = "No guest selected";
            }
        }
        
        // Display selected meals
        const mealsList = document.getElementById('confirm-meals-list');
        mealsList.innerHTML = '';
        
        selectedMeals.forEach(meal => {
            const listItem = document.createElement('div');
            listItem.className = 'confirm-meal-item';
            
            const quantityText = meal.quantity > 1 ? ` (x${meal.quantity})` : '';
            const totalPrice = (parseFloat(meal.price) * (meal.quantity || 1)).toFixed(2);
            
            listItem.innerHTML = `
                <div class="meal-name">${meal.name}${quantityText}</div>
                <div class="meal-price">$${totalPrice}</div>
            `;
            
            mealsList.appendChild(listItem);
        });
        
        // Update total
        const total = selectedMeals.reduce((sum, meal) => 
            sum + (parseFloat(meal.price) * (meal.quantity || 1)), 0);
        const confirmTotal = document.getElementById('confirm-total');
        confirmTotal.textContent = `$${total.toFixed(2)}`;
    } catch (error) {
        console.error('Error in prepareConfirmStep:', error);
    }
}

function resetCreditFlow() {
    // Reset all variables
    selectedCreditGuest = null;
    selectedGuest = null; // Make sure to reset this too
    selectedMeals = []; 
    selectedCreditDate = '';
    selectedDate = ''; // Reset this too
    
    // Reset sidebar
    document.getElementById('sidebar-date').textContent = 'Not selected';
    document.getElementById('sidebar-guest').textContent = 'Not selected';
    document.getElementById('sidebar-meals-list').innerHTML = '<p class="empty-selection">No meals selected</p>';
    document.getElementById('sidebar-total').textContent = '$0.00';
    
    // Reset form fields
    document.getElementById('credit-date').value = '';
    document.getElementById('credit-note').value = '';
    document.getElementById('credit-guest-search').value = '';
    document.getElementById('credit-meal-search').value = '';
    
    // Reset filters
    document.getElementById('credit-category-filter').value = 'all';
    document.getElementById('credit-meal-category-filter').value = 'all';
    document.getElementById('credit-meal-subcategory-filter').value = 'all';
    
    // Hide all steps except the first one
    document.getElementById('step-date').style.display = 'block';
    document.getElementById('step-guest').style.display = 'none';
    document.getElementById('step-meals').style.display = 'none';
    document.getElementById('step-confirm').style.display = 'none';
    document.getElementById('step-success').style.display = 'none';
}

function setupCreditFlowEventListeners() {
    try {
        // ... existing code ...
        
        // Add event listeners for meal filters
        const mealCategoryFilter = document.getElementById('credit-meal-category-filter');
        if (mealCategoryFilter) {
            mealCategoryFilter.addEventListener('change', function() {
                // When category changes, load subcategories for that category
                loadCreditMealSubcategories(this.value);
                // Then filter meals based on both category and subcategory
                loadCreditMeals();
            });
        }
        
        const mealSubcategoryFilter = document.getElementById('credit-meal-subcategory-filter');
        if (mealSubcategoryFilter) {
            mealSubcategoryFilter.addEventListener('change', function() {
                // Filter meals based on both category and subcategory
                loadCreditMeals();
            });
        }
        
        // Add event listener for meal search
        const mealSearch = document.getElementById('credit-meal-search');
        if (mealSearch) {
            mealSearch.addEventListener('input', debounce(function() {
                loadCreditMeals();
            }, 300));
        }
        
        // ... existing code ...
    } catch (error) {
        console.error('Error in setupCreditFlowEventListeners:', error);
    }
}

// Initialize the debounce function for search inputs
function debounce(func, wait) {
    let timeout;
    return function(...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), wait);
    };
}

// Initialize the credit flow when the add-credit tab is shown
document.addEventListener('DOMContentLoaded', () => {
    // ... existing DOMContentLoaded code ...
    
    // Add listener for tab change to initialize credit flow
    document.querySelectorAll('nav ul li').forEach(tab => {
        tab.addEventListener('click', function() {
            const tabId = this.getAttribute('data-tab');
            if (tabId === 'add-credit') {
                // Use initCreditFlow instead of initializeCreditFlow
                initCreditFlow();
            }
        });
    });
});

// Replace with this assignment to the previously declared variable
loadGuestsForCreditFlow = function(categoryId = 'all') {
    loadCreditGuests(categoryId);
};

// Replace with this assignment to the previously declared variable
let initializeCreditFlow;
initializeCreditFlow = function() {
    initCreditFlow();
};

// Add this function to handle date selection
function setupDateStep() {
    const dateInput = document.getElementById('credit-date');
    const nextButton = document.getElementById('date-next-btn');
    
    if (dateInput && nextButton) {
        nextButton.addEventListener('click', function() {
            if (!dateInput.value) {
                showToast('Please select a date', 'error');
                return;
            }
            
            // Store the selected date
            selectedCreditDate = dateInput.value;
            
            // Update sidebar
            document.getElementById('sidebar-date').textContent = selectedCreditDate;
            
            // Move to next step
            document.getElementById('step-date').style.display = 'none';
            document.getElementById('step-guest').style.display = 'block';
            
            // Load guests
            loadCreditGuests('all');
        });
    }
}

// Find the showToast function definition (around line 222)
function showToast(message, type = 'info') {
    // ... existing showToast implementation ...
}

// Add this line immediately after the showToast function definition
window.showToast = showToast;

// Make sure this is in the global scope
window.showToast = showToast;

// Similar function for Meal Management tab
async function loadMealSubcategoriesForManagement(categoryId = 'all') {
    try {
        console.log('Loading subcategories for management, category:', categoryId); // Debugging
        const subcategorySelect = document.querySelector('#meal-management #meal-subcategory-filter');
        if (!subcategorySelect) return;
        
        // Clear existing options
        subcategorySelect.innerHTML = '<option value="all">All Subcategories</option>';
        console.log('Cleared subcategory options for management'); // Debugging
        
        if (categoryId === 'all') return;
        
        // Fetch subcategories from the server
        const response = await fetch(`${API_BASE_URL}/api/meal-subcategories/category/${categoryId}`);
        const subcategories = await response.json();
        
        console.log('Fetched subcategories for management:', subcategories); // Debugging
        
        // Add options for each subcategory
        subcategories.forEach(subcategory => {
            const option = document.createElement('option');
            option.value = subcategory.id;
            option.textContent = subcategory.name;
            subcategorySelect.appendChild(option);
            console.log('Added subcategory option for management:', subcategory.name); // Debugging
        });
    } catch (error) {
        console.error('Error loading meal subcategories for management:', error);
        showToast('Failed to load meal subcategories', 'error');
    }
}

// Add this function definition before it's called
function goToConfirmStep() {
    // Implement the logic to transition to the confirmation step
    console.log("Transitioning to the confirmation step...");
    // Example: Hide the current step and show the confirmation step
    document.getElementById('step-meals').style.display = 'none';
    document.getElementById('step-confirm').style.display = 'block';
    // Make sure to call prepareConfirmStep
    prepareConfirmStep();
}

// Add this function to fetch and display credit history
async function loadGuestCredits(searchTerm) {
    try {
        const creditManagementContainer = document.getElementById('guest-credits-container');
        
        if (!searchTerm || searchTerm.trim() === '') {
            creditManagementContainer.innerHTML = '<p class="empty-message">Enter a guest name to view their credit history</p>';
            return;
        }
        
        creditManagementContainer.innerHTML = '<div class="loading"><i class="fas fa-spinner fa-spin"></i> Loading...</div>';
        
        // First, search for the guest with proper error handling
        const response = await fetch(`${API_BASE_URL}/api/guests?search=${encodeURIComponent(searchTerm)}`);
        
        if (!response.ok) {
            throw new Error(`Server returned an error (HTTP ${response.status})`);
        }
        
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
            throw new Error('Server did not return JSON. Check your API server.');
        }
        
        const guests = await response.json();
        
        if (!guests || guests.length === 0) {
            creditManagementContainer.innerHTML = '<p class="empty-message">No guests found with that name</p>';
            return;
        }
        
        // Create guest selection if multiple guests found
        if (guests.length > 1) {
            let html = '<div class="guest-selection">';
            html += '<h3>Multiple guests found. Select one:</h3>';
            html += '<div class="guest-selection-list">';
            
            guests.forEach(guest => {
                html += `
                    <div class="guest-selection-item" data-id="${guest.id}">
                        <strong>${guest.name}</strong>
                        ${guest.phone ? `<span>${guest.phone}</span>` : ''}
                        ${guest.email ? `<span>${guest.email}</span>` : ''}
                    </div>
                `;
            });
            
            html += '</div></div>';
            creditManagementContainer.innerHTML = html;
            
            // Add event listeners to the guest selection items
            document.querySelectorAll('.guest-selection-item').forEach(item => {
                item.addEventListener('click', async () => {
                    const guestId = item.getAttribute('data-id');
                    await displayGuestCreditHistory(guestId);
                });
            });
            
            return;
        }
        
        // If only one guest found, display their credit history directly
        await displayGuestCreditHistory(guests[0].id);
        
    } catch (error) {
        console.error('Error loading guest credits:', error);
        document.getElementById('guest-credits-container').innerHTML = 
            `<p class="error-message">Error: ${error.message}</p>
             <p>Make sure your server is running at ${API_BASE_URL} and has the necessary endpoints.</p>`;
    }
}

// Function to display credit history for a specific guest
async function displayGuestCreditHistory(guestId) {
    try {
        console.log("Displaying credit history for guest ID:", guestId);
        
        // Store the guest ID on the container for later use
        const creditContainer = document.getElementById('guest-credits-container');
        creditContainer.setAttribute('data-guest-id', guestId);
        
        const [guestResponse, creditsResponse] = await Promise.all([
            fetch(`http://localhost:3000/api/guests/${guestId}`),
            fetch(`http://localhost:3000/api/credits/guest/${guestId}`)
        ]);
        
        if (!guestResponse.ok || !creditsResponse.ok) {
            throw new Error('Failed to fetch guest or credits data');
        }
        
        const guest = await guestResponse.json();
        const credits = await creditsResponse.json();
        
        // Calculate total amount
        let totalAmount = 0;
        if (credits.length > 0) {
            totalAmount = credits.reduce((sum, credit) => sum + parseFloat(credit.amount), 0);
        }
        
        // Generate HTML to display guest and credits data
        let html = `
            <div class="guest-header">
                <div class="guest-info">
                    <h3>${guest.name}</h3>
                    <p class="guest-category">${guest.category ? guest.category.name : 'No Category'}</p>
                    <p class="guest-contact">${guest.phone || 'No Phone'} | ${guest.email || 'No Email'}</p>
                </div>
                <div class="guest-actions">
                    <button class="primary-btn" onclick="startCreditFlowForGuest(${JSON.stringify(guest)})">
                        <i class="fas fa-plus-circle"></i> Add Credit
                    </button>
                    <button class="secondary-btn" onclick="viewGuestCredits(${JSON.stringify(guest)})">
                        <i class="fas fa-sync"></i> Refresh
                    </button>
                </div>
            </div>
            
            <div class="credit-summary-card">
                <div class="credit-summary-header">
                    <h3>Credit Summary</h3>
                    <span class="total-amount">Total: $${totalAmount.toFixed(2)}</span>
                </div>
            </div>
            
            <div class="credits-list-container">
                <h3>Credit History</h3>`;
                
        if (credits.length === 0) {
            html += `
                <div class="empty-message">
                    <i class="fas fa-info-circle"></i>
                    <p>No credits found for this guest.</p>
                </div>`;
        } else {
            html += `
                <div class="credits-list">
                    <table class="credits-table">
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>Amount</th>
                                <th>Items</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>`;
                        
            credits.forEach(credit => {
                const date = new Date(credit.date).toLocaleDateString();
                html += `
                    <tr>
                        <td>${date}</td>
                        <td>$${parseFloat(credit.amount).toFixed(2)}</td>
                        <td>${credit.items ? credit.items.length : 0} items</td>
                        <td><span class="status-badge ${credit.paid ? 'paid' : 'unpaid'}">${credit.paid ? 'Paid' : 'Unpaid'}</span></td>
                        <td>
                            <button class="text-btn" onclick="viewCreditDetails(${credit.id})">
                                <i class="fas fa-eye"></i> View
                            </button>
                            ${!credit.paid ? `
                            <button class="text-btn success-text" onclick="markCreditAsPaid(${credit.id})">
                                <i class="fas fa-check-circle"></i> Mark Paid
                            </button>` : ''}
                        </td>
                    </tr>`;
            });
            
            html += `
                        </tbody>
                    </table>
                </div>`;
        }
        
        html += `</div>`;
        
        // Update the container with the generated HTML
        creditContainer.innerHTML = html;
        
    } catch (error) {
        console.error('Error displaying guest credit history:', error);
        document.getElementById('guest-credits-container').innerHTML = 
            `<p class="error-message">Error: ${error.message}</p>
             <p>Make sure your server is running at ${API_BASE_URL} and has the necessary endpoints.</p>`;
    }
}

// Update setupCreditManagementTab function or add if it doesn't exist
function setupCreditManagementTab() {
    // Load categories for the filter
    loadCreditManagementCategories();
    
    // Add toggle buttons if they don't exist
    const creditManagementElement = document.getElementById('credit-management');
    if (!document.querySelector('.view-toggle-container')) {
        const toggleContainer = document.createElement('div');
        toggleContainer.className = 'view-toggle-container';
        toggleContainer.innerHTML = `
            <div class="view-toggle">
                <button class="toggle-btn active" data-view="active">Active Credits</button>
                <button class="toggle-btn" data-view="paid">Paid Credits</button>
            </div>
            
            <button class="primary-btn mark-selected-paid-btn" style="display: none;">
                <i class="fas fa-check-circle"></i> Mark Selected as Paid
            </button>
        `;
        
        // Insert after the h2 element
        const h2Element = creditManagementElement.querySelector('h2');
        if (h2Element) {
            h2Element.insertAdjacentElement('afterend', toggleContainer);
        } else {
            creditManagementElement.prepend(toggleContainer);
        }
    }
    
    // Set up event listeners for the view toggle
    document.querySelectorAll('.view-toggle .toggle-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const view = this.getAttribute('data-view');
            
            // Update active class
            document.querySelectorAll('.view-toggle .toggle-btn').forEach(b => {
                b.classList.remove('active');
            });
            this.classList.add('active');
            
            // Show appropriate guests based on view
            if (view === 'active') {
                loadGuestsForCreditManagement();
                document.querySelector('.mark-selected-paid-btn').style.display = 'none';
            } else {
                loadGuestsWithPaidCredits();
                document.querySelector('.mark-selected-paid-btn').style.display = 'none';
            }
        });
    });
    
    // Set up search functionality
    const searchInput = document.getElementById('credit-guest-search');
    if (searchInput) {
        searchInput.addEventListener('input', debounce(function() {
            const searchTerm = this.value.trim();
            const view = document.querySelector('.view-toggle .toggle-btn.active').getAttribute('data-view');
            
            if (view === 'active') {
                filterGuestsForCreditManagement(searchTerm);
            } else {
                filterGuestsWithPaidCredits(searchTerm);
            }
        }, 300));
    }
    
    // Set up category filter
    const categoryFilter = document.getElementById('credit-management-category-filter');
    if (categoryFilter) {
        categoryFilter.addEventListener('change', function() {
            const categoryId = this.value;
            const view = document.querySelector('.view-toggle .toggle-btn.active').getAttribute('data-view');
            
            if (view === 'active') {
                loadGuestsForCreditManagement(categoryId);
            } else {
                loadGuestsWithPaidCredits(categoryId);
            }
        });
    }
    
    // Set up event listener for marking selected credits as paid
    document.querySelector('.mark-selected-paid-btn')?.addEventListener('click', markSelectedCreditsPaid);
    
    // Initialize with active credits view
    loadGuestsForCreditManagement();
}

// Load categories for credit management filter
async function loadCreditManagementCategories() {
    try {
        const categoryFilter = document.getElementById('credit-management-category-filter');
        if (!categoryFilter) return;
        
        // Clear existing options except the first one
        while (categoryFilter.options.length > 1) {
            categoryFilter.remove(1);
        }
        
        // Fetch categories from the server
        const response = await fetch(`${API_BASE_URL}/api/guest-categories`);
        
        if (!response.ok) {
            throw new Error('Failed to load categories');
        }
        
        const categories = await response.json();
        
        // Add options for each category
        categories.forEach(category => {
            const option = document.createElement('option');
            option.value = category.id;
            option.textContent = category.name;
            categoryFilter.appendChild(option);
        });
    } catch (error) {
        console.error('Error loading categories for credit management:', error);
        showToast('Failed to load guest categories', 'error');
    }
}

// Function to load all guests for the credit management tab
async function loadGuestsForCreditManagement(categoryId = 'all') {
    try {
        const guestsGrid = document.getElementById('credit-management-guests-grid');
        const noGuestsMessage = document.getElementById('no-guests-credit-management');
        
        if (!guestsGrid || !noGuestsMessage) return;
        
        guestsGrid.innerHTML = '<div class="loading"><i class="fas fa-spinner fa-spin"></i> Loading guests...</div>';
        
        // Fetch guests based on category
        let url = `${API_BASE_URL}/api/guests`;
        if (categoryId !== 'all') {
            url = `${API_BASE_URL}/api/guests/category/${categoryId}`;
        }
        
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error(`Server returned ${response.status} when fetching guests`);
        }
        
        const guests = await response.json();
        
        if (guests.length === 0) {
            guestsGrid.innerHTML = '';
            noGuestsMessage.style.display = 'flex';
            return;
        }
        
        noGuestsMessage.style.display = 'none';
        guestsGrid.innerHTML = '';
        
        // Generate guest cards
        guests.forEach(guest => {
            const guestCard = document.createElement('div');
            guestCard.className = 'guest-card';
            guestCard.setAttribute('data-id', guest.id);
            
            guestCard.innerHTML = `
                <div class="guest-card-content">
                    <h4 class="guest-name">${guest.name}</h4>
                    <div class="guest-details">
                        ${guest.phone ? `<p><i class="fas fa-phone"></i> ${guest.phone}</p>` : ''}
                        ${guest.email ? `<p><i class="fas fa-envelope"></i> ${guest.email}</p>` : ''}
                    </div>
                    ${guest.category_name ? `<div class="guest-category">${guest.category_name}</div>` : ''}
                </div>
            `;
            
            guestsGrid.appendChild(guestCard);
            
            // Add click event to view guest credits
            guestCard.addEventListener('click', () => {
                viewGuestCredits(guest);
            });
        });
    } catch (error) {
        console.error('Error loading guests for credit management:', error);
        const guestsGrid = document.getElementById('credit-management-guests-grid');
        if (guestsGrid) {
            guestsGrid.innerHTML = `<div class="error-message">Error loading guests: ${error.message}</div>`;
        }
    }
}

// Function to filter guests based on search term
function filterGuestsForCreditManagement(searchTerm) {
    const guestCards = document.querySelectorAll('#credit-management-guests-grid .guest-card');
    const noGuestsMessage = document.getElementById('no-guests-credit-management');
    let matchFound = false;
    
    guestCards.forEach(card => {
        const guestName = card.querySelector('.guest-name').textContent.toLowerCase();
        const guestDetails = card.querySelector('.guest-details')?.textContent.toLowerCase() || '';
        
        if (guestName.includes(searchTerm.toLowerCase()) || 
            guestDetails.includes(searchTerm.toLowerCase())) {
            card.style.display = 'block';
            matchFound = true;
        } else {
            card.style.display = 'none';
        }
    });
    
    // Show/hide no guests message
    if (noGuestsMessage) {
        noGuestsMessage.style.display = matchFound ? 'none' : 'flex';
        if (!matchFound) {
            noGuestsMessage.innerHTML = `
                <i class="fas fa-search"></i>
                <p>No guests matching "${searchTerm}" found.</p>
            `;
        }
    }
}

// Function to view a specific guest's credits
async function viewGuestCredits(guest) {
    try {
        // Remove selection from all cards
        document.querySelectorAll('#credit-management-guests-grid .guest-card').forEach(card => {
            card.classList.remove('selected');
        });
        
        // Add selection to clicked card
        const selectedCard = document.querySelector(`#credit-management-guests-grid .guest-card[data-id="${guest.id}"]`);
        if (selectedCard) {
            selectedCard.classList.add('selected');
        }
        
        const creditManagementContainer = document.getElementById('guest-credits-container');
        creditManagementContainer.innerHTML = '<div class="loading"><i class="fas fa-spinner fa-spin"></i> Loading credits...</div>';
        
        // Attempt to fetch credits for this guest
        let credits = [];
        let allMeals = [];
        
        try {
            const creditsResponse = await fetch(`${API_BASE_URL}/api/credits/guest/${guest.id}`);
            
            if (creditsResponse.ok) {
                credits = await creditsResponse.json();
                
                // For each credit, fetch its meals
                for (const credit of credits) {
                    try {
                        const mealsResponse = await fetch(`${API_BASE_URL}/api/credits/${credit.id}/meals`);
                        if (mealsResponse.ok) {
                            const meals = await mealsResponse.json();
                            credit.meals = meals;
                            allMeals = [...allMeals, ...meals];
                        } else {
                            console.warn(`Could not fetch meals for credit ${credit.id}: ${mealsResponse.status}`);
                            credit.meals = [];
                        }
                    } catch (mealError) {
                        console.warn(`Error fetching meals for credit ${credit.id}:`, mealError);
                        credit.meals = [];
                    }
                }
            } else {
                console.warn(`Credits endpoint returned ${creditsResponse.status}`);
                // Continue with empty credits array
            }
        } catch (creditError) {
            console.warn("Error fetching credits:", creditError);
            // Continue with empty credits array
        }
        
        // Create the summarized view data
        const mealSummary = {};
        allMeals.forEach(meal => {
            if (!mealSummary[meal.name]) {
                mealSummary[meal.name] = {
                    count: 0,
                    totalAmount: 0,
                    meal: meal
                };
            }
            mealSummary[meal.name].count++;
            mealSummary[meal.name].totalAmount += parseFloat(meal.price || 0);
        });
        
        // Create the HTML for guest credit history
        let html = `
            <div class="guest-credit-history">
                <div class="credit-navigation">
                    <button class="secondary-btn back-to-guests-btn">
                        <i class="fas fa-arrow-left"></i> Back to Guest Selection
                    </button>
                </div>
                
                <div class="guest-info">
                    <h3>${guest.name}</h3>
                    ${guest.phone ? `<p><i class="fas fa-phone"></i> ${guest.phone}</p>` : ''}
                    ${guest.email ? `<p><i class="fas fa-envelope"></i> ${guest.email}</p>` : ''}
                    ${guest.category_name ? `<p><i class="fas fa-tag"></i> ${guest.category_name}</p>` : ''}
                </div>
                
                <div class="credit-actions">
                    <div class="view-toggle">
                        <button class="toggle-btn active" data-view="detailed">
                            <i class="fas fa-list"></i> Detailed View
                        </button>
                        <button class="toggle-btn" data-view="summary">
                            <i class="fas fa-chart-pie"></i> Summary View
                        </button>
                    </div>
                    <button class="primary-btn add-credit-for-guest" data-id="${guest.id}">
                        <i class="fas fa-plus-circle"></i> Add New Credit
                    </button>
                </div>
        `;
        
        if (credits.length === 0) {
            html += '<div class="no-credits">No credits found for this guest. Add a new credit using the button above.</div>';
        } else {
            html += `
                <div class="credit-history-summary">
                    <div class="summary-item">
                        <span>Total Credits:</span>
                        <strong>${credits.length}</strong>
                    </div>
                    <div class="summary-item">
                        <span>Total Amount:</span>
                        <strong>$${credits.reduce((sum, credit) => sum + parseFloat(credit.amount || 0), 0).toFixed(2)}</strong>
                    </div>
                </div>
                
                <!-- Detailed View (default) -->
                <div class="credit-view detailed-view">
                    <h4>Credit History</h4>
                    <table class="credit-history-table">
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>Amount</th>
                                <th>Note</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
            `;
            
            credits.forEach(credit => {
                const date = new Date(credit.date_credited).toLocaleDateString();
                
                html += `
                    <tr>
                        <td>${date}</td>
                        <td>$${parseFloat(credit.amount || 0).toFixed(2)}</td>
                        <td>${credit.note || '-'}</td>
                        <td>
                            <button class="view-credit-btn" data-id="${credit.id}">
                                <i class="fas fa-eye"></i> View
                            </button>
                        </td>
                    </tr>
                `;
            });
            
            html += '</tbody></table></div>';
            
            // Summary View (hidden initially)
            html += `
                <div class="credit-view summary-view" style="display: none;">
                    <h4>Credit Summary by Meal</h4>
            `;
            
            if (Object.keys(mealSummary).length === 0) {
                html += '<div class="no-credits">No meal information available for this guest\'s credits.</div>';
            } else {
                html += `
                    <table class="meal-summary-table">
                        <thead>
                            <tr>
                                <th>Meal</th>
                                <th>Quantity</th>
                                <th>Total Amount</th>
                            </tr>
                        </thead>
                        <tbody>
                `;
                
                Object.keys(mealSummary).forEach(mealName => {
                    const item = mealSummary[mealName];
                    html += `
                        <tr>
                            <td>${mealName}</td>
                            <td>${item.count}</td>
                            <td>$${item.totalAmount.toFixed(2)}</td>
                        </tr>
                    `;
                });
                
                html += '</tbody></table>';
            }
            
            html += '</div>'; // Close the summary view div
        }
        
        html += '</div>';
        creditManagementContainer.innerHTML = html;
        
        // Add event listener for "Add New Credit" button
        document.querySelector('.add-credit-for-guest')?.addEventListener('click', function() {
            startCreditFlowForGuest(guest);
        });
        
        // Add event listeners for view credit buttons
        document.querySelectorAll('.view-credit-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const creditId = this.getAttribute('data-id');
                viewCreditDetails(creditId);
            });
        });
        
        // Add event listener for back button
        document.querySelector('.back-to-guests-btn')?.addEventListener('click', function() {
            const welcomeMessage = `
                <div class="welcome-message">
                    <i class="fas fa-credit-card welcome-icon"></i>
                    <h3>Credit Management</h3>
                    <p>Search for a guest to view their credit history, or select from the list below.</p>
                </div>
                
                <div class="guest-grid-container">
                    <h4>Select a Guest</h4>
                    <div id="credit-management-guests-grid" class="guests-grid">
                        <!-- Guest cards will be loaded here -->
                    </div>
                    <div id="no-guests-credit-management" class="empty-message" style="display: none;">
                        <i class="fas fa-info-circle"></i>
                        <p>No guests found. Add guests in the Guest Management tab.</p>
                    </div>
                </div>
            `;
            
            document.getElementById('guest-credits-container').innerHTML = welcomeMessage;
            loadGuestsForCreditManagement();
        });
        
        // Add event listeners for view toggle buttons
        document.querySelectorAll('.toggle-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                // Remove active class from all toggle buttons
                document.querySelectorAll('.toggle-btn').forEach(b => b.classList.remove('active'));
                // Add active class to clicked button
                this.classList.add('active');
                
                const viewType = this.getAttribute('data-view');
                
                // Hide all views
                document.querySelectorAll('.credit-view').forEach(view => {
                    view.style.display = 'none';
                });
                
                // Show selected view
                document.querySelector(`.${viewType}-view`).style.display = 'block';
            });
        });
        
    } catch (error) {
        console.error('Error viewing guest credits:', error);
        document.getElementById('guest-credits-container').innerHTML = 
            `<div class="error-message">Error: ${error.message}</div>`;
    }
}

// Function to start the credit flow for a specific guest
function startCreditFlowForGuest(guest) {
    // Switch to the add credit tab
    const addCreditTab = document.querySelector('li[data-tab="add-credit"]');
    if (addCreditTab) {
        addCreditTab.click();
        
        // Wait for the tab to fully load
        setTimeout(() => {
            // Skip to step 2 (guest selection) and pre-select the guest
            document.getElementById('step-date').style.display = 'none';
            document.getElementById('step-guest').style.display = 'block';
            
            // Simulate selecting this guest
            selectGuest(guest);
        }, 300);
    }
}

// Call this function when the document is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Add this to your existing DOMContentLoaded event
    document.querySelectorAll('nav ul li').forEach(tab => {
        tab.addEventListener('click', function() {
            const tabId = this.getAttribute('data-tab');
            if (tabId === 'credit-management') {
                setupCreditManagementTab();
            }
        });
    });
});

// Function to view detailed credit information
async function viewCreditDetails(creditId) {
    try {
        // Create and show a modal for credit details
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.id = 'credit-detail-modal';
        
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Credit Details</h3>
                    <span class="close-modal">&times;</span>
                </div>
                <div class="modal-body">
                    <div class="loading"><i class="fas fa-spinner fa-spin"></i> Loading credit details...</div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        modal.style.display = 'block';
        
        // Add event listener to close the modal
        modal.querySelector('.close-modal').addEventListener('click', () => {
            modal.style.display = 'none';
            modal.remove();
        });
        
        // Fetch credit details
        let credit = null;
        let meals = [];
        
        // Try the combined endpoint first
        try {
            const combinedResponse = await fetch(`${API_BASE_URL}/api/credits/${creditId}/with-meals`);
            
            if (combinedResponse.ok) {
                const data = await combinedResponse.json();
                credit = data;
                meals = data.meals || [];
            } else {
                // Fall back to fetching credit details separately
                const response = await fetch(`${API_BASE_URL}/api/credits/${creditId}`);
                
                if (!response.ok) {
                    throw new Error(`Failed to fetch credit details (${response.status})`);
                }
                
                credit = await response.json();
                
                // Try to fetch meals separately
                try {
                    const mealsResponse = await fetch(`${API_BASE_URL}/api/credits/${creditId}/meals`);
                    if (mealsResponse.ok) {
                        meals = await mealsResponse.json();
                    } else {
                        console.warn(`Could not fetch meals for credit ${creditId}: ${mealsResponse.status}`);
                    }
                } catch (mealsError) {
                    console.warn(`Error fetching meals for credit ${creditId}:`, mealsError);
                }
            }
        } catch (error) {
            console.error("Error fetching credit details:", error);
            const modalBody = modal.querySelector('.modal-body');
            modalBody.innerHTML = `<div class="error-message">Error fetching credit details: ${error.message}</div>`;
            return;
        }
        
        // Format the date
        const creditDate = new Date(credit.date_credited).toLocaleDateString();
        
        // Update modal content
        const modalBody = modal.querySelector('.modal-body');
        
        let html = `
            <div class="credit-detail-info">
                <div class="credit-detail-row">
                    <span class="credit-detail-label">Date:</span>
                    <span>${creditDate}</span>
                </div>
                <div class="credit-detail-row">
                    <span class="credit-detail-label">Guest:</span>
                    <span>${credit.guest_name || 'Unknown'}</span>
                </div>
                <div class="credit-detail-row">
                    <span class="credit-detail-label">Amount:</span>
                    <span>$${parseFloat(credit.amount || 0).toFixed(2)}</span>
                </div>
                <div class="credit-detail-row">
                    <span class="credit-detail-label">Note:</span>
                    <span>${credit.note || '-'}</span>
                </div>
            </div>
            
            <h4>Meals</h4>
        `;
        
        if (meals.length === 0) {
            html += `<p class="no-meals">No meals found for this credit. This could be because the meals endpoint is not yet implemented on the server.</p>`;
        } else {
            html += `
                <table class="credit-meals-table">
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Category</th>
                            <th>Price</th>
                        </tr>
                    </thead>
                    <tbody>
            `;
            
            meals.forEach(meal => {
                html += `
                    <tr>
                        <td>${meal.name}</td>
                        <td>${meal.category_name || meal.subcategory_name || '-'}</td>
                        <td>$${parseFloat(meal.price || 0).toFixed(2)}</td>
                    </tr>
                `;
            });
            
            html += `
                    </tbody>
                </table>
            `;
        }
        
        modalBody.innerHTML = html;
        
    } catch (error) {
        console.error('Error viewing credit details:', error);
        const modalBody = document.querySelector('#credit-detail-modal .modal-body');
        if (modalBody) {
            modalBody.innerHTML = `<div class="error-message">Error: ${error.message}</div>`;
        }
    }
}

// Modify the meal form submission handler
document.getElementById('meal-form').addEventListener('submit', function(event) {
    // Prevent the default form submission
    event.preventDefault();
    
    // Get form values
    const id = document.getElementById('meal-id').value;
    const name = document.getElementById('meal-name').value;
    const description = document.getElementById('meal-description').value;
    const price = document.getElementById('meal-price').value;
    const subcategoryId = document.getElementById('meal-subcategory').value;
    
    // Validate form
    if (!name) {
        showToast('Meal name is required', 'error');
        return;
    }
    
    if (isNaN(price) || price < 0) {
        showToast('Please enter a valid price', 'error');
        return;
    }
    
    // Determine if this is an add or edit operation
    const isEdit = id !== '';
    
    // API endpoint and method
    const url = isEdit ? `/api/meals/${id}` : '/api/meals';
    const method = isEdit ? 'PUT' : 'POST';
    
    // Send request to server
    fetch(url, {
        method: method,
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            name,
            description,
            price: parseFloat(price),
            subcategory_id: subcategoryId || null
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.error) {
            showToast(data.error, 'error');
        } else {
            showToast(data.message || 'Meal saved successfully', 'success');
            closeModal('meal-modal');
            // Refresh the meals table
            loadMealSubcategoriesForManagement();
        }
    })
    .catch(error => {
        console.error('Error saving meal:', error);
        showToast('Failed to save meal', 'error');
    });
});

// Also make sure we add an event listener to populate subcategories when a category is selected
document.getElementById('meal-category').addEventListener('change', function() {
    const categoryId = this.value;
    if (categoryId) {
        // Load subcategories for the selected category
        fetch(`${API_BASE_URL}/api/meal-subcategories/category/${categoryId}`)
            .then(response => response.json())
            .then(subcategories => {
                const subcategorySelect = document.getElementById('meal-subcategory');
                subcategorySelect.innerHTML = '<option value="">-- Select Subcategory --</option>';
                
                subcategories.forEach(subcategory => {
                    const option = document.createElement('option');
                    option.value = subcategory.id;
                    option.textContent = subcategory.name;
                    subcategorySelect.appendChild(option);
                });
            })
            .catch(error => {
                console.error('Error loading subcategories:', error);
                showToast('Failed to load subcategories', 'error');
            });
    } else {
        // Clear subcategory select if no category is selected
        document.getElementById('meal-subcategory').innerHTML = '<option value="">-- Select Subcategory --</option>';
    }
});

// Add or update the function to load categories for the meal filter
function loadCategoriesForMealFilter() {
    fetch(`${API_BASE_URL}/api/meal-categories`)
        .then(response => response.json())
        .then(categories => {
            const categoryFilter = document.getElementById('meal-category-filter');
            
            // Keep the "All Categories" option
            categoryFilter.innerHTML = '<option value="all">All Categories</option>';
            
            // Add categories from the database
            categories.forEach(category => {
                const option = document.createElement('option');
                option.value = category.id;
                option.textContent = category.name;
                categoryFilter.appendChild(option);
            });
        })
        .catch(error => {
            console.error('Error loading meal categories for filter:', error);
            showToast('Failed to load categories for filter', 'error');
        });
}

// Update category filter change event to load subcategories
document.getElementById('meal-category-filter').addEventListener('change', function() {
    const categoryId = this.value;
    
    if (categoryId && categoryId !== 'all') {
        // Load subcategories for the selected category
        loadSubcategoriesForFilter(categoryId);
    } else {
        // Clear subcategory filter if "All Categories" is selected
        const subcategoryFilter = document.getElementById('meal-subcategory-filter');
        subcategoryFilter.innerHTML = '<option value="all">All Subcategories</option>';
    }
    
    // Update the meals table after filter change
    loadMeals({
        categoryId: categoryId,
        subcategoryId: document.getElementById('meal-subcategory-filter').value
    });
});

// Function to load subcategories for filter based on selected category
function loadSubcategoriesForFilter(categoryId) {
    fetch(`${API_BASE_URL}/api/meal-subcategories/category/${categoryId}`)
        .then(response => response.json())
        .then(subcategories => {
            const subcategoryFilter = document.getElementById('meal-subcategory-filter');
            
            // Keep the "All Subcategories" option
            subcategoryFilter.innerHTML = '<option value="all">All Subcategories</option>';
            
            // Add subcategories from the database
            subcategories.forEach(subcategory => {
                const option = document.createElement('option');
                option.value = subcategory.id;
                option.textContent = subcategory.name;
                subcategoryFilter.appendChild(option);
            });
        })
        .catch(error => {
            console.error('Error loading meal subcategories for filter:', error);
            showToast('Failed to load subcategories for filter', 'error');
        });
}

// Make sure to call this function when initializing the meal management tab
// Update the initialization of the meal management tab to include loading categories for filters
function initializeMealManagement() {
    // Load categories for the filter
    loadCategoriesForMealFilter();
    
    // Load initial meals
    loadMeals({
        categoryId: 'all',
        subcategoryId: 'all'
    });
    
    // Make sure this function is called when switching to the meal management tab
    
    // Update the table header to include the selection column
    const thead = document.querySelector('#meals-table thead tr');
    
    // Check if the header already has a selection column
    if (!thead.querySelector('th.selection-column')) {
        // Create selection column header with checkbox for select all
        const selectionTh = document.createElement('th');
        selectionTh.className = 'selection-column';
        selectionTh.innerHTML = '<input type="checkbox" id="select-all-meals">';
        thead.insertBefore(selectionTh, thead.firstChild);
        
        // Add select all functionality
        document.getElementById('select-all-meals').addEventListener('change', function() {
            const isChecked = this.checked;
            document.querySelectorAll('.meal-checkbox').forEach(checkbox => {
                checkbox.checked = isChecked;
            });
        });
    }
    
    // Add a button to update selected meals
    const actionButtons = document.querySelector('#meal-management .action-buttons');
    if (!document.getElementById('update-selected-prices-btn')) {
        const updateSelectedBtn = document.createElement('button');
        updateSelectedBtn.id = 'update-selected-prices-btn';
        updateSelectedBtn.className = 'secondary-btn';
        updateSelectedBtn.innerHTML = '<i class="fas fa-tags"></i> Update Selected Prices';
        updateSelectedBtn.addEventListener('click', openSelectedPriceUpdateModal);
        actionButtons.appendChild(updateSelectedBtn);
    }
}

// Make sure this initialization function is called when the page loads or when switching to the meal tab
document.querySelector('[data-tab="meal-management"]').addEventListener('click', function() {
    // This assumes your tab switching logic already handles making the tab visible
    // Just call the initialization function here
    initializeMealManagement();
});

// Also call it on initial page load if the meal management tab is the default active tab
document.addEventListener('DOMContentLoaded', function() {
    if (document.getElementById('meal-management').classList.contains('active')) {
        initializeMealManagement();
    }
});

// Add this to the main initialization at the top of your script.js
document.addEventListener('DOMContentLoaded', function() {
    // ... existing code ...
    
    // Initialize theme settings
    initializeThemeSettings();
});

// Add this function to your script.js
function initializeThemeSettings() {
    // Get theme from localStorage
    const savedTheme = localStorage.getItem('theme') || 'light';
    
    // Apply saved theme
    document.body.className = savedTheme + '-theme';
    
    // Set the correct radio button
    document.querySelector(`input[name="theme"][value="${savedTheme}"]`).checked = true;
    
    // Toggle settings menu visibility
    const settingsIcon = document.getElementById('settings-icon');
    const settingsMenu = document.getElementById('settings-menu');
    
    settingsIcon.addEventListener('click', function(e) {
        e.stopPropagation();
        settingsMenu.style.display = settingsMenu.style.display === 'none' ? 'block' : 'none';
    });
    
    // Close settings menu when clicking elsewhere
    document.addEventListener('click', function() {
        settingsMenu.style.display = 'none';
    });
    
    // Prevent clicks inside the menu from closing it
    settingsMenu.addEventListener('click', function(e) {
        e.stopPropagation();
    });
    
    // Theme change event listener
    const themeRadios = document.querySelectorAll('input[name="theme"]');
    themeRadios.forEach(radio => {
        radio.addEventListener('change', function() {
            // Remove existing theme class
            document.body.classList.remove('light-theme', 'dark-theme', 'green-theme');
            
            // Add new theme class
            document.body.classList.add(this.value + '-theme');
            
            // Save to localStorage
            localStorage.setItem('theme', this.value);
            
            // Show confirmation toast
            showToast(`${this.value.charAt(0).toUpperCase() + this.value.slice(1)} theme applied!`, 'info');
        });
    });
}

// Replace the existing settings event listener code with this

document.addEventListener('DOMContentLoaded', function() {
    // Other existing initialization code...
    
    // Initialize theme settings properly
    initializeThemeSettings();
});

function initializeThemeSettings() {
    // Get theme from localStorage
    const savedTheme = localStorage.getItem('theme') || 'light';
    
    // Apply saved theme on page load
    document.body.className = savedTheme + '-theme';
    
    // Set the correct radio button
    const activeThemeRadio = document.querySelector(`input[name="theme"][value="${savedTheme}"]`);
    if (activeThemeRadio) {
        activeThemeRadio.checked = true;
    }
    
    // Settings menu toggle
    const settingsIcon = document.getElementById('settings-icon');
    const settingsMenu = document.getElementById('settings-menu');
    
    if (settingsIcon && settingsMenu) {
        // Remove any existing event listeners by cloning and replacing the element
        const newSettingsIcon = settingsIcon.cloneNode(true);
        settingsIcon.parentNode.replaceChild(newSettingsIcon, settingsIcon);
        
        // Add fresh event listener
        newSettingsIcon.addEventListener('click', function(e) {
            e.stopPropagation();
            console.log('Settings clicked'); // Debug log
            settingsMenu.style.display = settingsMenu.style.display === 'none' ? 'block' : 'none';
        });
        
        // Close settings menu when clicking elsewhere
        document.addEventListener('click', function() {
            settingsMenu.style.display = 'none';
        });
        
        // Prevent clicks inside the menu from closing it
        settingsMenu.addEventListener('click', function(e) {
            e.stopPropagation();
        });
    } else {
        console.error('Settings elements not found');
    }
    
    // Theme change event listener
    const themeRadios = document.querySelectorAll('input[name="theme"]');
    themeRadios.forEach(radio => {
        radio.addEventListener('change', function() {
            // Remove existing theme classes
            document.body.classList.remove('light-theme', 'dark-theme', 'green-theme');
            
            // Add new theme class
            document.body.classList.add(this.value + '-theme');
            
            // Save to localStorage
            localStorage.setItem('theme', this.value);
            
            // Show confirmation toast
            showToast(`${this.value.charAt(0).toUpperCase() + this.value.slice(1)} theme applied!`, 'info');
        });
    });
}

// Add this debugging code to help identify any issues
window.addEventListener('load', function() {
    console.log('Window loaded');
    const settingsIcon = document.getElementById('settings-icon');
    const settingsMenu = document.getElementById('settings-menu');
    
    console.log('Settings icon exists:', !!settingsIcon);
    console.log('Settings menu exists:', !!settingsMenu);
    
    if (settingsIcon) {
        settingsIcon.addEventListener('click', function() {
            console.log('Settings icon clicked');
        });
    }
});

// Function to confirm and delete a meal
function confirmDeleteMeal(id, name) {
    // Set up the confirm modal
    confirmTitle.textContent = 'Delete Meal';
    confirmMessage.textContent = `Are you sure you want to delete the meal "${name}"? This action cannot be undone.`;
    
    // Define the delete callback
    deleteCallback = function() {
        // Use fetch instead of window.electron.api.delete
        fetch(`http://localhost:3000/api/meals/${id}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            }
        })
        .then(response => {
            if (!response.ok) throw new Error('Failed to delete meal');
            return response.json();
        })
        .then(data => {
            showToast('Meal deleted successfully', 'success');
            closeModal('confirm-modal');
            
            // Refresh the meals list
            loadMeals({
                categoryId: document.getElementById('meal-category-filter').value,
                subcategoryId: document.getElementById('meal-subcategory-filter').value
            });
        })
        .catch(error => {
            console.error('Error deleting meal:', error);
            showToast('Error deleting meal: ' + error.message, 'error');
        });
    };
    
    // Make sure the confirm button has the correct event listener
    const confirmButton = document.getElementById('confirm-action');
    
    // Remove any existing event listeners to avoid duplicates
    const newConfirmButton = confirmButton.cloneNode(true);
    confirmButton.parentNode.replaceChild(newConfirmButton, confirmButton);
    
    // Add the event listener to the new button
    newConfirmButton.addEventListener('click', function() {
        deleteCallback();
    });
    
    // Show the confirm modal
    document.getElementById('confirm-modal').style.display = 'block';
}

// Ensure the confirm-action button has its event listener
document.getElementById('confirm-action').addEventListener('click', function() {
    if (typeof deleteCallback === 'function') {
        deleteCallback();
    }
    closeModal('confirm-modal');
});

// Make sure the cancel button works too
document.getElementById('cancel-confirm').addEventListener('click', function() {
    closeModal('confirm-modal');
});

function openSelectedPriceUpdateModal() {
    // Get all selected meal IDs
    const selectedMealIds = [];
    document.querySelectorAll('.meal-checkbox:checked').forEach(checkbox => {
        selectedMealIds.push(checkbox.dataset.id);
    });
    
    if (selectedMealIds.length === 0) {
        showToast('Please select at least one meal to update', 'warning');
        return;
    }
    
    // Store the selected meal IDs for later use
    window.selectedMealIds = selectedMealIds;
    
    // Set the modal title to indicate selection
    document.querySelector('#bulk-price-modal .modal-header h3').textContent = 
        `Update Prices (${selectedMealIds.length} meals selected)`;
    
    // Update the preview text
    updatePricePreview();
    
    // Show the modal
    document.getElementById('bulk-price-modal').style.display = 'block';
}

// Update the preview text based on current selections
function updatePricePreview() {
    const updateType = document.querySelector('input[name="price-update-type"]:checked').value;
    const operation = document.querySelector('input[name="price-update-operation"]:checked').value;
    const value = document.getElementById('price-update-value').value || '0';
    
    let previewText = `This will ${operation} selected meal prices by `;
    
    if (updateType === 'percentage') {
        previewText += `${value}%`;
    } else {
        previewText += `$${value}`;
    }
    
    document.querySelector('.preview-text').textContent = previewText;
    
    // Update affected count
    const selectedCount = window.selectedMealIds ? window.selectedMealIds.length : 0;
    document.getElementById('affected-count').textContent = selectedCount;
}

// Update the bulk price form submission
document.getElementById('bulk-price-form').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const updateType = document.querySelector('input[name="price-update-type"]:checked').value;
    const operation = document.querySelector('input[name="price-update-operation"]:checked').value;
    const value = parseFloat(document.getElementById('price-update-value').value);
    
    if (isNaN(value) || value <= 0) {
        showToast('Please enter a positive number', 'error');
        return;
    }
    
    // Determine if using selected meals or filter
    let requestData = {
        update_type: updateType,
        value: value,
        operation: operation
    };
    
    // Check if we have selected meal IDs
    if (window.selectedMealIds && window.selectedMealIds.length > 0) {
        requestData.filter = 'selected';
        requestData.mealIds = window.selectedMealIds;
    } else {
        // Use the filter controls as before
        requestData.filter = document.getElementById('bulk-update-filter').value;
        
        if (requestData.filter === 'category') {
            requestData.categoryId = document.getElementById('bulk-category').value;
        } else if (requestData.filter === 'subcategory') {
            requestData.subcategoryId = document.getElementById('bulk-subcategory').value;
        }
    }
    
    // Send the update request
    fetch('http://localhost:3000/api/meals/bulk-price-update', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestData)
    })
    .then(response => {
        if (!response.ok) throw new Error('Failed to update prices');
        return response.json();
    })
    .then(data => {
        showToast(`Successfully updated ${data.count} meal prices`, 'success');
        closeModal('bulk-price-modal');
        
        // Clear the selection
        window.selectedMealIds = null;
        document.getElementById('select-all-meals').checked = false;
        
        // Refresh the meals list
        loadMeals({
            categoryId: document.getElementById('meal-category-filter').value,
            subcategoryId: document.getElementById('meal-subcategory-filter').value
        });
    })
    .catch(error => {
        console.error('Error updating prices:', error);
        showToast('Error updating prices: ' + error.message, 'error');
    });
});

function removeMealFromSelection(uniqueId) {
    const index = selectedMeals.findIndex(meal => meal.uniqueId === uniqueId);
    
    if (index !== -1) {
        const removedMeal = selectedMeals[index];
        selectedMeals.splice(index, 1);
        showToast(`Removed ${removedMeal.name} from selection`, 'info');
        updateSidebarMeals();
        updateTotalAmount();
    }
}

function updateTotalAmount() {
    let total = 0;
    
    selectedMeals.forEach(meal => {
        const price = parseFloat(meal.price) || 0;
        const quantity = meal.quantity || 1;
        total += price * quantity;
    });
    
    // Update sidebar-total (this exists in your HTML)
    const sidebarTotal = document.getElementById('sidebar-total');
    if (sidebarTotal) {
        sidebarTotal.textContent = `$${total.toFixed(2)}`;
    }
    
    // Update credit-amount if it exists (might be used in forms)
    const creditAmount = document.getElementById('credit-amount');
    if (creditAmount) {
        creditAmount.value = total.toFixed(2);
    }
    
    // Update selected-meals-total for the meal selection summary
    const selectedMealsTotal = document.getElementById('selected-meals-total');
    if (selectedMealsTotal) {
        selectedMealsTotal.textContent = `$${total.toFixed(2)}`;
    }
    
    // Update confirm-total on the confirmation page
    const confirmTotal = document.getElementById('confirm-total');
    if (confirmTotal) {
        confirmTotal.textContent = `$${total.toFixed(2)}`;
    }
}

async function markCreditAsPaid(creditId) {
    try {
        // Display a confirmation modal
        document.getElementById('confirm-title').textContent = 'Confirm Payment';
        document.getElementById('confirm-message').textContent = 
            'Are you sure you want to mark this credit as paid? This action cannot be undone.';
        
        const confirmModal = document.getElementById('confirm-modal');
        confirmModal.style.display = 'block';
        
        // Remove any existing event listeners
        const confirmBtn = document.getElementById('confirm-action');
        const newConfirmBtn = confirmBtn.cloneNode(true);
        confirmBtn.parentNode.replaceChild(newConfirmBtn, confirmBtn);
        
        // Add new event listener
        newConfirmBtn.addEventListener('click', async function() {
            confirmModal.style.display = 'none';
            
            // Show loading toast
            showToast('Processing payment...', 'info');
            
            const response = await fetch(`http://localhost:3000/api/credits/${creditId}/mark-paid`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    date_paid: new Date().toISOString().split('T')[0]
                })
            });
            
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Failed to mark credit as paid');
            }
            
            showToast('Credit has been marked as paid successfully!', 'success');
            
            // Refresh the credit view to show updated status
            const creditContainerElement = document.getElementById('guest-credits-container');
            const guestId = creditContainerElement.getAttribute('data-guest-id');
            
            if (guestId) {
                await displayGuestCreditHistory(guestId);
            } else {
                // Navigate back to the guest's credit list
                const data = await response.json();
                if (data.guest_id) {
                    await viewGuestCredits({id: data.guest_id, name: data.guest_name});
                } else {
                    // Fallback to credit management main view
                    setupCreditManagementTab();
                }
            }
        });
        
        // Cancel button
        document.getElementById('cancel-confirm').addEventListener('click', function() {
            confirmModal.style.display = 'none';
        });
        
    } catch (error) {
        console.error('Error marking credit as paid:', error);
        showToast(`Error: ${error.message}`, 'error');
    }
}

async function loadGuestsWithPaidCredits(categoryId = 'all') {
    try {
        let url = 'http://localhost:3000/api/guests-with-paid-credits';
        if (categoryId !== 'all') {
            url += `?category=${categoryId}`;
        }
        
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error('Failed to fetch guests with paid credits');
        }
        
        const guests = await response.json();
        
        const guestsGrid = document.getElementById('credit-management-guests-grid');
        const noGuestsMessage = document.getElementById('no-guests-credit-management');
        
        if (guests.length === 0) {
            guestsGrid.innerHTML = '';
            noGuestsMessage.style.display = 'block';
            noGuestsMessage.innerHTML = `
                <i class="fas fa-info-circle"></i>
                <p>No guests with paid credits found.</p>
            `;
            return;
        }
        
        noGuestsMessage.style.display = 'none';
        
        guestsGrid.innerHTML = guests.map(guest => `
            <div class="guest-card" onclick="viewGuestPaidCredits(${JSON.stringify(guest)})">
                <div class="guest-card-content">
                    <h4>${guest.name}</h4>
                    <div class="guest-details">
                        ${guest.category_name ? 
                            `<span class="guest-category">${guest.category_name}</span>` : ''}
                        ${guest.phone ? 
                            `<span class="guest-phone">${guest.phone}</span>` : ''}
                    </div>
                    <div class="guest-credit-summary">
                        <span class="paid-credits-count">${guest.paid_credits_count} paid credits</span>
                        <span class="paid-credits-amount">$${guest.paid_credits_amount.toFixed(2)}</span>
                    </div>
                </div>
            </div>
        `).join('');
        
    } catch (error) {
        console.error('Error loading guests with paid credits:', error);
        showToast('Failed to load guests with paid credits', 'error');
    }
}

async function viewGuestPaidCredits(guest) {
    try {
        const response = await fetch(`http://localhost:3000/api/paid-credits/guest/${guest.id}`);
        
        if (!response.ok) {
            throw new Error('Failed to fetch paid credits');
        }
        
        const paidCredits = await response.json();
        
        let totalPaidAmount = 0;
        
        // Calculate total paid amount
        if (paidCredits.length > 0) {
            totalPaidAmount = paidCredits.reduce((sum, credit) => sum + parseFloat(credit.amount_used), 0);
        }
        
        const paidCreditsHtml = `
            <div class="guest-credit-history" data-guest-id="${guest.id}">
                <div class="guest-info">
                    <h3>${guest.name}'s Paid Credits</h3>
                    <p>${guest.phone ? `Phone: ${guest.phone}` : ''} ${guest.email ? `Email: ${guest.email}` : ''}</p>
                </div>
                
                <div class="credit-history-summary">
                    <div class="summary-item">
                        <span class="summary-label">Total Paid Credits</span>
                        <span>${paidCredits.length}</span>
                    </div>
                    <div class="summary-item">
                        <span class="summary-label">Total Paid Amount</span>
                        <span>$${totalPaidAmount.toFixed(2)}</span>
                    </div>
                </div>
                
                <div class="credit-actions">
                    <button class="text-btn" onclick="setupCreditManagementTab()">
                        <i class="fas fa-arrow-left"></i> Back to Guest Selection
                    </button>
                    <button class="primary-btn" onclick="viewGuestCredits(${JSON.stringify(guest)})">
                        <i class="fas fa-credit-card"></i> View Active Credits
                    </button>
                </div>
                
                <h4>Paid Credit History</h4>
                
                ${paidCredits.length > 0 ? `
                    <table class="credit-history-table">
                        <thead>
                            <tr>
                                <th>Credit ID</th>
                                <th>Date Credited</th>
                                <th>Date Paid</th>
                                <th>Amount</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${paidCredits.map(credit => `
                                <tr>
                                    <td>#${credit.credit_id}</td>
                                    <td>${new Date(credit.date_credited).toLocaleDateString()}</td>
                                    <td>${new Date(credit.date_used).toLocaleDateString()}</td>
                                    <td>$${parseFloat(credit.amount).toFixed(2)}</td>
                                    <td>
                                        <button class="view-credit-btn" onclick="viewPaidCreditDetails(${credit.id})">
                                            <i class="fas fa-eye"></i> View Details
                                        </button>
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                ` : `
                    <p class="no-credits">No paid credits found for this guest.</p>
                `}
            </div>
        `;
        
        document.getElementById('guest-credits-container').innerHTML = paidCreditsHtml;
        
    } catch (error) {
        console.error('Error viewing guest paid credits:', error);
        showToast('Failed to load guest paid credits', 'error');
    }
}

// This function should be called after displaying guest credit history
function setupCreditSelectionSystem() {
    console.log("Setting up credit selection system");
    
    // Find all credit checkboxes
    const creditCheckboxes = document.querySelectorAll('.credit-checkbox');
    const selectAllCheckbox = document.getElementById('select-all-credits');
    const markPaidButton = document.querySelector('.mark-selected-paid-btn');
    
    if (!creditCheckboxes.length) {
        console.warn("No credit checkboxes found on the page");
    }
    
    if (!selectAllCheckbox) {
        console.warn("Select all checkbox not found");
    }
    
    if (!markPaidButton) {
        console.warn("Mark as paid button not found");
    }
    
    // Add event listener to "Select All" checkbox
    if (selectAllCheckbox) {
        selectAllCheckbox.addEventListener('change', function() {
            const isChecked = this.checked;
            
            // Update all credit checkboxes
            creditCheckboxes.forEach(checkbox => {
                checkbox.checked = isChecked;
            });
            
            // Update the visibility of the "Mark as Paid" button
            updateMarkPaidButtonVisibility();
        });
    }
    
    // Add event listeners to individual credit checkboxes
    creditCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', function() {
            // If any checkbox is unchecked, uncheck the "Select All" checkbox
            if (!this.checked && selectAllCheckbox) {
                selectAllCheckbox.checked = false;
            }
            
            // If all checkboxes are checked, check the "Select All" checkbox
            if (selectAllCheckbox) {
                const allChecked = Array.from(creditCheckboxes).every(cb => cb.checked);
                selectAllCheckbox.checked = allChecked;
            }
            
            // Update the visibility of the "Mark as Paid" button
            updateMarkPaidButtonVisibility();
        });
    });
    
    // Initial check for button visibility
    updateMarkPaidButtonVisibility();
}

// Helper function to update the visibility of the "Mark as Paid" button
function updateMarkPaidButtonVisibility() {
    const creditCheckboxes = document.querySelectorAll('.credit-checkbox:checked');
    const markPaidButton = document.querySelector('.mark-selected-paid-btn');
    
    if (markPaidButton) {
        markPaidButton.style.display = creditCheckboxes.length > 0 ? 'block' : 'none';
    }
}

async function markSelectedCreditsPaid() {
    // Get all checked checkboxes
    const checkedBoxes = document.querySelectorAll('.credit-checkbox:checked');
    
    if (checkedBoxes.length === 0) {
        showToast('No credits selected', 'info');
        return;
    }
    
    // Get all credit IDs that are selected
    const creditIds = Array.from(checkedBoxes).map(checkbox => 
        checkbox.getAttribute('data-credit-id')
    );
    
    console.log("Selected credit IDs to mark as paid:", creditIds);
    
    // Show the payment date modal
    showPaymentDateModal(creditIds);
}

function showPaymentDateModal(creditIds) {
    // Create the modal if it doesn't exist
    if (!document.getElementById('payment-date-modal')) {
        const modalHtml = `
            <div class="modal" id="payment-date-modal">
                <div class="modal-content modal-sm">
                    <div class="modal-header">
                        <h3>Select Payment Date</h3>
                        <span class="close-modal">&times;</span>
                    </div>
                    <div class="modal-body">
                        <div class="form-group">
                            <label for="payment-date">Payment Date:</label>
                            <input type="date" id="payment-date" value="${new Date().toISOString().split('T')[0]}">
                        </div>
                        <p class="modal-message">
                            Please select a payment date for the selected credits.
                        </p>
                        <div class="form-actions">
                            <button type="button" class="secondary-btn" id="cancel-payment">Cancel</button>
                            <button type="button" class="primary-btn" id="confirm-payment-date">Continue</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', modalHtml);
        
        // Set up event listeners for the modal
        document.querySelector('#payment-date-modal .close-modal').addEventListener('click', function() {
            closeModal('payment-date-modal');
        });
        
        document.getElementById('cancel-payment').addEventListener('click', function() {
            closeModal('payment-date-modal');
        });
    }
    
    // Set up the confirm button event listener
    document.getElementById('confirm-payment-date').onclick = async function() {
        const paymentDate = document.getElementById('payment-date').value;
        
        if (!paymentDate) {
            showToast('Please select a payment date', 'error');
            return;
        }
        
        closeModal('payment-date-modal');
        
        // Show a loading indicator
        const loadingHtml = `
            <div class="loading-overlay" id="loading-overlay">
                <div class="loading-spinner"></div>
                <div class="loading-message">Processing credits...</div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', loadingHtml);
        
        try {
            const response = await fetch('http://localhost:3000/api/credits/mark-multiple-paid', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    creditIds: creditIds,
                    paidDate: paymentDate
                })
            });
            
            if (!response.ok) {
                throw new Error('Failed to mark credits as paid');
            }
            
            const result = await response.json();
            
            // Refresh the credit history
            const guestId = document.getElementById('guest-credits-container').getAttribute('data-guest-id');
            await displayGuestCreditHistory(guestId);
            
            showToast(`Successfully marked ${creditIds.length} credits as paid`, 'success');
            
        } catch (error) {
            console.error('Error marking credits as paid:', error);
            showToast('Failed to mark credits as paid', 'error');
        } finally {
            // Remove the loading overlay
            document.getElementById('loading-overlay')?.remove();
        }
    };
    
    // Show the modal
    document.getElementById('payment-date-modal').style.display = 'block';
}

async function viewPaidCreditDetails(paidCreditId) {
    try {
        const response = await fetch(`http://localhost:3000/api/paid-credits/${paidCreditId}`);
        if (!response.ok) {
            throw new Error('Failed to fetch paid credit details');
        }
        
        const paidCredit = await response.json();
        
        const paidCreditDetailsHtml = `
            <div class="credit-detail-view">
                <div class="credit-navigation">
                    <button class="text-btn" onclick="viewGuestPaidCredits({id: ${paidCredit.guest_id}, name: '${paidCredit.guest_name}'})">
                        <i class="fas fa-arrow-left"></i> Back to Paid Credits
                    </button>
                </div>
                
                <div class="credit-detail-info">
                    <h3>Paid Credit #${paidCredit.id}</h3>
                    <div class="credit-detail-row">
                        <span class="credit-detail-label">Guest:</span>
                        <span>${paidCredit.guest_name}</span>
                    </div>
                    <div class="credit-detail-row">
                        <span class="credit-detail-label">Date Credited:</span>
                        <span>${new Date(paidCredit.date_credited).toLocaleDateString()}</span>
                    </div>
                    <div class="credit-detail-row">
                        <span class="credit-detail-label">Date Paid:</span>
                        <span>${new Date(paidCredit.date_used).toLocaleDateString()}</span>
                    </div>
                    <div class="credit-detail-row">
                        <span class="credit-detail-label">Amount:</span>
                        <span>$${parseFloat(paidCredit.amount_used).toFixed(2)}</span>
                    </div>
                    <div class="credit-detail-row">
                        <span class="credit-detail-label">Note:</span>
                        <span>${paidCredit.note || 'No note provided'}</span>
                    </div>
                    <div class="credit-detail-row">
                        <span class="credit-detail-label">Status:</span>
                        <span><span class="status-badge paid">Paid</span></span>
                    </div>
                </div>
                
                <h4>Meals in this Credit</h4>
                ${paidCredit.meals && paidCredit.meals.length > 0 ? `
                    <table class="credit-meals-table">
                        <thead>
                            <tr>
                                <th>Meal</th>
                                <th>Category</th>
                                <th>Quantity</th>
                                <th>Price</th>
                                <th>Subtotal</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${paidCredit.meals.map(meal => `
                                <tr>
                                    <td>${meal.name}</td>
                                    <td>${meal.category_name || ''} ${meal.subcategory_name ? `- ${meal.subcategory_name}` : ''}</td>
                                    <td>${meal.quantity}</td>
                                    <td>$${parseFloat(meal.price).toFixed(2)}</td>
                                    <td>$${(parseFloat(meal.price) * meal.quantity).toFixed(2)}</td>
                                </tr>
                            `).join('')}
                            <tr class="total-row">
                                <td colspan="4" style="text-align: right;"><strong>Total:</strong></td>
                                <td><strong>$${parseFloat(paidCredit.amount_used).toFixed(2)}</strong></td>
                            </tr>
                        </tbody>
                    </table>
                ` : `
                    <div class="no-meals">No meals found for this credit.</div>
                `}
            </div>
        `;
        
        document.getElementById('guest-credits-container').innerHTML = paidCreditDetailsHtml;
        
    } catch (error) {
        console.error('Error viewing paid credit details:', error);
        showToast('Failed to load paid credit details', 'error');
    }
}

function filterGuestsWithPaidCredits(searchTerm) {
    try {
        const guestCards = document.querySelectorAll('#credit-management-guests-grid .guest-card');
        const noGuestsMessage = document.getElementById('no-guests-credit-management');
        
        if (guestCards.length === 0) {
            noGuestsMessage.style.display = 'block';
            return;
        }
        
        let visibleCount = 0;
        
        guestCards.forEach(card => {
            const guestName = card.querySelector('h4').textContent.toLowerCase();
            const guestCategory = card.querySelector('.guest-category')?.textContent.toLowerCase() || '';
            const guestPhone = card.querySelector('.guest-phone')?.textContent.toLowerCase() || '';
            
            if (searchTerm === '' || 
                guestName.includes(searchTerm) || 
                guestCategory.includes(searchTerm) || 
                guestPhone.includes(searchTerm)) {
                card.style.display = 'block';
                visibleCount++;
            } else {
                card.style.display = 'none';
            }
        });
        
        if (visibleCount === 0) {
            noGuestsMessage.style.display = 'block';
            noGuestsMessage.innerHTML = `
                <i class="fas fa-info-circle"></i>
                <p>No guests found matching "${searchTerm}". Try a different search term.</p>
            `;
        } else {
            noGuestsMessage.style.display = 'none';
        }
        
    } catch (error) {
        console.error('Error filtering guests with paid credits:', error);
        showToast('Error filtering guests', 'error');
    }
}

