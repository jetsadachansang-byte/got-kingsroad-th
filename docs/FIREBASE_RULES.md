# Firebase Rules สำหรับระบบ Combo & Build จากผู้เล่น

หน้า `combo.html` เก็บคอมโบและเซตบิลด์ที่ผู้เล่นแชร์ไว้บน Firebase Realtime Database
ตัวเดียวกับที่ตัวนับผู้เข้าชมใช้ (`js/visitors.js`)

## ⚠️ สิ่งที่ต้องทำ (สำคัญ)

โค้ดฝั่งเบราว์เซอร์กันได้แค่การใช้งานทั่วไป — **ความปลอดภัยจริงอยู่ที่ Rules**
ถ้าไม่ตั้ง Rules ใครก็ตามที่รู้ URL ของฐานข้อมูลสามารถลบหรือเขียนทับข้อมูลทั้งหมดได้

เข้า [Firebase Console](https://console.firebase.google.com/) → เลือกโปรเจกต์
→ **Realtime Database** → แท็บ **Rules** แล้ววาง:

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
          ".write": "!data.exists() || !data.child('tok').exists() || newData.child('tok').val() === data.child('tok').val()",
          ".validate": "newData.hasChildren(['title', 'body', 'ts'])",
          "title": { ".validate": "newData.isString() && newData.val().length >= 3 && newData.val().length <= 120" },
          "body":  { ".validate": "newData.isString() && newData.val().length >= 10 && newData.val().length <= 4000" },
          "author":{ ".validate": "newData.isString() && newData.val().length <= 40" },
          "img":   { ".validate": "newData.isString() && newData.val().length <= 400000" },
          "tok":   { ".validate": "newData.isString() && newData.val().length <= 64" },
          "ts":    { ".validate": "newData.isNumber()" },
          "edited":{ ".validate": "newData.isBoolean()" },
          "$other": { ".validate": false }
        }
      }
    }
  }
}
```

### Rules นี้บังคับอะไร

| กฎ | ผลลัพธ์ |
|---|---|
| `.read: true` | ทุกคนอ่านข้อมูลคอมโบ/บิลด์ได้ (จำเป็น เพราะเป็นเว็บสาธารณะ) |
| เงื่อนไข `tok` ใน `.write` | โพสต์ใหม่สร้างได้เสรี แต่**แก้/ลบของคนอื่นไม่ได้** ต้องส่ง `tok` ตรงกับของเดิม |
| `.validate` ต่าง ๆ | จำกัดความยาวหัวข้อ/เนื้อหา/ชื่อ และขนาดรูป กันสแปมยัดข้อมูลใหญ่ |
| `$other: false` | ห้ามเขียน field แปลกปลอมที่เว็บไม่ได้ใช้ |

> หมายเหตุ: path ใน RTDB ยังใช้ชื่อ `skilltree` ตามเดิมโดยตั้งใจ เพื่อไม่ให้ข้อมูลที่ผู้เล่น
> โพสต์ไว้ก่อนเปลี่ยนชื่อระบบหายไป
>
> การลบโพสต์ต้องส่ง `tok` เดิมมาด้วย ซึ่ง Firebase จะเห็นเป็น `newData` ว่าง
> กฎด้านบนอนุญาตให้ลบได้เมื่อ node นั้นไม่มี `tok` — ถ้าต้องการล็อกการลบให้แน่นกว่านี้
> ให้เปลี่ยนเป็นระบบ "ซ่อน" (ตั้ง field `hidden: true`) แทนการลบจริง

## การดูแลเนื้อหา (moderation)

ตอนนี้ยังไม่มีระบบผู้ดูแลในเว็บ ถ้าเจอโพสต์ที่ไม่เหมาะสม เจ้าของเว็บลบได้จาก
Firebase Console → Realtime Database → เปิด path `skilltree/<อาชีพ>/<id>` → กดลบ

ถ้าต้องการระบบรายงานโพสต์ / ผู้ดูแลลบผ่านหน้าเว็บ แจ้งได้ เพิ่มให้ในรอบถัดไปได้

## โครงสร้างข้อมูล

```
skilltree/
  knight/
    <auto-id>/
      title:  "หัวข้อ"
      body:   "รายละเอียด"
      img:    "https://..." หรือ "data:image/webp;base64,..." (ถ้ามี)
      author: "ชื่อผู้แชร์"
      ts:     1754000000000
      tok:    "โทเคนเจ้าของโพสต์"
      edited: true (ถ้าเคยแก้)
  assassin/  ...
  sellsword/ ...
```
