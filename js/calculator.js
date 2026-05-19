let currentStudent = JSON.parse(localStorage.getItem('loggedInUser'));
let subjects = [];

if (!currentStudent) {
    window.location.href = "index.html";
}

document.getElementById('welcomeText').innerText = "Welcome, " + currentStudent.name;
document.getElementById('sID').innerText = currentStudent.id;
document.getElementById('sDept').innerText = currentStudent.dept;

window.onload = function() {
    loadStoredResults();
};

function addSubject() {
    const name = document.getElementById('subName').value;
    const credit = parseFloat(document.getElementById('subCredit').value);
    const marks = parseFloat(document.getElementById('subMarks').value);

    if (!name || isNaN(credit) || isNaN(marks)) {
        return alert("Please fill all fields correctly!");
    }

    const gradeData = calculateGrade(marks);
    subjects.push({ name, credit, marks, ...gradeData });
    
    document.getElementById('subName').value = "";
    document.getElementById('subCredit').value = "";
    document.getElementById('subMarks').value = "";

    updateTable();
}

function calculateGrade(marks) {
    if (marks >= 80) return { grade: "A+", gpa: 4.00 };
    if (marks >= 75) return { grade: "A", gpa: 3.75 };
    if (marks >= 70) return { grade: "A-", gpa: 3.50 };
    if (marks >= 65) return { grade: "B+", gpa: 3.25 };
    if (marks >= 60) return { grade: "B", gpa: 3.00 };
    if (marks >= 55) return { grade: "B-", gpa: 2.75 };
    if (marks >= 50) return { grade: "C+", gpa: 2.50 };
    if (marks >= 45) return { grade: "C", gpa: 2.25 };
    if (marks >= 40) return { grade: "D", gpa: 2.00 };
    return { grade: "F", gpa: 0.00 };
}

function updateTable() {
    const list = document.getElementById('subjectList');
    list.innerHTML = "";
    let totalPoints = 0;
    let totalCredits = 0;

    subjects.forEach((s, index) => {
        totalPoints += (s.gpa * s.credit);
        totalCredits += s.credit;
        list.innerHTML += `<tr>
            <td>${s.name}</td>
            <td>${s.credit}</td>
            <td>${s.marks}</td>
            <td>${s.grade}</td>
            <td>${s.gpa.toFixed(2)}</td>
            <td><button onclick="deleteSub(${index})" style="background:#ff4757; color:white; border:none; padding:5px 10px; cursor:pointer; border-radius:3px;">Remove</button></td>
        </tr>`;
    });

    const currentGpa = totalCredits === 0 ? 0 : totalPoints / totalCredits;
    document.getElementById('currentGPA').innerText = currentGpa.toFixed(2);
}

function deleteSub(i) {
    subjects.splice(i, 1);
    updateTable();
}

function saveSemesterResult() {
    const finalGpa = document.getElementById('currentGPA').innerText;
    const semNo = document.getElementById('semesterNum').value;
    
    if (subjects.length === 0) return alert("Add subjects first!");
    if (!semNo) return alert("Enter Semester Number!");

    let users = JSON.parse(localStorage.getItem('users'));
    let userIndex = users.findIndex(u => u.id === currentStudent.id);

    users[userIndex].results.push({
        semester: semNo,
        date: new Date().toLocaleDateString(),
        gpa: finalGpa,
        details: [...subjects]
    });

    localStorage.setItem('users', JSON.stringify(users));
    localStorage.setItem('loggedInUser', JSON.stringify(users[userIndex]));
    currentStudent = users[userIndex];

    alert("Semester " + semNo + " result saved!");
    subjects = [];
    document.getElementById('semesterNum').value = "";
    updateTable();
    loadStoredResults();
}

function loadStoredResults() {
    const filter = document.getElementById('viewSemesterFilter');
    const list = document.getElementById('storedHistoryList');
    const overallCGPAElement = document.getElementById('overallCGPA');
    
    list.innerHTML = "";
    let totalGpaSum = 0;
    let results = currentStudent.results || [];

    // Populate Filter Dropdown
    const currentFilterVal = filter.value;
    filter.innerHTML = '<option value="all">View All Semesters</option>';
    let uniqueSemesters = [...new Set(results.map(r => r.semester))].sort();
    uniqueSemesters.forEach(sem => {
        filter.innerHTML += `<option value="${sem}">Semester ${sem}</option>`;
    });
    filter.value = currentFilterVal;

    // Filter Logic
    let displayResults = currentFilterVal === "all" ? results : results.filter(r => r.semester == currentFilterVal);

    displayResults.forEach((res, index) => {
        totalGpaSum += parseFloat(res.gpa);
        let subs = res.details.map(s => `<small style="background:#eee; padding:2px; margin:2px; border-radius:3px;">${s.name}(${s.grade})</small>`).join(" ");
        
        list.innerHTML += `<tr>
            <td><b>Semester ${res.semester}</b></td>
            <td>${res.date}</td>
            <td><span style="color:#28a745; font-weight:bold;">${res.gpa}</span></td>
            <td>${subs}</td>
            <td><button onclick="deleteSavedResult(${index})" style="background:#ff4757; color:white; border:none; padding:3px 8px; border-radius:3px;">Delete</button></td>
        </tr>`;
    });

    // Calculate Final Overall CGPA
    let avgCGPA = results.length === 0 ? 0 : (results.reduce((acc, curr) => acc + parseFloat(curr.gpa), 0) / results.length);
    overallCGPAElement.innerText = avgCGPA.toFixed(2);
}

function viewResultsBySemester() {
    loadStoredResults();
}

function deleteSavedResult(index) {
    if (confirm("Delete this semester record?")) {
        let users = JSON.parse(localStorage.getItem('users'));
        let uIdx = users.findIndex(u => u.id === currentStudent.id);
        users[uIdx].results.splice(index, 1);
        localStorage.setItem('users', JSON.stringify(users));
        localStorage.setItem('loggedInUser', JSON.stringify(users[uIdx]));
        currentStudent = users[uIdx];
        loadStoredResults();
    }
}

function clearAllHistory() {
    if (confirm("Clear all your history?")) {
        let users = JSON.parse(localStorage.getItem('users'));
        let uIdx = users.findIndex(u => u.id === currentStudent.id);
        users[uIdx].results = [];
        localStorage.setItem('users', JSON.stringify(users));
        localStorage.setItem('loggedInUser', JSON.stringify(users[uIdx]));
        currentStudent = users[uIdx];
        loadStoredResults();
    }
}