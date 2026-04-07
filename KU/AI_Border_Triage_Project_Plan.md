# AI Border Triage - Project Implementation Plan & Tasks

เอกสารนี้เป็นการแตกสเปคจาก PRD (โดยเน้นที่ Phase 1) ออกเป็น Epic และ Task ย่อย เพื่อให้ง่ายต่อการแบ่งงานในทีมพัฒนาและการติดตามความคืบหน้า

---

## Epic 1: Project Initialization & Infrastructure (การจัดเตรียมโครงสร้างพื้นฐาน)
> **เป้าหมาย:** สร้างระบบพื้นฐานและโครงสร้าง Database / API ที่จำเป็น
- [ ] **Task 1.1:** Setup project repositories (แบ่ง Backend, Frontend, AI/ML Services)
- [ ] **Task 1.2:** ออกแบบและสร้าง Database Schema (Patient Data, Triage Logs, Medical Staff Accounts)
- [ ] **Task 1.3:** ติดตั้งระบบ CI/CD สำหรับทดสอบและ Deploy อัตโนมัติ
- [ ] **Task 1.4:** จัดเตรียม Server และสภาพแวดล้อมสำหรับรัน `Med-Gemma` (เช่น GPU Server หรือ Cloud Endpoint)

---

## Epic 2: Multilingual Input System (ระบบรับข้อมูลและแปลภาษา - Phase 1 Text)
> **เป้าหมาย:** สร้างระบบรับข้อความอาการป่วยและแปลภาษาเป็นภาษาเป้าหมาย (English/Thai) เพื่อส่งให้ AI
- [ ] **Task 2.1:** พัฒนา UI ส่วนรับข้อมูลผู้ป่วย (แชทบอท/แบบฟอร์ม) รองรับภาษาไทย, พม่า, และกะเหรี่ยง
- [ ] **Task 2.2:** Integration ร่วมกับ Translation Layer API (Google Translate API หรือ Custom Model สำหรับภาษากะเหรี่ยง)
- [ ] **Task 2.3:** พัฒนา Backend Service เพื่อรับข้อความ แปลภาษา และจัดการโครงสร้างข้อมูลก่อนส่งให้ LLM

---

## Epic 3: AI Symptom Interview & Clinical Summary (ระบบสัมภาษณ์และสรุปผลโดย AI)
> **เป้าหมาย:** ใช้ Med-Gemma ในการถามกลับและสรุปประวัติอาการป่วย
- [ ] **Task 3.1:** Prompt Engineering สำหรับ `Med-Gemma` ให้ทำหน้าที่ถามคำถาม Follow-up (สกัดอาการที่ขาดหาย)
- [ ] **Task 3.2:** พัฒนาระบบ Session Management เก็บ Chat History เพื่อให้ AI จำบริบทการสนทนาที่ผ่านมาได้
- [ ] **Task 3.3:** Prompt Engineering สำหรับการสร้าง `Clinical Summary` (Chief Complaint, Symptoms ในรูปแบบมาตรฐาน)
- [ ] **Task 3.4:** สร้าง API Service เพื่อจัดการ Pipeline: สรุปผลข้อความจากแชททั้งหมดเป็นรูปแบบโครงสร้าง JSON

---

## Epic 4: Triage Engine (ระบบคัดกรองจัดระดับความเร่งด่วน)
> **เป้าหมาย:** ระบุระดับความฉุกเฉินของผู้ป่วย (Critical, Urgent, Moderate, Mild) พร้อมระบบความปลอดภัย
- [ ] **Task 4.1:** พัฒนา Rule-based Medical Safety System (ดักจับคีย์เวิร์ด Red Flags เช่น Chest pain, Severe bleeding) 
- [ ] **Task 4.2:** เตรียม Dataset/Features (symptoms, duration, severity) สำหรับ Train Model จัดระดับ Triage
- [ ] **Task 4.3:** พัฒนาและ Train Machine Learning Classifier Model (จัดระดับตามข้อมูลอาการทั่วไป)
- [ ] **Task 4.4:** ประกอบ Hybrid Engine: รัน ML Model ตัดสินใจร่วมกับ Rule-based (Rule-based มีสิทธิ์ Override หากเป็น Red Flag)

---

## Epic 5: Medical Dashboard (แดชบอร์ดสำหรับแพทย์และพยาบาล)
> **เป้าหมาย:** หน้าจอสำหรับบุคลากรทางการแพทย์ใช้ประเมินและตัดสินใจ (Human-in-the-loop)
- [ ] **Task 5.1:** ออกแบบ UI/UX Dashboard หน้าแสดงคิวผู้ป่วย (Patient Queue) และระดับความเสี่ยง
- [ ] **Task 5.2:** พัฒนาระบบ Real-time Update สำหรับ Queue (WebSockets หรือ Server-Sent Events)
- [ ] **Task 5.3:** พัฒนา UI ส่วนแสดง `Clinical Summary` ควบคู่กับการแปลภาษาดั้งเดิม (เพื่อตรวจสอบความถูกต้อง)
- [ ] **Task 5.4:** พัฒนา UI ส่วนอธิบายเหตุผลของ AI (AI Transparency - Symptom evidence and reasoning)
- [ ] **Task 5.5:** สร้างระบบกดยืนยันหรือแก้ไขผล Triage โดยแพทย์ (Doctor Override)

---

## Epic 6: Security, Compliance & Evaluation (ความปลอดภัยและการทดสอบ)
> **เป้าหมาย:** ระบบมีความน่าเชื่อถือ ปลอดภัย และดึงข้อมูลไปใช้ได้อย่างถูกต้องตามกฎหมาย
- [ ] **Task 6.1:** ทำ Data Anonymization Module ลบข้อมูล PII (ชื่อ, ที่อยู่) ก่อนส่งให้ AI
- [ ] **Task 6.2:** เข้ารหัสข้อมูล End-to-end Encryption และตรวจสอบ PDPA Compliance
- [ ] **Task 6.3:** เขียนระบบ Automated Testing สำหรับ Triage Accuracy (โดยเปรียบเทียบผลที่ได้กับ Baseline ของพยาบาล)
- [ ] **Task 6.4:** ทำ Load/Performance Testing (เป้าหมาย: Response time < 3 วิ, Process สรุป < 5 นาที)

---

## ถัดไป (Next Steps)
หากคุณพร้อมลงมือพัฒนา เราสามารถเริ่มตั้งแต่ **Epic 1** หรือเลือก Service ที่คุณต้องการโฟกัสก่อนได้ เช่น:
-  ตั้งค่า Database Schema และ Tech Stack (จะใช้ Node.js, Python, React หรือ ฯลฯ)
-  เขียนโค้ดทดสอบ Prompt กับ Med-Gemma
-  ออกแบบหน้า Dashboard UI

คุณอยากเริ่มโฟกัสที่จุดไหนก่อนดีครับ?
