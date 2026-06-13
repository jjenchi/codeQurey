import { readFileSync, writeFileSync, existsSync } from "fs";
import { join, dirname } from "path";
import bcrypt from "bcryptjs";

const ROOT_DIR = join(decodeURIComponent(dirname(new URL(import.meta.url).pathname)), "..");
const USERS_FILE = join(ROOT_DIR, "users.json");

const username = process.argv[2];
const password = process.argv[3];
const email = process.argv[4];

if (!username || !password || !email) {
  console.log("用法: node init-admin.mjs <帳號> <密碼> <email>");
  process.exit(1);
}

const users = existsSync(USERS_FILE) ? JSON.parse(readFileSync(USERS_FILE, "utf-8")) : [];

if (users.some((u) => u.username === username)) {
  console.log(`帳號 ${username} 已存在`);
  process.exit(1);
}

users.push({
  username,
  password_hash: bcrypt.hashSync(password, 10),
  email,
  role: "admin",
});

writeFileSync(USERS_FILE, JSON.stringify(users, null, 2) + "\n");
console.log(`✅ 管理員帳號 ${username} 建立完成`);
