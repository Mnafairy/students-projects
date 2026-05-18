"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { SplitText } from "gsap/SplitText";
import { Flip } from "gsap/Flip";

type Student = {
  id: string;
  studentId: string;
  cardId: string;
  slideNum: string;
  totalSlides: string;
  name: string;
  firstName: string;
  lastName: string;
  project: string;
  stack: string;
  desc: string;
  year: string;
  color: string;
};

export default function Home() {
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    // ============= PLACEHOLDER PROJECT DATA =============
    const projects: [string, string, string][] = [
      [
        "Personal Portfolio",
        "React",
        "A responsive portfolio site featuring smooth scroll animations, dark mode, and a custom CMS for blog posts.",
      ],
      [
        "Weather Dashboard",
        "JavaScript",
        "Real-time weather app using OpenWeather API with location search, 7-day forecasts, and animated icons.",
      ],
      [
        "Recipe Finder",
        "Next.js",
        "Search 10,000+ recipes by ingredient with Tailwind and a custom Spoonacular integration.",
      ],
      [
        "Todo App Pro",
        "Vue",
        "Drag-and-drop task manager with categories, due dates, and persistent local storage.",
      ],
      [
        "Music Player",
        "Svelte",
        "Web-based music player with playlists, audio visualizer, and keyboard shortcuts.",
      ],
      [
        "Fitness Tracker",
        "React Native",
        "Track workouts, calories, and progress charts. Built mobile-first with offline support.",
      ],
      [
        "Blog Platform",
        "Astro",
        "Static-generated blog with markdown support, RSS feeds, and automatic dark mode.",
      ],
      [
        "Quiz Game",
        "Vanilla JS",
        "Interactive quiz game with timer, scoreboard, and 500+ questions across 12 categories.",
      ],
      [
        "Photography Site",
        "HTML/CSS",
        "Minimal gallery site showcasing landscape photography with lightbox previews.",
      ],
      [
        "Pomodoro Timer",
        "React",
        "Focus timer with task lists, productivity statistics, and ambient sounds.",
      ],
      [
        "Chat Application",
        "Node.js",
        "Real-time chat with Socket.io, multiple rooms, file sharing, and emoji reactions.",
      ],
      [
        "E-commerce Demo",
        "Next.js",
        "Full shopping cart with Stripe checkout, product filters, and admin panel.",
      ],
    ];
    const colors = [
      "#2d4a5c",
      "#5a3d3d",
      "#3d5a4a",
      "#5a4a3d",
      "#4a3d5a",
      "#3d5a5a",
      "#5a3d5a",
      "#3d3d5a",
      "#5a5a3d",
      "#4a5a3d",
      "#1a4a3d",
      "#4a3d1a",
      "#3d1a4a",
      "#1a3d4a",
      "#4a1a3d",
      "#6b4a3d",
      "#3d6b4a",
      "#4a3d6b",
      "#6b3d4a",
      "#3d4a6b",
    ];

    let TOTAL_STUDENTS = 0;
    let students: Student[] = [];
    const cardIdToIndex = new Map<string, number>();
    const studentIdToIndex = new Map<string, number>();

    async function loadStudents() {
      let raw: Array<{
        id: string;
        studentId: string;
        name: string;
        grade: number;
        cardId: string;
      }>;
      try {
        const res = await fetch("/grade8to11_students_prod.json");
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        raw = await res.json();
      } catch (err) {
        console.error("Failed to load student data:", err);
        document.body.insertAdjacentHTML(
          "afterbegin",
          `<div style="position:fixed;top:80px;left:50%;transform:translateX(-50%);z-index:200;background:#7f1d1d;color:#fff;padding:14px 22px;border-radius:12px;font-family:monospace;font-size:13px;max-width:540px;text-align:center;">
              Could not load <b>grade8to11_students_prod.json</b>.
            </div>`,
        );
        raw = [];
      }

      students = raw.map((s, i) => {
        const parts = (s.name || "").trim().split(/\s+/);
        const firstName = parts[0] || s.name || "Student";
        const lastName = parts.slice(1).join(" ");
        const proj = projects[i % projects.length];
        return {
          id: s.id,
          studentId: s.studentId,
          cardId: s.cardId,
          slideNum: String(i + 1).padStart(3, "0"),
          totalSlides: String(raw.length).padStart(3, "0"),
          name: s.name,
          firstName,
          lastName,
          project: proj[0],
          stack: proj[1],
          desc: proj[2],
          year: String(s.grade),
          color: colors[i % colors.length],
        };
      });
      TOTAL_STUDENTS = students.length;

      cardIdToIndex.clear();
      studentIdToIndex.clear();
      students.forEach((s, i) => {
        if (s.cardId) cardIdToIndex.set(String(s.cardId).trim(), i);
        if (s.studentId)
          studentIdToIndex.set(String(s.studentId).trim().toLowerCase(), i);
      });
    }

    // ============= FAKE QR CODE =============
    function generateQR(seed: string, container: HTMLElement) {
      container.innerHTML = "";
      let seedNum = 0;
      const str = String(seed || "");
      for (let i = 0; i < str.length; i++) {
        seedNum = (seedNum * 31 + str.charCodeAt(i)) | 0;
      }
      seedNum = Math.abs(seedNum);
      for (let i = 0; i < 225; i++) {
        const cell = document.createElement("div");
        const row = Math.floor(i / 15);
        const col = i % 15;
        const inCorner =
          (row < 3 && col < 3) ||
          (row < 3 && col > 11) ||
          (row > 11 && col < 3);
        const cornerBorder =
          (row === 0 || row === 2 || col === 0 || col === 2) &&
          row < 3 &&
          col < 3;
        const cornerBorderTR =
          (row === 0 || row === 2 || col === 12 || col === 14) &&
          row < 3 &&
          col > 11;
        const cornerBorderBL =
          (row === 12 || row === 14 || col === 0 || col === 2) &&
          row > 11 &&
          col < 3;
        const cornerCenter =
          (row === 1 && col === 1) ||
          (row === 1 && col === 13) ||
          (row === 13 && col === 1);
        if (cornerBorder || cornerBorderTR || cornerBorderBL || cornerCenter) {
          // black
        } else if (inCorner) {
          cell.classList.add("white");
        } else {
          const hash = Math.abs(((seedNum * 31 + i * 7) ^ (i * i)) % 100);
          if (hash > 48) cell.classList.add("white");
        }
        container.appendChild(cell);
      }
    }

    // ============= BUILD CAROUSEL =============
    const slider = document.getElementById("slider")!;
    let currentIndex = 0;

    function buildSlide(student: Student, index: number) {
      const section = document.createElement("section");
      section.className =
        "slide-container flex-shrink-0 flex flex-col overflow-hidden group bg-[#0A0A0A] border-white/10 border relative shadow-2xl rounded-2xl origin-center will-change-transform";
      section.id = `slide-${index}`;
      section.dataset.index = String(index);

      section.innerHTML = `
        <div class="site-bg">
          <div class="site-bg-inner">
            <iframe
              src="/example.html"
              loading="lazy"
              scrolling="no"
              tabindex="-1"
            ></iframe>
          </div>
        </div>

        <div class="absolute top-0 left-0 right-0 h-0.5 bg-white/10 z-30">
          <div class="progress-bar h-full bg-orange-500" data-progress></div>
        </div>

        <header class="absolute top-0 left-0 right-0 z-20 flex items-start justify-between p-4 sm:p-8">
          <span class="font-mono text-[9px] sm:text-xs text-neutral-200 uppercase tracking-widest bg-black/45 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/10" data-stagger>
            [<span data-counter>${student.slideNum}</span>/${student.totalSlides}] // ${student.stack.toUpperCase()}
          </span>
        </header>

        <div class="absolute bottom-0 left-0 right-0 z-20 h-[32%] sm:h-1/4 px-4 sm:px-6 py-3 sm:py-4 flex gap-3 sm:gap-4 items-stretch overflow-hidden" data-info-panel
             style="background: linear-gradient(180deg, rgba(10,10,10,0) 0%, rgba(10,10,10,0.85) 18%, rgba(10,10,10,0.96) 50%, rgba(10,10,10,1) 100%);">

          <div class="flex-1 min-w-0 flex flex-col justify-between">
            <div class="min-h-0">
              <div class="mb-0.5 sm:mb-1" data-stagger>
                <span class="font-mono text-[9px] uppercase tracking-[0.3em] text-orange-500 font-bold">Now showing</span>
              </div>

              <h1 class="font-space-grotesk text-2xl sm:text-3xl md:text-4xl tracking-tighter leading-[0.95] font-semibold text-white break-words" data-name
                  style="text-shadow: 0 1px 2px rgba(0,0,0,1), 0 4px 14px rgba(0,0,0,0.95), 0 10px 44px rgba(0,0,0,0.85), 0 0 32px rgba(249,115,22,0.45);">
                ${student.firstName} <span class="text-white/80">${student.lastName}</span>
              </h1>

              <p class="font-space-grotesk text-sm sm:text-base md:text-lg text-white/85 mt-0.5 sm:mt-1 truncate" data-stagger>
                ${student.project}
              </p>
            </div>

            <div class="pt-1.5 sm:pt-2 border-t border-white/10 flex flex-col gap-1 sm:gap-1.5" data-stagger>
              <div class="flex gap-1.5 sm:gap-2 flex-wrap">
                <span class="text-[10px] sm:text-sm font-mono uppercase tracking-wider px-2 sm:px-3 py-0.5 sm:py-1.5 bg-orange-500 text-black rounded font-bold">Year ${student.year}</span>
                <span class="text-[10px] sm:text-sm font-mono uppercase tracking-wider px-2 sm:px-3 py-0.5 sm:py-1.5 bg-white/10 border border-white/15 rounded">${student.stack}</span>
              </div>
              <span class="font-mono text-[8px] sm:text-[9px] text-neutral-500 tracking-widest truncate">PROJECT #${student.slideNum} · CARD ${student.cardId || "—"}</span>
            </div>
          </div>

          <div class="bg-white p-1 sm:p-2 rounded-md shrink-0 flex flex-col items-center justify-center self-center w-20 sm:w-auto h-20 sm:h-[70%] aspect-square shadow-[0_4px_18px_rgba(0,0,0,0.5)]" data-stagger>
            <div class="qr-grid" data-qr="${student.id}" style="height: 100%; width: auto;"></div>
            <div class="hidden sm:block text-black text-[10px] font-mono font-bold text-center mt-1 tracking-wider">SCAN</div>
          </div>
        </div>
      `;

      return section;
    }

    function renderAllSlides() {
      slider.innerHTML = "";
      students.forEach((student, idx) => {
        slider.appendChild(buildSlide(student, idx));
      });
      slider.querySelectorAll<HTMLElement>("[data-qr]").forEach((el) => {
        generateQR(el.dataset.qr!, el);
      });
    }

    // ============= AUTO-ADVANCE =============
    const SLIDE_DURATION = 8000;

    function advance() {
      currentIndex = (currentIndex + 1) % TOTAL_STUDENTS;
      goToSlide(currentIndex);
    }

    gsap.registerPlugin(SplitText, Flip);
    let prevActiveIdx = 0;

    function goToSlide(idx: number) {
      const target = document.getElementById(`slide-${idx}`);
      if (!target) return;
      const targetScrollLeft =
        target.offsetLeft + target.offsetWidth / 2 - slider.clientWidth / 2;
      const scrollObj = { x: slider.scrollLeft };
      gsap.to(scrollObj, {
        x: targetScrollLeft,
        duration: 1.0,
        ease: "power3.out",
        overwrite: "auto",
        onUpdate() {
          slider.scrollLeft = scrollObj.x;
        },
      });
      updateSlideScales(idx);
      animateActiveSlide(idx);
      prevActiveIdx = idx;
    }

    // ============= GSAP COVERFLOW =============
    function updateSlideScales(activeIdx: number) {
      const propsByDistance = (signed: number) => {
        const d = Math.abs(signed);
        if (d === 0) return { scale: 1, opacity: 1, rotationY: 0, z: 0 };
        if (d === 1)
          return {
            scale: 0.72,
            opacity: 0.65,
            rotationY: signed < 0 ? 22 : -22,
            z: -120,
          };
        return {
          scale: 0.52,
          opacity: 0.25,
          rotationY: signed < 0 ? 30 : -30,
          z: -240,
        };
      };
      const range = 2;
      for (let i = 0; i < TOTAL_STUDENTS; i++) {
        const el = document.getElementById(`slide-${i}`);
        if (!el) continue;
        const dist = Math.abs(i - activeIdx);
        if (dist > range) {
          el.style.visibility = "hidden";
          el.style.opacity = "0";
          continue;
        }
        el.style.visibility = "visible";
        gsap.to(el, {
          ...propsByDistance(i - activeIdx),
          duration: 0.9,
          ease: "power3.out",
          overwrite: "auto",
          force3D: true,
        });
      }
    }

    // ============= ACTIVE-SLIDE ANIMATIONS =============
    const splitTextCache = new WeakMap<Element, SplitText>();
    function animateActiveSlide(idx: number) {
      const slide = document.getElementById(`slide-${idx}`);
      if (!slide) return;

      const items = slide.querySelectorAll("[data-stagger]");
      gsap.fromTo(
        items,
        { y: 24, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.7,
          ease: "expo.out",
          stagger: 0.06,
          overwrite: "auto",
          force3D: true,
        },
      );

      const nameEl = slide.querySelector("[data-name]");
      if (nameEl) {
        const cached = splitTextCache.get(nameEl);
        if (cached) cached.revert();
        const split = new SplitText(nameEl as HTMLElement, { type: "chars" });
        splitTextCache.set(nameEl, split);
        gsap.from(split.chars, {
          yPercent: 110,
          opacity: 0,
          rotateX: -90,
          duration: 0.8,
          ease: "expo.out",
          stagger: 0.025,
          delay: 0.15,
        });
      }

      const counter = slide.querySelector("[data-counter]");
      if (counter) {
        const targetVal = idx + 1;
        const fromVal = prevActiveIdx + 1;
        const obj = { v: fromVal };
        gsap.to(obj, {
          v: targetVal,
          duration: 0.7,
          ease: "power2.out",
          onUpdate() {
            counter.textContent = String(Math.round(obj.v)).padStart(2, "0");
          },
        });
      }

      const bar = slide.querySelector("[data-progress]");
      if (bar) {
        gsap.killTweensOf(bar);
        gsap.fromTo(
          bar,
          { scaleX: 0 },
          {
            scaleX: 1,
            duration: SLIDE_DURATION / 1000,
            ease: "none",
          },
        );
      }

      const bg = slide.querySelector(".site-bg-inner") as HTMLElement | null;
      if (bg) {
        gsap.killTweensOf(bg);
        const slideH = slide.offsetHeight || 1;
        const travel = Math.max(0, bg.offsetHeight - slideH);
        gsap.fromTo(
          bg,
          { y: 0 },
          {
            y: -travel,
            duration: (SLIDE_DURATION / 1000) * 0.95,
            ease: "none",
            force3D: true,
          },
        );
      }

      const panel = slide.querySelector("[data-info-panel]");
      if (panel) {
        gsap.fromTo(
          panel,
          { y: 30, opacity: 0.3 },
          {
            y: 0,
            opacity: 1,
            duration: 0.9,
            ease: "power3.out",
            overwrite: "auto",
          },
        );
      }
    }

    // ============= AUTO-ADVANCE CONTROL =============
    let autoAdvanceTimer: ReturnType<typeof setInterval> | null = null;
    function startAutoAdvance() {
      stopAutoAdvance();
      autoAdvanceTimer = setInterval(advance, SLIDE_DURATION);
    }
    function stopAutoAdvance() {
      if (autoAdvanceTimer) clearInterval(autoAdvanceTimer);
      autoAdvanceTimer = null;
    }
    let resumeTimeout: ReturnType<typeof setTimeout> | null = null;
    function pauseAutoAdvance(ms: number) {
      stopAutoAdvance();
      if (resumeTimeout) clearTimeout(resumeTimeout);
      resumeTimeout = setTimeout(startAutoAdvance, ms);
    }

    // ============= TOAST =============
    const toastEl = document.getElementById("toast")!;
    const toastTextEl = document.getElementById("toast-text")!;
    let toastTimer: ReturnType<typeof setTimeout> | null = null;
    function showToast(text: string, variant?: "error" | "ok") {
      toastTextEl.textContent = text;
      toastEl.style.borderColor =
        variant === "error" ? "rgba(239,68,68,0.6)" : "rgba(249,115,22,0.5)";
      toastEl.style.color = variant === "error" ? "#fca5a5" : "#fff";
      gsap.killTweensOf(toastEl);
      gsap.fromTo(
        toastEl,
        { y: -10, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.35, ease: "power3.out" },
      );
      if (toastTimer) clearTimeout(toastTimer);
      toastTimer = setTimeout(() => {
        gsap.to(toastEl, {
          y: -10,
          opacity: 0,
          duration: 0.35,
          ease: "power3.in",
        });
      }, 3500);
    }

    // ============= SCAN / SEARCH =============
    const SCAN_PAUSE_MS = 30000;
    const scanDot = document.getElementById("scan-dot")!;
    function flashScanDot(color: string) {
      scanDot.style.background = color;
      scanDot.style.boxShadow = `0 0 8px ${color}`;
      setTimeout(() => {
        scanDot.style.background = "#525252";
        scanDot.style.boxShadow = "none";
      }, 1500);
    }

    function findStudent(query: string) {
      const q = String(query || "").trim();
      if (!q) return -1;
      if (cardIdToIndex.has(q)) return cardIdToIndex.get(q)!;
      const lower = q.toLowerCase();
      if (studentIdToIndex.has(lower)) return studentIdToIndex.get(lower)!;
      return students.findIndex(
        (s) => s.name && s.name.toLowerCase().includes(lower),
      );
    }

    function handleScan(rawValue: string) {
      const value = String(rawValue || "").trim();
      if (!value) return;
      const idx = findStudent(value);
      if (idx === -1) {
        showToast(`Card not recognized · ${value}`, "error");
        flashScanDot("#ef4444");
        return;
      }
      const s = students[idx];
      currentIndex = idx;
      goToSlide(idx);
      pauseAutoAdvance(SCAN_PAUSE_MS);
      showToast(`Scanned · ${s.name}`, "ok");
      flashScanDot("#f97316");
      const slideEl = document.getElementById(`slide-${idx}`);
      if (slideEl) {
        gsap.fromTo(
          slideEl,
          { scale: 1 },
          {
            scale: 1.04,
            duration: 0.2,
            ease: "power2.out",
            yoyo: true,
            repeat: 1,
            overwrite: false,
          },
        );
      }
    }

    function wireScanInputs() {
      const search = document.getElementById(
        "search-input",
      ) as HTMLInputElement;

      const refocus = () => {
        if (document.activeElement !== search) search.focus();
      };
      refocus();
      document.addEventListener("click", refocus);
      search.addEventListener("blur", () => setTimeout(refocus, 0));

      let lastKeyTime = 0;
      let burstChars = 0;
      const SCAN_BURST_GAP_MS = 50;
      const SCAN_BURST_MIN = 4;
      let autoSubmitTimer: ReturnType<typeof setTimeout> | null = null;

      search.addEventListener("keydown", (e) => {
        const now = performance.now();
        if (e.key === "Enter") {
          e.preventDefault();
          if (autoSubmitTimer) clearTimeout(autoSubmitTimer);
          const v = search.value;
          handleScan(v);
          search.value = "";
          burstChars = 0;
          return;
        }
        if (e.key.length === 1) {
          if (now - lastKeyTime < SCAN_BURST_GAP_MS) burstChars++;
          else burstChars = 1;
          lastKeyTime = now;

          if (autoSubmitTimer) clearTimeout(autoSubmitTimer);
          if (burstChars >= SCAN_BURST_MIN) {
            autoSubmitTimer = setTimeout(() => {
              const v = search.value;
              if (!v) return;
              handleScan(v);
              search.value = "";
              burstChars = 0;
            }, 120);
          }
        }
      });

      let liveTimer: ReturnType<typeof setTimeout> | null = null;
      search.addEventListener("input", () => {
        if (liveTimer) clearTimeout(liveTimer);
        const v = search.value.trim();
        if (!v) return;
        liveTimer = setTimeout(() => {
          if (autoSubmitTimer) return;
          const idx = findStudent(v);
          if (idx !== -1) {
            currentIndex = idx;
            goToSlide(idx);
            pauseAutoAdvance(SCAN_PAUSE_MS);
          }
        }, 250);
      });
    }

    // ============= INIT =============
    (async function init() {
      await loadStudents();
      if (TOTAL_STUDENTS === 0) return;
      renderAllSlides();
      gsap.set("[id^='slide-']", {
        scale: 0.4,
        opacity: 0,
        rotationY: 0,
        transformPerspective: 2000,
      });
      updateSlideScales(0);
      animateActiveSlide(0);
      startAutoAdvance();
      wireScanInputs();
    })();

    // Arrow key navigation
    const onKeyDown = (e: KeyboardEvent) => {
      if (!TOTAL_STUDENTS) return;
      const el = document.activeElement as HTMLElement | null;
      if (el?.id === "search-input") return;
      if (e.key === "ArrowRight") {
        currentIndex = (currentIndex + 1) % TOTAL_STUDENTS;
        goToSlide(currentIndex);
      } else if (e.key === "ArrowLeft") {
        currentIndex = (currentIndex - 1 + TOTAL_STUDENTS) % TOTAL_STUDENTS;
        goToSlide(currentIndex);
      }
    };
    document.addEventListener("keydown", onKeyDown);

    // Touch swipe
    let touchStartX = 0;
    let touchStartY = 0;
    const onTouchStart = (e: TouchEvent) => {
      touchStartX = e.touches[0].clientX;
      touchStartY = e.touches[0].clientY;
    };
    const onTouchEnd = (e: TouchEvent) => {
      if (!TOTAL_STUDENTS) return;
      const dx = e.changedTouches[0].clientX - touchStartX;
      const dy = e.changedTouches[0].clientY - touchStartY;
      if (Math.abs(dx) < 50 || Math.abs(dx) < Math.abs(dy)) return;
      if (dx < 0) {
        currentIndex = (currentIndex + 1) % TOTAL_STUDENTS;
      } else {
        currentIndex = (currentIndex - 1 + TOTAL_STUDENTS) % TOTAL_STUDENTS;
      }
      goToSlide(currentIndex);
      pauseAutoAdvance(SCAN_PAUSE_MS);
    };
    slider.addEventListener("touchstart", onTouchStart, { passive: true });
    slider.addEventListener("touchend", onTouchEnd, { passive: true });
  }, []);

  return (
    <>
      {/* ============= FLOATING TOP-LEFT HEADER ============= */}
      <div className="fixed top-0 left-0 z-50 flex items-center gap-2 sm:gap-3 px-4 sm:px-6 py-3 sm:py-4">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo 1.svg" alt="Oyunlag" className="h-14 sm:h-36 w-auto" />
        <span className="hidden sm:inline font-display text-4xl font-bold tracking-tight text-white font-geist">
          Сурагчдын хийсэн бүтээл
        </span>
      </div>

      {/* ============= FLOATING TOP-RIGHT SEARCH ============= */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 sm:left-auto sm:translate-x-0 sm:right-0 z-50 flex items-center gap-2 sm:gap-3 px-4 sm:px-6 py-3 sm:py-4">
        <div className="relative w-56 sm:w-96">
          <input
            id="search-input"
            type="text"
            inputMode="search"
            placeholder="Search name, ID, or scan…"
            autoComplete="off"
            spellCheck={false}
            className="w-full bg-black/60 backdrop-blur-md border border-white/10 rounded-full pl-11 pr-4 py-3 sm:py-4 text-base sm:text-base text-white placeholder:text-neutral-500 focus:outline-none focus:border-orange-500/50 focus:bg-white/10 transition font-mono"
          />
          <svg
            className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-neutral-500"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
          >
            <circle cx="11" cy="11" r="7" />
            <line x1="20" y1="20" x2="16.65" y2="16.65" />
          </svg>
        </div>
        <div
          id="scan-status"
          className="hidden sm:flex items-center gap-1.5 text-[10px] font-mono text-neutral-500 uppercase tracking-widest"
        >
          <span
            id="scan-dot"
            className="w-1.5 h-1.5 rounded-full bg-neutral-600"
          ></span>
          <span>RFID</span>
        </div>
      </div>

      {/* Scan toast */}
      <div
        id="toast"
        className="fixed top-16 sm:top-20 left-1/2 -translate-x-1/2 z-[100] px-5 py-3 rounded-full backdrop-blur-md bg-black/85 border border-white/10 text-sm font-mono tracking-wider shadow-2xl pointer-events-none opacity-0"
      >
        <span id="toast-text"></span>
      </div>

      {/* ============= CAROUSEL ============= */}
      <main
        id="slider"
        className="flex flex-row overflow-x-hidden hide-scrollbar w-full pt-20 sm:pt-44 pb-4 sm:pb-8 gap-x-4 md:gap-x-12"
        style={{
          maskImage:
            "linear-gradient(90deg, transparent, black 8%, black 92%, transparent)",
          WebkitMaskImage:
            "linear-gradient(90deg, transparent, black 8%, black 92%, transparent)",
          height: "100vh",
          perspective: "2000px",
          transformStyle: "preserve-3d",
        }}
      ></main>

      {/* ============= BOTTOM BAR ============= */}
      <div className="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-between px-4 sm:px-6 py-2 sm:py-3 bg-black/80 backdrop-blur-md border-t border-white/10 h-10 sm:h-14">
        <div className="font-mono text-[9px] sm:text-[10px] text-neutral-500 uppercase tracking-widest truncate">
          <span className="hidden sm:inline">
            <span className="text-orange-500 font-bold">●</span> Scan any QR
            code to explore the project
          </span>
        </div>
        <div className="hidden sm:flex gap-6 font-mono text-[10px] text-neutral-500 uppercase tracking-widest">
          <span>
            <span className="text-white font-bold">300</span> projects
          </span>
          <span>
            <span className="text-white font-bold">24</span> classes
          </span>
          <span>
            <span className="text-white font-bold">15</span> stacks
          </span>
        </div>
      </div>
    </>
  );
}
