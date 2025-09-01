// 20 questions (General Knowledge Questions)
const quizData = [
  {
    q: "Which is the largest planet in our Solar System?",
    opts: ["Earth","Mars","Jupiter","Saturn"],
    a: 2
  },
  {
    q: "Who wrote the play 'Romeo and Juliet'?",
    opts: ["William Shakespeare","Charles Dickens","Leo Tolstoy","Mark Twain"],
    a: 0
  },
  {
    q: "What is the capital city of Australia?",
    opts: ["Sydney","Melbourne","Canberra","Brisbane"],
    a: 2
  },
  {
    q: "Which element has the chemical symbol 'O'?",
    opts: ["Oxygen","Gold","Osmium","Oganesson"],
    a: 0
  },
  {
    q: "In which year did World War II end?",
    opts: ["1942","1945","1948","1950"],
    a: 1
  },
  {
    q: "Who painted the Mona Lisa?",
    opts: ["Pablo Picasso","Vincent van Gogh","Leonardo da Vinci","Michelangelo"],
    a: 2
  },
  {
    q: "Which is the smallest continent by land area?",
    opts: ["Europe","Australia","South America","Antarctica"],
    a: 1
  },
  {
    q: "What is the boiling point of water at sea level?",
    opts: ["50°C","75°C","100°C","120°C"],
    a: 2
  },
  {
    q: "Which planet is known as the Red Planet?",
    opts: ["Venus","Mars","Jupiter","Mercury"],
    a: 1
  },
  {
    q: "Who was the first President of the United States?",
    opts: ["Abraham Lincoln","Thomas Jefferson","George Washington","John Adams"],
    a: 2
  },
  {
    q: "Which ocean is the largest?",
    opts: ["Atlantic Ocean","Indian Ocean","Pacific Ocean","Arctic Ocean"],
    a: 2
  },
  {
    q: "What is the currency of Japan?",
    opts: ["Won","Yen","Yuan","Ringgit"],
    a: 1
  },
  {
    q: "Which gas do plants absorb from the atmosphere?",
    opts: ["Oxygen","Nitrogen","Carbon Dioxide","Helium"],
    a: 2
  },
  {
    q: "Which country gifted the Statue of Liberty to the USA?",
    opts: ["Germany","France","United Kingdom","Spain"],
    a: 1
  },
  {
    q: "What is the hardest natural substance on Earth?",
    opts: ["Gold","Iron","Diamond","Quartz"],
    a: 2
  },
  {
    q: "Which scientist proposed the theory of relativity?",
    opts: ["Isaac Newton","Albert Einstein","Galileo Galilei","Nikola Tesla"],
    a: 1
  },
  {
    q: "Which country is known as the Land of the Rising Sun?",
    opts: ["China","Japan","Thailand","Korea"],
    a: 1
  },
  {
    q: "How many players are there in a standard football (soccer) team?",
    opts: ["9","10","11","12"],
    a: 2
  },
  {
    q: "Which is the longest river in the world?",
    opts: ["Amazon River","Nile River","Yangtze River","Mississippi River"],
    a: 1
  },
  {
    q: "What is the national animal of India?",
    opts: ["Lion","Tiger","Elephant","Leopard"],
    a: 1
  }
];

// State
let idx = 0;
let countdown = 15;
let timerId = null;
const chosen = Array(quizData.length).fill(null);

// Elements
const elWelcome   = document.getElementById('welcome');
const elQuiz      = document.getElementById('quiz');
const elQNumber   = document.getElementById('q-number');
const elQText     = document.getElementById('q-text');
const elOptions   = document.getElementById('options');
const elTime      = document.getElementById('time');
const elProgBar   = document.getElementById('progress-bar');
const btnPrev     = document.getElementById('prev-btn');
const btnNext     = document.getElementById('next-btn');
const elResult    = document.getElementById('result');
const elScore     = document.getElementById('score');
const btnRestart  = document.getElementById('restart-btn');
const btnStart    = document.getElementById('start-btn');

// Start
btnStart.addEventListener('click', () => {
  elWelcome.classList.add('hidden');
  elQuiz.classList.remove('hidden');
  render();
  startTimer();
});

// Render the current question SAFELY (no innerHTML with raw tags)
function render() {
  const q = quizData[idx];

  // Question number + progress
  elQNumber.textContent = `Question ${idx + 1} of ${quizData.length}`;
  elProgBar.style.width = `${((idx + 1) / quizData.length) * 100}%`;

  // Question text
  elQText.textContent = q.q;

  // Options
  elOptions.innerHTML = ''; // clear
  q.opts.forEach((text, i) => {
    const label = document.createElement('label');
    label.className = 'option';

    const input = document.createElement('input');
    input.type = 'radio';
    input.name = 'answer';
    input.value = String(i);
    if (chosen[idx] === i) input.checked = true;

    const span = document.createElement('span');
    // Use textContent to avoid parsing <script>, etc.
    span.textContent = text;

    input.addEventListener('change', () => {
      chosen[idx] = i;
    });

    label.appendChild(input);
    label.appendChild(span);
    elOptions.appendChild(label);
  });

  // Footer button states
  btnPrev.disabled = idx === 0;
  btnNext.textContent = idx === quizData.length - 1 ? 'Finish →' : 'Next →';
}

// Timer
function startTimer() {
  clearInterval(timerId);
  countdown = 15;
  elTime.textContent = countdown;
  timerId = setInterval(() => {
    countdown--;
    elTime.textContent = countdown;
    if (countdown <= 0) {
      next();
    }
  }, 1000);
}

function next() {
  clearInterval(timerId);
  if (idx < quizData.length - 1) {
    idx++;
    render();
    startTimer();
  } else {
    finish();
  }
}

function prev() {
  clearInterval(timerId);
  if (idx > 0) {
    idx--;
    render();
    startTimer();
  }
}

btnNext.addEventListener('click', next);
btnPrev.addEventListener('click', prev);

// Finish + score
function finish() {
  // Compute score at the end (so navigating back/forward doesn’t double-count)
  let score = 0;
  chosen.forEach((ans, i) => { if (ans === quizData[i].a) score++; });

  // Hide quiz controls, show result
  document.querySelector('.card').classList.add('hidden');
  document.querySelector('.quiz-footer').classList.add('hidden');
  elResult.classList.remove('hidden');
  elScore.textContent = `${score} / ${quizData.length}`;
  clearInterval(timerId);
}

btnRestart.addEventListener('click', () => window.location.reload());
