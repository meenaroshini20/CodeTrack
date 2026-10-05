/* =========================================================
   CODETRACK - CODING PRACTICE TRACKER
   ========================================================= */

const STORAGE_KEY = "codetrack_pro_v1";

const defaultProblems = [
    {
        id: "1",
        name: "Two Sum",
        language: "Java",
        difficulty: "Easy",
        category: "Arrays",
        deadline: "",
        url: "https://leetcode.com/problems/two-sum/",
        tags: ["array", "hashmap"],
        notes: "Solve using HashMap.",
        solved: true,
        favorite: true,
        createdAt: new Date().toISOString(),
        solvedAt: new Date().toISOString()
    },

    {
        id: "2",
        name: "Binary Search",
        language: "Java",
        difficulty: "Easy",
        category: "Searching",
        deadline: "",
        url: "https://leetcode.com/problems/binary-search/",
        tags: ["searching"],
        notes: "Practice iterative and recursive approach.",
        solved: false,
        favorite: false,
        createdAt: new Date().toISOString(),
        solvedAt: null
    },

    {
        id: "3",
        name: "Longest Substring Without Repeating Characters",
        language: "Python",
        difficulty: "Medium",
        category: "Strings",
        deadline: "",
        url: "https://leetcode.com/problems/longest-substring-without-repeating-characters/",
        tags: ["string", "sliding-window"],
        notes: "Use sliding window.",
        solved: false,
        favorite: true,
        createdAt: new Date().toISOString(),
        solvedAt: null
    },

    {
        id: "4",
        name: "Reverse Linked List",
        language: "C++",
        difficulty: "Medium",
        category: "Linked List",
        deadline: "",
        url: "",
        tags: ["linked-list"],
        notes: "Practice pointer manipulation.",
        solved: false,
        favorite: false,
        createdAt: new Date().toISOString(),
        solvedAt: null
    }
];


let state = {
    problems: [],
    dailyGoal: 3,
    completedDates: [],
    theme: "light"
};


/* =========================================================
   INITIALIZATION
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    loadData();

    setupNavigation();
    setupFilters();
    setupImport();

    renderAll();

    updateTimerDisplay();

});


/* =========================================================
   LOCAL STORAGE
   ========================================================= */

function loadData() {

    const saved = localStorage.getItem(STORAGE_KEY);

    if (saved) {

        try {

            state = JSON.parse(saved);

            if (!Array.isArray(state.problems)) {
                state.problems = [];
            }

        } catch (error) {

            state.problems = [...defaultProblems];

        }

    } else {

        state.problems = [...defaultProblems];

    }

    applyTheme();
}


function saveData() {

    localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(state)
    );

}


/* =========================================================
   NAVIGATION
   ========================================================= */

function setupNavigation() {

    document.querySelectorAll(".nav-item").forEach(button => {

        button.addEventListener("click", () => {

            const section = button.dataset.section;

            showSection(section);

            document.querySelectorAll(".nav-item")
                .forEach(item => item.classList.remove("active"));

            button.classList.add("active");

        });

    });

}


function showSection(sectionName) {

    document.querySelectorAll(".section")
        .forEach(section => section.classList.remove("active"));

    const target = document.getElementById(sectionName);

    if (target) {
        target.classList.add("active");
    }

    const labels = {
        dashboard: "Dashboard",
        problems: "Problems",
        favorites: "Favorites",
        analytics: "Analytics",
        timer: "Focus Timer",
        goals: "Goals",
        settings: "Settings"
    };

    document.getElementById("pageLabel").textContent =
        labels[sectionName] || "CodeTrack";

    document.querySelector(".sidebar")?.classList.remove("open");

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });

}


function toggleSidebar() {

    document
        .querySelector(".sidebar")
        .classList.toggle("open");

}


/* =========================================================
   RENDER ALL
   ========================================================= */

function renderAll() {

    updateStatistics();
    renderProblems();
    renderFavorites();
    renderRecentProblems();
    renderOverdueProblems();
    renderAnalytics();
    updateGoal();
    applyTheme();

}


/* =========================================================
   STATISTICS
   ========================================================= */

