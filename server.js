const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { Pool } = require('pg');
const path = require('path');
const multer = require('multer');
const fs = require('fs');

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Create public and uploads directory if they don't exist
const publicDir = path.join(__dirname, 'public');
const uploadsDir = path.join(publicDir, 'uploads');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure CORS for all routes
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Middleware
app.use(bodyParser.json());

// Serve static files from the root directory and public directory
app.use(express.static(__dirname));
app.use('/public', express.static(path.join(__dirname, 'public')));

// Database configuration
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'ngo_management',
  password: 'YOUR_PASSWORD_HERE',
  port: 5432,
});

// Test database connection
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('Database connection error:', err);
  } else {
    console.log('Database connected successfully');
  }
});

// JWT Secret
const JWT_SECRET = process.env.JWT_SECRET || 'ngo-management-secure-jwt-token-key-2023';  // In production, use environment variables

// Authentication middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Authentication required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

// Multer configuration for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, 'public', 'uploads');
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Create unique filename with original extension
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, 'profile-' + Date.now() + '-' + uniqueSuffix + ext);
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    // Accept only images
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  }
});

// Helper function to get user data with domains
async function getUserDataWithDomains(userId) {
  // Get user details
  const userResult = await pool.query(`
    SELECT 
      id, name, email, role, phone, date_of_birth, 
      aadhaar_verified, profile_image, created_at as join_date
    FROM users 
    WHERE id = $1
  `, [userId]);

  if (userResult.rows.length === 0) {
    return null;
  }

  const user = userResult.rows[0];

  // Get user domains
  const domainsResult = await pool.query(
    'SELECT domain FROM user_domains WHERE user_id = $1',
    [userId]
  );
  
  user.domains = domainsResult.rows.map(row => row.domain);
  
  return user;
}

// Initialize database tables
async function initializeDatabase() {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    // Create users table
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(20) NOT NULL DEFAULT 'volunteer',
        phone VARCHAR(20),
        date_of_birth DATE,
        aadhaar_number VARCHAR(20),
        aadhaar_verified BOOLEAN DEFAULT FALSE,
        profile_image VARCHAR(255),
        active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Create user_domains table
    await client.query(`
      CREATE TABLE IF NOT EXISTS user_domains (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        domain VARCHAR(50) NOT NULL,
        UNIQUE(user_id, domain)
      )
    `);
    
    // Create tasks table
    await client.query(`
      CREATE TABLE IF NOT EXISTS tasks (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        domain VARCHAR(100),
        start_date DATE,
        due_date DATE,
        priority VARCHAR(50),
        status VARCHAR(50) DEFAULT 'pending',
        creator_id INTEGER REFERENCES users(id),
        assignee_id INTEGER REFERENCES users(id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Add updated_at column to tasks table if it doesn't exist
    try {
      // Check if the column exists
      const columnCheck = await client.query(`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = 'tasks' AND column_name = 'updated_at'
      `);
      
      // If column doesn't exist, add it
      if (columnCheck.rows.length === 0) {
        console.log('Adding updated_at column to tasks table');
        await client.query(`
          ALTER TABLE tasks 
          ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        `);
      }
    } catch (err) {
      console.error('Error checking/adding updated_at column:', err);
    }
    
    // Create events table
    await client.query(`
      CREATE TABLE IF NOT EXISTS events (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        event_date DATE NOT NULL,
        event_time TIME NOT NULL,
        location VARCHAR(255) NOT NULL,
        capacity INTEGER DEFAULT 10,
        organizer_id INTEGER REFERENCES users(id),
        created_by INTEGER REFERENCES users(id),
        event_type VARCHAR(50),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Check if organizer_id column exists in events table
    try {
      // Check if the column exists
      const columnCheck = await client.query(`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = 'events' AND column_name = 'organizer_id'
      `);
      
      // If column doesn't exist, add it
      if (columnCheck.rows.length === 0) {
        console.log('Adding organizer_id column to events table');
        await client.query(`
          ALTER TABLE events 
          ADD COLUMN organizer_id INTEGER REFERENCES users(id)
        `);
      }
    } catch (err) {
      console.error('Error checking/adding organizer_id column:', err);
    }
    
    // Check if created_by column exists in events table
    try {
      // Check if the column exists
      const columnCheck = await client.query(`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = 'events' AND column_name = 'created_by'
      `);
      
      // If column doesn't exist, add it
      if (columnCheck.rows.length === 0) {
        console.log('Adding created_by column to events table');
        await client.query(`
          ALTER TABLE events 
          ADD COLUMN created_by INTEGER REFERENCES users(id)
        `);
      }
    } catch (err) {
      console.error('Error checking/adding created_by column:', err);
    }
    
    // Create event_domains table
    await client.query(`
      CREATE TABLE IF NOT EXISTS event_domains (
        id SERIAL PRIMARY KEY,
        event_id INTEGER NOT NULL REFERENCES events(id) ON DELETE CASCADE,
        domain VARCHAR(50) NOT NULL,
        UNIQUE(event_id, domain)
      )
    `);
    
    // Create event_participants table
    await client.query(`
      CREATE TABLE IF NOT EXISTS event_participants (
        id SERIAL PRIMARY KEY,
        event_id INTEGER NOT NULL REFERENCES events(id) ON DELETE CASCADE,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        registered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(event_id, user_id)
      )
    `);
    
    // Create ideas table
    await client.query(`
      CREATE TABLE IF NOT EXISTS ideas (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT NOT NULL,
        type VARCHAR(50),
        submitter_id INTEGER NOT NULL REFERENCES users(id),
        status VARCHAR(20) DEFAULT 'pending',
        upvotes INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Create comments table
    await client.query(`
      CREATE TABLE IF NOT EXISTS comments (
        id SERIAL PRIMARY KEY,
        idea_id INTEGER NOT NULL REFERENCES ideas(id) ON DELETE CASCADE,
        user_id INTEGER NOT NULL REFERENCES users(id),
        content TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Create certificates table
    await client.query(`
      CREATE TABLE IF NOT EXISTS certificates (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        name VARCHAR(255) NOT NULL,
        issued_for VARCHAR(255) NOT NULL,
        issue_date DATE NOT NULL,
        file_path VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Insert admin user if it doesn't exist
    const adminExists = await client.query(
      'SELECT id FROM users WHERE email = $1',
      ['admin@example.com']
    );
    
    if (adminExists.rows.length === 0) {
      const hashedPassword = await bcrypt.hash('admin123', 10);
      await client.query(
        'INSERT INTO users (name, email, password, role, phone, date_of_birth) VALUES ($1, $2, $3, $4, $5, $6)',
        ['Admin User', 'admin@example.com', hashedPassword, 'admin', '+91 98765 43210', '1990-01-01']
      );
      
      // Get admin user id
      const adminResult = await client.query(
        'SELECT id FROM users WHERE email = $1',
        ['admin@example.com']
      );
      
      const adminId = adminResult.rows[0].id;
      
      // Add domains for admin
      await client.query(
        'INSERT INTO user_domains (user_id, domain) VALUES ($1, $2), ($1, $3), ($1, $4)',
        [adminId, 'technical', 'event_planning', 'on_ground']
      );
    }
    
    await client.query('COMMIT');
    console.log('Database tables created successfully');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error creating database tables:', err);
    throw err;
  } finally {
    client.release();
  }
}

// Initialize the database
initializeDatabase();

// API Routes

// Auth Routes
app.post('/api/auth/register', async (req, res) => {
  try {
    console.log('Registration request received:', req.body);
    const { name, email, password, phone, aadhaar_number, date_of_birth, domains } = req.body;

    // Validate required fields
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required' });
    }

    // Check if email already exists
    const emailCheck = await pool.query(
      'SELECT id FROM users WHERE email = $1',
      [email]
    );

    if (emailCheck.rows.length > 0) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Start transaction
    await pool.query('BEGIN');

    try {
      // Create new user
      const userResult = await pool.query(
        `INSERT INTO users (name, email, password, phone, aadhaar_number, date_of_birth)
         VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
        [name, email, hashedPassword, phone || null, aadhaar_number || null, date_of_birth || null]
      );
      
      const userId = userResult.rows[0].id;

      // Insert user domains
      if (domains && domains.length > 0) {
        for (const domain of domains) {
          await pool.query(
            'INSERT INTO user_domains (user_id, domain) VALUES ($1, $2)',
            [userId, domain]
          );
        }
      }

      // Commit transaction
      await pool.query('COMMIT');

      console.log('User registered successfully:', { id: userId, email });
      res.status(201).json({ message: 'Registration successful' });
    } catch (err) {
      // If any error occurs, rollback the transaction
      await pool.query('ROLLBACK');
      console.error('Error in registration transaction:', err);
      throw err; // Re-throw to be caught by outer catch
    }
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ message: 'Error during registration: ' + (err.message || 'Unknown error') });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    console.log('Login request received:', { email: req.body.email });
    const { email, password } = req.body;

    // Validate required fields
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    // Get user from database
    const result = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );

    if (result.rows.length === 0) {
      console.log('Login failed: User not found -', email);
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const user = result.rows[0];

    // Compare passwords
    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      console.log('Login failed: Invalid password -', email);
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Create JWT token
    const token = jwt.sign(
      { 
        id: user.id, 
        email: user.email, 
        role: user.role 
      }, 
      JWT_SECRET, 
      { expiresIn: '24h' }
    );

    console.log('Login successful:', { id: user.id, email: user.email, role: user.role });
    res.json({ token });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Error during login: ' + (err.message || 'Unknown error') });
  }
});

