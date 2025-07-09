'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useGame } from '@/context/GameContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Trophy, RefreshCw, Timer } from 'lucide-react';
import { cn } from '@/lib/utils';

const TEXTS: Record<string, string[]> = {
  'QWERTY Basics': [
    'The quick brown fox jumps over the lazy dog.',
    'Pack my box with five dozen liquor jugs.',
    'Jackdaws love my big sphinx of quartz.',
    'The five boxing wizards jump quickly.',
    'How vexingly quick daft zebras jump!',
    'Bright vixens jump; dozy fowl quack.',
    'Glib jocks quiz nymph to vex dwarf.',
    'Sphinx of black quartz, judge my vow.',
    'Waltz, bad nymph, for quick jigs vex.',
    'Jived fox, pack my box with eight zigs.',
    'My girl wove six dozen plaid jackets before she quit.',
  ],
  'Business': [
    'The quarterly earnings report indicates a significant growth in market share, exceeding all initial projections.',
    'Please review the attached documents and provide your feedback by the end of the business day.',
    'Our core business strategy focuses on leveraging synergistic opportunities to maximize shareholder value.',
    'We need to streamline our workflow to improve operational efficiency across all departments.',
    'The new marketing campaign will target key demographics to enhance brand visibility and customer engagement.',
    "Let's touch base next week to discuss the project milestones and deliverables.",
    'The client has requested a detailed proposal outlining the scope of work and associated costs.',
    'All expense reports must be submitted by the 5th of each month for timely reimbursement.',
    'This initiative is designed to foster a culture of innovation and continuous improvement.',
    'We must ensure compliance with all industry regulations and data protection standards.',
    'The supply chain disruption has impacted our production schedule; we are working on a contingency plan.',
  ],
  'Email': [
    'Hi team, just a reminder about the meeting tomorrow at 10 AM. The agenda is attached. Please come prepared.',
    'I hope this email finds you well. I am writing to follow up on our previous conversation regarding the project timeline.',
    'Could you please provide an update on the status of the Q3 report? Let me know if you need any assistance.',
    'Thank you for your prompt response. Your input is greatly appreciated.',
    'As per our discussion, I have attached the meeting minutes for your review.',
    "I'm writing to confirm my attendance for the upcoming webinar on Thursday.",
    'Please let me know if you have any questions or require further clarification.',
    'Best regards, and I look forward to hearing from you soon.',
    'I am out of the office until Monday with limited access to email.',
    "Let's schedule a call to go over the details at your earliest convenience.",
    'This is an automated response. Your message has been received and will be addressed shortly.',
  ],
  'IT': [
    'The server migration is scheduled for this weekend, expect a brief downtime on Sunday from 2 AM to 4 AM.',
    'To resolve the issue, please clear your browser cache and cookies, then restart the application.',
    'Ensure your operating system and all software are updated with the latest security patches to prevent vulnerabilities.',
    'The firewall is blocking inbound traffic on port 8080; we need to create a new rule to allow access.',
    'We have detected a potential phishing attempt. Do not click on any suspicious links or open attachments.',
    'The database backup process failed last night. We are investigating the root cause of the failure.',
    'Please submit a support ticket through the helpdesk portal with a detailed description of the error.',
    'This system requires two-factor authentication for enhanced security. Please configure it on your mobile device.',
    'The network latency appears to be high in the main office. We are running diagnostics on the router.',
    'Data encryption is enforced for all sensitive information both in transit and at rest.',
    'The API endpoint is returning a 503 Service Unavailable error. The backend team has been notified.',
  ],
  'Python': [
    'import math\n\ndef circle_area(radius):\n    return math.pi * radius ** 2',
    'numbers = [1, 2, 3, 4, 5]\nsquares = [n**2 for n in numbers]',
    'user_data = {"name": "Alice", "age": 30}\nprint(user_data["name"])',
    'with open("data.txt", "r") as f:\n    content = f.read()',
    'for i in range(1, 11):\n    if i % 2 == 0:\n        print(f"{i} is even")',
    'def greet(name="World"):\n    print(f"Hello, {name}!")',
    'try:\n    result = 10 / 0\nexcept ZeroDivisionError:\n    print("Cannot divide by zero.")',
    'my_list = [5, 1, 4, 2, 3]\nmy_list.sort()\nprint(my_list)',
    'import json\n\nperson = \'{"name": "Bob", "languages": ["Python", "Java"]}\'\nperson_dict = json.loads(person)',
    'x = lambda a, b : a * b\nprint(x(5, 6))',
    'class Dog:\n    def __init__(self, name):\n        self.name = name\n\n    def bark(self):\n        return "Woof!"',
  ],
  'HTML': [
    '<!DOCTYPE html>\n<html>\n<head>\n  <title>Page Title</title>\n</head>\n<body>\n  <h1>My First Heading</h1>\n</body>\n</html>',
    '<nav>\n  <a href="/">Home</a>\n  <a href="/about">About</a>\n  <a href="/contact">Contact</a>\n</nav>',
    '<form action="/submit" method="post">\n  <label for="fname">First name:</label><br>\n  <input type="text" id="fname" name="fname">\n</form>',
    '<ul>\n  <li>Coffee</li>\n  <li>Tea</li>\n  <li>Milk</li>\n</ul>',
    '<table>\n  <tr>\n    <th>Company</th>\n    <th>Contact</th>\n  </tr>\n  <tr>\n    <td>Meta</td>\n    <td>Mark</td>\n  </tr>\n</table>',
    '<img src="image.jpg" alt="A descriptive caption" width="500" height="600">',
    '<p>This is a paragraph with a <a href="#">link inside</a>.</p>',
    '<button type="button" onclick="alert(\'Hello world!\')">Click Me</button>',
    '<video width="320" height="240" controls>\n  <source src="movie.mp4" type="video/mp4">\n</video>',
    '<details>\n  <summary>Copyright 2024</summary>\n  <p>All rights reserved.</p>\n</details>',
    '<p>This is a <span style="color:blue;font-weight:bold">blue</span> and bold span.</p>',
  ],
  'CSS': [
    'body {\n  font-family: sans-serif;\n  line-height: 1.6;\n  background-color: #f0f0f0;\n}',
    '.container {\n  max-width: 1200px;\n  margin: 0 auto;\n  padding: 20px;\n}',
    'a:hover {\n  color: #ff0000;\n  text-decoration: none;\n}',
    '@media (max-width: 600px) {\n  .menu {\n    flex-direction: column;\n  }\n}',
    '.grid-container {\n  display: grid;\n  grid-template-columns: auto auto auto;\n}',
    '.flex-container {\n  display: flex;\n  justify-content: center;\n  align-items: center;\n}',
    'button {\n  background-color: #4CAF50;\n  border: none;\n  color: white;\n}',
    'h1 {\n  font-size: 36px;\n  text-align: center;\n  text-transform: uppercase;\n}',
    '#navbar {\n  position: sticky;\n  top: 0;\n  z-index: 100;\n}',
    'p::first-letter {\n  color: #ff0000;\n  font-size: xx-large;\n}',
    'div {\n  border: 1px solid black;\n  box-shadow: 5px 10px #888888;\n}',
  ]
};