function updateStatistics() {

    const total = state.problems.length;

    const solved = state.problems.filter(
        problem => problem.solved
    ).length;

    const pending = total - solved;

    const favorites = state.problems.filter(
        problem => problem.favorite
    ).length;

    const progress = total === 0
        ? 0
        : Math.round((solved / total) * 100);

    document.getElementById("totalProblems").textContent = total;

    document.getElementById("solvedProblems").textContent = solved;

    document.getElementById("pendingProblems").textContent = pending;

    document.getElementById("progressPercent").textContent =
        progress + "%";

    document.getElementById("favoriteProblems").textContent =
        favorites;

    const streak = calculateStreak();

    document.getElementById("streakCount").textContent =
        streak + (streak === 1 ? " day" : " days");

    document.getElementById("circlePercent").textContent =
        progress + "%";

    const circle =
        document.querySelector(".circle-progress");

    if (circle) {

        circle.style.background =
            `conic-gradient(
                var(--primary) ${progress * 3.6}deg,
                var(--border) ${progress * 3.6}deg
            )`;

    }

}


/* =========================================================
   PROBLEM RENDERING
   ========================================================= */

function renderProblems() {

    const container =
        document.getElementById("problemsList");

    if (!container) return;

    const search =
        document.getElementById("searchInput").value
            .toLowerCase()
            .trim();

    const difficulty =
        document.getElementById("difficultyFilter").value;

    const language =
        document.getElementById("languageFilter").value;

    const status =
        document.getElementById("statusFilter").value;

    const sort =
        document.getElementById("sortFilter").value;


    let problems = [...state.problems];


    if (search) {

        problems = problems.filter(problem => {

            const content = [
                problem.name,
                problem.language,
                problem.category,
                problem.notes,
                ...(problem.tags || [])
            ]
                .join(" ")
                .toLowerCase();

            return content.includes(search);

        });

    }


    if (difficulty !== "all") {

        problems = problems.filter(
            problem => problem.difficulty === difficulty
        );

    }


    if (language !== "all") {

        problems = problems.filter(
            problem => problem.language === language
        );

    }


    if (status === "solved") {

        problems = problems.filter(
            problem => problem.solved
        );

    }


    if (status === "pending") {

        problems = problems.filter(
            problem => !problem.solved
        );

    }


    sortProblems(problems, sort);


    document.getElementById("problemCount").textContent =
        `${problems.length} problem${problems.length === 1 ? "" : "s"} found`;


    if (problems.length === 0) {

        container.innerHTML = emptyState(
            "No problems found",
            "Try changing your filters or add a new coding problem."
        );

        return;

    }


    container.innerHTML =
        problems.map(createProblemCard).join("");

}


function sortProblems(problems, type) {

    if (type === "newest") {

        problems.sort(
            (a, b) =>
                new Date(b.createdAt) -
                new Date(a.createdAt)
        );

    }


    if (type === "oldest") {

        problems.sort(
            (a, b) =>
                new Date(a.createdAt) -
                new Date(b.createdAt)
        );

    }


    if (type === "name") {

        problems.sort(
            (a, b) =>
                a.name.localeCompare(b.name)
        );

    }


    if (type === "deadline") {

        problems.sort((a, b) => {

            if (!a.deadline) return 1;

            if (!b.deadline) return -1;

            return a.deadline.localeCompare(b.deadline);

        });

    }


    if (type === "difficulty") {

        const order = {
            Easy: 1,
            Medium: 2,
            Hard: 3
        };

        problems.sort(
            (a, b) =>
                order[a.difficulty] -
                order[b.difficulty]
        );

    }

}


/* =========================================================
   PROBLEM CARD
   ========================================================= */

