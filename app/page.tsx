"use client";

import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { gsap } from "gsap";
import { SplitText } from "gsap/SplitText";
import { Flip } from "gsap/Flip";

const SLIDE_DURATION = 8000;
const SCAN_PAUSE_MS = 30000;
// Mount iframe + QR cells only for slides within ±VISIBLE_WINDOW of active.
const VISIBLE_WINDOW = 4;
// Apply coverflow transforms only within ±COVERFLOW_RANGE.
const COVERFLOW_RANGE = 2;

const PROJECTS: ReadonlyArray<readonly [string, string, string]> = [
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
] as const;

const COLORS: readonly string[] = [
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

type RawStudent = {
  id: string;
  studentId: string;
  name: string;
  grade: number;
  cardId: string;
};

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
  year: string;
  color: string;
};

function buildStudents(raw: RawStudent[]): Student[] {
  return raw.map((s, i) => {
    const parts = (s.name || "").trim().split(/\s+/);
    const firstName = parts[0] || s.name || "Student";
    const lastName = parts.slice(1).join(" ");
    const proj = PROJECTS[i % PROJECTS.length];
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
      year: String(s.grade),
      color: COLORS[i % COLORS.length],
    };
  });
}

function generateQRCells(seed: string): boolean[] {
  let seedNum = 0;
  const str = String(seed || "");
  for (let i = 0; i < str.length; i++) {
    seedNum = (seedNum * 31 + str.charCodeAt(i)) | 0;
  }
  seedNum = Math.abs(seedNum);
  const cells: boolean[] = [];
  for (let i = 0; i < 225; i++) {
    const row = Math.floor(i / 15);
    const col = i % 15;
    const inCorner =
      (row < 3 && col < 3) || (row < 3 && col > 11) || (row > 11 && col < 3);
    const cornerBorder =
      (row === 0 || row === 2 || col === 0 || col === 2) && row < 3 && col < 3;
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
      cells.push(false);
    } else if (inCorner) {
      cells.push(true);
    } else {
      const hash = Math.abs(((seedNum * 31 + i * 7) ^ (i * i)) % 100);
      cells.push(hash > 48);
    }
  }
  return cells;
}

function FakeQR({ seed }: { seed: string }) {
  const cells = useMemo(() => generateQRCells(seed), [seed]);
  return (
    <div className="qr-grid" style={{ height: "100%", width: "auto" }}>
      {cells.map((white, i) => (
        <div key={i} className={white ? "white" : undefined} />
      ))}
    </div>
  );
}

type SlideProps = {
  student: Student;
  index: number;
  isInWindow: boolean;
  registerSlide: (index: number, el: HTMLElement | null) => void;
};

