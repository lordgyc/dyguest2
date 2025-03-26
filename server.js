const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const express = require('express');
const cors = require('cors');

// Create Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Create a new database connection
const db = new sqlite3.Database(path.join(__dirname, 'database.sqlite'), (err) => {
    if (err) {
        console.error('Error connecting to the database:', err.message);
    } else {
        console.log('Successfully connected to the SQLite database.');
        
        // Create tables after successful connection
        createTables();
        
        // Add sample data if not already present
        addSampleData();
    }
});

// Function to create all the required tables
function createTables() {
    // Guest Category table
    db.run(`CREATE TABLE IF NOT EXISTS guest_category (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        description TEXT
    )`, handleError);

    // Guest table
    db.run(`CREATE TABLE IF NOT EXISTS guest (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        phone TEXT,
        email TEXT,
        address TEXT,
        category_id INTEGER,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (category_id) REFERENCES guest_category(id)
    )`, handleError);

    // Meal Category table
    db.run(`CREATE TABLE IF NOT EXISTS meal_category (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        description TEXT
    )`, handleError);

    // Meal Subcategory table
    db.run(`CREATE TABLE IF NOT EXISTS meal_subcategory (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        description TEXT,
        category_id INTEGER,
        FOREIGN KEY (category_id) REFERENCES meal_category(id)
    )`, handleError);

    // Meal table
    db.run(`CREATE TABLE IF NOT EXISTS meal (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        description TEXT,
        price REAL NOT NULL,
        subcategory_id INTEGER,
        FOREIGN KEY (subcategory_id) REFERENCES meal_subcategory(id)
    )`, handleError);

    // Credit table (for tracking credits given to guests)
    db.run(`CREATE TABLE IF NOT EXISTS credit (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        guest_id INTEGER NOT NULL,
        amount REAL NOT NULL,
        date_credited DATETIME DEFAULT CURRENT_TIMESTAMP,
        note TEXT,
        FOREIGN KEY (guest_id) REFERENCES guest(id)
    )`, handleError);

    // Credit_Meal junction table (for tracking which meals are part of a credit)
    db.run(`CREATE TABLE IF NOT EXISTS credit_meal (
        credit_id INTEGER,
        meal_id INTEGER,
        price REAL NOT NULL,
        quantity INTEGER NOT NULL DEFAULT 1,
        PRIMARY KEY (credit_id, meal_id),
        FOREIGN KEY (credit_id) REFERENCES credit (id) ON DELETE CASCADE,
        FOREIGN KEY (meal_id) REFERENCES meal (id) ON DELETE CASCADE
    )`, handleError);

    // Paid Credits table (for tracking when credits are used/paid)
    db.run(`CREATE TABLE IF NOT EXISTS paid_credits (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        credit_id INTEGER NOT NULL,
        amount_used REAL NOT NULL,
        date_used DATETIME DEFAULT CURRENT_TIMESTAMP,
        meal_id INTEGER,
        note TEXT,
        FOREIGN KEY (credit_id) REFERENCES credit(id),
        FOREIGN KEY (meal_id) REFERENCES meal(id)
    )`, handleError);

    // Paid Credit Meals junction table (for tracking which meals are part of a paid credit)
    db.run(`CREATE TABLE IF NOT EXISTS paid_credit_meals (
        paid_credit_id INTEGER,
        meal_id INTEGER,
        price REAL NOT NULL,
        quantity INTEGER NOT NULL DEFAULT 1,
        PRIMARY KEY (paid_credit_id, meal_id),
        FOREIGN KEY (paid_credit_id) REFERENCES paid_credits(id) ON DELETE CASCADE,
        FOREIGN KEY (meal_id) REFERENCES meal(id) ON DELETE CASCADE
    )`, handleError);
    
    console.log('All tables created successfully or already exist.');
}

// Error handler function
function handleError(err) {
    if (err) {
        console.error('Error creating table:', err.message);
    }
}