function createProblemCard(problem) {

    const difficultyClass =
        problem.difficulty.toLowerCase();

    const overdue =
        isOverdue(problem);

    const tags =
        (problem.tags || [])
            .map(tag =>
                `<span class="tag">#${escapeHtml(tag)}</span>`
            )
            .join("");


    return `
        <div class="problem-card ${problem.solved ? "solved-card" : ""}">

            <div class="card-top">

                <span class="badge ${difficultyClass}">
                    ${escapeHtml(problem.difficulty)}
                </span>

                <button
                    class="favorite-btn ${problem.favorite ? "active" : ""}"
                    onclick="toggleFavorite('${problem.id}')">

                    ${problem.favorite ? "★" : "☆"}

                </button>

            </div>


            <h3 class="card-title">
                ${escapeHtml(problem.name)}
            </h3>


            <div class="card-meta">
                ${escapeHtml(problem.language)}
                •
                ${escapeHtml(problem.category)}
            </div>


            ${
                problem.notes
                    ? `
                    <p class="card-description">
                        ${escapeHtml(problem.notes)}
                    </p>
                    `
                    : ""
            }


            <div class="tags">
                ${tags}
            </div>


            ${
                problem.deadline
                    ? `
                    <div class="card-meta">
                        📅 ${formatDate(problem.deadline)}

                        ${
                            overdue
                                ? `<span class="badge overdue">Overdue</span>`
                                : ""
                        }
                    </div>
                    `
                    : ""
            }


            ${
                problem.solved
                    ? `
                    <span class="badge solved-badge">
                        ✓ Solved
                    </span>
                    `
                    : `
                    <span class="badge">
                        ⏳ Pending
                    </span>
                    `
            }


            <div class="card-actions">

                <button
                    class="card-btn"
                    onclick="toggleSolved('${problem.id}')">

                    ${problem.solved ? "↩ Undo" : "✓ Solve"}

                </button>


                ${
                    problem.url
                        ? `
                        <button
                            class="card-btn"
                            onclick="openProblemUrl('${problem.id}')">

                            🔗 Open

                        </button>
                        `
                        : ""
                }


                <button
                    class="card-btn"
                    onclick="openEditModal('${problem.id}')">

                    ✏️ Edit

                </button>


                <button
                    class="card-btn"
                    onclick="deleteProblem('${problem.id}')">

                    🗑

                </button>

            </div>

        </div>
    `;

}


/* =========================================================
   ADD PROBLEM
   ========================================================= */

function openAddModal() {

    document.getElementById("modalTitle").textContent =
        "Add Problem";

    document.getElementById("problemForm").reset();

    document.getElementById("editId").value = "";

    document.getElementById("problemModal")
        .classList.add("show");

}


function closeModal() {

    document.getElementById("problemModal")
        .classList.remove("show");

}


document.getElementById("problemForm")
    .addEventListener("submit", function(event) {

        event.preventDefault();

        const id =
            document.getElementById("editId").value;

        const name =
            document.getElementById("problemName").value.trim();

        const language =
            document.getElementById("problemLanguage").value;

        const difficulty =
            document.getElementById("problemDifficulty").value;

        const category =
            document.getElementById("problemCategory").value;

        const deadline =
            document.getElementById("problemDeadline").value;

        const url =
            document.getElementById("problemUrl").value.trim();

        const tags =
            document.getElementById("problemTags").value
                .split(",")
                .map(tag => tag.trim())
                .filter(Boolean);

        const notes =
            document.getElementById("problemNotes").value.trim();


        if (id) {

            const problem =
                state.problems.find(
                    problem => problem.id === id
                );

            if (problem) {

                problem.name = name;
                problem.language = language;
                problem.difficulty = difficulty;
                problem.category = category;
                problem.deadline = deadline;
                problem.url = url;
                problem.tags = tags;
                problem.notes = notes;

                showToast("Problem updated successfully!");

            }

        } else {

            const newProblem = {

                id: generateId(),

                name,
                language,
                difficulty,
                category,
                deadline,
                url,
                tags,
                notes,

                solved: false,

                favorite: false,

                createdAt: new Date().toISOString(),

                solvedAt: null

            };


            state.problems.unshift(newProblem);

            showToast("New problem added!");

        }


        saveData();

        closeModal();

        renderAll();

    });


/* =========================================================
   EDIT
   ========================================================= */