const Slide = memo(function Slide({
  student,
  index,
  isInWindow,
  registerSlide,
}: SlideProps) {
  const refCallback = useCallback(
    (el: HTMLElement | null) => {
      registerSlide(index, el);
      return () => registerSlide(index, null);
    },
    [index, registerSlide],
  );

  return (
    <section
      ref={refCallback}
      data-index={index}
      className="slide-container flex-shrink-0 flex flex-col overflow-hidden group bg-[#0A0A0A] border-white/10 border relative shadow-2xl rounded-2xl origin-center will-change-transform"
    >
      {isInWindow && (
        <div className="site-bg">
          <div className="site-bg-inner">
            <iframe
              src="/example.html"
              loading="lazy"
              scrolling="no"
              tabIndex={-1}
            />
          </div>
        </div>
      )}

      <div className="absolute top-0 left-0 right-0 h-0.5 bg-white/10 z-30">
        <div className="progress-bar h-full bg-orange-500" data-progress />
      </div>

      <header className="absolute top-0 left-0 right-0 z-20 flex items-start justify-between p-4 sm:p-8">
        <span
          className="font-mono text-[9px] sm:text-xs text-neutral-200 uppercase tracking-widest bg-black/45 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/10"
          data-stagger
        >
          [<span data-counter>{student.slideNum}</span>/{student.totalSlides}]{" "}
          // {student.stack.toUpperCase()}
        </span>
      </header>

      <div
        className="absolute bottom-0 left-0 right-0 z-20 h-[32%] sm:h-1/4 px-4 sm:px-6 py-3 sm:py-4 flex gap-3 sm:gap-4 items-stretch overflow-hidden"
        data-info-panel
        style={{
          background:
            "linear-gradient(180deg, rgba(10,10,10,0) 0%, rgba(10,10,10,0.85) 18%, rgba(10,10,10,0.96) 50%, rgba(10,10,10,1) 100%)",
        }}
      >
        <div className="flex-1 min-w-0 flex flex-col justify-between">
          <div className="min-h-0">
            <div className="mb-0.5 sm:mb-1" data-stagger>
              <span className="font-mono text-[9px] uppercase tracking-[0.3em] text-orange-500 font-bold">
                Now showing
              </span>
            </div>

            <h1
              className="font-space-grotesk text-2xl sm:text-3xl md:text-4xl tracking-tighter leading-[0.95] font-semibold text-white break-words"
              data-name
              style={{
                textShadow:
                  "0 1px 2px rgba(0,0,0,1), 0 4px 14px rgba(0,0,0,0.95), 0 10px 44px rgba(0,0,0,0.85), 0 0 32px rgba(249,115,22,0.45)",
              }}
            >
              {student.firstName}{" "}
              <span className="text-white/80">{student.lastName}</span>
            </h1>

            <p
              className="font-space-grotesk text-sm sm:text-base md:text-lg text-white/85 mt-0.5 sm:mt-1 truncate"
              data-stagger
            >
              {student.project}
            </p>
          </div>

          <div
            className="pt-1.5 sm:pt-2 border-t border-white/10 flex flex-col gap-1 sm:gap-1.5"
            data-stagger
          >
            <div className="flex gap-1.5 sm:gap-2 flex-wrap">
              <span className="text-[10px] sm:text-sm font-mono uppercase tracking-wider px-2 sm:px-3 py-0.5 sm:py-1.5 bg-orange-500 text-black rounded font-bold">
                Year {student.year}
              </span>
              <span className="text-[10px] sm:text-sm font-mono uppercase tracking-wider px-2 sm:px-3 py-0.5 sm:py-1.5 bg-white/10 border border-white/15 rounded">
                {student.stack}
              </span>
            </div>
            <span className="font-mono text-[8px] sm:text-[9px] text-neutral-500 tracking-widest truncate">
              PROJECT #{student.slideNum} · CARD {student.cardId || "—"}
            </span>
          </div>
        </div>

        <div
          className="bg-white p-1 sm:p-2 rounded-md shrink-0 flex flex-col items-center justify-center self-center w-20 sm:w-auto h-20 sm:h-[70%] aspect-square shadow-[0_4px_18px_rgba(0,0,0,0.5)]"
          data-stagger
        >
          {isInWindow ? (
            <FakeQR seed={student.id} />
          ) : (
            <div
              className="qr-grid"
              style={{ height: "100%", width: "auto" }}
            />
          )}
          <div className="hidden sm:block text-black text-[10px] font-mono font-bold text-center mt-1 tracking-wider">
            SCAN
          </div>
        </div>
      </div>
    </section>
  );
});