// Function to add sample data if not already present
async function addSampleData() {
    console.log('Checking for sample data...');
    
    // Check if data already exists to avoid duplicates
    db.get('SELECT COUNT(*) as count FROM guest_category', [], (err, result) => {
        if (err) {
            console.error('Error checking for existing data:', err.message);
            return;
        }
        
        // Only add sample data if no categories exist
        if (result.count === 0) {
            console.log('No sample data found. Adding sample data...');
            
            // Add guest categories
            const guestCategories = [
                { name: 'VIP', description: 'Very Important Persons' },
                { name: 'Regular', description: 'Regular customers' },
                { name: 'New', description: 'First-time guests' }
            ];
            
            // Add meal categories
            const mealCategories = [
                { name: 'Breakfast', description: 'Morning meals' },
                { name: 'Lunch', description: 'Midday meals' },
                { name: 'Dinner', description: 'Evening meals' },
                { name: 'Desserts', description: 'Sweet treats' },
                { name: 'Beverages', description: 'Drinks' }
            ];
            
            // Add sample guests
            const guests = [
                { name: 'John Smith', phone: '555-123-4567', email: 'john@example.com', address: '123 Main St', category_id: 1 },
                { name: 'Jane Doe', phone: '555-987-6543', email: 'jane@example.com', address: '456 Oak Ave', category_id: 1 },
                { name: 'Bob Johnson', phone: '555-456-7890', email: 'bob@example.com', address: '789 Pine Rd', category_id: 2 },
                { name: 'Alice Williams', phone: '555-567-8901', email: 'alice@example.com', address: '101 Maple Dr', category_id: 2 },
                { name: 'Charlie Brown', phone: '555-234-5678', email: 'charlie@example.com', address: '202 Cedar Ln', category_id: 3 }
            ];
            
            // Insert guest categories
            db.serialize(() => {
                const categoryStmt = db.prepare('INSERT INTO guest_category (name, description) VALUES (?, ?)');
                guestCategories.forEach(category => {
                    categoryStmt.run([category.name, category.description]);
                });
                categoryStmt.finalize();
                
                // Insert meal categories
                const mealCategoryStmt = db.prepare('INSERT INTO meal_category (name, description) VALUES (?, ?)');
                mealCategories.forEach(category => {
                    mealCategoryStmt.run([category.name, category.description]);
                });
                mealCategoryStmt.finalize();
                
                // Add meal subcategories
                const mealSubcategories = [
                    { name: 'Continental', description: 'Light breakfast items', category_id: 1 },
                    { name: 'American', description: 'Hearty breakfast', category_id: 1 },
                    { name: 'Sandwiches', description: 'Lunch sandwiches', category_id: 2 },
                    { name: 'Salads', description: 'Fresh salads', category_id: 2 },
                    { name: 'Appetizers', description: 'Starters', category_id: 3 },
                    { name: 'Main Course', description: 'Main dinner dishes', category_id: 3 },
                    { name: 'Cakes', description: 'Sweet cakes', category_id: 4 },
                    { name: 'Ice Cream', description: 'Cold treats', category_id: 4 },
                    { name: 'Hot Drinks', description: 'Coffee and tea', category_id: 5 },
                    { name: 'Cold Drinks', description: 'Sodas and juices', category_id: 5 }
                ];
                
                const subcategoryStmt = db.prepare('INSERT INTO meal_subcategory (name, description, category_id) VALUES (?, ?, ?)');
                mealSubcategories.forEach(subcategory => {
                    subcategoryStmt.run([subcategory.name, subcategory.description, subcategory.category_id]);
                });
                subcategoryStmt.finalize();
                
                // Add sample meals
                const meals = [
                    // Breakfast - Continental
                    { name: 'Croissant', description: 'Buttery, flaky pastry', price: 3.50, subcategory_id: 1 },
                    { name: 'Fruit Platter', description: 'Assorted fresh fruits', price: 5.75, subcategory_id: 1 },
                    { name: 'Yogurt Parfait', description: 'Yogurt with granola and berries', price: 4.50, subcategory_id: 1 },
                    
                    // Breakfast - American
                    { name: 'Pancakes', description: 'Stack of fluffy pancakes with syrup', price: 7.99, subcategory_id: 2 },
                    { name: 'Breakfast Combo', description: 'Eggs, bacon, toast, and potatoes', price: 10.99, subcategory_id: 2 },
                    { name: 'Omelette', description: 'Three-egg omelette with cheese and vegetables', price: 9.50, subcategory_id: 2 },
                    
                    // Lunch - Sandwiches
                    { name: 'Club Sandwich', description: 'Triple-decker sandwich with turkey, bacon, and lettuce', price: 11.50, subcategory_id: 3 },
                    { name: 'BLT', description: 'Bacon, lettuce, and tomato sandwich', price: 8.75, subcategory_id: 3 },
                    { name: 'Grilled Cheese', description: 'Classic grilled cheese sandwich', price: 6.50, subcategory_id: 3 },
                    
                    // Lunch - Salads
                    { name: 'Caesar Salad', description: 'Romaine lettuce with Caesar dressing and croutons', price: 9.99, subcategory_id: 4 },
                    { name: 'Greek Salad', description: 'Mixed greens with feta, olives, and Greek dressing', price: 10.50, subcategory_id: 4 },
                    { name: 'Cobb Salad', description: 'Chopped salad with chicken, bacon, egg, and avocado', price: 12.99, subcategory_id: 4 },
                    
                    // Dinner - Appetizers
                    { name: 'Mozzarella Sticks', description: 'Breaded and fried mozzarella with marinara sauce', price: 7.99, subcategory_id: 5 },
                    { name: 'Chicken Wings', description: 'Buffalo wings with dipping sauce', price: 9.99, subcategory_id: 5 },
                    { name: 'Spinach Dip', description: 'Creamy spinach and artichoke dip with chips', price: 8.50, subcategory_id: 5 },
                    
                    // Dinner - Main Course
                    { name: 'Grilled Salmon', description: 'Grilled salmon fillet with vegetables', price: 16.99, subcategory_id: 6 },
                    { name: 'Steak', description: '8oz sirloin steak with mashed potatoes', price: 19.99, subcategory_id: 6 },
                    { name: 'Pasta Alfredo', description: 'Fettuccine with creamy Alfredo sauce', price: 13.50, subcategory_id: 6 },
                    
                    // Desserts - Cakes
                    { name: 'Chocolate Cake', description: 'Rich chocolate layer cake', price: 5.99, subcategory_id: 7 },
                    { name: 'Cheesecake', description: 'New York style cheesecake', price: 6.50, subcategory_id: 7 },
                    { name: 'Carrot Cake', description: 'Spiced carrot cake with cream cheese frosting', price: 5.75, subcategory_id: 7 },
                    
                    // Desserts - Ice Cream
                    { name: 'Ice Cream Sundae', description: 'Vanilla ice cream with toppings', price: 4.99, subcategory_id: 8 },
                    { name: 'Milkshake', description: 'Thick and creamy milkshake', price: 4.50, subcategory_id: 8 },
                    { name: 'Sorbet', description: 'Fruit sorbet', price: 3.99, subcategory_id: 8 },
                    
                    // Beverages - Hot Drinks
                    { name: 'Coffee', description: 'Freshly brewed coffee', price: 2.50, subcategory_id: 9 },
                    { name: 'Tea', description: 'Assorted teas', price: 2.25, subcategory_id: 9 },
                    { name: 'Hot Chocolate', description: 'Rich hot chocolate with whipped cream', price: 3.25, subcategory_id: 9 },
                    
                    // Beverages - Cold Drinks
                    { name: 'Iced Tea', description: 'Sweetened or unsweetened iced tea', price: 2.50, subcategory_id: 10 },
                    { name: 'Soda', description: 'Assorted soft drinks', price: 2.00, subcategory_id: 10 },
                    { name: 'Lemonade', description: 'Fresh-squeezed lemonade', price: 3.00, subcategory_id: 10 }
                ];
                
                const mealStmt = db.prepare('INSERT INTO meal (name, description, price, subcategory_id) VALUES (?, ?, ?, ?)');
                meals.forEach(meal => {
                    mealStmt.run([meal.name, meal.description, meal.price, meal.subcategory_id]);
                });
                mealStmt.finalize();
                
                // Insert guests
                const guestStmt = db.prepare('INSERT INTO guest (name, phone, email, address, category_id) VALUES (?, ?, ?, ?, ?)');
                guests.forEach(guest => {
                    guestStmt.run([guest.name, guest.phone, guest.email, guest.address, guest.category_id]);
                });
                guestStmt.finalize();
                
                console.log('Sample data added successfully.');
            });
        } else {
            console.log('Sample data already exists.');
        }
    });
}

// API ENDPOINTS FOR GUEST CATEGORIES
// Get all categories
app.get('/api/guest-categories', (req, res) => {
    db.all('SELECT * FROM guest_category ORDER BY name', [], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(rows);
    });
});

