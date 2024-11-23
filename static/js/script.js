let score = 0;
let timeLeft = 30;
let isGameOver = false;
let lastClickTime = 0;
let fastClickCount = 0;
const maxClickSpeed = 66.67; // Allow up to 15 clicks per second (1 click every 66.67ms)
const maxFastClicks = 5;  // Number of consecutive fast clicks before alert

let isTouching = false; // Flag to prevent double-counting on mobile

const scoreElement = document.getElementById('score');
const timerElement = document.getElementById('timer');
const messageElement = document.getElementById('message');
const clickButton = document.getElementById('click-button');
const nameModal = document.getElementById('name-modal');
const nameForm = document.getElementById('name-form');
const leaderboardElement = document.getElementById('leaderboard');

// Function to update the score
const updateScore = (event) => {
    if (isGameOver) return; // Stop if the game is over

    let now = Date.now();
    if (now - lastClickTime < maxClickSpeed) {
        fastClickCount++;
        if (fastClickCount >= maxFastClicks) {
            alert("Auto-clicker detected! Your score will be reset.");
            score = 0; // Reset score if auto-clicker is detected
            scoreElement.textContent = score;
            return;
        }
    } else {
        fastClickCount = 0; // Reset fast-click counter if speed is normal
    }
    lastClickTime = now;

    score++;
    scoreElement.textContent = score;
};

// Function to start the timer
const startTimer = () => {
    const timerInterval = setInterval(() => {
        if (timeLeft <= 0) {
            clearInterval(timerInterval); // Stop the timer
            messageElement.textContent = `Game Over! Your final score is: ${score}`;
            isGameOver = true;

            // Show the name input modal if the score is valid
            if (score > 0) {
                nameModal.style.display = 'block';
            }
        } else {
            timeLeft--;
            timerElement.textContent = timeLeft;
        }
    }, 1000);
};

// Start the timer when the game starts
startTimer();

// Disable click on mobile to avoid double counting
if (!('ontouchstart' in window)) {
    clickButton.addEventListener('click', updateScore); // Only for desktop
}

// Handle touch events for mobile users
clickButton.addEventListener('touchstart', (event) => {
    if (isTouching) return; // Prevent double-touching
    isTouching = true;
    updateScore(event);      // Call the scoring function
});

clickButton.addEventListener('touchend', () => {
    isTouching = false; // Reset the flag after touch ends
});

// Handle name form submission without refreshing the page
nameForm.addEventListener('submit', function(event) {
    event.preventDefault(); // Prevent page refresh

    const playerName = document.getElementById('player-name').value;

    // Send score and name to the server using fetch
    fetch('/submit-score', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            player_name: playerName,
            score: score
        })
    })
    .then(response => response.json())
    .then(data => {
        // Hide the name input modal
        nameModal.style.display = 'none';

        // Update the leaderboard with the latest data
        updateLeaderboard(data.leaderboard);
    })
    .catch(error => console.error('Error:', error));
});

// Function to update the leaderboard on the page
const updateLeaderboard = (leaderboard) => {
    leaderboardElement.innerHTML = ''; // Clear any previous leaderboard data

    leaderboard.forEach(entry => {
        const li = document.createElement('li');
        li.textContent = `${entry.player_name}: ${entry.score} points`;
        leaderboardElement.appendChild(li);
    });
};

// Fetch and display the leaderboard when the page loads
window.onload = () => {
    fetch('/get-leaderboard')
    .then(response => response.json())
    .then(data => {
        updateLeaderboard(data.leaderboard);
    })
    .catch(error => console.error('Error fetching leaderboard:', error));
};
