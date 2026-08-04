# Firebase — ตั้งค่าสิทธิ์ระบบ Combo & Build จากผู้เล่น

หน้า `combo.html` เก็บคอมโบและเซตบิลด์ที่ผู้เล่นแชร์ไว้บน Firebase Realtime Database
ตัวเดียวกับที่ตัวนับผู้เข้าชมใช้ (`js/visitors.js`)

## สิทธิ์ที่ระบบนี้บังคับ

| ใคร | ทำอะไรได้ |
|---|---|
| ผู้เล่นทั่วไป | **เขียนโพสต์ใหม่** และเผยแพร่ได้ทันที |
| เจ้าของโพสต์ | **แก้ไขโพสต์ของตัวเอง** ได้ (จากอุปกรณ์เดิม) |
| **เจ้าของเว็บเท่านั้น** | **ลบโพสต์** ได้ — ต้องล็อกอินก่อน |

> ⚠️ การซ่อน/แสดงปุ่มบนหน้าเว็บเป็นแค่ส่วนติดต่อผู้ใช้ กันคนทั่วไปได้เท่านั้น
> **ตัวบังคับสิทธิ์จริงคือ Rules ด้านล่าง** ถ้าไม่ตั้ง ใครก็ลบข้อมูลทั้งหมดได้

---

## 🚑 ทำก่อนเลย — เปิดให้ผู้เล่นโพสต์ได้ (2 นาที)

**อาการ:** กด "เผยแพร่" แล้วขึ้นว่าเปิดสิทธิ์เขียนไม่ครบ / บันทึกไม่สำเร็จ
**สาเหตุ:** Rules เดิมเปิดสิทธิ์ไว้แค่ `presence` (ของตัวนับผู้เข้าชม) ยังไม่ได้เปิดให้ path ของระบบ Combo