function openEditModal(id) {

    const problem =
        state.problems.find(
            problem => problem.id === id
        );

    if (!problem) return;


    document.getElementById("modalTitle").textContent =
        "Edit Problem";

    document.getElementById("editId").value =
        problem.id;

    document.getElementById("problemName").value =
        problem.name;

    document.getElementById("problemLanguage").value =
        problem.language;

    document.getElementById("problemDifficulty").value =
        problem.difficulty;

    document.getElementById("problemCategory").value =
        problem.category;

    document.getElementById("problemDeadline").value =
        problem.deadline || "";

    document.getElementById("problemUrl").value =
        problem.url || "";

    document.getElementById("problemTags").value =
        (problem.tags || []).join(", ");

    document.getElementById("problemNotes").value =
        problem.notes || "";


    document.getElementById("problemModal")
        .classList.add("show");

}


/* =========================================================
   SOLVED
   ========================================================= */

function toggleSolved(id) {

    const problem =
        state.problems.find(
            problem => problem.id === id
        );

    if (!problem) return;


    problem.solved =
        !problem.solved;


    if (problem.solved) {

        problem.solvedAt =
            new Date().toISOString();

        addCompletedDate();

        showToast("🎉 Problem solved!");

    } else {

        problem.solvedAt = null;

        showToast("Problem moved back to pending.");

    }


    saveData();

    renderAll();

}


/* =========================================================
   FAVORITE
   ========================================================= */

function toggleFavorite(id) {

    const problem =
        state.problems.find(
            problem => problem.id === id
        );

    if (!problem) return;


    problem.favorite =
        !problem.favorite;


    saveData();

    renderAll();

    showToast(
        problem.favorite
            ? "⭐ Added to favorites"
            : "Removed from favorites"
    );

}


/* =========================================================
   DELETE
   ========================================================= */

function deleteProblem(id) {

    const problem =
        state.problems.find(
            problem => problem.id === id
        );

    if (!problem) return;


    const confirmed =
        confirm(
            `Delete "${problem.name}"?`
        );


    if (!confirmed) return;


    state.problems =
        state.problems.filter(
            problem => problem.id !== id
        );


    saveData();

    renderAll();

    showToast("Problem deleted.");

}


/* =========================================================
   FAVORITES
   ========================================================= */

function renderFavorites() {

    const container =
        document.getElementById("favoritesList");

    const favorites =
        state.problems.filter(
            problem => problem.favorite
        );


    if (favorites.length === 0) {

        container.innerHTML =
            emptyState(
                "No favorite problems",
                "Click the star on a problem to save it here."
            );

        return;

    }


    container.innerHTML =
        favorites
            .map(createProblemCard)
            .join("");

}


/* =========================================================
   RECENT PROBLEMS
   ========================================================= */

function renderRecentProblems() {

    const container =
        document.getElementById("recentProblems");

    const recent =
        [...state.problems]
            .sort(
                (a, b) =>
                    new Date(b.createdAt) -
                    new Date(a.createdAt)
            )
            .slice(0, 5);


    if (recent.length === 0) {

        container.innerHTML =
            emptyState(
                "No problems yet",
                "Add your first coding problem."
            );

        return;

    }


    container.innerHTML =
        recent.map(problem => `

            <div class="problem-row">

                <div class="problem-row-left">

                    <div
                        class="problem-check ${problem.solved ? "solved" : ""}"
                        onclick="toggleSolved('${problem.id}')">

                        ${problem.solved ? "✓" : ""}

                    </div>

                    <div>

                        <h4>
                            ${escapeHtml(problem.name)}
                        </h4>

                        <small>
                            ${escapeHtml(problem.language)}
                            •
                            ${escapeHtml(problem.difficulty)}
                        </small>

                    </div>

                </div>


                <button
                    class="favorite-btn ${problem.favorite ? "active" : ""}"
                    onclick="toggleFavorite('${problem.id}')">

                    ${problem.favorite ? "★" : "☆"}

                </button>

            </div>

        `).join("");

}


/* =========================================================
   OVERDUE
   ========================================================= */

function renderOverdueProblems() {

    const container =
        document.getElementById("overdueList");

    const overdue =
        state.problems
            .filter(isOverdue)
            .slice(0, 5);


    if (overdue.length === 0) {

        container.innerHTML = `
            <div class="empty-state">
                <strong>🎉 All clear!</strong>
                No overdue problems.
            </div>
        `;

        return;

    }


    container.innerHTML =
        overdue.map(problem => `

            <div class="problem-row">

                <div>

                    <h4>
                        ${escapeHtml(problem.name)}
                    </h4>

                    <small>
                        Due ${formatDate(problem.deadline)}
                    </small>

                </div>

                <span class="badge overdue">
                    Overdue
                </span>

            </div>

        `).join("");

}


