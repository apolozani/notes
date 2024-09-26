document.addEventListener('DOMContentLoaded', () => {
    const subjectsContainer = document.getElementById('subjects-container');
    const addSectionBtn = document.getElementById('add-section');
    const semesterButtons = document.querySelectorAll('.semester-btn');

    // Load subjects from local storage
    let semesterData = JSON.parse(localStorage.getItem('semesterData')) || {};
    let currentSemester = '1';
    loadSemester(currentSemester);

    // Add new subject section
    addSectionBtn.addEventListener('click', () => {
        const subjectName = prompt("Enter Subject Name:");
        if (subjectName) {
            semesterData[currentSemester].push({ name: subjectName, files: [], notes: '' });
            saveAndRender();
        }
    });

    // Load the subjects for a specific semester
    function loadSemester(semester) {
        currentSemester = semester;
        if (!semesterData[currentSemester]) {
            semesterData[currentSemester] = [];
        }
        renderSubjects();
        updateActiveButton();
    }

    // Update the active semester button
    function updateActiveButton() {
        semesterButtons.forEach(button => {
            button.classList.remove('active');
            if (button.getAttribute('data-semester') === currentSemester) {
                button.classList.add('active');
            }
        });
    }

    // Semester navigation
    semesterButtons.forEach(button => {
        button.addEventListener('click', () => {
            loadSemester(button.getAttribute('data-semester'));
        });
    });

    // Render subjects and files
    function renderSubjects() {
        subjectsContainer.innerHTML = '';
        semesterData[currentSemester].forEach((subject, index) => {
            const subjectElement = document.createElement('div');
            subjectElement.classList.add('subject');
            subjectElement.innerHTML = `
                <div class="subject-heading">
                    <h2>${subject.name}</h2>
                    <button class="remove-btn" onclick="confirmRemoveSubject(${index})">-</button>
                </div>
                <div class="files-container" id="files-container-${index}">
                    ${subject.files.map((file, fileIndex) => `
                        <div class="file-item">
                            <a href="${file.content}" target="_blank">${file.name}</a>
                            <button class="remove-btn" onclick="confirmRemoveFile(${index}, ${fileIndex})">-</button>
                        </div>
                    `).join('')}
                    <input type="file" class="add-file-input" id="file-input-${index}" style="display:none" />
                    <button class="add-file-btn" onclick="document.getElementById('file-input-${index}').click()">Add File</button>
                </div>
                <div class="note-container">
                    <textarea class="note-textarea" id="note-${index}" placeholder="Add notes here...">${subject.notes}</textarea>
                    <button class="save-note-btn" onclick="saveNote(${index})">Save Note</button>
                </div>
            `;
            subjectsContainer.appendChild(subjectElement);

            // Attach file input change event
            document.getElementById(`file-input-${index}`).addEventListener('change', (event) => handleFileUpload(event, index));
        });
    }

    // Handle file upload
    function handleFileUpload(event, subjectIndex) {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                semesterData[currentSemester][subjectIndex].files.push({ name: file.name, type: file.type, content: e.target.result });
                saveAndRender();
            };
            reader.readAsDataURL(file);
        }
    }

    // Save note
    window.saveNote = function (subjectIndex) {
        const noteContent = document.getElementById(`note-${subjectIndex}`).value;
        semesterData[currentSemester][subjectIndex].notes = noteContent;
        saveAndRender();
    }

    // Confirm before removing subject
    window.confirmRemoveSubject = function (subjectIndex) {
        if (confirm("Are you sure you want to delete this subject?")) {
            removeSubject(subjectIndex);
        }
    }

    // Remove subject section
    function removeSubject(subjectIndex) {
        semesterData[currentSemester].splice(subjectIndex, 1);
        saveAndRender();
    }

    // Confirm before removing file
    window.confirmRemoveFile = function (subjectIndex, fileIndex) {
        if (confirm("Are you sure you want to delete this file?")) {
            removeFile(subjectIndex, fileIndex);
        }
    }

    // Remove file from a subject
    function removeFile(subjectIndex, fileIndex) {
        semesterData[currentSemester][subjectIndex].files.splice(fileIndex, 1);
        saveAndRender();
    }

    // Save data to local storage and re-render
    function saveAndRender() {
        localStorage.setItem('semesterData', JSON.stringify(semesterData));
        renderSubjects();
    }
});