// Add new category
app.post('/api/guest-categories', (req, res) => {
    const { name, description } = req.body;
    
    if (!name) {
        res.status(400).json({ error: "Category name is required" });
        return;
    }
    
    db.run(
        'INSERT INTO guest_category (name, description) VALUES (?, ?)',
        [name, description || ''],
        function(err) {
            if (err) {
                res.status(500).json({ error: err.message });
                return;
            }
            
            res.json({
                id: this.lastID,
                name,
                description,
                message: "Category added successfully"
            });
        }
    );
});

// Update category
app.put('/api/guest-categories/:id', (req, res) => {
    const { id } = req.params;
    const { name, description } = req.body;
    
    if (!name) {
        res.status(400).json({ error: "Category name is required" });
        return;
    }
    
    db.run(
        'UPDATE guest_category SET name = ?, description = ? WHERE id = ?',
        [name, description || '', id],
        function(err) {
            if (err) {
                res.status(500).json({ error: err.message });
                return;
            }
            
            if (this.changes === 0) {
                res.status(404).json({ error: "Category not found" });
                return;
            }
            
            res.json({
                id,
                name,
                description,
                message: "Category updated successfully"
            });
        }
    );
});

// Delete category
app.delete('/api/guest-categories/:id', (req, res) => {
    const { id } = req.params;
    
    // First check if there are guests using this category
    db.get('SELECT COUNT(*) as count FROM guest WHERE category_id = ?', [id], (err, result) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        
        if (result.count > 0) {
            res.status(400).json({ 
                error: "Cannot delete category: there are guests assigned to this category",
                count: result.count
            });
            return;
        }
        
        // If no guests use this category, proceed with deletion
        db.run('DELETE FROM guest_category WHERE id = ?', [id], function(err) {
            if (err) {
                res.status(500).json({ error: err.message });
                return;
            }
            
            if (this.changes === 0) {
                res.status(404).json({ error: "Category not found" });
                return;
            }
            
            res.json({ message: "Category deleted successfully" });
        });
    });
});

// API ENDPOINTS FOR GUESTS
// Get all guests
app.get('/api/guests', (req, res) => {
    const { search } = req.query;
    let sql = `SELECT g.*, gc.name as category_name 
               FROM guest g
               LEFT JOIN guest_category gc ON g.category_id = gc.id`;
    const params = [];

    if (search) {
        sql += ` WHERE g.name LIKE ?`;
        params.push(`%${search}%`);
    }

    sql += ` ORDER BY g.name`;

    db.all(sql, params, (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(rows);
    });
});

// Get guests by category
app.get('/api/guests/category/:id', (req, res) => {
    const { id } = req.params;
    
    db.all(
        `SELECT g.*, gc.name as category_name 
         FROM guest g
         LEFT JOIN guest_category gc ON g.category_id = gc.id
         WHERE g.category_id = ?
         ORDER BY g.name`,
        [id], 
        (err, rows) => {
            if (err) {
                res.status(500).json({ error: err.message });
                return;
            }
            res.json(rows);
        }
    );
});

// Add new guest
app.post('/api/guests', (req, res) => {
    const { name, phone, email, address, category_id } = req.body;
    
    if (!name) {
        res.status(400).json({ error: "Guest name is required" });
        return;
    }
    
    db.run(
        'INSERT INTO guest (name, phone, email, address, category_id) VALUES (?, ?, ?, ?, ?)',
        [name, phone || '', email || '', address || '', category_id || null],
        function(err) {
            if (err) {
                res.status(500).json({ error: err.message });
                return;
            }
            
            res.json({
                id: this.lastID,
                name,
                phone,
                email,
                address,
                category_id,
                message: "Guest added successfully"
            });
        }
    );
});

// Update guest
app.put('/api/guests/:id', (req, res) => {
    const { id } = req.params;
    const { name, phone, email, address, category_id } = req.body;
    
    if (!name) {
        res.status(400).json({ error: "Guest name is required" });
        return;
    }
    
    db.run(
        'UPDATE guest SET name = ?, phone = ?, email = ?, address = ?, category_id = ? WHERE id = ?',
        [name, phone || '', email || '', address || '', category_id || null, id],
        function(err) {
            if (err) {
                res.status(500).json({ error: err.message });
                return;
            }
            
            if (this.changes === 0) {
                res.status(404).json({ error: "Guest not found" });
                return;
            }
            
            res.json({
                id,
                name,
                phone,
                email,
                address,
                category_id,
                message: "Guest updated successfully"
            });
        }
    );
});

// Delete guest
app.delete('/api/guests/:id', (req, res) => {
    const { id } = req.params;
    
    // Check if this guest has credits first
    db.get('SELECT COUNT(*) as count FROM credit WHERE guest_id = ?', [id], (err, result) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        
        if (result.count > 0) {
            res.status(400).json({ 
                error: "Cannot delete guest: this guest has existing credits",
                count: result.count
            });
            return;
        }
        
        // If no credits, proceed with deletion
        db.run('DELETE FROM guest WHERE id = ?', [id], function(err) {
            if (err) {
                res.status(500).json({ error: err.message });
                return;
            }
            
            if (this.changes === 0) {
                res.status(404).json({ error: "Guest not found" });
                return;
            }
            
            res.json({ message: "Guest deleted successfully" });
        });
    });
});

// Get a specific guest by ID
app.get('/api/guests/:id', (req, res) => {
    const { id } = req.params;
    
    db.get(
        `SELECT g.*, gc.name as category_name 
         FROM guest g
         LEFT JOIN guest_category gc ON g.category_id = gc.id
         WHERE g.id = ?`,
        [id],
        (err, guest) => {
            if (err) {
                res.status(500).json({ error: err.message });
                return;
            }
            
            if (!guest) {
                res.status(404).json({ error: "Guest not found" });
                return;
            }
            
            res.json(guest);
        }
    );
});

// API ENDPOINTS FOR MEALS
// Get all meals
app.get('/api/meals', (req, res) => {
    db.all('SELECT * FROM meal ORDER BY name', [], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(rows);
    });
});

// Get meals by category
app.get('/api/meals/category/:id', (req, res) => {
    const { id } = req.params;
    
    db.all(
        `SELECT m.*, ms.name as subcategory_name 
         FROM meal m
         LEFT JOIN meal_subcategory ms ON m.subcategory_id = ms.id
         WHERE ms.category_id = ?
         ORDER BY m.name`,
        [id], 
        (err, rows) => {
            if (err) {
                res.status(500).json({ error: err.message });
                return;
            }
            res.json(rows);
        }
    );
});

