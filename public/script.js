/* ===============================
   GLOBAL STATE
================================ */
let fullData = []; // original data (for search reset)
let currentData = []; // filtered / displayed data
let currentPage = 1;
const rowsPerPage = 3;
let editId = null;

/* ===============================
   ADMIN LOGIN
================================ */
function login() {
  const user = document.getElementById("username").value;
  const pass = document.getElementById("password").value;

  if (user === "admin" && pass === "admin123") {
    document.getElementById("loginCard").classList.add("hidden");
    document.getElementById("panel").classList.remove("hidden");
    loadData();
  } else {
    showToast("Admin credentials do not match");
  }
}

/* ===============================
   LOAD DATA
================================ */
function loadData() {
  fetch("/data")
    .then((res) => res.json())
    .then((data) => {
      fullData = data;
      currentData = data;
      currentPage = 1;
      renderTable();
    })
    .catch(() => showToast("Failed to load data"));
}

/* ===============================
   SEARCH
================================ */
function searchTable(value) {
  const keyword = value.toLowerCase();

  currentData = fullData.filter(
    (d) =>
      d.name?.toLowerCase().includes(keyword) ||
      d.phone?.includes(keyword) ||
      d.email?.toLowerCase().includes(keyword) ||
      d.description?.toLowerCase().includes(keyword),
  );

  currentPage = 1;
  renderTable();
}

/* ===============================
   RENDER TABLE + PAGINATION
================================ */
function renderTable() {
  const tableBody = document.getElementById("data");
  tableBody.innerHTML = "";

  if (!currentData.length) {
    tableBody.innerHTML = `<tr><td colspan="5" style="text-align:center">No records found</td></tr>`;
    document.getElementById("pageInfo").innerText = "Page 0 of 0";
    togglePaginationButtons(0);
    return;
  }

  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const pageRows = currentData.slice(startIndex, endIndex);

  pageRows.forEach((item) => {
    tableBody.innerHTML += `
      <tr>
        <td>${item.first_name ?? "-"}</td>
        <td>${item.last_name ?? "-"}</td>
        <td>${item.phone ?? "-"}</td>
        <td>${item.email ?? "-"}</td>
        <td>${item.description ?? "-"}</td>
        <td>${item.mobile ?? "-"}</td>
        <td>${item.bank ?? "-"}</td>
        <td>${item.device ?? "-"}</td>
        <td>
          <button class="edit-btn" onclick="edit(${item.id})">Edit</button>
          <button class="delete-btn" onclick="del(${item.id})">Delete</button>
        </td>
      </tr>
    `;
  });

  const totalPages = Math.ceil(currentData.length / rowsPerPage);
  document.getElementById("pageInfo").innerText =
    `Page ${currentPage} of ${totalPages}`;

  togglePaginationButtons(totalPages);
}

/* ===============================
   PAGINATION CONTROLS
================================ */
function nextPage() {
  const totalPages = Math.ceil(currentData.length / rowsPerPage);
  if (currentPage < totalPages) {
    currentPage++;
    renderTable();
  }
}

function prevPage() {
  if (currentPage > 1) {
    currentPage--;
    renderTable();
  }
}

function togglePaginationButtons(totalPages) {
  document.getElementById("prevBtn").disabled = currentPage <= 1;
  document.getElementById("nextBtn").disabled =
    currentPage >= totalPages || totalPages === 0;
}

function refreshTable() {
  loadData();
}

/* ===============================
   MODAL CONTROLS
================================ */
function openModal() {
  editId = null;
  document.getElementById("modal").classList.remove("hidden");

  ["m_name", "m_phone", "m_email", "m_description"].forEach(
    (id) => (document.getElementById(id).value = ""),
  );

  document.querySelector("#modal h2").innerText = "Add Request";
}

function closeModal() {
  document.getElementById("modal").classList.add("hidden");
  editId = null;
}

/* ===============================
   EDIT
================================ */
function edit(id) {
  editId = id;
  const row = currentData.find((d) => d.id === id);
  if (!row) return;

  document.getElementById("m_first_name").value = row.first_name || "";
  document.getElementById("m_last_name").value = row.last_name || "";
  document.getElementById("m_phone").value = row.phone || "";
  document.getElementById("m_email").value = row.email || "";
  document.getElementById("m_mobile").value = row.mobile || "";
  document.getElementById("m_bank").value = row.bank || "";
  document.getElementById("m_device").value = row.device || "";
  document.getElementById("m_description").value = row.description || "";

  document.querySelector("#modal h2").innerText = "Edit Request";
  document.getElementById("modal").classList.remove("hidden");
}

