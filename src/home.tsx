import {
  Component,
  createMemo,
  Index,
  For,
  createSignal,
  Accessor,
  Setter,
  Show,
  Switch,
  Match,
} from "solid-js";
import { createStore, reconcile } from "solid-js/store";

import "/styles/home.scss";
import * as tags from "./tags";

const timeSlots: { hour: number; start: string; end: string }[] = [
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

const teachers = ["Alice", "Bob", "Charly"];
const classes = ["a1", "b1", "b2", "c2"];
const subjects = ["英語", "Hebrew", "Maths"];

type HourSlot = { class: string; subject: string; teacher: string };

class WeekSchedule {
  slots: (HourSlot | null)[];

  static readonly Null = new WeekSchedule();

  constructor() {
    this.slots = Array.from({ length: 60 }, () => null);
  }

  get(day: number, hour: number): HourSlot | null {
    return this.slots[10 * day + hour];
  }

  set(day: number, hour: number, slot: HourSlot | null) {
    this.slots[10 * day + hour] = slot;
  }

  getByHour(hour: number): (HourSlot | null)[] {
    return Array.from({ length: 6 }, (_, i) => this.slots[10 * i + hour]);
  }

  getByDay(day: number): (HourSlot | null)[] {
    return this.slots.slice(10 * day, 10 * day + 10);
  }
}

const [schedules, setSchedules] = createSignal(
  new Map([
    [tags.none(), [WeekSchedule.Null]],
    ...classes.map<[string, WeekSchedule[]]>(k => [
      tags.class_(k),
      [new WeekSchedule()],
    ]),
    ...teachers.map<[string, WeekSchedule[]]>(k => [
      tags.teacher(k),
      [new WeekSchedule()],
    ]),
  ]),
  {
    equals: false,
  },
);

function applySlot(week: number, day: number, hour: number, slot: HourSlot) {
  setSchedules(map => {
    map.get(tags.class_(slot.class))![week].set(day, hour, slot);
    map.get(tags.teacher(slot.teacher))![week].set(day, hour, slot);
    return map;
  });
}
function dbg<T>(x: T): T {
  console.log(x);
  return x;
}

applySlot(0, 2, 6, { class: "b2", teacher: "Bob", subject: "英語" });
applySlot(0, 2, 5, { class: "b2", teacher: "Bob", subject: "英語" });

console.log(applySlot);

export const WeekTimeTable: Component = () => {
  const [selector, setSelector] = createSignal<string>(tags.none());

  const weekSchedule = () => {
    return schedules().get(selector())![0];
  };

  return (
    <table id="time-table">
      <thead>
        <tr>
          <th scope="col">
            <select onChange={ev => setSelector(ev.target.value)}>
              <option value={tags.none()} disabled={true} hidden={true}>
                None
              </option>
              <optgroup label="Teachers">
                <For each={teachers}>
                  {tch => <option value={tags.teacher(tch)}>{tch}</option>}
                </For>
              </optgroup>
              <optgroup label="Classes">
                <For each={classes}>
                  {cls => <option value={tags.class_(cls)}>{cls}</option>}
                </For>
              </optgroup>
            </select>
          </th>
          <th scope="col">Sunday</th>
          <th scope="col">Monday</th>
          <th scope="col">Tuesday</th>
          <th scope="col">Wednesday</th>
          <th scope="col">Thursday</th>
          <th scope="col">Friday</th>
        </tr>
      </thead>
      <tbody>
        <For each={timeSlots}>
          {({ hour, start, end }) => (
            <tr>
              <th scope="row">
                {hour + 1}
                <br />
                <small style={{ "font-weight": "normal" }}>
                  {start} - {end}
                </small>
              </th>
              <For each={weekSchedule().getByHour(hour)}>
                {slot => (
                  <Switch>
                    <Match when={tags.isNone(selector())}>
                      <td></td>
                    </Match>
                    <Match when={tags.isClass(selector())}>
                      <td>{slot ? `${slot.subject} / ${slot.teacher}` : ""}</td>
                    </Match>
                    <Match when={tags.isTeacher(selector())}>
                      <td>{slot ? `${slot.subject} to ${slot.class}` : ""}</td>
                    </Match>
                  </Switch>
                )}
              </For>
            </tr>
          )}
        </For>
      </tbody>
    </table>
  );
};
export default WeekTimeTable;
