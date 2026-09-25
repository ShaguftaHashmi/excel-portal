let portalData = null;
let userScores = {}; 

const sidebarMenu = document.getElementById('topicMenu');
const searchInput = document.getElementById('searchInput');
const themeToggle = document.getElementById('themeToggle');
const body = document.body;

fetch('data.json')
    .then(response => response.json())
    .then(data => {
        portalData = data;
        renderSidebar(portalData.topics);
        if (portalData.topics.length > 0) loadTopic(portalData.topics[0].id);
    })
    .catch(error => console.error("Error loading JSON:", error));

function renderSidebar(topics) {
    sidebarMenu.innerHTML = '';
    topics.forEach(topic => {
        const li = document.createElement('li');
        li.textContent = topic.title;
        li.onclick = () => loadTopic(topic.id);
        li.id = `nav-${topic.id}`;
        sidebarMenu.appendChild(li);
    });
}

function loadTopic(topicId) {
    document.querySelectorAll('#topicMenu li').forEach(li => li.classList.remove('active'));
    const activeNav = document.getElementById(`nav-${topicId}`);
    if(activeNav) activeNav.classList.add('active');

    const topic = portalData.topics.find(t => t.id === topicId);
    if (!topic) return;

    document.getElementById('topicTitle').innerText = topic.title;
    document.getElementById('topicNotes').innerHTML = topic.content;

    // Load Code Block
    if (topic.code) {
        document.getElementById('codeSection').style.display = 'block';
        document.getElementById('topicCode').innerText = topic.code;
        document.getElementById('topicOutput').innerText = topic.output || "No output";
    } else {
        document.getElementById('codeSection').style.display = 'none';
    }

    // Load Coding Questions
    if (topic.coding_questions && topic.coding_questions.length > 0) {
        document.getElementById('codingQuestionsSection').style.display = 'block';
        const cqContainer = document.getElementById('codingQuestionsContainer');
        cqContainer.innerHTML = '';
        topic.coding_questions.forEach((cq, i) => {
            cqContainer.innerHTML += `<div class="coding-task"><strong>Task ${i+1}:</strong> ${cq}</div>`;
        });
    } else {
        document.getElementById('codingQuestionsSection').style.display = 'none';
    }

    // Load MCQ Quiz
    if (topic.quiz && topic.quiz.length > 0) {
        document.getElementById('quizSection').style.display = 'block';
        renderQuiz(topic.quiz, topicId);
    } else {
        document.getElementById('quizSection').style.display = 'none';
    }

    document.getElementById('sidebar').classList.remove('open');
}

function renderQuiz(quizArray, topicId) {
    const container = document.getElementById('quizContainer');
    container.innerHTML = '';
    let score = 0;
    let answeredQuestions = 0;

    quizArray.forEach((q, index) => {
        const qDiv = document.createElement('div');
        qDiv.className = 'quiz-question';
        qDiv.innerHTML = `<p><strong>Q${index + 1}:</strong> ${q.question}</p>`;

        q.options.forEach((opt, optIndex) => {
            const btn = document.createElement('button');
            btn.className = 'quiz-option';
            btn.innerText = opt;
            btn.onclick = () => {
                Array.from(qDiv.querySelectorAll('button')).forEach(child => child.disabled = true);
                answeredQuestions++;
                
                if (optIndex === q.answer) {
                    btn.classList.add('correct');
                    score++;
                } else {
                    btn.classList.add('incorrect');
                    qDiv.querySelectorAll('button')[q.answer].classList.add('correct');
                }
                
                if(answeredQuestions === quizArray.length) {
                    updateScore(topicId, score, quizArray.length);
                }
            };
            qDiv.appendChild(btn);
        });
        container.appendChild(qDiv);
    });
    document.getElementById('topicScore').innerText = '';
}

function updateScore(topicId, score, total) {
    if (topicId !== 'final') {
        userScores[topicId] = true; 
        const totalTopics = portalData.topics.length;
        const completedTopics = Object.keys(userScores).length;
        const percentage = Math.round((completedTopics / totalTopics) * 100);
        
        document.getElementById('overallProgress').style.width = percentage + '%';
        document.getElementById('progressText').innerText = `${percentage}% Completed`;
    }
    document.getElementById('topicScore').innerText = `Score: ${score}/${total}`;
}

searchInput.addEventListener('input', (e) => {
    const term = e.target.value.toLowerCase();
    const filteredTopics = portalData.topics.filter(t => 
        t.title.toLowerCase().includes(term) || t.content.toLowerCase().includes(term)
    );
    renderSidebar(filteredTopics);
});

document.getElementById('copyCodeBtn').addEventListener('click', () => {
    const code = document.getElementById('topicCode').innerText;
    navigator.clipboard.writeText(code).then(() => {
        const btn = document.getElementById('copyCodeBtn');
        btn.innerHTML = '<i class="fa-solid fa-check"></i> Copied!';
        setTimeout(() => btn.innerHTML = '<i class="fa-regular fa-copy"></i> Copy', 2000);
    });
});

themeToggle.addEventListener('click', () => {
    body.classList.toggle('dark-mode');
    const isDark = body.classList.contains('dark-mode');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
    themeToggle.innerHTML = isDark ? '<i class="fa-solid fa-sun"></i>' : '<i class="fa-solid fa-moon"></i>';
});

if (localStorage.getItem('theme') === 'dark') {
    body.classList.add('dark-mode');
    themeToggle.innerHTML = '<i class="fa-solid fa-sun"></i>';
}

document.getElementById('mobileMenuBtn').addEventListener('click', () => {
    document.getElementById('sidebar').classList.toggle('open');
});

document.getElementById('finalAssessmentBtn').addEventListener('click', () => {
    document.getElementById('topicTitle').innerText = "Final Python Assessment";
    document.getElementById('topicNotes').innerHTML = "<p>Test your overall Python knowledge!</p>";
    document.getElementById('codeSection').style.display = 'none';
    document.getElementById('codingQuestionsSection').style.display = 'none';
    document.querySelectorAll('#topicMenu li').forEach(li => li.classList.remove('active'));
    
    document.getElementById('quizSection').style.display = 'block';
    renderQuiz(portalData.assessment, 'final');
});