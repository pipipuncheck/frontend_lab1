/* Календарь экскурсий на главной странице */

const MONTH_NAMES = [
  "Январь", "Февраль", "Март", "Апрель", "Май", "Июнь",
  "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь",
];

const MONTH_FORMS = [
  "января", "февраля", "марта", "апреля", "мая", "июня",
  "июля", "августа", "сентября", "октября", "ноября", "декабря",
];

/* Свободные даты по месяцам: ключ в формате «год-номер месяца». */
const FREE_DAYS = {
  "2026-07": [2, 5, 7, 12, 14, 19, 21, 26, 28],
};

function freeDaysOf(year, month) {
  const key = `${year}-${String(month + 1).padStart(2, "0")}`;
  if (FREE_DAYS[key]) return new Set(FREE_DAYS[key]);

  // Для остальных месяцев — ровный шаг, чтобы календарь не пустел.
  const total = new Date(year, month + 1, 0).getDate();
  const step = 5 + (month % 3);
  const days = new Set();
  for (let day = 1 + (month % step); day <= total; day += step) days.add(day);
  return days;
}

class ExcursionCalendar {
  constructor(root) {
    this.root = root;
    this.title = root.querySelector("[data-calendar-title]");
    this.grid = root.querySelector("[data-calendar-grid]");
    this.date = new Date(2026, 6, 1);
    this.picked = null;
  }

  init() {
    this.root.querySelector("[data-calendar-prev]")
      .addEventListener("click", () => this.shift(-1));
    this.root.querySelector("[data-calendar-next]")
      .addEventListener("click", () => this.shift(1));
    this.grid.addEventListener("keydown", (event) => this.jump(event));
    this.draw();
  }

  get year() {
    return this.date.getFullYear();
  }

  get month() {
    return this.date.getMonth();
  }

  shift(step) {
    this.date = new Date(this.year, this.month + step, 1);
    this.picked = null;
    this.draw();
  }

  draw() {
    const { year, month } = this;
    const free = freeDaysOf(year, month);
    const shift = (new Date(year, month, 1).getDay() + 6) % 7;
    const total = new Date(year, month + 1, 0).getDate();
    const cells = [];

    this.title.textContent = MONTH_NAMES[month];

    for (let i = 0; i < shift; i += 1) {
      const blank = document.createElement("span");
      blank.className = "calendar__empty";
      blank.setAttribute("aria-hidden", "true");
      cells.push(blank);
    }

    for (let day = 1; day <= total; day += 1) {
      const cell = document.createElement("button");
      cell.type = "button";
      cell.textContent = String(day);
      cell.setAttribute("aria-label", `${day} ${MONTH_FORMS[month]} ${year}`);

      if (free.has(day)) {
        cell.classList.add("is-free");
        if (this.picked === day) cell.setAttribute("aria-pressed", "true");
        cell.addEventListener("click", () => this.pick(cell, day));
      } else {
        cell.disabled = true;
      }

      cells.push(cell);
    }

    this.grid.replaceChildren(...cells);
  }

  pick(cell, day) {
    this.grid.querySelectorAll("[aria-pressed]").forEach((item) => {
      item.removeAttribute("aria-pressed");
    });
    cell.setAttribute("aria-pressed", "true");
    this.picked = day;
  }

  jump(event) {
    if (!["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(event.key)) return;

    const free = [...this.grid.querySelectorAll("button.is-free")];
    const index = free.indexOf(document.activeElement);
    if (index < 0) return;

    event.preventDefault();
    const forward = event.key === "ArrowRight" || event.key === "ArrowDown";
    free[(index + (forward ? 1 : -1) + free.length) % free.length].focus();
  }
}

const calendarRoot = document.querySelector("[data-calendar]");
if (calendarRoot) new ExcursionCalendar(calendarRoot).init();