เข้า [Firebase Console](https://console.firebase.google.com/) → โปรเจกต์ของคุณ
→ **Realtime Database** → แท็บ **Rules** → วางทับทั้งหมด → **Publish**

```json
{
  "rules": {
    "presence": {
      ".read": true,
      ".write": true
    },
    "skilltree": {
      ".read": true,
      "$class": {
        "$entry": {
          ".write": "(!data.exists() && newData.exists()) || (data.exists() && newData.exists() && newData.child('tok').val() === data.child('tok').val())",
          ".validate": "newData.hasChildren(['title', 'body', 'ts'])",
          "title":  { ".validate": "newData.isString() && newData.val().length >= 3 && newData.val().length <= 120" },
          "body":   { ".validate": "newData.isString() && newData.val().length >= 10 && newData.val().length <= 4000" },
          "author": { ".validate": "newData.isString() && newData.val().length <= 40" },
          "img":    { ".validate": "newData.isString() && newData.val().length <= 400000" },
          "tok":    { ".validate": "newData.isString() && newData.val().length <= 64" },
          "ts":     { ".validate": "newData.isNumber()" },
          "edited": { ".validate": "newData.isBoolean()" },
          "$other": { ".validate": false }
        }
      }
    }
  }
}
```

**วางแค่นี้ก็ใช้งานได้ทันที:**

| ใคร | ผลลัพธ์ |
|---|---|
| ผู้เล่น | โพสต์และเผยแพร่ได้ ✅ |
| เจ้าของโพสต์ | แก้ไขของตัวเองได้ ✅ |
| ทุกคน (รวมคุณ) | **ลบผ่านหน้าเว็บไม่ได้เลย** — ยังไม่มีเงื่อนไข auth |
| คุณ | ลบได้จาก **Firebase Console** (เปิด path → กดถังขยะ) |

สถานะนี้ตรงกับที่ต้องการอยู่แล้ว (คุณเป็นคนเดียวที่ลบได้) เพียงแต่ต้องลบผ่าน Console
ถ้าอยากลบได้จากหน้าเว็บเลย ทำขั้นที่ 1–3 ด้านล่างต่อ

---

# เพิ่มเติม (ถ้าต้องการลบจากหน้าเว็บ)

## ขั้นที่ 1 — สร้างบัญชีผู้ดูแล (ทำครั้งเดียว)

1. เข้า [Firebase Console](https://console.firebase.google.com/) → เลือกโปรเจกต์
2. เมนูซ้าย → **Authentication** → **Get started**
3. แท็บ **Sign-in method** → เปิดใช้ **Email/Password** → Save
4. แท็บ **Users** → **Add user** → ใส่อีเมลกับรหัสผ่านที่จะใช้เป็นผู้ดูแล → Add user
5. คัดลอก **User UID** ของบัญชีนั้นเก็บไว้ (แถวผู้ใช้จะมีคอลัมน์ User UID)

> ใช้รหัสผ่านที่คาดเดายาก และอย่าใช้ซ้ำกับที่อื่น — ใครได้บัญชีนี้ไปจะลบข้อมูลได้ทั้งหมด

## ขั้นที่ 2 — วาง Rules ฉบับเต็ม (เพิ่มสิทธิ์ลบให้เจ้าของ)

ไปที่ **Realtime Database** → แท็บ **Rules** แล้ววางทับทั้งหมด
ต่างจากชุดด้านบนตรงที่เพิ่มเงื่อนไข `auth.uid` เข้าไปเป็นตัวแรก
**อย่าลืมแทน `PASTE_OWNER_UID_HERE` ด้วย UID จากขั้นที่ 1**

```json
{
  "rules": {
    "presence": {
      ".read": true,
      ".write": true
    },
    "skilltree": {
      ".read": true,
      "$class": {
        "$entry": {
          ".write": "auth.uid === 'PASTE_OWNER_UID_HERE' || (!data.exists() && newData.exists()) || (data.exists() && newData.exists() && newData.child('tok').val() === data.child('tok').val())",
          ".validate": "newData.hasChildren(['title', 'body', 'ts'])",
          "title":  { ".validate": "newData.isString() && newData.val().length >= 3 && newData.val().length <= 120" },
          "body":   { ".validate": "newData.isString() && newData.val().length >= 10 && newData.val().length <= 4000" },
          "author": { ".validate": "newData.isString() && newData.val().length <= 40" },
          "img":    { ".validate": "newData.isString() && newData.val().length <= 400000" },
          "tok":    { ".validate": "newData.isString() && newData.val().length <= 64" },
          "ts":     { ".validate": "newData.isNumber()" },
          "edited": { ".validate": "newData.isBoolean()" },
          "$other": { ".validate": false }
        }
      }
    }
  }
}
```

### เงื่อนไข `.write` แต่ละท่อนทำอะไร

| ท่อน | ผลลัพธ์ |
|---|---|
| `auth.uid === 'OWNER_UID'` | เจ้าของเว็บทำได้ทุกอย่าง **รวมถึงลบ** |
| `!data.exists() && newData.exists()` | ใครก็สร้างโพสต์ใหม่ได้ (ยังไม่มีข้อมูลเดิมตรงนั้น) |
| `data.exists() && newData.exists() && tok ตรงกัน` | แก้ไขได้เฉพาะเจ้าของโพสต์ที่ถือ token เดิม |

**การลบของคนทั่วไปจะถูกปฏิเสธอัตโนมัติ** เพราะการลบคือ `newData` ว่าง
ซึ่งไม่ตรงกับเงื่อนไขข้อ 2 และ 3 เหลือแค่ข้อ 1 ที่ต้องเป็นเจ้าของเว็บ

`.validate` ที่เหลือจำกัดความยาวข้อความและขนาดรูป กันคนยัดข้อมูลใหญ่ถล่มฐานข้อมูล
และ `$other: false` ห้ามเขียน field แปลกปลอมที่เว็บไม่ได้ใช้

## ขั้นที่ 3 — ใช้งานจริง

1. เปิดหน้า `combo.html` เลื่อนลงล่างสุด กด **"เข้าสู่ระบบผู้ดูแล"**
2. ใส่อีเมล/รหัสผ่านจากขั้นที่ 1
3. เมื่อล็อกอินแล้วจะเห็นป้าย **"โหมดผู้ดูแล"** และปุ่ม **ลบ (ผู้ดูแล)** ทุกโพสต์
4. เสร็จแล้วกด **ออกจากระบบ** ได้ (ระบบจำการล็อกอินไว้จนกว่าจะกดออก)

---

## โครงสร้างข้อมูล

```
skilltree/                ← path เดิม ตั้งใจไม่เปลี่ยนตามชื่อระบบ
  knight/                   เพื่อไม่ให้โพสต์ที่มีอยู่แล้วหาย
    <auto-id>/
      title:  "หัวข้อคอมโบ/บิลด์"
      body:   "รายละเอียด"
      img:    "https://..." หรือ "data:image/webp;base64,..." (ถ้ามี)
      author: "ชื่อผู้แชร์"
      ts:     1754000000000
      tok:    "โทเคนเจ้าของโพสต์ (ใช้ตรวจสิทธิ์แก้ไข)"
      edited: true (ถ้าเคยแก้)
  assassin/  ...
  sellsword/ ...
```

## ลบจาก Console (สำรอง)

ถ้าล็อกอินหน้าเว็บไม่ได้ ลบตรง ๆ ได้ที่
**Realtime Database** → เปิด path `skilltree/<อาชีพ>/<id>` → กดไอคอนถังขยะ