/* =========================================================
   ANALYTICS
   ========================================================= */

function renderAnalytics() {

    renderDifficultyChart();

    renderLanguageChart();


    const easy =
        state.problems.filter(
            p => p.difficulty === "Easy" && p.solved
        ).length;

    const medium =
        state.problems.filter(
            p => p.difficulty === "Medium" && p.solved
        ).length;

    const hard =
        state.problems.filter(
            p => p.difficulty === "Hard" && p.solved
        ).length;


    document.getElementById("easySolved").textContent =
        easy;

    document.getElementById("mediumSolved").textContent =
        medium;

    document.getElementById("hardSolved").textContent =
        hard;

}


function renderDifficultyChart() {

    const container =
        document.getElementById("difficultyChart");

    const total =
        Math.max(state.problems.length, 1);


    const difficulties = [
        ["Easy", "easy"],
        ["Medium", "medium"],
        ["Hard", "hard"]
    ];


    container.innerHTML =
        difficulties.map(([name, cls]) => {

            const count =
                state.problems.filter(
                    p => p.difficulty === name
                ).length;

            const percent =
                Math.round((count / total) * 100);


            return `
                <div class="chart-row">

                    <div class="chart-label">
                        <span>${name}</span>
                        <strong>${count}</strong>
                    </div>

                    <div class="chart-track">

                        <div
                            class="chart-value ${cls}"
                            style="width:${percent}%">
                        </div>

                    </div>

                </div>
            `;

        }).join("");

}


function renderLanguageChart() {

    const container =
        document.getElementById("languageChart");


    const languages = {};


    state.problems.forEach(problem => {

        languages[problem.language] =
            (languages[problem.language] || 0) + 1;

    });


    const entries =
        Object.entries(languages);


    if (entries.length === 0) {

        container.innerHTML =
            `<div class="empty-state">No language data.</div>`;

        return;

    }


    const max =
        Math.max(...entries.map(item => item[1]));


    container.innerHTML =
        entries.map(([language, count]) => {

            const width =
                Math.round((count / max) * 100);


            return `
                <div class="chart-row">

                    <div class="chart-label">
                        <span>${escapeHtml(language)}</span>
                        <strong>${count}</strong>
                    </div>

                    <div class="chart-track">

                        <div
                            class="chart-value"
                            style="width:${width}%">
                        </div>

                    </div>

                </div>
            `;

        }).join("");

}


/* =========================================================
   FILTERS
   ========================================================= */

function setupFilters() {

    [
        "searchInput",
        "difficultyFilter",
        "languageFilter",
        "statusFilter",
        "sortFilter"
    ].forEach(id => {

        document.getElementById(id)
            .addEventListener(
                "input",
                renderProblems
            );

        document.getElementById(id)
            .addEventListener(
                "change",
                renderProblems
            );

    });

}


/* =========================================================
   GOALS
   ========================================================= */

function updateGoal() {

    const today =
        getTodayString();


    const solvedToday =
        state.problems.filter(problem =>
            problem.solved &&
            problem.solvedAt &&
            problem.solvedAt.startsWith(today)
        ).length;


    const goal =
        Number(state.dailyGoal) || 3;


    const percentage =
        Math.min(
            100,
            Math.round((solvedToday / goal) * 100)
        );


    document.getElementById("todaySolved").textContent =
        solvedToday;

    document.getElementById("dailyGoalText").textContent =
        goal;

    document.getElementById("dailyGoalBar").style.width =
        percentage + "%";


    document.getElementById("goalPageSolved").textContent =
        solvedToday;

    document.getElementById("goalPageBar").style.width =
        percentage + "%";


    document.getElementById("goalInput").value =
        goal;


    const message =
        document.getElementById("goalMessage");


    if (solvedToday >= goal) {

        message.textContent =
            "🎉 Daily goal completed! Great work!";

    } else {

        const remaining =
            goal - solvedToday;

        message.textContent =
            `${remaining} more problem${remaining === 1 ? "" : "s"} to reach today's goal.`;

    }

}


