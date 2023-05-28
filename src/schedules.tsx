import { createSignal } from "solid-js";
import { createStore } from "solid-js/store";
import { SigMap, StoreCell, StoreMap, tuple } from "./util";

export const timeSlots: { hour: number; start: string; end: string }[] = [
  ["8:15", "9:00"],
  ["9:00", "9:50"],
  ["10:10", "10:55"],
  ["10:55", "11:40"],
  ["11:50", "12:35"],
  ["12:35", "13:20"],
  ["13:30", "14:15"],
  ["14:15", "15:00"],
  ["15:10", "15:55"],
  ["15:55", "16:30"],
].map(([start, end], hour) => ({ hour, start, end }));

export const teachers = ["Alice", "Bob", "Charly"];
export const classes = ["a1", "b1", "b2", "c2"];
export const subjects = ["Engrish", "Hebrew", "Maths"];

export type HourSlot = {
  readonly class: string;
  readonly subject: string;
  readonly teacher: string;
};

export class WeekSchedule {
  slots: (HourSlot | null)[];

  static readonly Null = new WeekSchedule();

  constructor(slots?: (HourSlot | null)[]) {
    this.slots = slots ?? Array.from({ length: 60 }, () => null);
  }

  set(day: number, hour: number, slot: HourSlot | null) {
    this.slots[10 * day + hour] = slot;
  }

  get(day: number, hour: number): HourSlot | null {
    return this.slots[10 * day + hour];
  }

  map(
    f: (slot: HourSlot | null, day: number, hour: number) => HourSlot | null,
  ): WeekSchedule {
    return new WeekSchedule(
      this.slots.map((slot, i) => f(slot, i / 10, i % 10)),
    );
  }

  change(changes: [day: number, hour: number, slot: HourSlot | null][]) {
    const slots = [...this.slots];
    for (const [day, hour, slotId] of changes) {
      slots[10 * day + hour] = slotId;
    }
    return new WeekSchedule(slots);
  }

  clone() {
    return new WeekSchedule([...this.slots]);
  }

  getByHour(hour: number): readonly (HourSlot | null)[] {
    return Array.from({ length: 6 }, (_, i) => this.get(i, hour));
  }

  getIdByDay(day: number): readonly (HourSlot | null)[] {
    return this.slots.slice(10 * day, 10 * day + 10);
  }
}

export const [schedules, setSchedules] = createSignal(
  new StoreMap([
    ...classes.map(class_ => tuple(class_, [new WeekSchedule()])),
    ...teachers.map(teach => tuple(teach, [new WeekSchedule()])),
  ]),
  { equals: false },
);

export const [slots, setSlots] = createSignal(
  new Map<number | HourSlot, number | HourSlot>(),
  { equals: false },
);
export const [memberSlots, setMemberSlots] = createSignal(
  new SigMap(teachers.map(k => [k, new Set<HourSlot>()])),
);

export function getSlotId(slot: HourSlot): number {
  return slots().get(slot) as number;
}
export function getSlotById(id: number): HourSlot {
  return slots().get(id) as HourSlot;
}

export function applySlot(
  week: number,
  day: number,
  hour: number,
  slot: HourSlot,
) {
  setSchedules(schedules => {
    schedules.update(slot.class, week, "slots", 10 * day + hour, slot);
    schedules.update(slot.teacher, week, "slots", 10 * day + hour, slot);
    return schedules;
  });
}
export function clearSlot(
  week: number,
  day: number,
  hour: number,
  teacher: string,
  class_: string,
) {
  setSchedules(schedules => {
    schedules.update(class_, week, "slots", 10 * day + hour, null);
    schedules.update(teacher, week, "slots", 10 * day + hour, null);
    return schedules;
  });
}
let newSlotId = 0;
export function addSlot(slot: HourSlot): number {
  const id = newSlotId++;
  setSlots(slots => {
    slots.set(id, slot);
    slots.set(slot, id);
    return slots;
  });
  return id;
}
export function rmSlot(slot: HourSlot) {
  setSlots(slots => {
    const id = slots.get(slot)!;
    slots.delete(slot);
    slots.delete(id);
    return slots;
  });
  setSchedules(schedules => {
    schedules.update(slot.class, {}, "slots", s => s === slot, null);
    schedules.update(slot.teacher, {}, "slots", s => s === slot, null);
    return schedules;
  });
}

{
  const slot = { class: "b2", teacher: "Bob", subject: "Engrish" };
  addSlot(slot);
  applySlot(0, 2, 6, slot);
  applySlot(0, 2, 5, slot);
}