// Get meals by subcategory
app.get('/api/meals/subcategory/:id', (req, res) => {
    const { id } = req.params;
    
    db.all(
        `SELECT m.*, ms.name as subcategory_name 
         FROM meal m
         LEFT JOIN meal_subcategory ms ON m.subcategory_id = ms.id
         WHERE m.subcategory_id = ?
         ORDER BY m.name`,
        [id], 
        (err, rows) => {
            if (err) {
                res.status(500).json({ error: err.message });
                return;
            }
            res.json(rows);
        }
    );
});

// Add new meal
app.post('/api/meals', (req, res) => {
    const { name, description, price, subcategory_id } = req.body;
    
    if (!name) {
        res.status(400).json({ error: "Meal name is required" });
        return;
    }
    
    db.run(
        'INSERT INTO meal (name, description, price, subcategory_id) VALUES (?, ?, ?, ?)',
        [name, description || '', price || 0, subcategory_id || null],
        function(err) {
            if (err) {
                res.status(500).json({ error: err.message });
                return;
            }
            
            res.json({
                id: this.lastID,
                name,
                description,
                price,
                subcategory_id,
                message: "Meal added successfully"
            });
        }
    );
});

// Update meal
app.put('/api/meals/:id', (req, res) => {
    const { id } = req.params;
    const { name, description, price, subcategory_id } = req.body;
    
    if (!name) {
        res.status(400).json({ error: "Meal name is required" });
        return;
    }
    
    db.run(
        'UPDATE meal SET name = ?, description = ?, price = ?, subcategory_id = ? WHERE id = ?',
        [name, description || '', price || 0, subcategory_id || null, id],
        function(err) {
            if (err) {
                res.status(500).json({ error: err.message });
                return;
            }
            
            if (this.changes === 0) {
                res.status(404).json({ error: "Meal not found" });
                return;
            }
            
            res.json({
                id,
                name,
                description,
                price,
                subcategory_id,
                message: "Meal updated successfully"
            });
        }
    );
});

// Quick update meal price
app.patch('/api/meals/:id/price', (req, res) => {
    const { id } = req.params;
    const { price } = req.body;
    
    if (price === undefined || price === null) {
        res.status(400).json({ error: "Price is required" });
        return;
    }
    
    db.run(
        'UPDATE meal SET price = ? WHERE id = ?',
        [price, id],
        function(err) {
            if (err) {
                res.status(500).json({ error: err.message });
                return;
            }
            
            if (this.changes === 0) {
                res.status(404).json({ error: "Meal not found" });
                return;
            }
            
            res.json({
                id,
                price,
                message: "Meal price updated successfully"
            });
        }
    );
});

// Delete meal
app.delete('/api/meals/:id', (req, res) => {
    const { id } = req.params;
    
    // Check if this meal is referenced in credit_meal junction table first
    db.get('SELECT COUNT(*) as count FROM credit_meal WHERE meal_id = ?', [id], (err, result) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        
        if (result.count > 0) {
            res.status(400).json({ 
                error: "Cannot delete meal: this meal is referenced in credits",
                count: result.count
            });
            return;
        }
        
        // If no credits use this meal, check paid_credit_meals junction table
        db.get('SELECT COUNT(*) as count FROM paid_credit_meals WHERE meal_id = ?', [id], (err, result) => {
            if (err) {
                res.status(500).json({ error: err.message });
                return;
            }
            
            if (result.count > 0) {
                res.status(400).json({ 
                    error: "Cannot delete meal: this meal is referenced in paid credits",
                    count: result.count
                });
                return;
            }
            
            // If no references, proceed with deletion
            db.run('DELETE FROM meal WHERE id = ?', [id], function(err) {
                if (err) {
                    res.status(500).json({ error: err.message });
                    return;
                }
                
                if (this.changes === 0) {
                    res.status(404).json({ error: "Meal not found" });
                    return;
                }
                
                res.json({ message: "Meal deleted successfully" });
            });
        });
    });
});

// Bulk update meal prices
app.post('/api/meals/bulk-price-update', (req, res) => {
    const { 
        update_type, // 'percentage' or 'fixed'
        value, // number
        operation, // 'increase' or 'decrease'
        filter, // 'all', 'category', 'subcategory' or 'selected'
        categoryId, // optional
        subcategoryId, // optional
        mealIds // optional array of meal IDs when filter is 'selected'
    } = req.body;
    
    if (!update_type || !value || !operation || !filter) {
        res.status(400).json({ error: "Missing required parameters" });
        return;
    }
    
    // Build the SQL query based on the filter
    let sql, params = [];
    let sqlSelect = `SELECT id, price FROM meal`;
    
    if (filter === 'category') {
        if (!categoryId) {
            res.status(400).json({ error: "Category ID is required for category filter" });
            return;
        }
        
        sqlSelect += ` WHERE subcategory_id IN (SELECT id FROM meal_subcategory WHERE category_id = ?)`;
        params.push(categoryId);
    } else if (filter === 'subcategory') {
        if (!subcategoryId) {
            res.status(400).json({ error: "Subcategory ID is required for subcategory filter" });
            return;
        }
        
        sqlSelect += ` WHERE subcategory_id = ?`;
        params.push(subcategoryId);
    } else if (filter === 'selected') {
        if (!mealIds || !Array.isArray(mealIds) || mealIds.length === 0) {
            res.status(400).json({ error: "Meal IDs are required for selected filter" });
            return;
        }
        
        // Create placeholders for the IN clause
        const placeholders = mealIds.map(() => '?').join(',');
        sqlSelect += ` WHERE id IN (${placeholders})`;
        params = params.concat(mealIds);
    }
    
    // Get all affected meals first to calculate new prices
    db.all(sqlSelect, params, (err, meals) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        
        if (meals.length === 0) {
            res.status(400).json({ error: "No meals found matching the criteria" });
            return;
        }
        
        // Prepare the update operation
        let updatedCount = 0;
        const updateMeal = (index) => {
            if (index >= meals.length) {
                // All updates completed
                res.json({ 
                    message: `Successfully updated prices for ${updatedCount} meals`, 
                    count: updatedCount 
                });
                return;
            }
            
            const meal = meals[index];
            let newPrice;
            
            if (update_type === 'percentage') {
                const changeAmount = meal.price * (value / 100);
                newPrice = operation === 'increase' ? 
                    meal.price + changeAmount : 
                    meal.price - changeAmount;
            } else { // fixed
                newPrice = operation === 'increase' ? 
                    meal.price + value : 
                    meal.price - value;
            }
            
            // Ensure price doesn't go below zero
            newPrice = Math.max(0, newPrice);
            // Round to 2 decimal places
            newPrice = Math.round(newPrice * 100) / 100;
            
            db.run(
                'UPDATE meal SET price = ? WHERE id = ?',
                [newPrice, meal.id],
                function(err) {
                    if (!err && this.changes > 0) {
                        updatedCount++;
                    }
                    // Continue to next meal regardless of success/failure of current one
                    updateMeal(index + 1);
                }
            );
        };
        
        // Start the sequential updates
        updateMeal(0);
    });
});

