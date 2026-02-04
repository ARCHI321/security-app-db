const express = require("express");
const bodyParser = require("body-parser");
const db = require("./db");
const path = require("path");

const app = express();
const cors = require("cors");
app.use(cors());

app.use(bodyParser.json());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));
app.set("view engine", "html");

/* ✅ HOME PAGE */

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "views", "landing.html"));
});

app.get("/form", (req, res) => {
  res.sendFile(path.join(__dirname, "views", "form.html"));
});

app.get("/success", (req, res) => {
  res.sendFile(path.join(__dirname, "views", "success.html"));
});

/* ✅ ADMIN PAGE */
app.get("/admin", (req, res) => {
  res.sendFile(path.join(__dirname, "views", "admin.html"));
});

/* FORM SUBMIT */
app.post("/submit", (req, res) => {
  const {
    first,
    last,
    address,
    phone,
    email,
    description,
    mobile,
    bank,
    device,
  } = req.body;

  // Basic validation
  if (!first || !last || !phone || !email) {
    return res
      .status(400)
      .json({ success: false, message: "Missing required fields" });
  }

  const sql = `
    INSERT INTO requests
    (first_name, last_name, address, phone, email, description, mobile, bank, device)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  db.query(
    sql,
    [first, last, address, phone, email, description, mobile, bank, device],
    (err, result) => {
      if (err) {
        if (err.code === "ER_DUP_ENTRY") {
          return res
            .status(409)
            .json({ success: false, message: "Phone or email already exists" });
        }
        console.error("DB INSERT ERROR:", err);
        return res.status(500).json({ success: false });
      }

      res.json({ success: true, id: result.insertId });
    },
  );
});

/* ADMIN LOGIN */
app.post("/admin-login", (req, res) => {
  const { username, password } = req.body;

  db.query(
    "SELECT * FROM admin WHERE username=? AND password=?",
    [username, password],
    (err, result) => {
      res.json({ success: result.length > 0 });
    },
  );
});

/* FETCH DATA */
app.get("/data", (req, res) => {
  db.query("SELECT * FROM requests", (err, data) => res.json(data));
});

/* DELETE */
app.delete("/delete/:id", (req, res) => {
  db.query("DELETE FROM requests WHERE id=?", [req.params.id], () => {
    res.json({ success: true });
  });
});

// UPDATE
app.put("/update/:id", (req, res) => {
  const sql =
    "UPDATE requests SET first_name=?, last_name = ? , phone=?, email=?, mobile= ? , bank = ? , device = ?, description=? WHERE id=?";

  const values = [
    req.body.first_name,
    req.body.last_name,
    req.body.phone,
    req.body.email,
    req.body.mobile,
    req.body.bank,
    req.body.device,
    req.body.description,
    req.params.id,
  ];

  db.query(sql, values, (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ success: false, error: err });
    }

    res.json({ success: true });
  });
});

// app.listen(process.env.PORT, () =>
//   console.log("✅ Server running on http://localhost:3000"),
// );

app.listen(process.env.PORT, "0.0.0.0", () => {
  console.log(`✅ Server running on port ${process.env.PORT}`);
});
