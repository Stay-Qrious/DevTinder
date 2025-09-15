const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = 3000;

// Middleware
app.use(express.json());
app.use(express.static('public'));

// Data file path
const dataFilePath = path.join(__dirname, 'leetcode-data.json');

// Initialize data file if it doesn't exist
const initializeData = () => {
    const defaultData = {
        problems: [
            { id: 1, name: "Two Sum", link: "https://leetcode.com/problems/two-sum/" },
            { id: 2, name: "Add Two Numbers", link: "https://leetcode.com/problems/add-two-numbers/" },
            { id: 3, name: "Longest Substring Without Repeating Characters", link: "https://leetcode.com/problems/longest-substring-without-repeating-characters/" },
            { id: 4, name: "Median of Two Sorted Arrays", link: "https://leetcode.com/problems/median-of-two-sorted-arrays/" },
            { id: 5, name: "Longest Palindromic Substring", link: "https://leetcode.com/problems/longest-palindromic-substring/" },
            { id: 6, name: "ZigZag Conversion", link: "https://leetcode.com/problems/zigzag-conversion/" },
            { id: 7, name: "Reverse Integer", link: "https://leetcode.com/problems/reverse-integer/" },
            { id: 8, name: "String to Integer (atoi)", link: "https://leetcode.com/problems/string-to-integer-atoi/" },
            { id: 9, name: "Palindrome Number", link: "https://leetcode.com/problems/palindrome-number/" },
            { id: 10, name: "Regular Expression Matching", link: "https://leetcode.com/problems/regular-expression-matching/" }
        ],
        mastered: []
    };

    if (!fs.existsSync(dataFilePath)) {
        fs.writeFileSync(dataFilePath, JSON.stringify(defaultData, null, 2));
    }
};