// API ENDPOINTS FOR MEAL CATEGORIES
// Get all meal categories
app.get('/api/meal-categories', (req, res) => {
    db.all('SELECT * FROM meal_category ORDER BY name', [], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(rows);
    });
});

// Add new meal category
app.post('/api/meal-categories', (req, res) => {
    const { name, description } = req.body;
    
    if (!name) {
        res.status(400).json({ error: "Category name is required" });
        return;
    }
    
    db.run(
        'INSERT INTO meal_category (name, description) VALUES (?, ?)',
        [name, description || ''],
        function(err) {
            if (err) {
                res.status(500).json({ error: err.message });
                return;
            }
            
            res.json({
                id: this.lastID,
                name,
                description,
                message: "Meal category added successfully"
            });
        }
    );
});

// Update meal category
app.put('/api/meal-categories/:id', (req, res) => {
    const { id } = req.params;
    const { name, description } = req.body;
    
    if (!name) {
        res.status(400).json({ error: "Category name is required" });
        return;
    }
    
    db.run(
        'UPDATE meal_category SET name = ?, description = ? WHERE id = ?',
        [name, description || '', id],
        function(err) {
            if (err) {
                res.status(500).json({ error: err.message });
                return;
            }
            
            if (this.changes === 0) {
                res.status(404).json({ error: "Category not found" });
                return;
            }
            
            res.json({
                id,
                name,
                description,
                message: "Meal category updated successfully"
            });
        }
    );
});

// Delete meal category
app.delete('/api/meal-categories/:id', (req, res) => {
    const { id } = req.params;
    
    // First check if there are subcategories referencing this category
    db.get('SELECT COUNT(*) as count FROM meal_subcategory WHERE category_id = ?', [id], (err, result) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        
        if (result.count > 0) {
            res.status(400).json({ 
                error: "Cannot delete category: there are subcategories assigned to this category",
                count: result.count
            });
            return;
        }
        
        // If no subcategories use this category, proceed with deletion
        db.run('DELETE FROM meal_category WHERE id = ?', [id], function(err) {
            if (err) {
                res.status(500).json({ error: err.message });
                return;
            }
            
            if (this.changes === 0) {
                res.status(404).json({ error: "Category not found" });
                return;
            }
            
            res.json({ message: "Meal category deleted successfully" });
        });
    });
});

// API ENDPOINTS FOR MEAL SUBCATEGORIES
// Get all meal subcategories
app.get('/api/meal-subcategories', (req, res) => {
    db.all(
        `SELECT ms.*, mc.name as category_name 
         FROM meal_subcategory ms
         LEFT JOIN meal_category mc ON ms.category_id = mc.id
         ORDER BY ms.name`,
        [], 
        (err, rows) => {
            if (err) {
                res.status(500).json({ error: err.message });
                return;
            }
            res.json(rows);
        }
    );
});

// Get subcategories by category
app.get('/api/meal-subcategories/category/:id', (req, res) => {
    const { id } = req.params;
    
    db.all(
        `SELECT ms.*, mc.name as category_name 
         FROM meal_subcategory ms
         LEFT JOIN meal_category mc ON ms.category_id = mc.id
         WHERE ms.category_id = ?
         ORDER BY ms.name`,
        [id], 
        (err, rows) => {
            if (err) {
                res.status(500).json({ error: err.message });
                return;
            }
            res.json(rows);
        }
    );
});

// Add new meal subcategory
app.post('/api/meal-subcategories', (req, res) => {
    const { name, description, category_id } = req.body;
    
    if (!name) {
        res.status(400).json({ error: "Subcategory name is required" });
        return;
    }
    
    if (!category_id) {
        res.status(400).json({ error: "Parent category is required" });
        return;
    }
    
    db.run(
        'INSERT INTO meal_subcategory (name, description, category_id) VALUES (?, ?, ?)',
        [name, description || '', category_id],
        function(err) {
            if (err) {
                res.status(500).json({ error: err.message });
                return;
            }
            
            res.json({
                id: this.lastID,
                name,
                description,
                category_id,
                message: "Meal subcategory added successfully"
            });
        }
    );
});

// Update meal subcategory
app.put('/api/meal-subcategories/:id', (req, res) => {
    const { id } = req.params;
    const { name, description, category_id } = req.body;
    
    if (!name) {
        res.status(400).json({ error: "Subcategory name is required" });
        return;
    }
    
    if (!category_id) {
        res.status(400).json({ error: "Parent category is required" });
        return;
    }
    
    db.run(
        'UPDATE meal_subcategory SET name = ?, description = ?, category_id = ? WHERE id = ?',
        [name, description || '', category_id, id],
        function(err) {
            if (err) {
                res.status(500).json({ error: err.message });
                return;
            }
            
            if (this.changes === 0) {
                res.status(404).json({ error: "Subcategory not found" });
                return;
            }
            
            res.json({
                id,
                name,
                description,
                category_id,
                message: "Meal subcategory updated successfully"
            });
        }
    );
});

// Delete meal subcategory
app.delete('/api/meal-subcategories/:id', (req, res) => {
    const { id } = req.params;
    
    // First check if there are meals referencing this subcategory
    db.get('SELECT COUNT(*) as count FROM meal WHERE subcategory_id = ?', [id], (err, result) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        
        if (result.count > 0) {
            res.status(400).json({ 
                error: "Cannot delete subcategory: there are meals assigned to this subcategory",
                count: result.count
            });
            return;
        }
        
        // If no meals use this subcategory, proceed with deletion
        db.run('DELETE FROM meal_subcategory WHERE id = ?', [id], function(err) {
            if (err) {
                res.status(500).json({ error: err.message });
                return;
            }
            
            if (this.changes === 0) {
                res.status(404).json({ error: "Subcategory not found" });
                return;
            }
            
            res.json({ message: "Meal subcategory deleted successfully" });
        });
    });
});

