let currentStudent = JSON.parse(localStorage.getItem('loggedInUser'));
let subjects = [];

if(!currentStudent) window.location.href = "index.html";

// Display Student Info
document.getElementById('welcomeText').innerText = "Welcome, " + currentStudent.name;
document.getElementById('sID').innerText = currentStudent.id;
document.getElementById('sDept').innerText = currentStudent.dept;

function addSubject() {
    const name = document.getElementById('subName').value;
    const credit = parseFloat(document.getElementById('subCredit').value);
    const marks = parseFloat(document.getElementById('subMarks').value);

    if(!name || isNaN(credit) || isNaN(marks)) return alert("Input all fields");

    const gradeData = calculateGrade(marks);
    subjects.push({ name, credit, marks, ...gradeData });
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
    let totalGPA = 0, totalCredits = 0;

    subjects.forEach((s, index) => {
        totalGPA += (s.gpa * s.credit);
        totalCredits += s.credit;
        list.innerHTML += `<tr>
            <td>${s.name}</td>
            <td>${s.credit}</td>
            <td>${s.marks}</td>
            <td>${s.grade}</td>
            <td>${s.gpa}</td>
            <td><button onclick="deleteSub(${index})">Remove</button></td>
        </tr>`;
    });

    const finalGpa = totalCredits === 0 ? 0 : totalGPA / totalCredits;
    document.getElementById('currentGPA').innerText = finalGpa.toFixed(2);
}

function deleteSub(i) { subjects.splice(i, 1); updateTable(); }

function saveSemesterResult() {
    const finalGpa = document.getElementById('currentGPA').innerText;
    let users = JSON.parse(localStorage.getItem('users'));
    let userIndex = users.findIndex(u => u.id === currentStudent.id);

    users[userIndex].results.push({
        date: new Date().toLocaleDateString(),
        gpa: finalGpa,
        subjectCount: subjects.length
    });

    localStorage.setItem('users', JSON.stringify(users));
    localStorage.setItem('loggedInUser', JSON.stringify(users[userIndex]));
    alert("Result Saved Successfully!");
    subjects = [];
    updateTable();
}