function saveGoal() {

    const value =
        Number(
            document.getElementById("goalInput").value
        );


    if (!value || value < 1) {

        showToast("Enter a valid goal.");

        return;

    }


    state.dailyGoal = value;

    saveData();

    updateGoal();

    showToast("🎯 Daily goal updated!");

}


/* =========================================================
   STREAK
   ========================================================= */

function addCompletedDate() {

    const today =
        getTodayString();


    if (!state.completedDates) {
        state.completedDates = [];
    }


    if (!state.completedDates.includes(today)) {

        state.completedDates.push(today);

    }

}


function calculateStreak() {

    if (
        !state.completedDates ||
        state.completedDates.length === 0
    ) {

        return 0;

    }


    const dates =
        new Set(state.completedDates);


    let current =
        new Date();


    let today =
        getTodayString();


    if (!dates.has(today)) {

        current.setDate(
            current.getDate() - 1
        );

    }


    let streak = 0;


    while (true) {

        const date =
            current.toISOString().split("T")[0];


        if (!dates.has(date)) {
            break;
        }


        streak++;

        current.setDate(
            current.getDate() - 1
        );

    }


    return streak;

}


/* =========================================================
   RANDOM PROBLEM
   ========================================================= */

function pickRandomProblem() {

    const pending =
        state.problems.filter(
            problem => !problem.solved
        );


    if (pending.length === 0) {

        showToast(
            "🎉 You have solved all your problems!"
        );

        return;

    }


    const random =
        pending[
            Math.floor(
                Math.random() * pending.length
            )
        ];


    showSection("problems");

    document.querySelectorAll(".nav-item")
        .forEach(item => item.classList.remove("active"));


    document
        .querySelector('[data-section="problems"]')
        ?.classList.add("active");


    showToast(
        `🎲 Challenge: ${random.name}`
    );

}


/* =========================================================
   TIMER
   ========================================================= */

let timerSeconds = 25 * 60;

let timerInterval = null;

let currentTimerMode = "focus";


function updateTimerDisplay() {

    const minutes =
        Math.floor(timerSeconds / 60)
            .toString()
            .padStart(2, "0");

    const seconds =
        (timerSeconds % 60)
            .toString()
            .padStart(2, "0");


    document.getElementById("timerDisplay")
        .textContent =
        `${minutes}:${seconds}`;

}


function startTimer() {

    if (timerInterval) return;


    timerInterval =
        setInterval(() => {

            if (timerSeconds <= 0) {

                clearInterval(timerInterval);

                timerInterval = null;

                showToast(
                    currentTimerMode === "focus"
                        ? "🎉 Focus session complete!"
                        : "Break finished! Time to code."
                );

                return;

            }


            timerSeconds--;

            updateTimerDisplay();

        }, 1000);

}


function pauseTimer() {

    clearInterval(timerInterval);

    timerInterval = null;

}


function resetTimer() {

    pauseTimer();

    timerSeconds =
        currentTimerMode === "focus"
            ? 25 * 60
            : 5 * 60;

    updateTimerDisplay();

}


function setTimerMode(mode) {

    currentTimerMode = mode;

    timerSeconds =
        mode === "focus"
            ? 25 * 60
            : 5 * 60;


    document.getElementById("timerMode")
        .textContent =
        mode === "focus"
            ? "FOCUS SESSION"
            : "SHORT BREAK";


    updateTimerDisplay();

    pauseTimer();

}


/* =========================================================
   THEME
   ========================================================= */

function toggleTheme() {

    state.theme =
        state.theme === "dark"
            ? "light"
            : "dark";


    saveData();

    applyTheme();

}


function applyTheme() {

    document.body.classList.toggle(
        "dark",
        state.theme === "dark"
    );

}


/* =========================================================
   EXPORT
   ========================================================= */