// API ENDPOINTS FOR CREDITS
// Add new credit
app.post('/api/credits', (req, res) => {
    const { guest_id, date, note, total_amount, meals } = req.body;
    
    if (!guest_id || !date || !Array.isArray(meals) || meals.length === 0) {
        return res.status(400).json({ error: 'Missing required parameters' });
    }
    
    db.serialize(() => {
        db.run('BEGIN TRANSACTION');
        
        db.run(
            `INSERT INTO credit (guest_id, date_credited, amount, note)
             VALUES (?, ?, ?, ?)`,
            [guest_id, date, total_amount, note],
            function(err) {
                if (err) {
                    db.run('ROLLBACK');
                    return res.status(500).json({ error: err.message });
                }
                
                const creditId = this.lastID;
                const insertMealPromises = [];
                
                // Process meals and combine duplicate meals
                const mealMap = new Map();
                
                meals.forEach(meal => {
                    // Handle both object format and simple ID format
                    const mealId = typeof meal === 'object' ? meal.id : meal;
                    const mealPrice = typeof meal === 'object' ? meal.price : null;
                    const quantity = typeof meal === 'object' && meal.quantity ? meal.quantity : 1;
                    
                    if (mealMap.has(mealId)) {
                        // If this meal ID already exists, increment its quantity
                        const existingMeal = mealMap.get(mealId);
                        existingMeal.quantity += quantity;
                    } else {
                        // Otherwise, add it to the map
                        mealMap.set(mealId, {
                            id: mealId,
                            price: mealPrice,
                            quantity: quantity
                        });
                    }
                });
                
                // Insert each meal with its accumulated quantity
                mealMap.forEach(meal => {
                    const promise = new Promise((resolve, reject) => {
                        if (meal.price !== null) {
                            // Use provided price
                            db.run(
                                `INSERT INTO credit_meal (credit_id, meal_id, price, quantity)
                                 VALUES (?, ?, ?, ?)`,
                                [creditId, meal.id, meal.price, meal.quantity],
                                function(err) {
                                    if (err) reject(err);
                                    else resolve();
                                }
                            );
                        } else {
                            // Fetch current price from meals table
                            db.get(
                                'SELECT price FROM meal WHERE id = ?',
                                [meal.id],
                                function(err, row) {
                                    if (err) {
                                        reject(err);
                                        return;
                                    }
                                    
                                    if (!row) {
                                        reject(new Error(`Meal with ID ${meal.id} not found`));
                                        return;
                                    }
                                    
                                    db.run(
                                        `INSERT INTO credit_meal (credit_id, meal_id, price, quantity)
                                         VALUES (?, ?, ?, ?)`,
                                        [creditId, meal.id, row.price, meal.quantity],
                                        function(err) {
                                            if (err) reject(err);
                                            else resolve();
                                        }
                                    );
                                }
                            );
                        }
                    });
                    
                    insertMealPromises.push(promise);
                });
                
                Promise.all(insertMealPromises)
                    .then(() => {
                        db.run('COMMIT');
                        res.status(201).json({ 
                            id: creditId,
                            message: 'Credit added successfully' 
                        });
                    })
                    .catch(err => {
                        db.run('ROLLBACK');
                        res.status(500).json({ error: err.message });
                    });
            }
        );
    });
});

// Get all credits
app.get('/api/credits', (req, res) => {
    db.all(
        `SELECT c.*, g.name as guest_name
         FROM credit c
         JOIN guest g ON c.guest_id = g.id
         ORDER BY c.date_credited DESC`,
        [],
        (err, rows) => {
            if (err) {
                res.status(500).json({ error: err.message });
                return;
            }
            res.json(rows);
        }
    );
});

// Get credits for a specific guest
app.get('/api/credits/guest/:id', (req, res) => {
    const { id } = req.params;
    
    db.all(
        `SELECT c.*, g.name as guest_name
         FROM credit c
         JOIN guest g ON c.guest_id = g.id
         WHERE c.guest_id = ?
         ORDER BY c.date_credited DESC`,
        [id],
        (err, rows) => {
            if (err) {
                res.status(500).json({ error: err.message });
                return;
            }
            res.json(rows);
        }
    );
});

// Get meals for a specific credit
app.get('/api/credits/:id/meals', (req, res) => {
    const { id } = req.params;
    
    db.all(
        `SELECT m.id, m.name, m.description, m.subcategory_id, cm.price, 
                cm.quantity, ms.name as subcategory_name, mc.name as category_name
         FROM credit_meal cm
         JOIN meal m ON cm.meal_id = m.id
         LEFT JOIN meal_subcategory ms ON m.subcategory_id = ms.id
         LEFT JOIN meal_category mc ON ms.category_id = mc.id
         WHERE cm.credit_id = ?`,
        [id],
        (err, meals) => {
            if (err) {
                res.status(500).json({ error: err.message });
                return;
            }
            
            res.json(meals);
        }
    );
});

// Get details for a specific credit
app.get('/api/credits/:id', (req, res) => {
    const { id } = req.params;
    
    db.get(
        `SELECT c.*, g.name as guest_name, g.phone as guest_phone, g.email as guest_email
         FROM credit c
         JOIN guest g ON c.guest_id = g.id
         WHERE c.id = ?`,
        [id],
        (err, credit) => {
            if (err) {
                res.status(500).json({ error: err.message });
                return;
            }
            
            if (!credit) {
                res.status(404).json({ error: "Credit not found" });
                return;
            }
            
            res.json(credit);
        }
    );
});

// Delete a credit
app.delete('/api/credits/:id', (req, res) => {
    const { id } = req.params;
    
    db.serialize(() => {
        db.run('BEGIN TRANSACTION');
        
        // First delete from the junction table
        db.run('DELETE FROM credit_meal WHERE credit_id = ?', [id], function(err) {
            if (err) {
                db.run('ROLLBACK');
                res.status(500).json({ error: err.message });
                return;
            }
            
            // Now delete the credit itself
            db.run('DELETE FROM credit WHERE id = ?', [id], function(err) {
                if (err) {
                    db.run('ROLLBACK');
                    res.status(500).json({ error: err.message });
                    return;
                }
                
                if (this.changes === 0) {
                    db.run('ROLLBACK');
                    res.status(404).json({ error: "Credit not found" });
                    return;
                }
                
                db.run('COMMIT', function(err) {
                    if (err) {
                        db.run('ROLLBACK');
                        res.status(500).json({ error: "Failed to commit transaction" });
                        return;
                    }
                    
                    res.json({ message: "Credit deleted successfully" });
                });
            });
        });
    });
});