export default function Home() {
  const [students, setStudents] = useState<Student[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loadError, setLoadError] = useState(false);

  const sliderRef = useRef<HTMLElement>(null);
  const slideRefsMap = useRef<Map<number, HTMLElement>>(new Map());
  const searchInputRef = useRef<HTMLInputElement>(null);
  const scanDotRef = useRef<HTMLSpanElement>(null);
  const toastRef = useRef<HTMLDivElement>(null);
  const toastTextRef = useRef<HTMLSpanElement>(null);

  const prevActiveIdxRef = useRef(0);
  const initialResetDoneRef = useRef(false);
  const splitTextCacheRef = useRef<WeakMap<Element, SplitText>>(new WeakMap());
  const autoAdvanceTimerRef = useRef<ReturnType<typeof setInterval> | null>(
    null,
  );
  const resumeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const flashTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const registerSlide = useCallback((index: number, el: HTMLElement | null) => {
    if (el) slideRefsMap.current.set(index, el);
    else slideRefsMap.current.delete(index);
  }, []);

  // ============= LOOKUP INDEXES =============
  const lookup = useMemo(() => {
    const cardIdToIndex = new Map<string, number>();
    const studentIdToIndex = new Map<string, number>();
    students.forEach((s, i) => {
      if (s.cardId) cardIdToIndex.set(String(s.cardId).trim(), i);
      if (s.studentId)
        studentIdToIndex.set(String(s.studentId).trim().toLowerCase(), i);
    });
    return { cardIdToIndex, studentIdToIndex };
  }, [students]);

  const findStudent = useCallback(
    (query: string) => {
      const q = String(query || "").trim();
      if (!q) return -1;
      if (lookup.cardIdToIndex.has(q)) return lookup.cardIdToIndex.get(q)!;
      const lower = q.toLowerCase();
      if (lookup.studentIdToIndex.has(lower))
        return lookup.studentIdToIndex.get(lower)!;
      return students.findIndex(
        (s) => s.name && s.name.toLowerCase().includes(lower),
      );
    },
    [students, lookup],
  );

  // ============= LOAD DATA =============
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/grade8to11_students_prod.json");
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const raw = (await res.json()) as RawStudent[];
        if (cancelled) return;
        setStudents(buildStudents(raw));
      } catch (err) {
        console.error("Failed to load student data:", err);
        if (!cancelled) setLoadError(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // ============= REGISTER GSAP PLUGINS =============
  useEffect(() => {
    gsap.registerPlugin(SplitText, Flip);
  }, []);

  // ============= AUTO-ADVANCE =============
  const startAutoAdvance = useCallback(() => {
    if (autoAdvanceTimerRef.current) clearInterval(autoAdvanceTimerRef.current);
    autoAdvanceTimerRef.current = setInterval(() => {
      setCurrentIndex((i) => {
        const n = students.length;
        return n > 0 ? (i + 1) % n : 0;
      });
    }, SLIDE_DURATION);
  }, [students.length]);

  const stopAutoAdvance = useCallback(() => {
    if (autoAdvanceTimerRef.current) {
      clearInterval(autoAdvanceTimerRef.current);
      autoAdvanceTimerRef.current = null;
    }
  }, []);

  const pauseAutoAdvance = useCallback(
    (ms: number) => {
      stopAutoAdvance();
      if (resumeTimeoutRef.current) clearTimeout(resumeTimeoutRef.current);
      resumeTimeoutRef.current = setTimeout(startAutoAdvance, ms);
    },
    [startAutoAdvance, stopAutoAdvance],
  );

  useEffect(() => {
    if (students.length === 0) return;
    startAutoAdvance();
    return stopAutoAdvance;
  }, [students.length, startAutoAdvance, stopAutoAdvance]);

  // ============= SCROLL + COVERFLOW + ACTIVE-SLIDE ANIMATIONS =============
  useEffect(() => {
    if (students.length === 0) return;
    const slider = sliderRef.current;
    if (!slider) return;

    if (!initialResetDoneRef.current) {
      slideRefsMap.current.forEach((el) => {
        gsap.set(el, {
          scale: 0.4,
          opacity: 0,
          rotationY: 0,
          transformPerspective: 2000,
        });
      });
      initialResetDoneRef.current = true;
    }

    const target = slideRefsMap.current.get(currentIndex);
    if (!target) return;

    // Tween scrollLeft in sync with scale/tilt — no native snap.
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

    // Coverflow scale/tilt/Z within COVERFLOW_RANGE; hide the rest.
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
    slideRefsMap.current.forEach((el, i) => {
      const dist = Math.abs(i - currentIndex);
      if (dist > COVERFLOW_RANGE) {
        el.style.visibility = "hidden";
        el.style.opacity = "0";
        return;
      }
      el.style.visibility = "visible";
      gsap.to(el, {
        ...propsByDistance(i - currentIndex),
        duration: 0.9,
        ease: "power3.out",
        overwrite: "auto",
        force3D: true,
      });
    });

    // ---- Active-slide animations ----
    const items = target.querySelectorAll("[data-stagger]");
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

    const nameEl = target.querySelector("[data-name]");
    if (nameEl) {
      const cached = splitTextCacheRef.current.get(nameEl);
      if (cached) cached.revert();
      const split = new SplitText(nameEl as HTMLElement, { type: "chars" });
      splitTextCacheRef.current.set(nameEl, split);
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

    const counter = target.querySelector("[data-counter]");
    if (counter) {
      const targetVal = currentIndex + 1;
      const fromVal = prevActiveIdxRef.current + 1;
      const obj = { v: fromVal };
      gsap.to(obj, {
        v: targetVal,
        duration: 0.7,
        ease: "power2.out",
        onUpdate() {
          counter.textContent = String(Math.round(obj.v)).padStart(3, "0");
        },
      });
    }

    const bar = target.querySelector("[data-progress]");
    if (bar) {
      gsap.killTweensOf(bar);
      gsap.fromTo(
        bar,
        { scaleX: 0 },
        { scaleX: 1, duration: SLIDE_DURATION / 1000, ease: "none" },
      );
    }

    const bg = target.querySelector(".site-bg-inner") as HTMLElement | null;
    if (bg) {
      gsap.killTweensOf(bg);
      const slideH = target.offsetHeight || 1;
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

    const panel = target.querySelector("[data-info-panel]");
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

    prevActiveIdxRef.current = currentIndex;
  }, [currentIndex, students.length]);

  // ============= TOAST + SCAN-DOT =============
  const showToast = useCallback((text: string, variant?: "error" | "ok") => {
    const toastEl = toastRef.current;
    const toastTextEl = toastTextRef.current;
    if (!toastEl || !toastTextEl) return;
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
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    toastTimerRef.current = setTimeout(() => {
      gsap.to(toastEl, {
        y: -10,
        opacity: 0,
        duration: 0.35,
        ease: "power3.in",
      });
    }, 3500);
  }, []);

  const flashScanDot = useCallback((color: string) => {
    const scanDot = scanDotRef.current;
    if (!scanDot) return;
    scanDot.style.background = color;
    scanDot.style.boxShadow = `0 0 8px ${color}`;
    if (flashTimerRef.current) clearTimeout(flashTimerRef.current);
    flashTimerRef.current = setTimeout(() => {
      const el = scanDotRef.current;
      if (!el) return;
      el.style.background = "#525252";
      el.style.boxShadow = "none";
    }, 1500);
  }, []);

  const handleScan = useCallback(
    (rawValue: string) => {
      const value = String(rawValue || "").trim();
      if (!value) return;
      const idx = findStudent(value);
      if (idx === -1) {
        showToast(`Card not recognized · ${value}`, "error");
        flashScanDot("#ef4444");
        return;
      }
      const s = students[idx];
      setCurrentIndex(idx);
      pauseAutoAdvance(SCAN_PAUSE_MS);
      showToast(`Scanned · ${s.name}`, "ok");
      flashScanDot("#f97316");
      const slideEl = slideRefsMap.current.get(idx);
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
    },
    [findStudent, students, showToast, flashScanDot, pauseAutoAdvance],
  );

  // ============= SEARCH / SCANNER INPUT =============
  useEffect(() => {
    if (students.length === 0) return;
    const search = searchInputRef.current;
    if (!search) return;

    // Kiosk mode: keep search focused so scanner keystrokes land here.
    const refocus = () => {
      if (document.activeElement !== search) search.focus();
    };
    refocus();
    document.addEventListener("click", refocus);
    const onBlur = () => setTimeout(refocus, 0);
    search.addEventListener("blur", onBlur);

    let lastKeyTime = 0;
    let burstChars = 0;
    const SCAN_BURST_GAP_MS = 50;
    const SCAN_BURST_MIN = 4;
    let autoSubmitTimer: ReturnType<typeof setTimeout> | null = null;

    const onKeyDown = (e: KeyboardEvent) => {
      const now = performance.now();
      if (e.key === "Enter") {
        e.preventDefault();
        if (autoSubmitTimer) clearTimeout(autoSubmitTimer);
        handleScan(search.value);
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
    };
    search.addEventListener("keydown", onKeyDown);

    let liveTimer: ReturnType<typeof setTimeout> | null = null;
    const onInput = () => {
      if (liveTimer) clearTimeout(liveTimer);
      const v = search.value.trim();
      if (!v) return;
      liveTimer = setTimeout(() => {
        if (autoSubmitTimer) return;
        const idx = findStudent(v);
        if (idx !== -1) {
          setCurrentIndex(idx);
          pauseAutoAdvance(SCAN_PAUSE_MS);
        }
      }, 250);
    };
    search.addEventListener("input", onInput);

    return () => {
      document.removeEventListener("click", refocus);
      search.removeEventListener("blur", onBlur);
      search.removeEventListener("keydown", onKeyDown);
      search.removeEventListener("input", onInput);
      if (autoSubmitTimer) clearTimeout(autoSubmitTimer);
      if (liveTimer) clearTimeout(liveTimer);
    };
  }, [students.length, handleScan, findStudent, pauseAutoAdvance]);

  // ============= ARROW KEYS + TOUCH SWIPE =============
  useEffect(() => {
    if (students.length === 0) return;
    const slider = sliderRef.current;
    if (!slider) return;
    const n = students.length;

    const onKeyDown = (e: KeyboardEvent) => {
      const el = document.activeElement as HTMLElement | null;
      if (el?.id === "search-input") return;
      if (e.key === "ArrowRight") {
        setCurrentIndex((i) => (i + 1) % n);
      } else if (e.key === "ArrowLeft") {
        setCurrentIndex((i) => (i - 1 + n) % n);
      }
    };
    document.addEventListener("keydown", onKeyDown);

    let touchStartX = 0;
    let touchStartY = 0;
    const onTouchStart = (e: TouchEvent) => {
      touchStartX = e.touches[0].clientX;
      touchStartY = e.touches[0].clientY;
    };
    const onTouchEnd = (e: TouchEvent) => {
      const dx = e.changedTouches[0].clientX - touchStartX;
      const dy = e.changedTouches[0].clientY - touchStartY;
      if (Math.abs(dx) < 50 || Math.abs(dx) < Math.abs(dy)) return;
      setCurrentIndex((i) => {
        if (dx < 0) return (i + 1) % n;
        return (i - 1 + n) % n;
      });
      pauseAutoAdvance(SCAN_PAUSE_MS);
    };
    slider.addEventListener("touchstart", onTouchStart, { passive: true });
    slider.addEventListener("touchend", onTouchEnd, { passive: true });

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      slider.removeEventListener("touchstart", onTouchStart);
      slider.removeEventListener("touchend", onTouchEnd);
    };
  }, [students.length, pauseAutoAdvance]);

  return (
    <>
      {/* ============= FLOATING TOP-LEFT HEADER ============= */}
      <div className="fixed top-3 sm:top-6 left-3 sm:left-6 z-50 flex items-center gap-2 sm:gap-3 px-3 sm:px-5 py-2 sm:py-3 bg-black/60 backdrop-blur-md border border-white/10 rounded-full shadow-2xl">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo 1.svg" alt="Oyunlag" className="h-8 sm:h-12 w-auto" />
        <span className="hidden sm:inline font-display text-xl font-bold tracking-tight text-white font-geist pr-2">
          Сурагчдын хийсэн бүтээл
        </span>
      </div>

      {/* ============= FLOATING SEARCH / RFID ============= */}
      <div className="fixed top-3 sm:top-6 left-1/2 -translate-x-1/2 sm:left-auto sm:translate-x-0 sm:right-6 z-50 flex items-center gap-2 sm:gap-3">
        <div className="relative w-56 sm:w-96">
          <input
            ref={searchInputRef}
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
        <div className="hidden sm:flex items-center gap-1.5 text-[10px] font-mono text-neutral-500 uppercase tracking-widest">
          <span
            ref={scanDotRef}
            className="w-1.5 h-1.5 rounded-full bg-neutral-600"
          />
          <span>RFID</span>
        </div>
      </div>

      {/* Scan toast */}
      <div
        ref={toastRef}
        className="fixed top-16 sm:top-20 left-1/2 -translate-x-1/2 z-[100] px-5 py-3 rounded-full backdrop-blur-md bg-black/85 border border-white/10 text-sm font-mono tracking-wider shadow-2xl pointer-events-none opacity-0"
      >
        <span ref={toastTextRef} />
      </div>

      {/* Load error banner */}
      {loadError && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[200] bg-red-900 text-white px-5 py-3 rounded-xl font-mono text-xs max-w-[540px] text-center">
          Could not load <b>grade8to11_students_prod.json</b>.
        </div>
      )}

      {/* ============= CAROUSEL ============= */}
      <main
        ref={sliderRef}
        id="slider"
        className="flex flex-row overflow-x-hidden hide-scrollbar w-full pt-0 pb-0 gap-x-4 md:gap-x-12"
        style={{
          maskImage:
            "linear-gradient(90deg, transparent, black 8%, black 92%, transparent)",
          WebkitMaskImage:
            "linear-gradient(90deg, transparent, black 8%, black 92%, transparent)",
          height: "100vh",
          perspective: "2000px",
          transformStyle: "preserve-3d",
        }}
      >
        {students.map((student, i) => (
          <Slide
            key={student.id}
            student={student}
            index={i}
            isInWindow={Math.abs(i - currentIndex) <= VISIBLE_WINDOW}
            registerSlide={registerSlide}
          />
        ))}
      </main>

    </>
  );
}
