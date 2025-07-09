
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
    'Learning to type quickly and accurately is a valuable skill in the modern digital world. From writing simple emails and messages to friends to composing complex technical documents and coding intricate software, the ability to translate thoughts into text efficiently can save a significant amount of time and boost productivity. Many people begin their journey by practicing with short, simple sentences that are specifically designed to contain every single letter of the alphabet. This technique helps to build crucial muscle memory across the entire keyboard layout, not just for the most commonly used letters. Consistent and dedicated practice, even if it is just for a few minutes each day, can lead to remarkable and noticeable improvements in both typing speed and overall precision. It is also important to remember to maintain good posture, with your back straight and your feet flat on the floor, and to keep your wrists in a neutral, straight position to avoid any potential strain or injury over long periods of typing. Taking short breaks to stretch your hands and fingers is also highly recommended.',
    'The journey of a thousand miles begins with a single step. This old proverb holds a great deal of truth, especially when it comes to acquiring a new skill like touch typing. It is very easy to feel overwhelmed at the beginning, with a whole keyboard of letters, numbers, and symbols to master. However, by breaking down the learning process into small, manageable chunks, the task becomes far less daunting. Start by focusing on the home row, which includes the keys A, S, D, F, J, K, L, and the semicolon. Once you are comfortable with the home row, you can gradually expand your reach to the top and bottom rows. There are many online resources, games, and tutorials available that can make the learning process more interactive and enjoyable. The key to success is persistence and a positive attitude. Celebrate small victories, such as increasing your words-per-minute rate by a small margin or achieving a higher accuracy score than the previous day. Do not be discouraged by mistakes; they are a natural part of learning. Every error is an opportunity to identify a weak point and work on it. With time and consistent effort, you will find that your fingers start to fly across the keyboard, and typing becomes a seamless extension of your thoughts.',
    'A quiet evening sky, painted with hues of orange, pink, and purple, provides a perfect backdrop for reflection. As the sun dips below the horizon, the world seems to slow down, offering a moment of peace and tranquility. This is often a time when creativity can flourish, away from the hustle and bustle of the busy day. Many writers and artists find this twilight hour to be their most productive period. The soft, fading light can help to focus the mind and unlock new ideas. The transition from day to night is a powerful symbol of change and renewal. It reminds us that every ending is just the precursor to a new beginning. Just as the stars emerge one by one to populate the dark canvas of the night sky, our own ideas and inspirations can surface when we allow ourselves a moment of quiet contemplation. The digital world we live in is constantly demanding our attention with notifications and updates, but it is vital to carve out these moments of stillness. Whether it is through meditation, a quiet walk, or simply gazing out of a window, disconnecting from the noise allows us to reconnect with ourselves. This is where true insight and groundbreaking thoughts are often born.',
    'Exploring the vast and amazing world of food can be a delightful adventure for your senses. Every culture has its own unique culinary traditions, with a rich history behind each dish. From the spicy curries of India to the delicate pastries of France, there is an entire globe of flavors waiting to be discovered. Cooking is not just about sustenance; it is a form of art and a way to express love and creativity. The simple act of combining different ingredients can result in a masterpiece that brings joy to others. Think about the sizzle of garlic in a hot pan, the fresh aroma of chopped herbs, or the beautiful color of a ripe tomato. These are the small details that make the cooking experience so special and rewarding. Trying a new recipe can be like embarking on a journey to a foreign land without ever leaving your kitchen. You might discover a new favorite spice or a technique that you can use in your everyday cooking. Even if a dish does not turn out perfectly, the process of learning and experimenting is valuable in itself. So, do not be afraid to step out of your culinary comfort zone. Pick up an interesting ingredient from the market, find a recipe that excites you, and see what kind_of magic you can create. You might just surprise yourself with your own hidden talents.',
  ],
  'Business': [
    'The quarterly earnings report indicates a significant growth in market share, exceeding all initial projections. This success can be attributed to our recent strategic pivot towards digital-first marketing channels and a renewed focus on customer retention programs. Our analytics team has observed a forty-five percent increase in user engagement following the launch of the new mobile application. However, we must remain vigilant as our primary competitors are also ramping up their research and development spending. The board of directors has approved a provisional budget for the next fiscal year, which includes a substantial allocation for expanding our international operations. A detailed breakdown of the resource allocation will be circulated to all department heads by the end of the week. We will be holding an all-hands meeting next Tuesday to discuss these results and to outline the key objectives for the upcoming quarter. Please review the attached presentation materials in advance and come prepared with any questions or insights you may have. Our collective effort and commitment to excellence are what drive this company forward, and I am confident that we will continue this positive trajectory. Maintaining this momentum requires a synergistic approach across all verticals.',
    'Our core business strategy for the upcoming fiscal year revolves around leveraging synergistic opportunities to maximize shareholder value while fostering a culture of sustainable innovation. We have identified three key pillars for growth: aggressive market penetration in the Asia-Pacific region, diversification of our product portfolio to include subscription-based services, and a comprehensive overhaul of our supply chain to improve efficiency and reduce our carbon footprint. This multifaceted approach will require significant cross-departmental collaboration. The marketing team will need to develop culturally nuanced campaigns, while the product development team will focus on creating a seamless user experience for the new service offerings. Simultaneously, our operations department will work on sourcing ethical and sustainable materials. The finance team has secured a new round of venture capital funding, which will be instrumental in fueling these initiatives. A detailed project roadmap with clear milestones and key performance indicators has been developed to track our progress. We believe that by adhering to this strategic framework, we can not only achieve our financial targets but also solidify our reputation as a forward-thinking and socially responsible industry leader. Your dedication and expertise are crucial for this endeavor.',
    'This memorandum serves as a formal announcement regarding the impending merger with Quantum Dynamics Incorporated. The acquisition is projected to be finalized by the fourth quarter of this calendar year, pending regulatory approval and shareholder consent. This strategic consolidation is expected to create unparalleled value by combining our robust software development capabilities with Quantum\\\'s cutting-edge hardware innovations. The integration process will be managed by a specially appointed transition committee, co-chaired by executives from both organizations. Their primary responsibility will be to ensure a smooth and efficient amalgamation of our respective operations, cultures, and technologies. Over the next few weeks, the committee will be conducting a series of town hall meetings and departmental workshops to address any questions and to gather valuable input from all employees. We understand that a merger of this magnitude can create uncertainty, and we are fully committed to maintaining transparent and open lines of communication throughout this entire process. We firmly believe that this union will position our new combined entity as the undisputed market leader, capable of delivering next-generation solutions that will redefine the industry landscape. We are incredibly excited about the future and the immense opportunities that lie ahead for all of us.',
    'To optimize our operational efficiency, we are implementing a new enterprise resource planning system, which will go live at the beginning of next month. This transition will consolidate our disparate data sources into a single, unified platform, providing real-time analytics and improving decision-making capabilities across the entire organization. Mandatory training sessions will be held for all personnel over the next three weeks. Please consult the schedule distributed by the Human Resources department and register for a session that is convenient for you. It is imperative that all employees complete this training to ensure a seamless transition and to minimize disruptions to our daily operations. The new system will automate many of the manual processes that are currently in place, freeing up valuable time for employees to focus on more strategic, value-added tasks. We anticipate a short-term learning curve, but the long-term benefits, including enhanced productivity, reduced operational costs, and improved data accuracy, are expected to be substantial. A dedicated support team will be available around the clock during the initial launch phase to assist with any issues or questions that may arise. We appreciate your cooperation and positive attitude as we embark on this important technological advancement for our company.',
    'The client has formally requested a comprehensive proposal detailing the scope of work, project milestones, deliverables, and all associated costs for the "Project Titan" initiative. This proposal must be submitted for their review no later than the close of business next Friday. This is a high-priority engagement with the potential for a long-term strategic partnership, so it is imperative that our submission is professional, thorough, and compelling. I have assigned the following team members to lead different sections of the proposal: Rebecca will be responsible for the technical architecture and implementation plan. David will handle the financial modeling and pricing structure. Meanwhile, Sarah will focus on the project management methodology and timeline. I will personally oversee the executive summary and the overall narrative. We will have a kickoff meeting tomorrow morning at nine o\'clock sharp to align on our strategy and to establish a clear work-back schedule. Please come prepared to discuss your initial thoughts and to brainstorm our unique value proposition. We need to clearly articulate why our firm is the ideal partner for this ambitious project. Let\'s work together to create a winning proposal that showcases our expertise and secures this pivotal opportunity.',
  ],
  'Email': [
    'Subject: Urgent: Action Required - Q3 Financial Report Review\n\nHi Team,\n\nI hope this email finds you well. I am writing to request your immediate attention to the preliminary Q3 financial report, which I have attached to this email for your convenience. We have a deadline to submit the finalized version to the board by this Friday, so time is of the essence.\n\nPlease take a thorough look at the figures corresponding to your respective departments. It is crucial that we verify the accuracy of all data points and identify any discrepancies or anomalies as soon as possible. If you notice anything that seems incorrect or requires further clarification, please add your comments directly into the shared document and notify both me and the finance department immediately.\n\nWe will be holding a brief review meeting tomorrow afternoon at 2:00 PM to discuss any findings and to align on the final numbers. Please make every effort to attend. Your input is invaluable to ensure the integrity and accuracy of our financial reporting.\n\nThank you for your prompt cooperation on this important matter.\n\nBest regards,\n\nJennifer Chen\nChief Financial Officer',
    'Subject: Project Update and Request for Feedback - New Marketing Campaign\n\nHello everyone,\n\nThis email serves as a progress update on the new "Innovate a Better Tomorrow" marketing campaign. The creative team has just completed the first draft of the campaign materials, including the key visuals, ad copy, and the initial cut of the promotional video. You can access all of these assets via the shared drive link here: [Link to Assets]\n\nWe are now entering the crucial feedback phase of the project. We would be grateful if you could take some time to review the materials and provide your thoughts and suggestions. We are particularly interested in feedback regarding the overall message clarity, brand alignment, and the potential impact on our target demographic. Please consolidate your feedback into the provided spreadsheet in the same folder by the end of the day on Thursday.\n\nThis will allow us to incorporate your valuable insights before we move forward with the final production and media buy. We are on a tight schedule, so your timely response is greatly appreciated.\n\nWe are very excited about the potential of this campaign and believe it will significantly enhance our brand visibility. Thank you for your collaboration.\n\nSincerely,\n\nMichael Rodriguez\nMarketing Director',
    "Subject: Confirmation of Your Upcoming Appointment\n\nDear Valued Client,\n\nThis is an automated reminder to confirm your scheduled appointment with our team. We are looking forward to meeting with you.\n\nHere are the details of your appointment:\nDate: Wednesday, October 26th\nTime: 3:30 PM\nLocation: Our main office, located at 123 Business Avenue, Suite 404.\n\nPlease remember to bring a form of photo identification and any relevant documents that were mentioned in our previous correspondence. If you need to reschedule or cancel your appointment, we kindly request that you provide us with at least 24 hours\' notice. You can do so by replying directly to this email or by calling our office at (555) 123-4567.\n\nWe have reserved this time especially for you and appreciate your cooperation in helping us maintain a smooth schedule for all of our clients. Thank you for your business, and we look forward to seeing you soon.\n\nWarm regards,\n\nThe Service Team",
    'Subject: Welcome to the Team!\n\nHi Alex,\n\nOn behalf of the entire company, I would like to extend a very warm welcome to you! We are absolutely thrilled to have you join our team as the new Senior Software Engineer. We were all very impressed with your background and experience, and we are confident that you will be a fantastic addition to our engineering department.\n\nYour first day will be this coming Monday, September 12th. Please plan to arrive around 9:00 AM. Your new workspace has already been set up for you. Our IT department will provide you with your new laptop and help you get connected to our systems. We have also planned a team lunch at noon so you can get to know your new colleagues in a more informal setting.\n\nOver the next few weeks, you will be going through our onboarding process, which is designed to get you up to speed on our projects, tools, and internal workflows. Your designated mentor, Jane Doe, will be your main point of contact for any questions you might have.\n\nWe are all looking forward to working with you. Please do not hesitate to reach out if you have any questions before Monday.\n\nBest,\n\nSamantha Lee\nHuman Resources Manager',
    "Subject: Out of Office: Limited Access to Email\n\nHello,\n\nThank you for your message. I am currently out of the office and will be returning on Monday, July 15th. During this time, I will have limited access to my email and there may be a delay in my response.\n\nI will do my best to respond to all messages as promptly as possible upon my return. If your matter is urgent and requires immediate assistance, please contact one of the following colleagues who will be able to help you in my absence:\n\nFor matters related to sales and client accounts, please contact David Chen at david.chen@example.com.\n\nFor technical support issues, please create a ticket with our support team at support@example.com.\n\nFor all other urgent inquiries, please reach out to my manager, Brenda Smith, at brenda.smith@example.com.\n\nThank you for your patience and understanding. I look forward to connecting with you when I am back in the office.\n\nKind regards,\n\nThomas Anderson",
  ],
  'IT': [
    'The server migration is scheduled for this weekend, commencing on Saturday at 10:00 PM and concluding on Sunday at approximately 6:00 AM. During this maintenance window, several key internal services, including the CRM, the internal wiki, and the file-sharing platform, will be intermittently unavailable. We are transitioning our infrastructure to a new cloud-based environment to enhance performance, scalability, and security. This upgrade is a critical step in our ongoing modernization initiative. The IT department has conducted extensive testing to minimize the potential for disruption, but we advise all users to save their work and log out of all systems before the maintenance period begins. We will be sending out status updates via the company-wide communication channel throughout the process. A comprehensive post-migration report will be distributed on Monday morning. If you encounter any issues with any of the services after the migration is complete, please do not hesitate to submit a high-priority ticket to the IT helpdesk. We appreciate your patience and understanding as we work to improve our technology infrastructure. This move is vital for our long-term success.',
    'A new security patch, identified as KB5031356, has been released to address a critical remote code execution vulnerability discovered in the operating system. All workstations and servers must be updated within the next 48 hours to mitigate the associated risks. The patch will be deployed automatically via our centralized management system. However, a system restart will be required for the changes to take effect. Please save all of your work and manually restart your machine at your earliest convenience. If you do not restart your computer by the deadline, a forced restart will be initiated. We understand that this may cause a minor disruption, but the security of our network and data is our utmost priority. This vulnerability is being actively exploited in the wild, so prompt action is essential. For more detailed technical information about the vulnerability and the patch, you can refer to the security bulletin posted on the IT section of the intranet. Thank you for your immediate cooperation in helping to keep our digital environment secure. We are constantly monitoring for threats and working to protect our systems.',
    'We have detected a sophisticated phishing campaign that is currently targeting our employees. The malicious emails appear to originate from a legitimate-looking address and often contain a subject line related to "Urgent Payroll Update" or "Action Required: HR Policy Change". These emails typically include a link that directs the user to a fraudulent login page designed to capture their network credentials. It is imperative that you do not click on any links or open any attachments from suspicious or unsolicited emails. Remember, the IT department will never ask you for your password via email. If you receive an email that you believe to be part of this phishing campaign, please do not reply to it or forward it. Instead, use the "Report Phishing" button in your email client to immediately report it to our security team for analysis. If you are concerned that you may have already clicked a link or entered your credentials on a suspicious site, please change your password immediately and contact the IT helpdesk right away. Staying vigilant is our best defense against these types of attacks. Your cooperation is crucial.',
    'The network team will be performing a critical firmware upgrade on the core network switch in the main data center this Friday evening. The maintenance window is scheduled to begin at 11:00 PM and is expected to last for approximately two hours. During this period, you may experience intermittent loss of connectivity to all network resources, including internet access, internal applications, and file servers. This upgrade is necessary to improve network performance, enhance stability, and patch several known security vulnerabilities. While we have designed the process to be as non-disruptive as possible, some level of service interruption is unavoidable. We have chosen these off-peak hours to minimize the impact on business operations. Please plan your work accordingly and ensure that any critical tasks are completed before the maintenance window begins. We apologize for any inconvenience this may cause and appreciate your understanding as we work to maintain a secure and reliable network infrastructure for the entire company. Thank you for your cooperation.',
    'The API endpoint for the customer data service is currently returning a 503 Service Unavailable error. The backend engineering team has been alerted and is actively investigating the root cause of the issue. Initial diagnostics suggest a potential problem with the database connection pool, which appears to be exhausted. All services that rely on this API are currently experiencing degraded performance or complete outages. We are treating this as a top-priority incident and are working diligently to restore service as quickly as possible. We do not have an estimated time for resolution at this moment, but we will provide further updates as more information becomes available. You can monitor the status of the incident on our internal system status page. We have temporarily implemented a fallback mechanism for some non-essential features to reduce the load on the system while we troubleshoot. We sincerely apologize for the disruption this is causing to your workflow and to our customers. We will conduct a full post-mortem analysis after the incident is resolved to prevent a recurrence in the future.',
  ],
  'Python': [
    'import os\n\nclass FileManager:\n    """A simple class to manage file operations."""\n    def __init__(self, directory=\'.\'):\n        if not os.path.isdir(directory):\n            raise ValueError(f"Directory \\\'{directory}\\\' does not exist.")\n        self.directory = directory\n\n    def list_files(self, extension=None):\n        """Lists files in the directory, optionally filtered by extension."""\n        files = os.listdir(self.directory)\n        if extension:\n            if not extension.startswith(\'.\'):\n                extension = \'.\' + extension\n            return [f for f in files if f.endswith(extension)]\n        return files\n\n    def read_file(self, filename):\n        """Reads the content of a specific file."""\n        filepath = os.path.join(self.directory, filename)\n        try:\n            with open(filepath, \'r\') as f:\n                return f.read()\n        except FileNotFoundError:\n            return f"Error: File \\\'{filename}\\\' not found."\n\n    def write_file(self, filename, content):\n        """Writes content to a specific file, overwriting it if it exists."""\n        filepath = os.path.join(self.directory, filename)\n        with open(filepath, \'w\') as f:\n            f.write(content)\n        return True',
    'import requests\n\nclass APIClient:\n    """A basic client for interacting with a JSON REST API."""\n    def __init__(self, base_url):\n        self.base_url = base_url\n\n    def get(self, endpoint, params=None):\n        """Sends a GET request to the specified endpoint."""\n        url = f"{self.base_url}/{endpoint}"\n        try:\n            response = requests.get(url, params=params)\n            response.raise_for_status()  # Raise an exception for bad status codes\n            return response.json()\n        except requests.exceptions.RequestException as e:\n            print(f"An error occurred: {e}")\n            return None\n\n    def post(self, endpoint, data=None):\n        """Sends a POST request with JSON data."""\n        url = f"{self.base_url}/{endpoint}"\n        try:\n            response = requests.post(url, json=data)\n            response.raise_for_status()\n            return response.json()\n        except requests.exceptions.RequestException as e:\n            print(f"An error occurred: {e}")\n            return None',
    'def fibonacci(n):\n    """Generate the Fibonacci sequence up to n terms."""\n    a, b = 0, 1\n    count = 0\n    if n <= 0:\n        print("Please enter a positive integer")\n    elif n == 1:\n        print(f"Fibonacci sequence up to {n} term:")\n        print(a)\n    else:\n        print("Fibonacci sequence:")\n        while count < n:\n            print(a)\n            nth = a + b\n            # update values\n            a = b\n            b = nth\n            count += 1',
    'import datetime\n\n# Get the current date and time\nnow = datetime.datetime.now()\n\nprint("Current Date and Time:")\nprint(now.strftime("%Y-%m-%d %H:%M:%S"))\n\n# Create a specific date\nsome_date = datetime.date(2025, 5, 17)\nprint(f"A specific date: {some_date}")\n\n# Calculate the difference between two dates\ntoday = datetime.date.today()\ndifference = some_date - today\nprint(f"Days until {some_date}: {difference.days} days")\n\n# Add a timedelta to the current time\none_week_later = now + datetime.timedelta(weeks=1)\nprint("One week from now will be:")\nprint(one_week_later.strftime("%A, %B %d, %Y"))',
    'class Vehicle:\n    def __init__(self, make, model, year):\n        self.make = make\n        self.model = model\n        self.year = year\n\n    def display_info(self):\n        return f"{self.year} {self.make} {self.model}"\n\nclass Car(Vehicle):\n    def __init__(self, make, model, year, num_doors):\n        super().__init__(make, model, year)\n        self.num_doors = num_doors\n\n    def display_info(self):\n        return f"{super().display_info()}, {self.num_doors} doors"\n\nclass ElectricCar(Car):\n    def __init__(self, make, model, year, num_doors, battery_size):\n        super().__init__(make, model, year, num_doors)\n        self.battery_size = battery_size # in kWh\n\n    def display_info(self):\n        return f"{super().display_info()}, {self.battery_size} kWh battery"',
    'def bubble_sort(arr):\n    n = len(arr)\n    # Traverse through all array elements\n    for i in range(n):\n        swapped = False\n        # Last i elements are already in place\n        for j in range(0, n-i-1):\n            # traverse the array from 0 to n-i-1\n            # Swap if the element found is greater than the next element\n            if arr[j] > arr[j+1]:\n                arr[j], arr[j+1] = arr[j+1], arr[j]\n                swapped = True\n        if not swapped:\n            break # if no two elements were swapped by inner loop, then break\n    return arr',
  ],
  'HTML': [
    '<!DOCTYPE html>\n<html lang="en">\n<head>\n    <meta charset="UTF-8">\n    <meta name="viewport" content="width=device-width, initial-scale=1.0">\n    <title>Complex Landing Page</title>\n</head>\n<body>\n    <header>\n        <nav>\n            <ul>\n                <li><a href="#home">Home</a></li>\n                <li><a href="#about">About</a></li>\n                <li><a href="#services">Services</a></li>\n                <li><a href="#contact">Contact</a></li>\n            </ul>\n        </nav>\n        <h1>Welcome to Our Advanced Website</h1>\n        <p>Your one-stop solution for amazing things.</p>\n    </header>\n\n    <main>\n        <section id="about">\n            <h2>About Our Company</h2>\n            <p>We are a forward-thinking company dedicated to providing the most innovative and high-quality services in our specialized industry. Our highly skilled team is comprised of passionate experts and experienced professionals who are committed to excellence.</p>\n            <img src="team.jpg" alt="A picture of our dedicated team working together" width="600" height="400">\n        </section>\n\n        <section id="services">\n            <h2>Our Services</h2>\n            <article>\n                <h3>Web Development</h3>\n                <p>We build modern, responsive, and user-friendly websites.</p>\n            </article>\n            <article>\n                <h3>Mobile Applications</h3>\n                <p>Cross-platform mobile apps that work on any device.</p>\n            </article>\n        </section>\n\n        <section id="contact">\n            <h2>Get in Touch</h2>\n            <form action="/submit-form" method="post">\n                <div>\n                    <label for="name">Your Name:</label>\n                    <input type="text" id="name" name="user_name" required>\n                </div>\n                <div>\n                    <label for="email">Your Email:</label>\n                    <input type="email" id="email" name="user_email" required>\n                </div>\n                <div>\n                    <label for="message">Your Message:</label>\n                    <textarea id="message" name="user_message" rows="5" required></textarea>\n                </div>\n                <button type="submit">Send Message</button>\n            </form>\n        </section>\n    </main>\n\n    <footer>\n        <p>&copy; 2024 Our Awesome Company. All rights are reserved and protected.</p>\n        <p>Follow us on <a href="#">Social Media</a></p>\n    </footer>\n</body>\n</html>',
    '<figure>\n  <img src="pic_trulli.jpg" alt="Trulli" style="width:100%">\n  <figcaption>Fig.1 - Trulli, Puglia, Italy.</figcaption>\n</figure>',
    '<details>\n  <summary>Epcot Center</summary>\n  <p>Epcot is a theme park at Walt Disney World Resort featuring exciting attractions, international pavilions, award-winning fireworks and seasonal special events.</p>\n</details>',
    '<audio controls>\n  <source src="horse.ogg" type="audio/ogg">\n  <source src="horse.mp3" type="audio/mpeg">\n  Your browser does not support the audio element.\n</audio>',
    '<h2>A Description List</h2>\n\n<dl>\n  <dt>Coffee</dt>\n  <dd>- black hot drink</dd>\n  <dt>Milk</dt>\n  <dd>- white cold drink</dd>\n</dl>',
    '<iframe src="https://www.example.com" title="Example Website" width="400" height="300" style="border:1px solid black;"></iframe>',
    '<form oninput="x.value=parseInt(a.value)+parseInt(b.value)">\n  <input type="range" id="a" value="50">\n  +\n  <input type="number" id="b" value="25">\n  =\n  <output name="x" for="a b"></output>\n</form>',
    '<p>My favorite color is <del>blue</del> <ins>red</ins>!</p>\n<p>This is <sub>subscripted</sub> text.</p>\n<p>This is <sup>superscripted</sup> text.</p>',
    '<h2>The blockquote element</h2>\n<p>Here is a quote from WWF\\\'s website:</p>\n<blockquote cite="http://www.worldwildlife.org/who/index.html">\nFor 60 years, WWF has worked to help people and nature thrive. As the world\\\'s leading conservation organization, WWF works in nearly 100 countries. At every level, we collaborate with people around the world to develop and deliver innovative solutions that protect communities, wildlife, and the places in which they live.\n</blockquote>',
    '<label for="file">Downloading progress:</label>\n<progress id="file" value="32" max="100"> 32% </progress>',
    '<p>The <abbr title="World Health Organization">WHO</abbr> was founded in 1948.</p>\n<p><bdo dir="rtl">This text will be written from right to left</bdo></p>',
  ],
  'CSS': [
    '/* General Page and Typography Styles */\nbody {\n  font-family: \\\'Roboto\\\', \\\'Helvetica Neue\\\', Arial, sans-serif;\n  line-height: 1.7;\n  color: #333333;\n  background-color: #fcfcfc;\n  margin: 0;\n  padding: 0;\n  -webkit-font-smoothing: antialiased;\n  -moz-osx-font-smoothing: grayscale;\n}\n\nh1, h2, h3 {\n  font-family: \\\'Montserrat\\\', sans-serif;\n  font-weight: 700;\n  color: #2c3e50;\n  margin-top: 1.5em;\n  margin-bottom: 0.5em;\n}\n\na {\n  color: #3498db;\n  text-decoration: none;\n  transition: color 0.3s ease-in-out;\n}\n\na:hover, a:focus {\n  color: #2980b9;\n  text-decoration: underline;\n}\n\n/* Main Layout Container */\n.container {\n  max-width: 1140px;\n  margin-left: auto;\n  margin-right: auto;\n  padding-left: 15px;\n  padding-right: 15px;\n}\n\n/* Navigation Bar Styling */\n.main-navigation {\n  display: flex;\n  justify-content: space-between;\n  align-items: center;\n  background-color: #ffffff;\n  padding: 1rem 2rem;\n  border-bottom: 1px solid #eeeeee;\n  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);\n  position: sticky;\n  top: 0;\n  z-index: 1000;\n}\n\n/* Advanced Button Styling */\n.button-primary {\n  display: inline-block;\n  padding: 12px 24px;\n  border-radius: 5px;\n  background-image: linear-gradient(to right, #3498db, #2980b9);\n  color: white;\n  text-align: center;\n  font-weight: bold;\n  border: none;\n  cursor: pointer;\n  transition: all 0.3s ease;\n  box-shadow: 0 4px 6px rgba(50, 50, 93, 0.11), 0 1px 3px rgba(0, 0, 0, 0.08);\n}\n\n.button-primary:hover {\n  transform: translateY(-2px);\n  box-shadow: 0 7px 14px rgba(50, 50, 93, 0.1), 0 3px 6px rgba(0, 0, 0, 0.08);\n  background-image: linear-gradient(to right, #2980b9, #3498db);\n}\n\n/* Responsive Design using Media Queries */\n@media (max-width: 768px) {\n  .main-navigation {\n    flex-direction: column;\n    padding: 1rem;\n  }\n\n  .nav-links {\n    margin-top: 1rem;\n  }\n}\n\n/* Form Input Styling */\ninput[type="text"],\ninput[type="email"],\ntextarea {\n  width: 100%;\n  padding: 10px;\n  border: 1px solid #dddddd;\n  border-radius: 4px;\n  box-sizing: border-box; /* Important for padding */\n  margin-bottom: 10px;\n  font-size: 16px;\n  transition: border-color 0.3s ease;\n}\n\ninput:focus, textarea:focus {\n  outline: none;\n  border-color: #3498db;\n  box-shadow: 0 0 5px rgba(52, 152, 219, 0.5);\n}',
    '/* CSS Grid Layout Example */\n.grid-wrapper {\n  display: grid;\n  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));\n  grid-gap: 20px;\n  padding: 20px;\n}\n\n.grid-item {\n  background-color: #ffffff;\n  padding: 20px;\n  border-radius: 8px;\n  box-shadow: 0 2px 4px rgba(0,0,0,0.1);\n  text-align: center;\n}',
    '/* Flexbox Centering Utility */\n.flex-center {\n  display: flex;\n  justify-content: center;\n  align-items: center;\n  min-height: 100vh;\n}',
    '/* Keyframe Animation */\n@keyframes slide-in {\n  from {\n    transform: translateX(-100%);\n    opacity: 0;\n  }\n  to {\n    transform: translateX(0);\n    opacity: 1;\n  }\n}\n\n.animated-element {\n  animation: slide-in 1s ease-out forwards;\n}',
    '/* Using CSS Variables (Custom Properties) */\n:root {\n  --primary-color: #3498db;\n  --secondary-color: #2ecc71;\n  --text-color: #333;\n  --base-font-size: 16px;\n}\n\nbody {\n  color: var(--text-color);\n  font-size: var(--base-font-size);\n}\n\n.button-special {\n  background-color: var(--primary-color);\n  color: white;\n}\n\n.highlight {\n  color: var(--secondary-color);\n}',
    '/* Style for a table */\ntable {\n  width: 100%;\n  border-collapse: collapse;\n  margin: 25px 0;\n  font-size: 0.9em;\n}\n\ntable thead tr {\n  background-color: #009879;\n  color: #ffffff;\n  text-align: left;\n}\n\ntable th, table td {\n  padding: 12px 15px;\n}\n\ntable tbody tr {\n  border-bottom: 1px solid #dddddd;\n}\n\ntable tbody tr:nth-of-type(even) {\n  background-color: #f3f3f3;\n}\n\ntable tbody tr:last-of-type {\n  border-bottom: 2px solid #009879;\n}\n\ntable tbody tr.active-row {\n  font-weight: bold;\n  color: #009879;\n}',
    '/* Styling for ordered and unordered lists */\nul.custom-list {\n  list-style-type: none; /* Remove default bullets */\n  padding: 0;\n}\n\nul.custom-list li::before {\n  content: "\\2023 \\00A0"; /* Add a custom bullet and a space */\n  color: var(--primary-color);\n  font-weight: bold;\n  display: inline-block;\n  width: 1em;\n  margin-left: -1em;\n}',
    '/* Pseudo-elements for a cool hover effect */\n.hover-underline-animation {\n  display: inline-block;\n  position: relative;\n  color: var(--primary-color);\n}\n\n.hover-underline-animation::after {\n  content: \\\'\\\';\n  position: absolute;\n  width: 100%;\n  transform: scaleX(0);\n  height: 2px;\n  bottom: 0;\n  left: 0;\n  background-color: var(--primary-color);\n  transform-origin: bottom right;\n  transition: transform 0.25s ease-out;\n}\n\n.hover-underline-animation:hover::after {\n  transform: scaleX(1);\n  transform-origin: bottom left;\n}',
    '.card-flip {\n  perspective: 1000px;\n}\n\n.card-flip-inner {\n  position: relative;\n  width: 100%;\n  height: 100%;\n  text-align: center;\n  transition: transform 0.8s;\n  transform-style: preserve-3d;\n}\n\n.card-flip:hover .card-flip-inner {\n  transform: rotateY(180deg);\n}\n\n.card-front, .card-back {\n  position: absolute;\n  width: 100%;\n  height: 100%;\n  backface-visibility: hidden;\n}',
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
