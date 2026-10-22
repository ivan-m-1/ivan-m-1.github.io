/* ============================================================
   GEOMETRY DASH — БРАУЗЕРНЫЙ КЛОН НА CANVAS
   10 уровней • выбор уровня • физика прыжка • порталы гравитации
   ============================================================ */

(() => {
  'use strict';

  // ---------- КОНСТАНТЫ ----------
  const CANVAS_W = 1280;
  const CANVAS_H = 720;
  const GROUND_Y = CANVAS_H - 120;          // верхняя граница земли
  const PLAYER_SIZE = 44;
  const GRAVITY = 0.85;
  const JUMP_FORCE = -15.5;
  const BASE_SPEED = 6.2;
  const MAX_FALL = 22;

  // ---------- DOM ----------
  const canvas = document.getElementById('gameCanvas');
  const ctx = canvas.getContext('2d');
  const menuScreen = document.getElementById('menuScreen');
  const gameScreen = document.getElementById('gameScreen');
  const deathScreen = document.getElementById('deathScreen');
  const winScreen = document.getElementById('winScreen');
  const levelGrid = document.getElementById('levelGrid');
  const levelNameEl = document.getElementById('levelName');
  const attemptsEl = document.getElementById('attempts');
  const progressBar = document.getElementById('progressBar');
  const deathProgress = document.getElementById('deathProgress');
  const winLevelName = document.getElementById('winLevelName');
  const backBtn = document.getElementById('backBtn');
  const retryBtn = document.getElementById('retryBtn');
  const deathMenuBtn = document.getElementById('deathMenuBtn');
  const nextLevelBtn = document.getElementById('nextLevelBtn');
  const winMenuBtn = document.getElementById('winMenuBtn');

  // ---------- СОСТОЯНИЕ ----------
  let currentLevelIndex = 0;
  let attempts = 0;
  let gameState = 'menu'; // menu | playing | dead | win
  let animationId = null;
  let level = null;
  let player = null;
  let cameraX = 0;
  let levelLength = 0;
  let gravityDir = 1; // 1 = вниз, -1 = вверх

  // ---------- ГЕНЕРАЦИЯ 10 УРОВНЕЙ ----------
  // Каждый уровень — массив объектов. Сложность растёт: больше шипов,
  // уже "коридоры", появляются гравитационные порталы.
  const LEVELS = [
    // -------- УРОВЕНЬ 1: совсем простой --------
    {
      name: 'Уровень 1 — Разминка',
      difficulty: 'easy',
      bg: '#0d0d1f',
      ground: '#1a1a3a',
      accent: '#3a7bff',
      speed: 1.0,
      objects: [
        // первые шипы далеко друг от друга
        { type: 'spike', x: 900, y: GROUND_Y - 44, w: 44, h: 44 },
        { type: 'spike', x: 1500, y: GROUND_Y - 44, w: 44, h: 44 },
        { type: 'spike', x: 2100, y: GROUND_Y - 44, w: 44, h: 44 },
        { type: 'block', x: 2700, y: GROUND_Y - 80, w: 80, h: 80 },
        { type: 'spike', x: 3200, y: GROUND_Y - 44, w: 44, h: 44 },
        { type: 'spike', x: 3700, y: GROUND_Y - 44, w: 44, h: 44 },
        { type: 'spike', x: 4200, y: GROUND_Y - 44, w: 44, h: 44 },
        { type: 'spike', x: 4700, y: GROUND_Y - 44, w: 44, h: 44 },
        { type: 'block', x: 5300, y: GROUND_Y - 80, w: 80, h: 80 },
        { type: 'spike', x: 5900, y: GROUND_Y - 44, w: 44, h: 44 },
        { type: 'spike', x: 6500, y: GROUND_Y - 44, w: 44, h: 44 },
        { type: 'finish', x: 7200, y: GROUND_Y - 200, w: 60, h: 200 },
      ],
    },
    // -------- УРОВЕНЬ 2 --------
    {
      name: 'Уровень 2 — Шипы',
      difficulty: 'easy',
      bg: '#0e0d1f',
      ground: '#1b1a3a',
      accent: '#4a8aff',
      speed: 1.05,
      objects: [
        { type: 'spike', x: 800, y: GROUND_Y - 44, w: 44, h: 44 },
        { type: 'spike', x: 1200, y: GROUND_Y - 44, w: 44, h: 44 },
        { type: 'spike', x: 1600, y: GROUND_Y - 44, w: 44, h: 44 },
        { type: 'block', x: 2100, y: GROUND_Y - 80, w: 80, h: 80 },
        { type: 'spike', x: 2500, y: GROUND_Y - 44, w: 44, h: 44 },
        { type: 'spike', x: 2900, y: GROUND_Y - 44, w: 44, h: 44 },
        { type: 'spike', x: 3300, y: GROUND_Y - 44, w: 44, h: 44 },
        { type: 'spike', x: 3700, y: GROUND_Y - 44, w: 44, h: 44 },
        { type: 'block', x: 4200, y: GROUND_Y - 80, w: 80, h: 80 },
        { type: 'spike', x: 4700, y: GROUND_Y - 44, w: 44, h: 44 },
        { type: 'spike', x: 5100, y: GROUND_Y - 44, w: 44, h: 44 },
        { type: 'spike', x: 5500, y: GROUND_Y - 44, w: 44, h: 44 },
        { type: 'spike', x: 5900, y: GROUND_Y - 44, w: 44, h: 44 },
        { type: 'spike', x: 6300, y: GROUND_Y - 44, w: 44, h: 44 },
        { type: 'finish', x: 7000, y: GROUND_Y - 200, w: 60, h: 200 },
      ],
    },
    // -------- УРОВЕНЬ 3 --------
    {
      name: 'Уровень 3 — Блоки',
      difficulty: 'normal',
      bg: '#100e22',
      ground: '#1e1c40',
      accent: '#5a9aff',
      speed: 1.1,
      objects: [
        { type: 'spike', x: 700, y: GROUND_Y - 44, w: 44, h: 44 },
        { type: 'block', x: 1100, y: GROUND_Y - 80, w: 80, h: 80 },
        { type: 'spike', x: 1500, y: GROUND_Y - 44, w: 44, h: 44 },
        { type: 'spike', x: 1850, y: GROUND_Y - 44, w: 44, h: 44 },
        { type: 'block', x: 2200, y: GROUND_Y - 120, w: 80, h: 120 },
        { type: 'spike', x: 2600, y: GROUND_Y - 44, w: 44, h: 44 },
        { type: 'spike', x: 2950, y: GROUND_Y - 44, w: 44, h: 44 },
        { type: 'spike', x: 3300, y: GROUND_Y - 44, w: 44, h: 44 },
        { type: 'block', x: 3700, y: GROUND_Y - 80, w: 80, h: 80 },
        { type: 'spike', x: 4100, y: GROUND_Y - 44, w: 44, h: 44 },
        { type: 'spike', x: 4450, y: GROUND_Y - 44, w: 44, h: 44 },
        { type: 'spike', x: 4800, y: GROUND_Y - 44, w: 44, h: 44 },
        { type: 'block', x: 5200, y: GROUND_Y - 120, w: 80, h: 120 },
        { type: 'spike', x: 5650, y: GROUND_Y - 44, w: 44, h: 44 },
        { type: 'spike', x: 6000, y: GROUND_Y - 44, w: 44, h: 44 },
        { type: 'spike', x: 6350, y: GROUND_Y - 44, w: 44, h: 44 },
        { type: 'finish', x: 7000, y: GROUND_Y - 200, w: 60, h: 200 },
      ],
    },
    // -------- УРОВЕНЬ 4 --------
    {
      name: 'Уровень 4 — Ритм',
      difficulty: 'normal',
      bg: '#12102a',
      ground: '#201e45',
      accent: '#6aabff',
      speed: 1.15,
      objects: [
        { type: 'spike', x: 650, y: GROUND_Y - 44, w: 44, h: 44 },
        { type: 'spike', x: 950, y: GROUND_Y - 44, w: 44, h: 44 },
        { type: 'spike', x: 1250, y: GROUND_Y - 44, w: 44, h: 44 },
        { type: 'block', x: 1600, y: GROUND_Y - 80, w: 80, h: 80 },
        { type: 'spike', x: 1950, y: GROUND_Y - 44, w: 44, h: 44 },
        { type: 'spike', x: 2250, y: GROUND_Y - 44, w: 44, h: 44 },
        { type: 'spike', x: 2550, y: GROUND_Y - 44, w: 44, h: 44 },
        { type: 'spike', x: 2850, y: GROUND_Y - 44, w: 44, h: 44 },
        { type: 'block', x: 3200, y: GROUND_Y - 120, w: 80, h: 120 },
        { type: 'spike', x: 3600, y: GROUND_Y - 44, w: 44, h: 44 },
        { type: 'spike', x: 3900, y: GROUND_Y - 44, w: 44, h: 44 },
        { type: 'spike', x: 4200, y: GROUND_Y - 44, w: 44, h: 44 },
        { type: 'spike', x: 4500, y: GROUND_Y - 44, w: 44, h: 44 },
        { type: 'block', x: 4850, y: GROUND_Y - 80, w: 80, h: 80 },
        { type: 'spike', x: 5250, y: GROUND_Y - 44, w: 44, h: 44 },
        { type: 'spike', x: 5550, y: GROUND_Y - 44, w: 44, h: 44 },
        { type: 'spike', x: 5850, y: GROUND_Y - 44, w: 44, h: 44 },
        { type: 'spike', x: 6150, y: GROUND_Y - 44, w: 44, h: 44 },
        { type: 'finish', x: 6800, y: GROUND_Y - 200, w: 60, h: 200 },
      ],
    },
    // -------- УРОВЕНЬ 5 --------
    {
      name: 'Уровень 5 — Плотность',
      difficulty: 'hard',
      bg: '#14122e',
      ground: '#23214a',
      accent: '#7abbff',
      speed: 1.2,
      objects: [
        { type: 'spike', x: 600, y: GROUND_Y - 44, w: 44, h: 44 },
        { type: 'spike', x: 880, y: GROUND_Y - 44, w: 44, h: 44 },
        { type: 'spike', x: 1160, y: GROUND_Y - 44, w: 44, h: 44 },
        { type: 'spike', x: 1440, y: GROUND_Y - 44, w: 44, h: 44 },
        { type: 'block', x: 1750, y: GROUND_Y - 80, w: 80, h: 80 },
        { type: 'spike', x: 2080, y: GROUND_Y - 44, w: 44, h: 44 },
        { type: 'spike', x: 2360, y: GROUND_Y - 44, w: 44, h: 44 },
        { type: 'spike', x: 2640, y: GROUND_Y - 44, w: 44, h: 44 },
        { type: 'spike', x: 2920, y: GROUND_Y - 44, w: 44, h: 44 },
        { type: 'block', x: 3250, y: GROUND_Y - 120, w: 80, h: 120 },
        { type: 'spike', x: 3620, y: GROUND_Y - 44, w: 44, h: 44 },
        { type: 'spike', x: 3900, y: GROUND_Y - 44, w: 44, h: 44 },
        { type: 'spike', x: 4180, y: GROUND_Y - 44, w: 44, h: 44 },
        { type: 'spike', x: 4460, y: GROUND_Y - 44, w: 44, h: 44 },
        { type: 'spike', x: 4740, y: GROUND_Y - 44, w: 44, h: 44 },
        { type: 'block', x: 5050, y: GROUND_Y - 80, w: 80, h: 80 },
        { type: 'spike', x: 5400, y: GROUND_Y - 44, w: 44, h: 44 },
        { type: 'spike', x: 5680, y: GROUND_Y - 44, w: 44, h: 44 },
        { type: 'spike', x: 5960, y: GROUND_Y - 44, w: 44, h: 44 },
        { type: 'spike', x: 6240, y: GROUND_Y - 44, w: 44, h: 44 },
        { type: 'finish', x: 6900, y: GROUND_Y - 200, w: 60, h: 200 },
      ],
    },
    // -------- УРОВЕНЬ 6 --------
    {
      name: 'Уровень 6 — Гравитация',
      difficulty: 'hard',
      bg: '#16142f',
      ground: '#26244f',
      accent: '#8acbff',
      speed: 1.25,
      objects: [
        { type: 'spike', x: 550, y: GROUND_Y - 44, w: 44, h: 44 },
        { type: 'spike', x: 800, y: GROUND_Y - 44, w: 44, h: 44 },
        { type: 'spike', x: 1050, y: GROUND_Y - 44, w: 44, h: 44 },
        // гравитационный портал: переворачивает гравитацию
        { type: 'gravity', x: 1400, y: GROUND_Y - 200, w: 40, h: 120, dir: -1 },
        { type: 'block', x: 1750, y: 80, w: 80, h: 80 },
        { type: 'spike', x: 2100, y: 0, w: 44, h: 44, flip: true },
        { type: 'spike', x: 2350, y: 0, w: 44, h: 44, flip: true },
        // возврат гравитации
        { type: 'gravity', x: 2700, y: GROUND_Y - 200, w: 40, h: 120, dir: 1 },
        { type: 'spike', x: 3100, y: GROUND_Y - 44, w: 44, h: 44 },
        { type: 'spike', x: 3350, y: GROUND_Y - 44, w: 44, h: 44 },
        { type: 'block', x: 3650, y: GROUND_Y - 120, w: 80, h: 120 },
        { type: 'spike', x: 4000, y: GROUND_Y - 44, w: 44, h: 44 },
        { type: 'spike', x: 4250, y: GROUND_Y - 44, w: 44, h: 44 },
        { type: 'spike', x: 4500, y: GROUND_Y - 44, w: 44, h: 44 },
        { type: 'gravity', x: 4850, y: GROUND_Y - 200, w: 40, h: 120, dir: -1 },
        { type: 'spike', x: 5200, y: 0, w: 44, h: 44, flip: true },
        { type: 'spike', x: 5450, y: 0, w: 44, h: 44, flip: true },
        { type: 'gravity', x: 5800, y: GROUND_Y - 200, w: 40, h: 120, dir: 1 },
        { type: 'spike', x: 6150, y: GROUND_Y - 44, w: 44, h: 44 },
        { type: 'spike', x: 6400, y: GROUND_Y - 44, w: 44, h: 44 },
        { type: 'finish', x: 7000, y: GROUND_Y - 200, w: 60, h: 200 },
      ],
    },
    // -------- УРОВЕНЬ 7 --------
    {
      name: 'Уровень 7 — Коридор',
      difficulty: 'harder',
      bg: '#181630',
      ground: '#292755',
      accent: '#9adbff',
      speed: 1.3,
      objects: [
        { type: 'spike', x: 500, y: GROUND_Y - 44, w: 44, h: 44 },
        { type: 'spike', x: 750, y: GROUND_Y - 44, w: 44, h: 44 },
        { type: 'spike', x: 1000, y: GROUND_Y - 44, w: 44, h: 44 },
        { type: 'block', x: 1300, y: GROUND_Y - 80, w: 80, h: 80 },
        { type: 'spike', x: 1600, y: GROUND_Y - 44, w: 44, h: 44 },
        { type: 'spike', x: 1850, y: GROUND_Y - 44, w: 44, h: 44 },
        { type: 'spike', x: 2100, y: GROUND_Y - 44, w: 44, h: 44 },
        { type: 'spike', x: 2350, y: GROUND_Y - 44, w: 44, h: 44 },
        { type: 'block', x: 2650, y: GROUND_Y - 120, w: 80, h: 120 },
        { type: 'spike', x: 3000, y: GROUND_Y - 44, w: 44, h: 44 },
        { type: 'spike', x: 3250, y: GROUND_Y - 44, w: 44, h: 44 },
        { type: 'spike', x: 3500, y: GROUND_Y - 44, w: 44, h: 44 },
        { type: 'spike', x: 3750, y: GROUND_Y - 44, w: 44, h: 44 },
        { type: 'spike', x: 4000, y: GROUND_Y - 44, w: 44, h: 44 },
        { type: 'block', x: 4300, y: GROUND_Y - 80, w: 80, h: 80 },
        { type: 'spike', x: 4650, y: GROUND_Y - 44, w: 44, h: 44 },
        { type: 'spike', x: 4900, y: GROUND_Y - 44, w: 44, h: 44 },
        { type: 'spike', x: 5150, y: GROUND_Y - 44, w: 44, h: 44 },
        { type: 'spike', x: 5400, y: GROUND_Y - 44, w: 44, h: 44 },
        { type: 'spike', x: 5650, y: GROUND_Y - 44, w: 44, h: 44 },
        { type: 'block', x: 5950, y: GROUND_Y - 120, w: 80, h: 120 },
        { type: 'spike', x: 6300, y: GROUND_Y - 44, w: 44, h: 44 },
        { type: 'spike', x: 6550, y: GROUND_Y - 44, w: 44, h: 44 },
        { type: 'finish', x: 7100, y: GROUND_Y - 200, w: 60, h: 200 },
      ],
    },
    // -------- УРОВЕНЬ 8 --------
    {
      name: 'Уровень 8 — Хаос',
      difficulty: 'harder',
      bg: '#1a1832',
      ground: '#2c2a5a',
      accent: '#aaebff',
      speed: 1.35,
      objects: [
        { type: 'spike', x: 450, y: GROUND_Y - 44, w: 44, h: 44 },
        { type: 'spike', x: 680, y: GROUND_Y - 44, w: 44, h: 44 },
        { type: 'spike', x: 910, y: GROUND_Y - 44, w: 44, h: 44 },
        { type: 'spike', x: 1140, y: GROUND_Y - 44, w: 44, h: 44 },
        { type: 'block', x: 1420, y: GROUND_Y - 80, w: 80, h: 80 },
        { type: 'spike', x: 1730, y: GROUND_Y - 44, w: 44, h: 44 },
        { type: 'spike', x: 1960, y: GROUND_Y - 44, w: 44, h: 44 },
        { type: 'spike', x: 2190, y: GROUND_Y - 44, w: 44, h: 44 },
        { type: 'spike', x: 2420, y: GROUND_Y - 44, w: 44, h: 44 },
        { type: 'spike', x: 2650, y: GROUND_Y - 44, w: 44, h: 44 },
        { type: 'block', x: 2950, y: GROUND_Y - 120, w: 80, h: 120 },
        { type: 'spike', x: 3300, y: GROUND_Y - 44, w: 44, h: 44 },
        { type: 'spike', x: 3530, y: GROUND_Y - 44, w: 44, h: 44 },
        { type: 'spike', x: 3760, y: GROUND_Y - 44, w: 44, h: 44 },
        { type: 'spike', x: 3990, y: GROUND_Y - 44, w: 44, h: 44 },
        { type: 'spike', x: 4220, y: GROUND_Y - 44, w: 44, h: 44 },
        { type: 'block', x: 4520, y: GROUND_Y - 80, w: 80, h: 80 },
        { type: 'spike', x: 4870, y: GROUND_Y - 44, w: 44, h: 44 },
        { type: 'spike', x: 5100, y: GROUND_Y - 44, w: 44, h: 44 },
        { type: 'spike', x: 5330, y: GROUND_Y - 44, w: 44, h: 44 },
        { type: 'spike', x: 5560, y: GROUND_Y - 44, w: 44, h: 44 },
        { type: 'spike', x: 5790, y: GROUND_Y - 44, w: 44, h: 44 },
        { type: 'block', x: 6090, y: GROUND_Y - 120, w: 80, h: 120 },
        { type: 'spike', x: 6440, y: GROUND_Y - 44, w: 44, h: 44 },
        { type: 'spike', x: 6670, y: GROUND_Y - 44, w: 44, h: 44 },
        { type: 'finish', x: 7200, y: GROUND_Y - 200, w: 60, h: 200 },
      ],
    },
    // -------- УРОВЕНЬ 9 --------
    {
      name: 'Уровень 9 — Безумие',
      difficulty: 'insane',
      bg: '#1c1a34',
      ground: '#302e60',
      accent: '#bbfbff',
      speed: 1.4,
      objects: [
        { type: 'spike', x: 400, y: GROUND_Y - 44, w: 44, h: 44 },
        { type: 'spike', x: 600, y: GROUND_Y - 44, w: 44, h: 44 },
        { type: 'spike', x: 800, y: GROUND_Y - 44, w: 44, h: 44 },
        { type: 'spike', x: 1000, y: GROUND_Y - 44, w: 44, h: 44 },
        { type: 'spike', x: 1200, y: GROUND_Y - 44, w: 44, h: 44 },
        { type: 'block', x: 1450, y: GROUND_Y - 80, w: 80, h: 80 },
        { type: 'spike', x: 1750, y: GROUND_Y - 44, w: 44, h: 44 },
        { type: 'spike', x: 1950, y: GROUND_Y - 44, w: 44, h: 44 },
        { type: 'spike', x: 2150, y: GROUND_Y - 44, w: 44, h: 44 },
        { type: 'spike', x: 2350, y: GROUND_Y - 44, w: 44, h: 44 },
        { type: 'spike', x: 2550, y: GROUND_Y - 44, w: 44, h: 44 },
        { type: 'block', x: 2850, y: GROUND_Y - 120, w: 80, h: 120 },
        { type: 'spike', x: 3200, y: GROUND_Y - 44, w: 44, h: 44 },
        { type: 'spike', x: 3400, y: GROUND_Y - 44, w: 44, h: 44 },
        { type: 'spike', x: 3600, y: GROUND_Y - 44, w: 44, h: 44 },
        { type: 'spike', x: 3800, y: GROUND_Y - 44, w: 44, h: 44 },
        { type: 'spike', x: 4000, y: GROUND_Y - 44, w: 44, h: 44 },
        { type: 'block', x: 4300, y: GROUND_Y - 80, w: 80, h: 80 },
        { type: 'spike', x: 4650, y: GROUND_Y - 44, w: 44, h: 44 },
        { type: 'spike', x: 4850, y: GROUND_Y - 44, w: 44, h: 44 },
        { type: 'spike', x: 5050, y: GROUND_Y - 44, w: 44, h: 44 },
        { type: 'spike', x: 5250, y: GROUND_Y - 44, w: 44, h: 44 },
        { type: 'spike', x: 5450, y: GROUND_Y - 44, w: 44, h: 44 },
        { type: 'block', x: 5750, y: GROUND_Y - 120, w: 80, h: 120 },
        { type: 'spike', x: 6100, y: GROUND_Y - 44, w: 44, h: 44 },
        { type: 'spike', x: 6300, y: GROUND_Y - 44, w: 44, h: 44 },
        { type: 'spike', x: 6500, y: GROUND_Y - 44, w: 44, h: 44 },
        { type: 'finish', x: 7200, y: GROUND_Y - 200, w: 60, h: 200 },
      ],
    },
    // -------- УРОВЕНЬ 10: самый сложный --------
    {
      name: 'Уровень 10 — Демон',
      difficulty: 'insane',
      bg: '#1e1c36',
      ground: '#343265',
      accent: '#ccffff',
      speed: 1.5,
      objects: [
        { type: 'spike', x: 350, y: GROUND_Y - 44, w: 44, h: 44 },
        { type: 'spike', x: 520, y: GROUND_Y - 44, w: 44, h: 44 },
        { type: 'spike', x: 690, y: GROUND_Y - 44, w: 44, h: 44 },
        { type: 'spike', x: 860, y: GROUND_Y - 44, w: 44, h: 44 },
        { type: 'spike', x: 1030, y: GROUND_Y - 44, w: 44, h: 44 },
        { type: 'spike', x: 1200, y: GROUND_Y - 44, w: 44, h: 44 },
        { type: 'block', x: 1450, y: GROUND_Y - 80, w: 80, h: 80 },
        { type: 'spike', x: 1750, y: GROUND_Y - 44, w: 44, h: 44 },
        { type: 'spike', x: 1920, y: GROUND_Y - 44, w: 44, h: 44 },
        { type: 'spike', x: 2090, y: GROUND_Y - 44, w: 44, h: 44 },
        { type: 'spike', x: 2260, y: GROUND_Y - 44, w: 44, h: 44 },
        { type: 'spike', x: 2430, y: GROUND_Y - 44, w: 44, h: 44 },
        { type: 'spike', x: 2600, y: GROUND_Y - 44, w: 44, h: 44 },
        { type: 'block', x: 2900, y: GROUND_Y - 120, w: 80, h: 120 },
        { type: 'spike', x: 3250, y: GROUND_Y - 44, w: 44, h: 44 },
        { type: 'spike', x: 3420, y: GROUND_Y - 44, w: 44, h: 44 },
        { type: 'spike', x: 3590, y: GROUND_Y - 44, w: 44, h: 44 },
        { type: 'spike', x: 3760, y: GROUND_Y - 44, w: 44, h: 44 },
        { type: 'spike', x: 3930, y: GROUND_Y - 44, w: 44, h: 44 },
        { type: 'spike', x: 4100, y: GROUND_Y - 44, w: 44, h: 44 },
        { type: 'block', x: 4400, y: GROUND_Y - 80, w: 80, h: 80 },
        { type: 'spike', x: 4750, y: GROUND_Y - 44, w: 44, h: 44 },
        { type: 'spike', x: 4920, y: GROUND_Y - 44, w: 44, h: 44 },
        { type: 'spike', x: 5090, y: GROUND_Y - 44, w: 44, h: 44 },
        { type: 'spike', x: 5260, y: GROUND_Y - 44, w: 44, h: 44 },
        { type: 'spike', x: 5430, y: GROUND_Y - 44, w: 44, h: 44 },
        { type: 'spike', x: 5600, y: GROUND_Y - 44, w: 44, h: 44 },
        { type: 'block', x: 5900, y: GROUND_Y - 120, w: 80, h: 120 },
        { type: 'spike', x: 6250, y: GROUND_Y - 44, w: 44, h: 44 },
        { type: 'spike', x: 6420, y: GROUND_Y - 44, w: 44, h: 44 },
        { type: 'spike', x: 6590, y: GROUND_Y - 44, w: 44, h: 44 },
        { type: 'spike', x: 6760, y: GROUND_Y - 44, w: 44, h: 44 },
        { type: 'finish', x: 7400, y: GROUND_Y - 200, w: 60, h: 200 },
      ],
    },
  ];

  // ---------- ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ----------
  function setScreen(screen) {
    [menuScreen, gameScreen, deathScreen, winScreen].forEach(s => s.classList.remove('active'));
    screen.classList.add('active');
  }

  function getDifficultyLabel(diff) {
    return {
      easy: 'Легко',
      normal: 'Нормально',
      hard: 'Сложно',
      harder: 'Очень сложно',
      insane: 'Безумие',
    }[diff] || '—';
  }

  function getDifficultyClass(diff) {
    return `diff-${diff}`;
  }

  // ---------- ПОСТРОЕНИЕ МЕНЮ ----------
  function buildMenu() {
    levelGrid.innerHTML = '';
    LEVELS.forEach((lvl, i) => {
      const card = document.createElement('div');
      card.className = 'level-card';
      card.innerHTML = `
    