// User Routes
app.get('/api/users/me', authenticateToken, async (req, res) => {
  try {
    console.log('User me request received, user id:', req.user.id);
    
    // Get user details
    const userResult = await pool.query(`
      SELECT 
        id, name, email, role, phone, date_of_birth, aadhaar_number,
        aadhaar_verified, profile_image, created_at as join_date
      FROM users 
      WHERE id = $1
    `, [req.user.id]);

    if (userResult.rows.length === 0) {
      console.log('User not found for id:', req.user.id);
      return res.status(404).json({ message: 'User not found' });
    }

    const user = userResult.rows[0];
    console.log('User found:', user.id, user.email);

    // Get user domains
    const domainsResult = await pool.query(
      'SELECT domain FROM user_domains WHERE user_id = $1',
      [user.id]
    );
    user.domains = domainsResult.rows.map(row => row.domain);
    
    console.log('User domains:', user.domains);
    res.json(user);
  } catch (err) {
    console.error('Error fetching user data:', err);
    res.status(500).json({ message: 'Error fetching user data' });
  }
});

// Get user profile endpoint
app.get('/api/users/:id/profile', authenticateToken, async (req, res) => {
  try {
    const userId = parseInt(req.params.id);
    
    // Users can only access their own profile (except admins)
    if (req.user.id !== userId && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to access this profile' });
    }
    
    // Get user data
    const userResult = await pool.query(`
      SELECT 
        id, name, email, role, phone, date_of_birth, aadhaar_number,
        aadhaar_verified, profile_image, created_at as join_date
      FROM users
      WHERE id = $1
    `, [userId]);
    
    if (userResult.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    const userData = userResult.rows[0];
    
    // Get user domains
    const domainsResult = await pool.query(`
      SELECT domain
      FROM user_domains
      WHERE user_id = $1
    `, [userId]);
    
    userData.domains = domainsResult.rows.map(row => row.domain);
    
    // Get user certificates
    const certificatesResult = await pool.query(`
      SELECT id, name, issued_for, issue_date
      FROM certificates
      WHERE user_id = $1
    `, [userId]);
    
    userData.certificates = certificatesResult.rows;
    
    // Get user activity stats (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    
    // Sample activity data (in a real app, this would come from actual stats)
    // This is simplified for demonstration
    userData.activity = {
      months: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
      events: [1, 0, 2, 1, 0, 3],
      tasks: [3, 5, 2, 4, 6, 2]
    };
    
    res.json(userData);
  } catch (err) {
    console.error('Error fetching user profile:', err);
    res.status(500).json({ message: 'Error fetching user profile' });
  }
});

// Dashboard route
app.get('/api/dashboard', authenticateToken, async (req, res) => {
  try {
    // Check if user is admin
    const isAdmin = req.user.role === 'admin';

    // Get statistics based on user role
    const totalVolunteersResult = await pool.query(
      "SELECT COUNT(*) FROM users WHERE role = 'volunteer'"
    );
    
    const activeVolunteersResult = await pool.query(
      "SELECT COUNT(*) FROM users WHERE role = 'volunteer' AND active = true"
    );
    
    const upcomingEventsResult = await pool.query(
      "SELECT COUNT(*) FROM events WHERE event_date >= CURRENT_DATE"
    );

    let pendingTasksResult;
    if (isAdmin) {
      pendingTasksResult = await pool.query(
        "SELECT COUNT(*) FROM tasks WHERE status = 'pending'"
      );
    } else {
      pendingTasksResult = await pool.query(
        "SELECT COUNT(*) FROM tasks WHERE assignee_id = $1 AND status = 'pending'",
        [req.user.id]
      );
    }

    // Get domains distribution
    const domainsResult = await pool.query(`
      SELECT d.domain as name, COUNT(u.id) as count
      FROM user_domains d
      JOIN users u ON d.user_id = u.id
      WHERE u.role = 'volunteer'
      GROUP BY d.domain
      ORDER BY count DESC
      LIMIT 5
    `);

    // Get events activity for the last 6 months
    const eventsResult = await pool.query(`
      SELECT to_char(date_trunc('month', event_date), 'Mon') as month, COUNT(*) as count
      FROM events
      WHERE event_date >= CURRENT_DATE - INTERVAL '6 months'
      GROUP BY month
      ORDER BY month
    `);

    // Construct dashboard data
    const dashboardData = {
      totalVolunteers: parseInt(totalVolunteersResult.rows[0].count),
      activeVolunteers: parseInt(activeVolunteersResult.rows[0].count),
      upcomingEvents: parseInt(upcomingEventsResult.rows[0].count),
      pendingTasks: parseInt(pendingTasksResult.rows[0].count),
      activityData: {
        domains: domainsResult.rows,
        events: eventsResult.rows
      }
    };

    res.json(dashboardData);
  } catch (err) {
    console.error('Error fetching dashboard data:', err);
    res.status(500).json({ message: 'Error fetching dashboard data' });
  }
});

// Certificates route
app.get('/api/certificates/:id/download', authenticateToken, async (req, res) => {
  try {
    const certificateId = req.params.id;
    
    // Get certificate details
    const result = await pool.query(
      'SELECT * FROM certificates WHERE id = $1',
      [certificateId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Certificate not found' });
    }
    
    const certificate = result.rows[0];
    
    // Check if user is authorized to download (owner or admin)
    if (certificate.user_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to download this certificate' });
    }
    
    // In a real app, you would send the actual file
    // For this example, we'll just send a success message
    res.json({ message: 'Certificate download initiated', certificate });
  } catch (err) {
    console.error('Error downloading certificate:', err);
    res.status(500).json({ message: 'Error downloading certificate' });
  }
});

// Get all tasks (filtered by role)
app.get('/api/tasks', authenticateToken, async (req, res) => {
  try {
    const client = await pool.connect();
    try {
      // First check table structure
      const tableInfo = await client.query(`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = 'tasks'
      `);
      
      const columns = tableInfo.rows.map(row => row.column_name);
      console.log('Available columns in tasks table:', columns);
      
      // Determine creator column name (creator_id or created_by)
      const creatorColumn = columns.includes('creator_id') ? 'creator_id' : 
                            columns.includes('created_by') ? 'created_by' : null;
                            
      if (!creatorColumn) {
        throw new Error("Creator column not found in tasks table");
      }
      
      let query;
      const userId = req.user.id;
      const userRole = req.user.role;
      
      if (userRole === 'admin') {
        // Admins can see all tasks
        query = `
          SELECT t.*, 
                 u1.name as creator_name, 
                 u2.name as assignee_name
          FROM tasks t
          LEFT JOIN users u1 ON t.${creatorColumn} = u1.id
          LEFT JOIN users u2 ON t.assignee_id = u2.id
          ORDER BY t.due_date ASC
        `;
      } else {
        // Volunteers and members can only see their assigned tasks or tasks they created
        query = `
          SELECT t.*, 
                 u1.name as creator_name, 
                 u2.name as assignee_name
          FROM tasks t
          LEFT JOIN users u1 ON t.${creatorColumn} = u1.id
          LEFT JOIN users u2 ON t.assignee_id = u2.id
          WHERE t.assignee_id = $1 OR t.${creatorColumn} = $1
          ORDER BY t.due_date ASC
        `;
      }
      
      const result = userRole === 'admin' 
        ? await client.query(query)
        : await client.query(query, [userId]);
      
      res.json(result.rows);
    } finally {
      client.release();
    }
  } catch (err) {
    console.error('Error fetching tasks:', err);
    res.status(500).json({ message: 'Server error: ' + err.message });
  }
});

// Get single task details
app.get('/api/tasks/:id', authenticateToken, async (req, res) => {
  try {
    const taskId = req.params.id;
    const userId = req.user.id;
    const userRole = req.user.role;
    
    const result = await pool.query(
      `SELECT t.*, u.name as assignee_name
       FROM tasks t
       LEFT JOIN users u ON t.assignee_id = u.id
       WHERE t.id = $1`,
      [taskId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Task not found' });
    }
    
    const task = result.rows[0];
    
    // Only allow access if admin or task is assigned to user or matches their domain
    if (userRole !== 'admin' && task.assignee_id !== userId) {
      // Check if task domain matches user domain
      const domainsResult = await pool.query(
        'SELECT domain FROM user_domains WHERE user_id = $1 AND domain = $2',
        [userId, task.domain]
      );
      
      if (domainsResult.rows.length === 0) {
        return res.status(403).json({ message: 'Not authorized to view this task' });
      }
    }
    
    res.json(task);
  } catch (err) {
    console.error('Error fetching task:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update task status
app.put('/api/tasks/:id/status', authenticateToken, async (req, res) => {
  try {
    const taskId = req.params.id;
    const { status } = req.body;
    const userId = req.user.id;
    const userRole = req.user.role;
    
    // Validate status
    if (!status || !['pending', 'completed', 'cancelled'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }
    
    // Check if task exists and if user is authorized to update it
    const taskResult = await pool.query(
      'SELECT * FROM tasks WHERE id = $1',
      [taskId]
    );
    
    if (taskResult.rows.length === 0) {
      return res.status(404).json({ message: 'Task not found' });
    }
    
    const task = taskResult.rows[0];
    
    // Only allow update if admin or task is assigned to user
    if (userRole !== 'admin' && task.assignee_id !== userId) {
      return res.status(403).json({ message: 'Not authorized to update this task' });
    }
    
    // Update task status
    await pool.query(
      'UPDATE tasks SET status = $1, updated_at = NOW() WHERE id = $2',
      [status, taskId]
    );
    
    // Return success
    res.json({ 
      success: true, 
      message: `Task status updated to ${status}` 
    });
  } catch (err) {
    console.error('Error updating task status:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create new task
app.post('/api/tasks', authenticateToken, async (req, res) => {
  try {
    const {
      title,
      description,
      domain,
      priority,
      start_date,
      due_date,
      assignee_id
    } = req.body;
    
    console.log('Task creation request received:', req.body);
    
    const createdBy = req.user.id;
    
    // Validate required fields
    if (!title || !description || !domain || !priority || !start_date || !due_date) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    
    let finalAssigneeId = assignee_id;
    
    // If assignee is 'auto', find the best volunteer based on domain expertise and workload
    if (assignee_id === 'auto') {
      try {
        const domainVolunteersResult = await pool.query(
          `SELECT u.id, COUNT(t.id) as task_count
           FROM users u
           JOIN user_domains ud ON u.id = ud.user_id
           LEFT JOIN tasks t ON u.id = t.assignee_id AND t.status = 'pending'
           WHERE ud.domain = $1 AND u.role = 'volunteer'
           GROUP BY u.id
           ORDER BY task_count ASC
           LIMIT 1`,
          [domain]
        );
        
        if (domainVolunteersResult.rows.length > 0) {
          finalAssigneeId = domainVolunteersResult.rows[0].id;
          console.log('Found domain volunteer:', finalAssigneeId);
        } else {
          // If no domain match, just assign to any volunteer with least workload
          const anyVolunteerResult = await pool.query(
            `SELECT u.id, COUNT(t.id) as task_count
             FROM users u
             LEFT JOIN tasks t ON u.id = t.assignee_id AND t.status = 'pending'
             WHERE u.role = 'volunteer'
             GROUP BY u.id
             ORDER BY task_count ASC
             LIMIT 1`
          );
          
          if (anyVolunteerResult.rows.length > 0) {
            finalAssigneeId = anyVolunteerResult.rows[0].id;
            console.log('Found general volunteer:', finalAssigneeId);
          } else {
            finalAssigneeId = null; // No volunteers available
            console.log('No volunteers found, leaving task unassigned');
          }
        }
      } catch (err) {
        console.error('Error finding volunteer:', err);
        finalAssigneeId = null; // Just leave it unassigned in case of error
      }
    }
    
    // Get tasks table structure to determine column names
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');
      
      // Check tasks table structure
      const tableInfo = await client.query(`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = 'tasks'
      `);
      
      const columns = tableInfo.rows.map(row => row.column_name);
      console.log('Available columns in tasks table:', columns);
      
      // Determine creator column name (creator_id or created_by)
      const creatorColumn = columns.includes('creator_id') ? 'creator_id' : 
                          columns.includes('created_by') ? 'created_by' : null;
      
      if (!creatorColumn) {
        throw new Error("Creator column not found in tasks table");
      }
      
      // Build column list and values for insert
      const columnList = ['title', 'description', 'domain', 'priority', 'start_date', 'due_date', 'assignee_id', creatorColumn, 'status'];
      const values = [title, description, domain, priority, start_date, due_date, finalAssigneeId, createdBy, 'pending'];
      
      // Add updated_at if it exists
      if (columns.includes('updated_at')) {
        columnList.push('updated_at');
        values.push('NOW()');
      }
      
      // Build placeholders for query
      const placeholders = values.map((val, idx) => 
        val === 'NOW()' ? 'NOW()' : `$${idx + 1}`
      );
      
      // Build query
      const insertQuery = `
        INSERT INTO tasks (${columnList.join(', ')})
        VALUES (${placeholders.join(', ')})
        RETURNING id
      `;
      
      console.log('Insert query:', insertQuery);
      const result = await client.query(
        insertQuery,
        values.filter(val => val !== 'NOW()') // Remove NOW() from params as it's used directly
      );
      
      await client.query('COMMIT');
      
      console.log('Task created successfully:', result.rows[0]);
      
      res.status(201).json({ 
        id: result.rows[0].id,
        message: 'Task created successfully' 
      });
    } catch (insertErr) {
      await client.query('ROLLBACK');
      console.error('Error inserting task into database:', insertErr);
      return res.status(500).json({ message: 'Error creating task: ' + insertErr.message });
    } finally {
      client.release();
    }
  } catch (err) {
    console.error('Error creating task:', err);
    res.status(500).json({ message: 'Server error: ' + err.message });
  }
});

// Events routes
app.get('/api/events', authenticateToken, async (req, res) => {
  try {
    console.log('Fetching events for user:', req.user.id);
    
    // Use DISTINCT ON to ensure we get only one row per event
    const result = await pool.query(`
      SELECT DISTINCT ON (e.id) e.*, 
        (SELECT COUNT(*) FROM event_participants WHERE event_id = e.id) as participants_count,
        EXISTS(SELECT 1 FROM event_participants WHERE event_id = e.id AND user_id = $1) as is_registered
      FROM events e
      ORDER BY e.id, e.created_at DESC, e.event_date ASC
    `, [req.user.id]);
    
    console.log(`Found ${result.rows.length} distinct events`);
    
    // Get domains for each event
    const eventsWithDomains = [];
    const processedEventIds = new Set(); // Track processed events to prevent duplicates
    
    for (const event of result.rows) {
      // Skip if we've already processed this event ID
      if (processedEventIds.has(event.id)) {
        console.log(`Skipping duplicate event ID: ${event.id}`);
        continue;
      }
      
      // Mark this event as processed
      processedEventIds.add(event.id);
      
      // Get domains for this event
      const domainsResult = await pool.query(
        'SELECT domain FROM event_domains WHERE event_id = $1',
        [event.id]
      );
      
      event.domains = domainsResult.rows.map(row => row.domain);
      eventsWithDomains.push(event);
    }
    
    console.log(`Returning ${eventsWithDomains.length} events with domains`);
    res.json(eventsWithDomains);
  } catch (err) {
    console.error('Error fetching events:', err);
    res.status(500).json({ message: 'Error fetching events: ' + err.message });
  }
});

// Upcoming events endpoint
app.get('/api/events/upcoming', authenticateToken, async (req, res) => {
  try {
    console.log('Fetching upcoming events for user:', req.user.id);
    
    // Get events with date >= today
    const result = await pool.query(`
      SELECT DISTINCT ON (e.id) e.*, 
        (SELECT COUNT(*) FROM event_participants WHERE event_id = e.id) as participants_count,
        EXISTS(SELECT 1 FROM event_participants WHERE event_id = e.id AND user_id = $1) as is_registered
      FROM events e
      WHERE e.event_date >= CURRENT_DATE
      ORDER BY e.id, e.created_at DESC, e.event_date ASC
    `, [req.user.id]);
    
    console.log(`Found ${result.rows.length} upcoming events`);
    
    // Get domains for each event
    const eventsWithDomains = [];
    const processedEventIds = new Set();
    
    for (const event of result.rows) {
      if (processedEventIds.has(event.id)) continue;
      
      processedEventIds.add(event.id);
      
      // Get domains for this event
      const domainsResult = await pool.query(
        'SELECT domain FROM event_domains WHERE event_id = $1',
        [event.id]
      );
      
      event.domains = domainsResult.rows.map(row => row.domain);
      eventsWithDomains.push(event);
    }
    
    res.json(eventsWithDomains);
  } catch (err) {
    console.error('Error fetching upcoming events:', err);
    res.status(500).json({ message: 'Error fetching upcoming events: ' + err.message });
  }
});

// Past events endpoint
app.get('/api/events/past', authenticateToken, async (req, res) => {
  try {
    console.log('Fetching past events for user:', req.user.id);
    
    // Get events with date < today
    const result = await pool.query(`
      SELECT DISTINCT ON (e.id) e.*, 
        (SELECT COUNT(*) FROM event_participants WHERE event_id = e.id) as participants_count,
        EXISTS(SELECT 1 FROM event_participants WHERE event_id = e.id AND user_id = $1) as is_registered
      FROM events e
      WHERE e.event_date < CURRENT_DATE
      ORDER BY e.id, e.created_at DESC, e.event_date DESC
    `, [req.user.id]);
    
    console.log(`Found ${result.rows.length} past events`);
    
    // Get domains for each event
    const eventsWithDomains = [];
    const processedEventIds = new Set();
    
    for (const event of result.rows) {
      if (processedEventIds.has(event.id)) continue;
      
      processedEventIds.add(event.id);
      
      // Get domains for this event
      const domainsResult = await pool.query(
        'SELECT domain FROM event_domains WHERE event_id = $1',
        [event.id]
      );
      
      event.domains = domainsResult.rows.map(row => row.domain);
      eventsWithDomains.push(event);
    }
    
    res.json(eventsWithDomains);
  } catch (err) {
    console.error('Error fetching past events:', err);
    res.status(500).json({ message: 'Error fetching past events: ' + err.message });
  }
});

// My events endpoint (events user is registered for)
app.get('/api/events/my', authenticateToken, async (req, res) => {
  try {
    console.log('Fetching registered events for user:', req.user.id);
    
    // Get events user is registered for
    const result = await pool.query(`
      SELECT DISTINCT ON (e.id) e.*, 
        (SELECT COUNT(*) FROM event_participants WHERE event_id = e.id) as participants_count,
        true as is_registered
      FROM events e
      JOIN event_participants ep ON e.id = ep.event_id
      WHERE ep.user_id = $1
      ORDER BY e.id, e.created_at DESC, e.event_date ASC
    `, [req.user.id]);
    
    console.log(`Found ${result.rows.length} registered events`);
    
    // Get domains for each event
    const eventsWithDomains = [];
    const processedEventIds = new Set();
    
    for (const event of result.rows) {
      if (processedEventIds.has(event.id)) continue;
      
      processedEventIds.add(event.id);
      
      // Get domains for this event
      const domainsResult = await pool.query(
        'SELECT domain FROM event_domains WHERE event_id = $1',
        [event.id]
      );
      
      event.domains = domainsResult.rows.map(row => row.domain);
      eventsWithDomains.push(event);
    }
    
    res.json(eventsWithDomains);
  } catch (err) {
    console.error('Error fetching registered events:', err);
    res.status(500).json({ message: 'Error fetching registered events: ' + err.message });
  }
});

app.post('/api/events', authenticateToken, async (req, res) => {
  try {
    const { title, description, location, event_date, event_time, event_type, capacity, domains } = req.body;
    const userId = req.user.id;
    
    console.log('Event creation request received:', req.body);
    
    // Validation
    if (!title || !description || !location || !event_date || !event_time || !event_type) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    // Check for duplicate events (same title, date, time, location)
    const duplicateCheck = await pool.query(
      `SELECT * FROM events 
       WHERE title = $1 AND event_date = $2 AND event_time = $3 AND location = $4`,
      [title, event_date, event_time, location]
    );
    
    if (duplicateCheck.rows.length > 0) {
      console.log('Duplicate event detected:', {
        title,
        event_date,
        event_time,
        location,
        existing_id: duplicateCheck.rows[0].id
      });
      return res.status(409).json({ 
        error: 'A similar event already exists',
        existing_event: duplicateCheck.rows[0]
      });
    }
    
    // Check which columns exist in events table
    const columnsResult = await pool.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'events'
    `);
    
    const columns = columnsResult.rows.map(row => row.column_name);
    console.log('Available columns in events table:', columns);
    
    // Build dynamic query based on available columns
    let columnNames = ['title', 'description', 'location', 'event_date', 'event_time', 'event_type', 'capacity'];
    let placeholders = ['$1', '$2', '$3', '$4', '$5', '$6', '$7'];
    let paramIndex = 7;
    let queryParams = [title, description, location, event_date, event_time, event_type, capacity];
    
    // Add created_by if it exists
    if (columns.includes('created_by')) {
      columnNames.push('created_by');
      paramIndex++;
      placeholders.push(`$${paramIndex}`);
      queryParams.push(userId);
    }
    
    // Add organizer_id if it exists
    if (columns.includes('organizer_id')) {
      columnNames.push('organizer_id');
      paramIndex++;
      placeholders.push(`$${paramIndex}`);
      queryParams.push(userId);
    }
    
    const insertQuery = `
      INSERT INTO events (${columnNames.join(', ')})
      VALUES (${placeholders.join(', ')})
      RETURNING id
    `;
    
    console.log('Event insert query:', insertQuery);
    console.log('Event query params:', queryParams);
    
    // Create event
    const result = await pool.query(insertQuery, queryParams);
    
    const eventId = result.rows[0].id;
    
    // Add domains for the event if provided
    if (domains && domains.length > 0) {
      const domainValues = domains.map((_, i) => `($1, $${i + 2})`).join(', ');
      const domainParams = [eventId, ...domains];
      
      await pool.query(
        `INSERT INTO event_domains (event_id, domain) VALUES ${domainValues}`,
        domainParams
      );
    }
    
    console.log('Event created successfully:', { id: eventId });
    res.status(201).json({ id: eventId });
  } catch (error) {
    console.error('Error creating event:', error);
    res.status(500).json({ error: 'Failed to create event' });
  }
});

// Ideas routes
app.get('/api/ideas', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT i.*, u.name as submitter_name, 
        (SELECT COUNT(*) FROM comments WHERE idea_id = i.id) as comments_count
      FROM ideas i
      JOIN users u ON i.submitter_id = u.id
      ORDER BY i.created_at DESC
    `);
    
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching ideas:', err);
    res.status(500).json({ message: 'Error fetching ideas' });
  }
});

// Get ideas submitted by the current user
app.get('/api/ideas/my-submissions', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT i.*, u.name as submitter_name, 
        (SELECT COUNT(*) FROM comments WHERE idea_id = i.id) as comments_count
      FROM ideas i
      JOIN users u ON i.submitter_id = u.id
      WHERE i.submitter_id = $1
      ORDER BY i.created_at DESC
    `, [req.user.id]);
    
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching user ideas:', err);
    res.status(500).json({ message: 'Error fetching your submitted ideas' });
  }
});

app.post('/api/ideas', authenticateToken, async (req, res) => {
  try {
    const { title, type, description } = req.body;
    
    // Validate required fields
    if (!title || !description) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    
    // Insert the new idea
    const result = await pool.query(
      `INSERT INTO ideas (title, description, type, submitter_id, status)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id`,
      [title, description, type, req.user.id, 'pending']
    );
    
    res.status(201).json({ 
      id: result.rows[0].id,
      message: 'Idea submitted successfully' 
    });
  } catch (err) {
    console.error('Error submitting idea:', err);
    res.status(500).json({ message: 'Error submitting idea' });
  }
});

// Idea upvote endpoint
app.post('/api/ideas/:id/upvote', authenticateToken, async (req, res) => {
  try {
    const ideaId = req.params.id;
    
    // Check if idea exists
    const ideaCheck = await pool.query(
      'SELECT id FROM ideas WHERE id = $1',
      [ideaId]
    );
    
    if (ideaCheck.rows.length === 0) {
      return res.status(404).json({ message: 'Idea not found' });
    }
    
    // Update upvotes count
    await pool.query(
      'UPDATE ideas SET upvotes = upvotes + 1 WHERE id = $1',
      [ideaId]
    );
    
    res.json({ message: 'Idea upvoted successfully' });
  } catch (err) {
    console.error('Error upvoting idea:', err);
    res.status(500).json({ message: 'Error upvoting idea' });
  }
});

// Event registration endpoint
app.post('/api/events/:id/register', authenticateToken, async (req, res) => {
  try {
    const eventId = req.params.id;
    
    // Check if event exists
    const eventCheck = await pool.query(
      'SELECT id, capacity FROM events WHERE id = $1',
      [eventId]
    );
    
    if (eventCheck.rows.length === 0) {
      return res.status(404).json({ message: 'Event not found' });
    }
    
    // Check if user is already registered
    const registrationCheck = await pool.query(
      'SELECT id FROM event_participants WHERE event_id = $1 AND user_id = $2',
      [eventId, req.user.id]
    );
    
    if (registrationCheck.rows.length > 0) {
      return res.status(400).json({ message: 'You are already registered for this event' });
    }
    
    // Check if event has reached capacity
    const participantsCount = await pool.query(
      'SELECT COUNT(*) FROM event_participants WHERE event_id = $1',
      [eventId]
    );
    
    if (parseInt(participantsCount.rows[0].count) >= eventCheck.rows[0].capacity) {
      return res.status(400).json({ message: 'Event has reached maximum capacity' });
    }
    
    // Register user for event
    await pool.query(
      'INSERT INTO event_participants (event_id, user_id) VALUES ($1, $2)',
      [eventId, req.user.id]
    );
    
    res.json({ message: 'Successfully registered for event' });
  } catch (err) {
    console.error('Error registering for event:', err);
    res.status(500).json({ message: 'Error registering for event' });
  }
});

// User profile update endpoint
app.put('/api/profile', authenticateToken, upload.single('profileImage'), async (req, res) => {
  const userId = req.user.id;
  console.log('Profile update request received for user:', userId);
  console.log('Request body:', req.body);
  console.log('File:', req.file);
  
  // Start a transaction to ensure data integrity
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    // First check if the users table has necessary columns
    const tableInfo = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'users'
    `);
    
    const columns = tableInfo.rows.map(row => row.column_name);
    console.log('Available columns in users table:', columns);
    
    // Update user fields
    const {
      name,
      phone,
      dob,
      domains
    } = req.body;
    
    // Parse domains into array if provided as JSON string
    let domainsArray = [];
    if (domains) {
      try {
        domainsArray = Array.isArray(domains) ? domains : JSON.parse(domains);
      } catch (e) {
        console.warn('Error parsing domains:', e);
        domainsArray = [domains]; // If parsing fails, treat it as a single domain
      }
    }
    
    // Build update query dynamically based on provided fields and available columns
    let updateFields = [];
    let queryParams = [];
    let paramCounter = 1;
    
    if (name && columns.includes('name')) {
      updateFields.push(`name = $${paramCounter++}`);
      queryParams.push(name);
    }
    
    if (phone && columns.includes('phone')) {
      updateFields.push(`phone = $${paramCounter++}`);
      queryParams.push(phone);
    }
    
    // Check if it's called date_of_birth or dob in the database
    const dobColumnName = columns.includes('date_of_birth') ? 'date_of_birth' : 
                        columns.includes('dob') ? 'dob' : null;
    
    if (dob && dobColumnName) {
      updateFields.push(`${dobColumnName} = $${paramCounter++}`);
      queryParams.push(dob);
    }
    
    // Handle profile image if uploaded
    if (req.file && columns.includes('profile_image')) {
      const profileImagePath = `/uploads/${req.file.filename}`;
      updateFields.push(`profile_image = $${paramCounter++}`);
      queryParams.push(profileImagePath);
    }
    
    // Add updated_at if it exists
    if (columns.includes('updated_at')) {
      updateFields.push(`updated_at = NOW()`);
    }
    
    // Only update if there are fields to update
    if (updateFields.length > 0) {
      queryParams.push(userId); // Add userId as the last parameter
      
      const updateQuery = `
        UPDATE users 
        SET ${updateFields.join(', ')}
        WHERE id = $${paramCounter}
        RETURNING *
      `;
      
      console.log('Update query:', updateQuery, queryParams);
      const updateResult = await client.query(updateQuery, queryParams);
      
      if (updateResult.rows.length === 0) {
        await client.query('ROLLBACK');
        return res.status(404).json({ message: 'User not found' });
      }
    }
    
    // Handle domains update regardless of whether other fields were updated
    if (domainsArray.length > 0) {
      // Remove existing domains
      await client.query('DELETE FROM user_domains WHERE user_id = $1', [userId]);
      
      // Add new domains
      for (const domain of domainsArray) {
        if (domain && typeof domain === 'string') {
          await client.query(
            'INSERT INTO user_domains (user_id, domain) VALUES ($1, $2)',
            [userId, domain]
          );
        }
      }
    }
    
    await client.query('COMMIT');
    
    // Get updated user data with domains
    const userData = await getUserDataWithDomains(userId);
    console.log('Profile updated successfully:', userData);
    
    res.json({ message: 'Profile updated successfully', user: userData });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error updating profile:', err);
    res.status(500).json({ message: 'Server error: ' + err.message });
  } finally {
    client.release();
  }
});

// User profile update endpoint (simplified version using /me)
app.put('/api/users/me', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, email, phone, date_of_birth, domains, profile_image } = req.body;
    
    // Validate required fields
    if (!name || !email) {
      return res.status(400).json({ message: 'Name and email are required' });
    }
    
    console.log('Updating profile for user:', userId, req.body);
    
    // Start transaction
    await pool.query('BEGIN');
    
    try {
      // Update user basic info
      await pool.query(
        'UPDATE users SET name = $1, email = $2, phone = $3, date_of_birth = $4 WHERE id = $5',
        [name, email, phone, date_of_birth, userId]
      );
      
      // Update profile image if provided
      if (profile_image) {
        await pool.query(
          'UPDATE users SET profile_image = $1 WHERE id = $2',
          [profile_image, userId]
        );
      }
      
      // Update domains if provided
      if (domains && Array.isArray(domains)) {
        // Delete existing domains
        await pool.query(
          'DELETE FROM user_domains WHERE user_id = $1',
          [userId]
        );
        
        // Insert new domains
        if (domains.length > 0) {
          for (const domain of domains) {
            await pool.query(
              'INSERT INTO user_domains (user_id, domain) VALUES ($1, $2)',
              [userId, domain]
            );
          }
        }
      }
      
      // Commit transaction
      await pool.query('COMMIT');
      
      // Fetch updated user data
      const userResult = await pool.query(
        'SELECT id, name, email, phone, role, date_of_birth, profile_image, created_at FROM users WHERE id = $1',
        [userId]
      );
      
      const domainsResult = await pool.query(
        'SELECT domain FROM user_domains WHERE user_id = $1',
        [userId]
      );
      
      const userData = userResult.rows[0];
      userData.domains = domainsResult.rows.map(row => row.domain);
      
      res.json(userData);
    } catch (err) {
      await pool.query('ROLLBACK');
      console.error('Error updating profile:', err);
      res.status(500).json({ message: 'Error updating profile: ' + err.message });
    }
  } catch (err) {
    console.error('Error in profile update endpoint:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Profile image upload endpoint
app.post('/api/users/me/profile-image', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    
    // For file uploads, we need to use multer
    const storage = multer.diskStorage({
      destination: (req, file, cb) => {
        const uploadDir = path.join(__dirname, 'public', 'uploads');
        // Create directory if it doesn't exist
        if (!fs.existsSync(uploadDir)) {
          fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
      },
      filename: (req, file, cb) => {
        // Create unique filename with original extension
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        cb(null, 'profile-' + userId + '-' + uniqueSuffix + ext);
      }
    });
    
    const upload = multer({ 
      storage: storage,
      limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
      fileFilter: (req, file, cb) => {
        // Accept only images
        if (file.mimetype.startsWith('image/')) {
          cb(null, true);
        } else {
          cb(new Error('Only image files are allowed'), false);
        }
      }
    }).single('profile_image');
    
    // Handle the file upload
    upload(req, res, async (err) => {
      if (err) {
        console.error('File upload error:', err);
        return res.status(400).json({ message: 'Error uploading profile image: ' + err.message });
      }
      
      if (!req.file) {
        return res.status(400).json({ message: 'No image file provided' });
      }
      
      try {
        // Generate relative path to store in database
        const relativePath = '/uploads/' + path.basename(req.file.path);
        
        // Update user profile with image path
        await pool.query(
          'UPDATE users SET profile_image = $1 WHERE id = $2',
          [relativePath, userId]
        );
        
        res.json({ 
          message: 'Profile image uploaded successfully',
          profile_image: relativePath
        });
      } catch (err) {
        console.error('Error saving profile image to database:', err);
        res.status(500).json({ message: 'Error saving profile image' });
      }
    });
  } catch (err) {
    console.error('Error in profile image upload endpoint:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all members and volunteers
app.get('/api/users/members-volunteers', authenticateToken, async (req, res) => {
  try {
    console.log('MEMBERS-VOLUNTEERS API called by user:', req.user.id, 'with role:', req.user.role);
    
    // Only allow admins to view members and volunteers data
    if (req.user.role !== 'admin') {
      console.log('User not authorized to view members data - only admins allowed');
      return res.status(403).json({ message: 'Only administrators can view members data' });
    }
    
    // Get users with roles of member, volunteer, or admin (exclude other roles if any)
    const result = await pool.query(`
      SELECT id, name, email, role, phone, date_of_birth, aadhaar_verified, profile_image, created_at as join_date
      FROM users 
      WHERE role IN ('member', 'volunteer', 'admin')
      ORDER BY name ASC
    `);
    
    console.log(`Found ${result.rows.length} members/volunteers`);
    
    // Get domains for each user
    const usersWithDomains = [];
    
    for (const user of result.rows) {
      // Get domains for this user
      const domainsResult = await pool.query(
        'SELECT domain FROM user_domains WHERE user_id = $1',
        [user.id]
      );
      
      user.domains = domainsResult.rows.map(row => row.domain);
      usersWithDomains.push(user);
    }
    
    res.json(usersWithDomains);
  } catch (err) {
    console.error('Error fetching members and volunteers:', err);
    res.status(500).json({ message: 'Error fetching members: ' + err.message });
  }
});

// Update user profile
app.post('/api/users/update-profile', authenticateToken, async (req, res) => {
  try {
    console.log('Profile update request for user:', req.user.id);
    const userId = req.user.id;
    const { email, phone, current_password, new_password } = req.body;
    
    // Get current user data
    const userResult = await pool.query('SELECT * FROM users WHERE id = $1', [userId]);
    
    if (userResult.rows.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }
    
    const user = userResult.rows[0];
    let passwordValid = true;
    
    // Only verify password if we're changing the password
    if (new_password) {
      // Skip password verification if current_password is not provided or user has no password
      if (!current_password || !user.password) {
        passwordValid = false;
      } else {
        // Verify current password
        try {
          passwordValid = await bcrypt.compare(current_password, user.password);
        } catch (err) {
          console.error('Password comparison error:', err);
          passwordValid = false;
        }
      }
      
      if (!passwordValid) {
        return res.status(401).json({ 
          success: false, 
          message: 'Current password is incorrect' 
        });
      }
    }
    
    // Build the update query dynamically
    let updateFields = [];
    let queryParams = [];
    let paramIndex = 1;
    
    if (email) {
      updateFields.push(`email = $${paramIndex}`);
      queryParams.push(email);
      paramIndex++;
    }
    
    if (phone) {
      updateFields.push(`phone = $${paramIndex}`);
      queryParams.push(phone);
      paramIndex++;
    }
    
    if (new_password) {
      const hashedPassword = await bcrypt.hash(new_password, 10);
      updateFields.push(`password = $${paramIndex}`);
      queryParams.push(hashedPassword);
      paramIndex++;
    }
    
    // Only proceed if there are fields to update
    if (updateFields.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No fields to update'
      });
    }
    
    queryParams.push(userId);
    const updateQuery = `
      UPDATE users 
      SET ${updateFields.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING id, email, phone, role
    `;
    
    const updateResult = await pool.query(updateQuery, queryParams);
    
    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: updateResult.rows[0]
    });
    
  } catch (error) {
    console.error('Error updating user profile:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to update profile' 
    });
  }
});

// Update notification preferences
app.post('/api/users/notification-preferences', authenticateToken, async (req, res) => {
  try {
    console.log('Notification preferences update request for user:', req.user.id);
    
    // First, ensure the notification_preferences table exists
    await pool.query(`
      CREATE TABLE IF NOT EXISTS notification_preferences (
        user_id INTEGER PRIMARY KEY,
        email_notifications BOOLEAN DEFAULT true,
        sms_notifications BOOLEAN DEFAULT false,
        event_reminders BOOLEAN DEFAULT true,
        task_reminders BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Check if preferences already exist for this user
    const existingPrefs = await pool.query(
      'SELECT * FROM notification_preferences WHERE user_id = $1',
      [req.user.id]
    );
    
    let result;
    if (existingPrefs.rows.length > 0) {
      // Update existing preferences
      result = await pool.query(
        `UPDATE notification_preferences 
         SET email_notifications = $1, 
             sms_notifications = $2, 
             event_reminders = $3, 
             task_reminders = $4,
             updated_at = CURRENT_TIMESTAMP
         WHERE user_id = $5
         RETURNING *`,
        [
          req.body.email_notifications, 
          req.body.sms_notifications, 
          req.body.event_reminders, 
          req.body.task_reminders,
          req.user.id
        ]
      );
    } else {
      // Create new preferences
      result = await pool.query(
        `INSERT INTO notification_preferences 
         (user_id, email_notifications, sms_notifications, event_reminders, task_reminders)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING *`,
        [
          req.user.id, 
          req.body.email_notifications, 
          req.body.sms_notifications, 
          req.body.event_reminders, 
          req.body.task_reminders
        ]
      );
    }
    
    res.json({
      success: true,
      message: 'Notification preferences updated successfully',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error updating notification preferences:', error);
    res.status(500).json({ success: false, message: 'Failed to update notification preferences' });
  }
});

// Serve index.html for all other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 