function exportData() {

    const data =
        JSON.stringify(
            state,
            null,
            2
        );


    const blob =
        new Blob(
            [data],
            {
                type: "application/json"
            }
        );


    const url =
        URL.createObjectURL(blob);


    const link =
        document.createElement("a");


    link.href = url;

    link.download =
        "codetrack-backup.json";


    link.click();


    URL.revokeObjectURL(url);

    showToast("📥 Backup downloaded.");

}


/* =========================================================
   IMPORT
   ========================================================= */

function setupImport() {

    document
        .getElementById("importFile")
        .addEventListener("change", event => {

            const file =
                event.target.files[0];

            if (!file) return;


            const reader =
                new FileReader();


            reader.onload = function(e) {

                try {

                    const imported =
                        JSON.parse(e.target.result);


                    if (
                        !imported ||
                        !Array.isArray(imported.problems)
                    ) {

                        throw new Error(
                            "Invalid backup"
                        );

                    }


                    state = imported;

                    saveData();

                    renderAll();

                    showToast(
                        "📤 Data imported successfully!"
                    );


                } catch {

                    showToast(
                        "Invalid JSON backup file."
                    );

                }

            };


            reader.readAsText(file);

        });

}


/* =========================================================
   RESET
   ========================================================= */

function resetData() {

    const confirmed =
        confirm(
            "This will delete all CodeTrack data. Continue?"
        );


    if (!confirmed) return;


    localStorage.removeItem(STORAGE_KEY);


    state = {
        problems: [],
        dailyGoal: 3,
        completedDates: [],
        theme: "light"
    };


    renderAll();

    showToast("CodeTrack has been reset.");

}


/* =========================================================
   URL
   ========================================================= */

function openProblemUrl(id) {

    const problem =
        state.problems.find(
            problem => problem.id === id
        );


    if (!problem || !problem.url) {

        showToast("No URL added.");

        return;

    }


    let url = problem.url;


    if (
        !url.startsWith("http://") &&
        !url.startsWith("https://")
    ) {

        url = "https://" + url;

    }


    window.open(
        url,
        "_blank"
    );

}


/* =========================================================
   HELPER FUNCTIONS
   ========================================================= */

function generateId() {

    return Date.now().toString() +
        Math.random()
            .toString(36)
            .substring(2, 8);

}


function getTodayString() {

    const date =
        new Date();


    const year =
        date.getFullYear();


    const month =
        String(
            date.getMonth() + 1
        ).padStart(2, "0");


    const day =
        String(
            date.getDate()
        ).padStart(2, "0");


    return `${year}-${month}-${day}`;

}


function isOverdue(problem) {

    if (
        !problem.deadline ||
        problem.solved
    ) {

        return false;

    }


    return problem.deadline <
        getTodayString();

}


function formatDate(dateString) {

    if (!dateString) return "";

    const date =
        new Date(
            dateString + "T00:00:00"
        );


    return date.toLocaleDateString(
        "en-IN",
        {
            day: "2-digit",
            month: "short",
            year: "numeric"
        }
    );

}


function escapeHtml(value) {

    if (value === undefined || value === null) {
        return "";
    }


    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}


function emptyState(title, message) {

    return `
        <div class="empty-state">

            <strong>${escapeHtml(title)}</strong>

            <span>
                ${escapeHtml(message)}
            </span>

        </div>
    `;

}


/* =========================================================
   TOAST
   ========================================================= */

function showToast(message) {

    const container =
        document.getElementById(
            "toastContainer"
        );


    const toast =
        document.createElement("div");


    toast.className = "toast";

    toast.textContent = message;


    container.appendChild(toast);


    setTimeout(() => {

        toast.remove();

    }, 3000);

}


/* =========================================================
   KEYBOARD SHORTCUTS
   ========================================================= */

document.addEventListener("keydown", event => {

    if (
        event.ctrlKey &&
        event.key.toLowerCase() === "k"
    ) {

        event.preventDefault();

        document.getElementById("searchInput")?.focus();

    }


    if (
        event.key === "Escape"
    ) {

        closeModal();

    }

});


/* =========================================================
   CLOSE MODAL BY CLICKING OUTSIDE
   ========================================================= */

document
    .getElementById("problemModal")
    .addEventListener("click", event => {

        if (
            event.target.id === "problemModal"
        ) {

            closeModal();

        }

    });