// Get a credit with its meals
app.get('/api/credits/:id/with-meals', (req, res) => {
    const { id } = req.params;
    
    db.get(
        `SELECT c.*, g.name as guest_name, g.phone as guest_phone, g.email as guest_email
         FROM credit c
         JOIN guest g ON c.guest_id = g.id
         WHERE c.id = ?`,
        [id],
        (err, credit) => {
            if (err) {
                res.status(500).json({ error: err.message });
                return;
            }
            
            if (!credit) {
                res.status(404).json({ error: "Credit not found" });
                return;
            }
            
            // Now fetch the meals for this credit with their stored prices and quantities
            db.all(
                `SELECT m.id, m.name, m.description, m.subcategory_id, cm.price, 
                        cm.quantity, ms.name as subcategory_name, mc.name as category_name
                 FROM credit_meal cm
                 JOIN meal m ON cm.meal_id = m.id
                 LEFT JOIN meal_subcategory ms ON m.subcategory_id = ms.id
                 LEFT JOIN meal_category mc ON ms.category_id = mc.id
                 WHERE cm.credit_id = ?`,
                [id],
                (err, creditMeals) => {
                    if (err) {
                        res.status(500).json({ error: err.message });
                        return;
                    }
                    
                    credit.meals = creditMeals;
                    res.json(credit);
                }
            );
        }
    );
});

// Enhanced API endpoint to mark multiple credits as paid
app.post('/api/credits/mark-multiple-paid', (req, res) => {
    const { credit_ids, date_paid } = req.body;
    
    if (!credit_ids || !Array.isArray(credit_ids) || credit_ids.length === 0) {
        return res.status(400).json({ error: "No credit IDs provided" });
    }
    
    // Default to current date if no date provided
    const paidDate = date_paid || new Date().toISOString().split('T')[0];
    
    db.serialize(() => {
        db.run('BEGIN TRANSACTION');
        
        // Process credits in batches of 10
        processCreditBatches(credit_ids, 10, paidDate, (processedCount, errors) => {
            if (errors.length > 0) {
                db.run('ROLLBACK');
                return res.status(500).json({ 
                    error: `Errors occurred while processing credits: ${errors.join(', ')}` 
                });
            }
            
            db.run('COMMIT', function(err) {
                if (err) {
                    db.run('ROLLBACK');
                    return res.status(500).json({ error: "Failed to commit transaction" });
                }
                
                res.status(200).json({ 
                    message: "Credits marked as paid successfully",
                    processed: processedCount
                });
            });
        });
    });
});

// Get paid credits for a specific guest
app.get('/api/paid-credits/guest/:id', (req, res) => {
    const { id } = req.params;
    
    db.all(
        `SELECT pc.*, c.guest_id, c.date_credited, c.note, c.amount, g.name as guest_name
         FROM paid_credits pc
         JOIN credit c ON pc.credit_id = c.id
         JOIN guest g ON c.guest_id = g.id
         WHERE c.guest_id = ?
         ORDER BY pc.date_used DESC`,
        [id],
        (err, rows) => {
            if (err) {
                res.status(500).json({ error: err.message });
                return;
            }
            res.json(rows);
        }
    );
});

// Add a server status endpoint for health checks
app.get('/api/status', (req, res) => {
    res.json({ status: 'ok', message: 'Server is running' });
});

// Add this endpoint for getting a single meal by ID
app.get('/api/meals/:id', (req, res) => {
    const { id } = req.params;
    
    db.get(
        `SELECT m.*, ms.name as subcategory_name, ms.category_id, mc.name as category_name
         FROM meal m
         LEFT JOIN meal_subcategory ms ON m.subcategory_id = ms.id
         LEFT JOIN meal_category mc ON ms.category_id = mc.id
         WHERE m.id = ?`,
        [id],
        (err, meal) => {
            if (err) {
                res.status(500).json({ error: err.message });
                return;
            }
            
            if (!meal) {
                res.status(404).json({ error: "Meal not found" });
                return;
            }
            
            res.json(meal);
        }
    );
});

// Get all guests who have paid credits
app.get('/api/guests-with-paid-credits', (req, res) => {
    const { category } = req.query;
    
    let sql = `
        SELECT g.*, gc.name as category_name,
               COUNT(DISTINCT pc.id) as paid_credits_count,
               SUM(pc.amount_used) as paid_credits_amount
        FROM guest g
        LEFT JOIN guest_category gc ON g.category_id = gc.id
        JOIN credit c ON g.id = c.guest_id
        JOIN paid_credits pc ON c.id = pc.credit_id
    `;
    
    const params = [];
    
    if (category && category !== 'all') {
        sql += ` WHERE g.category_id = ?`;
        params.push(category);
    }
    
    sql += `
        GROUP BY g.id
        HAVING COUNT(DISTINCT pc.id) > 0
        ORDER BY g.name
    `;
    
    db.all(sql, params, (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(rows);
    });
});

// Get details for a specific paid credit with its meals
app.get('/api/paid-credits/:id', (req, res) => {
    const { id } = req.params;
    
    db.get(
        `SELECT pc.*, c.guest_id, c.date_credited, c.note, c.amount, g.name as guest_name
         FROM paid_credits pc
         JOIN credit c ON pc.credit_id = c.id
         JOIN guest g ON c.guest_id = g.id
         WHERE pc.id = ?`,
        [id],
        (err, paidCredit) => {
            if (err) {
                res.status(500).json({ error: err.message });
                return;
            }
            
            if (!paidCredit) {
                res.status(404).json({ error: "Paid credit not found" });
                return;
            }
            
            // Fetch the meals for this paid credit
            db.all(
                `SELECT m.id, m.name, m.description, m.subcategory_id, pcm.price, 
                        pcm.quantity, ms.name as subcategory_name, mc.name as category_name
                 FROM paid_credit_meals pcm
                 JOIN meal m ON pcm.meal_id = m.id
                 LEFT JOIN meal_subcategory ms ON m.subcategory_id = ms.id
                 LEFT JOIN meal_category mc ON ms.category_id = mc.id
                 WHERE pcm.paid_credit_id = ?`,
                [id],
                (err, meals) => {
                    if (err) {
                        res.status(500).json({ error: err.message });
                        return;
                    }
                    
                    paidCredit.meals = meals;
                    res.json(paidCredit);
                }
            );
        }
    );
});