/* ===============================
   SAVE (ADD / UPDATE)
================================ */
function save() {
  const payload = {
    first_name: document.getElementById("m_first_name").value,
    last_name: document.getElementById("m_last_name").value,
    phone: document.getElementById("m_phone").value,
    email: document.getElementById("m_email").value,
    mobile: document.getElementById("m_mobile").value,
    bank: document.getElementById("m_bank").value,
    device: document.getElementById("m_device").value,
    description: document.getElementById("m_description").value,
  };

  const url = editId ? `/update/${editId}` : "/submit";
  const method = editId ? "PUT" : "POST";

  fetch(url, {
    method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  })
    .then(() => {
      closeModal();
      loadData();
      showToast(editId ? "Record updated" : "Record added");
    })
    .catch(() => showToast("Operation failed"));
}

/* ===============================
   DELETE
================================ */
// function del(id) {
//   if (!confirm("Are you sure you want to delete this record?")) return;

//   fetch(`/delete/${id}`, { method: "DELETE" })
//     .then(() => {
//       loadData();
//       showToast("Record deleted");
//     })
//     .catch(() => showToast("Delete failed"));
// }

let deleteId = null;

function del(id) {
  deleteId = id;
  document.getElementById("confirmModal").classList.remove("hidden");
}

function closeConfirm() {
  deleteId = null;
  document.getElementById("confirmModal").classList.add("hidden");
}

function confirmDelete() {
  if (!deleteId) return;

  fetch(`/delete/${deleteId}`, { method: "DELETE" })
    .then(() => {
      loadData();
      showToast("Record deleted");
    })
    .catch(() => showToast("Delete failed"))
    .finally(() => closeConfirm());
}

/* ===============================
   PUBLIC FORM SUBMIT
================================ */
function submitForm() {
  let first = document.getElementById("first").value.trim();
  let last = document.getElementById("last").value.trim();
  let address = document.getElementById("address").value.trim();
  let phone = document.getElementById("phone").value.trim();
  let email = document.getElementById("email").value.trim();
  let mobile = document.getElementById("mobile").value.trim();
  let bank = document.getElementById("bank").value.trim();
  let device = document.getElementById("device").value.trim();
  let description = document.getElementById("description").value.trim();

  const payload = {
    first,
    last,
    address,
    phone,
    email,
    description,
    mobile,
    bank,
    device,
  };

  if (!payload.first || !payload.last || !payload.phone || !payload.email) {
    // alert("Please fill required fields");
    showToast("Please fill required fields");
    return;
  }
  // Regex patterns
  const phoneRegex = /^[0-9]{10}$/;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  // Validation
  if (first.length < 3 || last.length < 3) {
    showToast("First and last name must be at least 3 characters");
    return;
  }

  if (address.length < 5) {
    showToast("Address must be at least 5 characters");
    return;
  }

  if (!phoneRegex.test(phone)) {
    showToast("Phone number must be exactly 10 digits");
    return;
  }

  if (!emailRegex.test(email)) {
    showToast("Please enter a valid email address");
    return;
  }

  fetch("/submit", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  })
    .then((res) => res.json())
    .then((data) => {
      if (!data.success) {
        showToast(data.message || "Submission failed");
        return;
      }
      document
        .querySelectorAll("input, textarea")
        .forEach((el) => (el.value = ""));
      showToast("Thank you! Our team will contact you.");
      setTimeout(() => (window.location.href = "/success"), 2000);
    })
    .catch(() => alert("Something went wrong"));
}

/* ===============================
   TOAST
================================ */
// function showToast(message) {
//   const toast = document.getElementById("toast");
//   toast.textContent = message;
//   toast.classList.remove("hidden");
//   setTimeout(() => toast.classList.add("hidden"), 5000);
// }

function showToast(message) {
  const toast = document.getElementById("toast");
  toast.textContent = message;

  toast.style.display = "block";
  toast.style.opacity = "1";
  toast.style.zIndex = "9999";

  setTimeout(() => {
    toast.style.opacity = "0";
    setTimeout(() => (toast.style.display = "none"), 300);
  }, 3000);
}

/* ===============================
   LOGOUT
================================ */
function logout() {
  localStorage.clear();
  sessionStorage.clear();
  document.getElementById("panel").classList.add("hidden");
  showToast("Logged out successfully");
  window.location.reload();
}

function togglePassword() {
  const pwd = document.getElementById("password");
  pwd.type = pwd.type === "password" ? "text" : "password";
}