const CATEGORIES = Object.keys(TEXTS);

export const TypingGame = () => {
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [textToType, setTextToType] = useState('');
  const [userInput, setUserInput] = useState('');
  const [gameState, setGameState] = useState<'waiting' | 'typing' | 'finished'>('waiting');
  const [stats, setStats] = useState({ wpm: 0, accuracy: 0, time: 0 });
  const [charStates, setCharStates] = useState<( 'correct' | 'incorrect' | 'default')[]>([]);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const { scores, updateScore } = useGame();
  const highScore = scores[26] || 0;

  const chooseNewText = useCallback((cat: string) => {
    const texts = TEXTS[cat];
    setTextToType(texts[Math.floor(Math.random() * texts.length)]);
  }, []);

  useEffect(() => {
    chooseNewText(category);
  }, [category, chooseNewText]);
  
  const resetTest = useCallback(() => {
    setGameState('waiting');
    setUserInput('');
    setCharStates([]);
    setStats({ wpm: 0, accuracy: 0, time: 0 });
    if (timerRef.current) clearInterval(timerRef.current);
    chooseNewText(category);
    inputRef.current?.focus();
  }, [category, chooseNewText]);
  
  useEffect(() => {
    resetTest();
  }, [resetTest]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    
    if (gameState === 'waiting' && value.length > 0) {
      setGameState('typing');
      startTimeRef.current = Date.now();
      timerRef.current = setInterval(() => {
        const timeElapsed = (Date.now() - startTimeRef.current) / 1000;
        setStats(s => ({ ...s, time: parseFloat(timeElapsed.toFixed(1)) }));
      }, 100);
    }
    
    setUserInput(value);

    const newCharStates = textToType.split('').map((char, index) => {
      if (index < value.length) {
        return char === value[index] ? 'correct' : 'incorrect';
      }
      return 'default';
    });
    setCharStates(newCharStates);
    
    if (value.length >= textToType.length) {
      setGameState('finished');
      if (timerRef.current) clearInterval(timerRef.current);
      
      const timeElapsed = (Date.now() - startTimeRef.current) / 1000;
      const wordsTyped = textToType.length / 5;
      const wpm = Math.round(wordsTyped / (timeElapsed / 60));
      
      const correctChars = newCharStates.filter(s => s === 'correct').length;
      const accuracy = Math.round((correctChars / textToType.length) * 100);

      setStats({ wpm, accuracy, time: parseFloat(timeElapsed.toFixed(1)) });
      updateScore(26, wpm);
    }
  };

  return (
    <Card className="w-full max-w-3xl p-4">
      <CardContent className="p-2 space-y-4">
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
            <Select onValueChange={setCategory} defaultValue={category}>
                <SelectTrigger className="w-full sm:w-[200px]">
                    <SelectValue placeholder="Select Category" />
                </SelectTrigger>
                <SelectContent>
                    {CATEGORIES.map(cat => <SelectItem key={cat} value={cat}>{cat}</SelectItem>)}
                </SelectContent>
            </Select>
            <div className="flex gap-4">
                 <div className="flex items-center gap-2 text-lg"><Timer className="h-5 w-5"/>{stats.time}s</div>
                 <div className="flex items-center gap-2 text-lg"><Trophy className="h-5 w-5 text-yellow-500"/>{highScore} WPM</div>
            </div>
        </div>
        
        <div
            className="relative p-4 rounded-lg bg-muted text-lg font-mono tracking-wider cursor-text whitespace-pre-wrap"
            onClick={() => inputRef.current?.focus()}
        >
            {textToType.split('').map((char, index) => (
                <span
                    key={index}
                    className={cn({
                        'text-green-500': charStates[index] === 'correct',
                        'text-red-500 bg-red-500/20 rounded': charStates[index] === 'incorrect',
                        'text-muted-foreground': charStates[index] === 'default'
                    })}
                >
                    {char}
                </span>
            ))}
            {gameState !== 'finished' && userInput.length < textToType.length && (
                <span className="absolute animate-pulse bg-primary w-0.5 h-6" style={{
                    left: `${(userInput.length * 9.6) + 16}px`, // This is an approximation for mono fonts
                    top: '16px'
                }}/>
            )}
             <input
                ref={inputRef}
                type="text"
                value={userInput}
                onChange={handleInputChange}
                className="absolute inset-0 opacity-0 cursor-text"
                disabled={gameState === 'finished'}
                autoFocus
            />
        </div>
        
        {gameState === 'finished' ? (
            <div className="text-center space-y-4">
                <div className="flex justify-around">
                    <div><p className="text-sm text-muted-foreground">WPM</p><p className="text-3xl font-bold">{stats.wpm}</p></div>
                    <div><p className="text-sm text-muted-foreground">Accuracy</p><p className="text-3xl font-bold">{stats.accuracy}%</p></div>
                </div>
                <Button onClick={resetTest} size="lg"><RefreshCw className="mr-2"/>Try Again</Button>
            </div>
        ) : (
            <p className="text-sm text-muted-foreground text-center">Start typing to begin the test.</p>
        )}
      </CardContent>
    </Card>
  );
};