// Check if a credit is already paid
app.get('/api/credits/:id/paid-status', (req, res) => {
    const { id } = req.params;
    
    db.get(
        `SELECT COUNT(*) as count 
         FROM paid_credits 
         WHERE credit_id = ?`,
        [id],
        (err, result) => {
            if (err) {
                res.status(500).json({ error: err.message });
                return;
            }
            
            res.json({
                is_paid: result.count > 0
            });
        }
    );
});

// Get paid details for a specific credit
app.get('/api/credits/:id/paid-details', (req, res) => {
    const { id } = req.params;
    
    db.get(
        `SELECT pc.* 
         FROM paid_credits pc
         WHERE pc.credit_id = ?`,
        [id],
        (err, result) => {
            if (err) {
                res.status(500).json({ error: err.message });
                return;
            }
            
            if (!result) {
                res.status(404).json({ error: "Paid credit details not found" });
                return;
            }
            
            res.json(result);
        }
    );
});

// Mark multiple credits as paid
app.post('/api/credits/mark-paid', (req, res) => {
    const { credit_ids, payment_date, note } = req.body;
    
    if (!credit_ids || !Array.isArray(credit_ids) || credit_ids.length === 0 || !payment_date) {
        return res.status(400).json({ error: 'Missing required parameters' });
    }
    
    // Start a transaction to ensure all operations succeed or fail together
    db.serialize(() => {
        db.run('BEGIN TRANSACTION');
        
        let success = true;
        let processed = 0;
        
        // Process each credit in the array
        credit_ids.forEach(creditId => {
            // Add record to paid_credits table
            db.get(
                'SELECT amount FROM credit WHERE id = ?',
                [creditId],
                (err, row) => {
                    if (err || !row) {
                        console.error(`Error fetching credit amount for ${creditId}:`, err);
                        success = false;
                        return;
                    }
                    
                    db.run(
                        'INSERT INTO paid_credits (credit_id, amount_used, date_used, note) VALUES (?, ?, ?, ?)',
                        [creditId, row.amount, payment_date, note || ''],
                        function(err) {
                            if (err) {
                                console.error(`Error inserting paid credit for ${creditId}:`, err);
                                success = false;
                                return;
                            }
                            
                            processed++;
                            
                            // If all credits have been processed, commit or rollback
                            if (processed === credit_ids.length) {
                                if (success) {
                                    db.run('COMMIT', err => {
                                        if (err) {
                                            console.error('Error committing transaction:', err);
                                            db.run('ROLLBACK');
                                            res.status(500).json({ error: 'Failed to commit transaction' });
                                        } else {
                                            res.json({
                                                message: `${credit_ids.length} credit(s) marked as paid successfully`,
                                                credits: credit_ids
                                            });
                                        }
                                    });
                                } else {
                                    db.run('ROLLBACK');
                                    res.status(500).json({ error: 'Failed to mark all credits as paid' });
                                }
                            }
                        }
                    );
                }
            );
        });
    });
});

// Helper function to process credits in batches
function processCreditBatches(creditIds, batchSize, paidDate, callback) {
    const batches = [];
    for (let i = 0; i < creditIds.length; i += batchSize) {
        batches.push(creditIds.slice(i, i + batchSize));
    }
    
    let processedCount = 0;
    const errors = [];
    
    const processBatch = (batchIndex) => {
        if (batchIndex >= batches.length) {
            // All batches processed
            callback(processedCount, errors);
            return;
        }
        
        const batch = batches[batchIndex];
        const batchPromises = [];
        
        batch.forEach(creditId => {
            const promise = new Promise((resolve, reject) => {
                // Process a single credit (similar to the existing code)
                db.get(
                    `SELECT c.*, g.name as guest_name
                     FROM credit c
                     JOIN guest g ON c.guest_id = g.id
                     WHERE c.id = ?`,
                    [creditId],
                    function(err, credit) {
                        if (err) {
                            reject({ creditId, error: err });
                            return;
                        }
                        
                        if (!credit) {
                            reject({ creditId, error: new Error("Credit not found") });
                            return;
                        }
                        
                        // Get the meals associated with this credit
                        db.all(
                            `SELECT * FROM credit_meal WHERE credit_id = ?`,
                            [creditId],
                            function(err, creditMeals) {
                                if (err) {
                                    reject({ creditId, error: err });
                                    return;
                                }
                                
                                // Insert into paid_credits table
                                db.run(
                                    `INSERT INTO paid_credits 
                                     (credit_id, amount_used, date_used)
                                     VALUES (?, ?, ?)`,
                                    [creditId, credit.amount, paidDate],
                                    function(err) {
                                        if (err) {
                                            reject({ creditId, error: err });
                                            return;
                                        }
                                        
                                        const paidCreditId = this.lastID;
                                        const mealPromises = [];
                                        
                                        // Now copy the meal data to paid_credit_meals
                                        creditMeals.forEach(meal => {
                                            const mealPromise = new Promise((mealResolve, mealReject) => {
                                                db.run(
                                                    `INSERT INTO paid_credit_meals 
                                                     (paid_credit_id, meal_id, price, quantity)
                                                     VALUES (?, ?, ?, ?)`,
                                                    [paidCreditId, meal.meal_id, meal.price, meal.quantity],
                                                    function(err) {
                                                        if (err) mealReject(err);
                                                        else mealResolve();
                                                    }
                                                );
                                            });
                                            
                                            mealPromises.push(mealPromise);
                                        });
                                        
                                        Promise.all(mealPromises)
                                            .then(() => {
                                                resolve({ creditId, success: true });
                                            })
                                            .catch(err => {
                                                reject({ creditId, error: err });
                                            });
                                    }
                                );
                            }
                        );
                    }
                );
            });
            
            batchPromises.push(promise);
        });
        
        Promise.all(batchPromises.map(p => p.catch(e => e)))
            .then(results => {
                results.forEach(result => {
                    if (result.success) {
                        processedCount++;
                    } else {
                        errors.push(`Error with credit #${result.creditId}: ${result.error.message}`);
                    }
                });
                
                // Process next batch
                processBatch(batchIndex + 1);
            });
    };
    
    // Start processing batches
    processBatch(0);
}

// Start Express server
let server;

function startServer() {
    return new Promise((resolve, reject) => {
        server = app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
            resolve(PORT);
        });
        
        server.on('error', (err) => {
            reject(err);
        });
    });
}

function stopServer() {
    return new Promise((resolve, reject) => {
        if (server) {
            server.close((err) => {
                if (err) {
                    reject(err);
                    return;
                }
                console.log('Server stopped');
                resolve();
            });
        } else {
            resolve();
        }
    });
}

// Export the database connection and server functions
module.exports = { db, startServer, stopServer };