// Read data from file
const readData = () => {
    try {
        const data = fs.readFileSync(dataFilePath, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error('Error reading data:', error);
        return { problems: [], mastered: [] };
    }
};

// Write data to file
const writeData = (data) => {
    try {
        fs.writeFileSync(dataFilePath, JSON.stringify(data, null, 2));
    } catch (error) {
        console.error('Error writing data:', error);
    }
};

// Initialize data on startup
initializeData();

// API Routes
// Get all problems
app.get('/api/problems', (req, res) => {
    const data = readData();
    res.json(data);
});

// Add new problem
app.post('/api/problems', (req, res) => {
    const { name, link } = req.body;

    if (!name || !link) {
        return res.status(400).json({ message: 'Name and link are required' });
    }

    const data = readData();
    const newId = Math.max(...data.problems.map(p => p.id), ...data.mastered.map(p => p.id), 0) + 1;

    const newProblem = {
        id: newId,
        name: name.trim(),
        link: link.trim()
    };

    data.problems.push(newProblem);
    writeData(data);

    res.json({ message: 'Problem added successfully!', data });
});

// Get random problem from unmastered list
app.get('/api/random', (req, res) => {
    const data = readData();
    if (data.problems.length === 0) {
        return res.json({ message: 'No problems left! You have mastered all questions.' });
    }

    const randomIndex = Math.floor(Math.random() * data.problems.length);
    const randomProblem = data.problems[randomIndex];
    res.json({ ...randomProblem, source: 'unmastered' });
});

// Get random problem from mastered list
app.get('/api/random-mastered', (req, res) => {
    const data = readData();
    if (data.mastered.length === 0) {
        return res.json({ message: 'No mastered problems to practice!' });
    }

    const randomIndex = Math.floor(Math.random() * data.mastered.length);
    const randomProblem = data.mastered[randomIndex];
    res.json({ ...randomProblem, source: 'mastered' });
});

// Mark problem as mastered
app.post('/api/mastered/:id', (req, res) => {
    const problemId = parseInt(req.params.id);
    const data = readData();

    // Find and remove problem from problems array
    const problemIndex = data.problems.findIndex(p => p.id === problemId);
    if (problemIndex === -1) {
        return res.status(404).json({ message: 'Problem not found' });
    }

    const masteredProblem = data.problems.splice(problemIndex, 1)[0];
    masteredProblem.notes = ''; // Initialize notes field
    data.mastered.push(masteredProblem);

    writeData(data);
    res.json({ message: 'Problem marked as mastered!', data });
});

// Update notes for a mastered problem
app.post('/api/notes/:id', (req, res) => {
    const problemId = parseInt(req.params.id);
    const { notes } = req.body;
    const data = readData();

    // Find problem in mastered array
    const masteredIndex = data.mastered.findIndex(p => p.id === problemId);
    if (masteredIndex === -1) {
        return res.status(404).json({ message: 'Mastered problem not found' });
    }

    data.mastered[masteredIndex].notes = notes || '';
    writeData(data);
    res.json({ message: 'Notes updated successfully!', data });
});

// Move problem back from mastered to unmastered
app.post('/api/unmaster/:id', (req, res) => {
    const problemId = parseInt(req.params.id);
    const data = readData();

    // Find and remove problem from mastered array
    const masteredIndex = data.mastered.findIndex(p => p.id === problemId);
    if (masteredIndex === -1) {
        return res.status(404).json({ message: 'Mastered problem not found' });
    }

    const unmasteredProblem = data.mastered.splice(masteredIndex, 1)[0];
    delete unmasteredProblem.notes; // Remove notes when moving back
    data.problems.push(unmasteredProblem);

    writeData(data);
    res.json({ message: 'Problem moved back to practice list!', data });
});

// Reset all problems
app.post('/api/reset', (req, res) => {
    const data = readData();
    data.problems = [...data.problems, ...data.mastered.map(p => ({ id: p.id, name: p.name, link: p.link }))];
    data.mastered = [];
    writeData(data);
    res.json({ message: 'All problems reset!', data });
});

// Serve the main HTML page
app.get('/', (req, res) => {
    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>CodeBlind - Master LeetCode Like a Pro</title>
    <script src="https://unpkg.com/react@18/umd/react.development.js"></script>
    <script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
    <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&display=swap');
        
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Space Grotesk', sans-serif;
            background: linear-gradient(135deg, #0f0f23 0%, #1a1a2e 50%, #16213e 100%);
            min-height: 100vh;
            padding: 20px;
            color: #e2e8f0;
            overflow-x: hidden;
        }
        
        .container {
            max-width: 900px;
            margin: 0 auto;
            position: relative;
        }
        
        .header {
            text-align: center;
            margin-bottom: 40px;
            position: relative;
        }
        
        .header::before {
            content: '';
            position: absolute;
            top: -50%;
            left: 50%;
            transform: translateX(-50%);
            width: 200px;
            height: 200px;
            background: linear-gradient(45deg, #ff6b6b, #4ecdc4, #45b7d1, #96ceb4);
            border-radius: 50%;
            filter: blur(60px);
            opacity: 0.3;
            animation: pulse 4s ease-in-out infinite;
        }
        
        @keyframes pulse {
            0%, 100% { transform: translateX(-50%) scale(1); }
            50% { transform: translateX(-50%) scale(1.2); }
        }
        
        .header h1 {
            font-size: 3.5em;
            font-weight: 700;
            background: linear-gradient(45deg, #ff6b6b, #4ecdc4, #45b7d1, #96ceb4);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
            margin-bottom: 10px;
            position: relative;
            z-index: 1;
        }
        
        .header p {
            font-size: 1.2em;
            opacity: 0.8;
            font-weight: 300;
            position: relative;
            z-index: 1;
        }
        
        .main-card {
            background: rgba(255, 255, 255, 0.05);
            backdrop-filter: blur(10px);
            border-radius: 25px;
            border: 1px solid rgba(255, 255, 255, 0.1);
            box-shadow: 0 25px 50px rgba(0, 0, 0, 0.3);
            overflow: hidden;
            position: relative;
        }
        
        .main-card::before {
            content: '';
            position: absolute;
            top: 0;
            left: -100%;
            width: 100%;
            height: 2px;
            background: linear-gradient(90deg, transparent, #4ecdc4, transparent);
            animation: shimmer 3s infinite;
        }
        
        @keyframes shimmer {
            0% { left: -100%; }
            100% { left: 100%; }
        }
        
        .content {
            padding: 40px;
        }
        
        .stats {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
            gap: 20px;
            margin-bottom: 40px;
        }
        
        .stat-item {
            background: rgba(255, 255, 255, 0.03);
            border-radius: 15px;
            padding: 25px;
            text-align: center;
            border: 1px solid rgba(255, 255, 255, 0.05);
            transition: all 0.3s ease;
            position: relative;
            overflow: hidden;
            cursor: pointer;
        }
        
        .stat-item::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 3px;
            background: linear-gradient(90deg, #ff6b6b, #4ecdc4);
        }
        
        .stat-item:hover {
            transform: translateY(-5px);
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
        }
        
        .stat-number {
            font-size: 2.5em;
            font-weight: 700;
            background: linear-gradient(45deg, #ff6b6b, #4ecdc4);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
            display: block;
        }
        
        .stat-label {
            color: #94a3b8;
            margin-top: 8px;
            font-weight: 500;
        }
        
        .action-section {
            text-align: center;
            margin-bottom: 40px;
        }
        
        .button-group {
            display: flex;
            gap: 20px;
            justify-content: center;
            flex-wrap: wrap;
            margin-bottom: 30px;
        }
        
        .blind-button {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border: none;
            padding: 18px 35px;
            font-size: 1.1em;
            font-weight: 600;
            border-radius: 50px;
            cursor: pointer;
            transition: all 0.3s ease;
            box-shadow: 0 8px 25px rgba(102, 126, 234, 0.4);
            position: relative;
            overflow: hidden;
            font-family: 'Space Grotesk', sans-serif;
        }
        
        .blind-button::before {
            content: '';
            position: absolute;
            top: 0;
            left: -100%;
            width: 100%;
            height: 100%;
            background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
            transition: left 0.5s;
        }
        
        .blind-button:hover::before {
            left: 100%;
        }
        
        .blind-button:hover {
            transform: translateY(-3px);
            box-shadow: 0 15px 35px rgba(102, 126, 234, 0.6);
        }
        
        .blind-button:disabled {
            opacity: 0.6;
            cursor: not-allowed;
            transform: none;
        }
        
        .mastered-button {
            background: linear-gradient(135deg, #48bb78 0%, #38a169 100%);
            color: white;
            border: none;
            padding: 18px 35px;
            font-size: 1.1em;
            font-weight: 600;
            border-radius: 50px;
            cursor: pointer;
            transition: all 0.3s ease;
            box-shadow: 0 8px 25px rgba(72, 187, 120, 0.4);
            position: relative;
            overflow: hidden;
            font-family: 'Space Grotesk', sans-serif;
        }
        
        .mastered-button:hover {
            transform: translateY(-3px);
            box-shadow: 0 15px 35px rgba(72, 187, 120, 0.6);
        }

        .add-button {
            background: linear-gradient(135deg, #ed8936 0%, #dd7724 100%);
            color: white;
            border: none;
            padding: 18px 35px;
            font-size: 1.1em;
            font-weight: 600;
            border-radius: 50px;
            cursor: pointer;
            transition: all 0.3s ease;
            box-shadow: 0 8px 25px rgba(237, 137, 54, 0.4);
            position: relative;
            overflow: hidden;
            font-family: 'Space Grotesk', sans-serif;
        }
        
        .add-button:hover {
            transform: translateY(-3px);
            box-shadow: 0 15px 35px rgba(237, 137, 54, 0.6);
        }
        
        .problem-card {
            background: rgba(255, 255, 255, 0.05);
            border-radius: 20px;
            padding: 30px;
            margin-top: 25px;
            border: 1px solid rgba(255, 255, 255, 0.1);
            position: relative;
            overflow: hidden;
        }
        
        .problem-card::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 4px;
            background: linear-gradient(90deg, #ff6b6b, #4ecdc4, #45b7d1, #96ceb4);
        }
        
        .problem-name {
            font-size: 1.5em;
            font-weight: 600;
            color: #f1f5f9;
            margin-bottom: 20px;
            text-align: center;
        }
        
        .problem-actions {
            display: flex;
            gap: 15px;
            justify-content: center;
            flex-wrap: wrap;
        }
        
        .problem-link {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 12px 25px;
            text-decoration: none;
            border-radius: 12px;
            transition: all 0.3s ease;
            font-weight: 500;
        }
        
        .problem-link:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 20px rgba(102, 126, 234, 0.4);
        }
        
        .action-button {
            padding: 12px 25px;
            border: none;
            border-radius: 12px;
            cursor: pointer;
            font-weight: 500;
            transition: all 0.3s ease;
            font-family: 'Space Grotesk', sans-serif;
        }
        
        .mastered-btn {
            background: linear-gradient(135deg, #48bb78 0%, #38a169 100%);
            color: white;
        }
        
        .failed-btn {
            background: linear-gradient(135deg, #f56565 0%, #e53e3e 100%);
            color: white;
        }
        
        .action-button:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 20px rgba(0, 0, 0, 0.3);
        }
        
        .no-problems {
            text-align: center;
            color: #94a3b8;
            font-size: 1.3em;
            margin: 40px 0;
            padding: 30px;
            background: rgba(255, 255, 255, 0.03);
            border-radius: 15px;
            border: 1px solid rgba(255, 255, 255, 0.05);
        }
        
        .problems-list {
            margin-top: 40px;
        }
        
        .problems-title {
            font-size: 1.8em;
            color: #f1f5f9;
            margin-bottom: 25px;
            padding-bottom: 15px;
            border-bottom: 2px solid #667eea;
            font-weight: 600;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        
        .close-button {
            background: rgba(255, 255, 255, 0.1);
            border: none;
            color: #e2e8f0;
            padding: 8px 16px;
            border-radius: 8px;
            cursor: pointer;
            font-size: 0.9em;
            transition: all 0.3s ease;
        }
        
        .close-button:hover {
            background: rgba(255, 255, 255, 0.2);
        }
        
        .problems-item {
            background: rgba(102, 126, 234, 0.1);
            border: 1px solid rgba(102, 126, 234, 0.2);
            border-radius: 12px;
            padding: 20px;
            margin-bottom: 15px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            transition: all 0.3s ease;
        }
        
        .problems-item:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 20px rgba(102, 126, 234, 0.1);
        }
        
        .problems-item a {
            color: #4ecdc4;
            text-decoration: none;
            font-weight: 500;
            padding: 8px 16px;
            border-radius: 8px;
            background: rgba(78, 205, 196, 0.1);
            border: 1px solid rgba(78, 205, 196, 0.2);
            transition: all 0.3s ease;
        }
        
        .problems-item a:hover {
            background: rgba(78, 205, 196, 0.2);
            transform: translateY(-1px);
        }
        
        .mastered-list {
            margin-top: 40px;
        }
        
        .mastered-title {
            font-size: 1.8em;
            color: #f1f5f9;
            margin-bottom: 25px;
            padding-bottom: 15px;
            border-bottom: 2px solid #48bb78;
            font-weight: 600;
        }
        
        .mastered-item {
            background: rgba(72, 187, 120, 0.1);
            border: 1px solid rgba(72, 187, 120, 0.2);
            border-radius: 12px;
            padding: 20px;
            margin-bottom: 15px;
            transition: all 0.3s ease;
        }
        
        .mastered-item:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 20px rgba(72, 187, 120, 0.1);
        }
        
        .mastered-item-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 15px;
        }
        
        .mastered-item a {
            color: #4ecdc4;
            text-decoration: none;
            font-weight: 500;
            padding: 8px 16px;
            border-radius: 8px;
            background: rgba(78, 205, 196, 0.1);
            border: 1px solid rgba(78, 205, 196, 0.2);
            transition: all 0.3s ease;
        }
        
        .mastered-item a:hover {
            background: rgba(78, 205, 196, 0.2);
            transform: translateY(-1px);
        }
        
        .notes-section {
            margin-top: 15px;
        }
        
        .notes-label {
            color: #94a3b8;
            font-size: 0.9em;
            margin-bottom: 8px;
            font-weight: 500;
        }
        
        .notes-textarea {
            width: 100%;
            background: rgba(255, 255, 255, 0.05);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 8px;
            padding: 12px;
            color: #e2e8f0;
            font-family: 'Space Grotesk', sans-serif;
            font-size: 0.95em;
            min-height: 80px;
            resize: vertical;
        }
        
        .notes-textarea:focus {
            outline: none;
            border-color: #4ecdc4;
            box-shadow: 0 0 0 2px rgba(78, 205, 196, 0.1);
        }
        
        .notes-actions {
            display: flex;
            gap: 10px;
            margin-top: 10px;
        }
        
        .save-notes-btn {
            background: linear-gradient(135deg, #48bb78 0%, #38a169 100%);
            color: white;
            border: none;
            padding: 8px 16px;
            border-radius: 6px;
            cursor: pointer;
            font-size: 0.85em;
            font-weight: 500;
            transition: all 0.3s ease;
        }
        
        .save-notes-btn:hover {
            transform: translateY(-1px);
        }

        .modal-overlay {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.8);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 1000;
        }
        
        .modal {
            background: rgba(26, 26, 46, 0.95);
            backdrop-filter: blur(10px);
            border-radius: 20px;
            border: 1px solid rgba(255, 255, 255, 0.1);
            padding: 40px;
            width: 90%;
            max-width: 500px;
            position: relative;
        }
        
        .modal h3 {
            font-size: 1.8em;
            color: #f1f5f9;
            margin-bottom: 25px;
            text-align: center;
        }
        
        .form-group {
            margin-bottom: 20px;
        }
        
        .form-label {
            color: #94a3b8;
            font-weight: 500;
            margin-bottom: 8px;
            display: block;
        }
        
        .form-input {
            width: 100%;
            background: rgba(255, 255, 255, 0.05);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 12px;
            padding: 15px;
            color: #e2e8f0;
            font-family: 'Space Grotesk', sans-serif;
            font-size: 1em;
        }
        
        .form-input:focus {
            outline: none;
            border-color: #4ecdc4;
            box-shadow: 0 0 0 3px rgba(78, 205, 196, 0.1);
        }
        
        .modal-actions {
            display: flex;
            gap: 15px;
            justify-content: center;
            margin-top: 30px;
        }
        
        .modal-button {
            padding: 12px 25px;
            border: none;
            border-radius: 12px;
            cursor: pointer;
            font-weight: 500;
            transition: all 0.3s ease;
            font-family: 'Space Grotesk', sans-serif;
        }
        
        .modal-button.primary {
            background: linear-gradient(135deg, #48bb78 0%, #38a169 100%);
            color: white;
        }
        
        .modal-button.secondary {
            background: rgba(255, 255, 255, 0.1);
            color: #e2e8f0;
            border: 1px solid rgba(255, 255, 255, 0.2);
        }
        
        .modal-button:hover {
            transform: translateY(-2px);
        }
        
        @media (max-width: 768px) {
            .header h1 {
                font-size: 2.5em;
            }
            
            .content {
                padding: 25px;
            }
            
            .button-group {
                flex-direction: column;
                align-items: center;
            }
            
            .blind-button, .mastered-button, .add-button {
                width: 100%;
                max-width: 300px;
            }
            
            .problem-actions {
                flex-direction: column;
            }
            
            .modal {
                margin: 20px;
                width: calc(100% - 40px);
                padding: 30px 20px;
            }
            
            .problems-title {
                flex-direction: column;
                gap: 15px;
                text-align: center;
            }
        }
    </style>
</head>
<body>
    <div id="root"></div>

    <script type="text/babel">
        const { useState, useEffect } = React;

        function App() {
            const [data, setData] = useState({ problems: [], mastered: [] });
            const [currentProblem, setCurrentProblem] = useState(null);
            const [loading, setLoading] = useState(false);
            const [showProblems, setShowProblems] = useState(false);
            const [showAddModal, setShowAddModal] = useState(false);
            const [editingNotes, setEditingNotes] = useState({});
            const [newProblem, setNewProblem] = useState({ name: '', link: '' });

            // Fetch initial data
            useEffect(() => {
                fetchData();
            }, []);

            const fetchData = async () => {
                try {
                    const response = await fetch('/api/problems');
                    const result = await response.json();
                    setData(result);
                } catch (error) {
                    console.error('Error fetching data:', error);
                }
            };

            const getRandomProblem = async () => {
                if (data.problems.length === 0) return;
                
                setLoading(true);
                try {
                    const response = await fetch('/api/random');
                    const problem = await response.json();
                    setCurrentProblem(problem);
                } catch (error) {
                    console.error('Error getting random problem:', error);
                } finally {
                    setLoading(false);
                }
            };

            const getRandomMasteredProblem = async () => {
                if (data.mastered.length === 0) return;
                
                setLoading(true);
                try {
                    const response = await fetch('/api/random-mastered');
                    const problem = await response.json();
                    setCurrentProblem(problem);
                } catch (error) {
                    console.error('Error getting random mastered problem:', error);
                } finally {
                    setLoading(false);
                }
            };

            const markAsMastered = async (problemId) => {
                try {
                    const response = await fetch('/api/mastered/' + problemId, {
                        method: 'POST'
                    });
                    const result = await response.json();
                    setData(result.data);
                    setCurrentProblem(null);
                } catch (error) {
                    console.error('Error marking as mastered:', error);
                }
            };

            const markAsFailed = async (problemId) => {
                try {
                    const response = await fetch('/api/unmaster/' + problemId, {
                        method: 'POST'
                    });
                    const result = await response.json();
                    setData(result.data);
                    setCurrentProblem(null);
                } catch (error) {
                    console.error('Error marking as failed:', error);
                }
            };

            const addNewProblem = async () => {
                if (!newProblem.name.trim() || !newProblem.link.trim()) {
                    alert('Please fill in both name and link fields');
                    return;
                }

                try {
                    const response = await fetch('/api/problems', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify(newProblem)
                    });
                    const result = await response.json();
                    setData(result.data);
                    setNewProblem({ name: '', link: '' });
                    setShowAddModal(false);
                } catch (error) {
                    console.error('Error adding problem:', error);
                }
            };

            const saveNotes = async (problemId, notes) => {
                try {
                    const response = await fetch('/api/notes/' + problemId, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({ notes })
                    });
                    const result = await response.json();
                    setData(result.data);
                    setEditingNotes(prev => ({ ...prev, [problemId]: false }));
                } catch (error) {
                    console.error('Error saving notes:', error);
                }
            };

            const totalProblems = data.problems.length + data.mastered.length;
            const progressPercentage = totalProblems > 0 ? Math.round((data.mastered.length / totalProblems) * 100) : 0;

            return (
                <div className="container">
                    <div className="header">
                        <h1>⚡ CodeBlind</h1>
                        <p>Master LeetCode problems like a coding ninja</p>
                    </div>
                    
                    <div className="main-card">
                        <div className="content">
                            <div className="stats">
                                <div 
                                    className="stat-item" 
                                    onClick={() => setShowProblems(!showProblems)}
                                    title="Click to view problems list"
                                >
                                    <span className="stat-number">{data.problems.length}</span>
                                    <div className="stat-label">To Master</div>
                                </div>
                                <div className="stat-item">
                                    <span className="stat-number">{data.mastered.length}</span>
                                    <div className="stat-label">Conquered</div>
                                </div>
                                <div className="stat-item">
                                    <span className="stat-number">{progressPercentage}%</span>
                                    <div className="stat-label">Progress</div>
                                </div>
                                <div className="stat-item">
                                    <span className="stat-number">{totalProblems}</span>
                                    <div className="stat-label">Total Arsenal</div>
                                </div>
                            </div>

                            <div className="action-section">
                                <div className="button-group">
                                    {data.problems.length > 0 && (
                                        <button 
                                            className="blind-button"
                                            onClick={getRandomProblem}
                                            disabled={loading}
                                        >
                                            {loading ? '🎯 Rolling the dice...' : '🎯 Play Blind'}
                                        </button>
                                    )}

                                    {data.mastered.length > 0 && (
                                        <button 
                                            className="mastered-button"
                                            onClick={getRandomMasteredProblem}
                                            disabled={loading}
                                        >
                                            {loading ? '🔄 Selecting challenge...' : '🔄 Practice Mastered'}
                                        </button>
                                    )}

                                    <button 
                                        className="add-button"
                                        onClick={() => setShowAddModal(true)}
                                    >
                                        ➕ Add Problem
                                    </button>
                                </div>

                                {data.problems.length === 0 && data.mastered.length === 0 && (
                                    <div className="no-problems">
                                        🚀 Ready to start your coding journey?<br/>
                                        Add some problems to begin!
                                    </div>
                                )}

                                {data.problems.length === 0 && data.mastered.length > 0 && (
                                    <div className="no-problems">
                                        🎉 Legendary! You've conquered all problems!<br/>
                                        Practice your mastered ones or add new challenges.
                                    </div>
                                )}

                                {currentProblem && currentProblem.name && (
                                    <div className="problem-card">
                                        <div className="problem-name">
                                            {currentProblem.source === 'mastered' && '🏆 '} 
                                            {currentProblem.name}
                                        </div>
                                        <div className="problem-actions">
                                            <a 
                                                href={currentProblem.link} 
                                                target="_blank" 
                                                rel="noopener noreferrer"
                                                className="problem-link"
                                            >
                                                🚀 Solve Challenge
                                            </a>
                                            
                                            {currentProblem.source === 'unmastered' && (
                                                <button 
                                                    className="action-button mastered-btn"
                                                    onClick={() => markAsMastered(currentProblem.id)}
                                                >
                                                    ✅ Mastered It!
                                                </button>
                                            )}
                                            
                                            {currentProblem.source === 'mastered' && (
                                                <button 
                                                    className="action-button failed-btn"
                                                    onClick={() => markAsFailed(currentProblem.id)}
                                                >
                                                    ❌ Need More Practice
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {currentProblem && currentProblem.message && (
                                    <div className="no-problems">
                                        {currentProblem.message}
                                    </div>
                                )}
                            </div>

                            {showProblems && data.problems.length > 0 && (
                                <div className="problems-list">
                                    <div className="problems-title">
                                        📚 Problems To Master
                                        <button 
                                            className="close-button"
                                            onClick={() => setShowProblems(false)}
                                        >
                                            Close
                                        </button>
                                    </div>
                                    {data.problems.map(problem => (
                                        <div key={problem.id} className="problems-item">
                                            <span>{problem.name}</span>
                                            <a 
                                                href={problem.link} 
                                                target="_blank" 
                                                rel="noopener noreferrer"
                                            >
                                                Practice
                                            </a>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {data.mastered.length > 0 && (
                                <div className="mastered-list">
                                    <h3 className="mastered-title">🏆 Hall of Fame</h3>
                                    {data.mastered.map(problem => (
                                        <div key={problem.id} className="mastered-item">
                                            <div className="mastered-item-header">
                                                <span>{problem.name}</span>
                                                <a 
                                                    href={problem.link} 
                                                    target="_blank" 
                                                    rel="noopener noreferrer"
                                                >
                                                    View Solution
                                                </a>
                                            </div>
                                            <div className="notes-section">
                                                <div className="notes-label">📝 Solution Notes:</div>
                                                {editingNotes[problem.id] ? (
                                                    <>
                                                        <textarea 
                                                            className="notes-textarea"
                                                            value={problem.notes || ''}
                                                            onChange={(e) => {
                                                                const updatedData = { ...data };
                                                                const masteredIndex = updatedData.mastered.findIndex(p => p.id === problem.id);
                                                                updatedData.mastered[masteredIndex].notes = e.target.value;
                                                                setData(updatedData);
                                                            }}
                                                            placeholder="Write how you solved this problem, key insights, time/space complexity, etc..."
                                                        />
                                                        <div className="notes-actions">
                                                            <button 
                                                                className="save-notes-btn"
                                                                onClick={() => saveNotes(problem.id, problem.notes)}
                                                            >
                                                                💾 Save Notes
                                                            </button>
                                                            <button 
                                                                className="save-notes-btn"
                                                                style={{background: 'rgba(255, 255, 255, 0.1)'}}
                                                                onClick={() => setEditingNotes(prev => ({ ...prev, [problem.id]: false }))}
                                                            >
                                                                Cancel
                                                            </button>
                                                        </div>
                                                    </>
                                                ) : (
                                                    <div 
                                                        style={{
                                                            background: 'rgba(255, 255, 255, 0.03)',
                                                            padding: '12px',
                                                            borderRadius: '8px',
                                                            border: '1px solid rgba(255, 255, 255, 0.1)',
                                                            minHeight: '60px',
                                                            cursor: 'pointer',
                                                            color: problem.notes ? '#e2e8f0' : '#94a3b8',
                                                            fontStyle: problem.notes ? 'normal' : 'italic'
                                                        }}
                                                        onClick={() => setEditingNotes(prev => ({ ...prev, [problem.id]: true }))}
                                                    >
                                                        {problem.notes || 'Click to add solution notes...'}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {showAddModal && (
                        <div className="modal-overlay">
                            <div className="modal">
                                <h3>➕ Add New Problem</h3>
                                <div className="form-group">
                                    <label className="form-label">Problem Name</label>
                                    <input 
                                        type="text"
                                        className="form-input"
                                        value={newProblem.name}
                                        onChange={(e) => setNewProblem(prev => ({ ...prev, name: e.target.value }))}
                                        placeholder="e.g., Two Sum"
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">LeetCode Link</label>
                                    <input 
                                        type="url"
                                        className="form-input"
                                        value={newProblem.link}
                                        onChange={(e) => setNewProblem(prev => ({ ...prev, link: e.target.value }))}
                                        placeholder="https://leetcode.com/problems/..."
                                    />
                                </div>
                                <div className="modal-actions">
                                    <button 
                                        className="modal-button primary"
                                        onClick={addNewProblem}
                                    >
                                        Add Problem
                                    </button>
                                    <button 
                                        className="modal-button secondary"
                                        onClick={() => {
                                            setShowAddModal(false);
                                            setNewProblem({ name: '', link: '' });
                                        }}
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            );
        }

        ReactDOM.render(<App />, document.getElementById('root'));
    </script>
</body>
</html>
  `;
    res.send(html);
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 CodeBlind running at http://localhost:${PORT}`);
    console.log('📝 Data will be persisted in leetcode-data.json');
});