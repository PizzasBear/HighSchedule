import {
  Component,
  For,
  createSignal,
  Switch,
  Match,
  createMemo,
} from "solid-js";
import { createStore } from "solid-js/store";
import { ident } from "./util";
import {
  WeekSchedule,
  schedules,
  teachers,
  classes,
  slots,
  timeSlots,
} from "./schedules";

import "/styles/home.scss";

export const WeekTimeTable: Component = () => {
  type Selector =
    | { type: "teacher"; value: string }
    | { type: "class"; value: string }
    | null;
  const [selector, setSelector] = createSignal<Selector>(null);

  const weekSchedule = () => {
    const sel = selector();
    return sel === null
      ? WeekSchedule.Null
      : schedules.find(o => sel.type in o && o[sel.type] === sel.value)
          ?.schedule[0]!;
  };

  return (
    <table id="time-table">
      <thead>
        <tr>
          <th scope="col">
            <select
              onChange={ev =>
                setSelector(JSON.parse(ev.target.value) as Selector)
              }
            >
              <option
                value={JSON.stringify(ident<Selector>(null))}
                disabled={true}
                hidden={true}
              >
                None
              </option>
              <optgroup label="Teachers">
                <For each={teachers}>
                  {value => (
                    <option
                      value={JSON.stringify(
                        ident<Selector>({ type: "teacher", value }),
                      )}
                    >
                      {value}
                    </option>
                  )}
                </For>
              </optgroup>
              <optgroup label="Classes">
                <For each={classes}>
                  {value => (
                    <option
                      value={JSON.stringify(
                        ident<Selector>({ type: "class", value }),
                      )}
                    >
                      {value}
                    </option>
                  )}
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
                {(slot, day) => (
                  <Switch>
                    <Match when={selector() === null}>
                      <td></td>
                    </Match>
                    <Match when={selector()?.type === "class"}>
                      <td>
                        <select
                          onChange={ev => {
                            const value = JSON.parse(ev.target.value) as
                              | { type: "window" }
                              | { type: "free"; teacher: string }
                              | { type: "slot"; slotId: number };
                          }}
                        >
                          <option value={JSON.stringify({ type: "window" })}>
                            Window
                          </option>
                          <optgroup label="Available">
                            <For
                              each={slots().filter(
                                ({ slot: newSlot }) =>
                                  slot === newSlot ||
                                  (newSlot.class === selector()?.value &&
                                    schedules
                                      .find(o => o.teacher === newSlot.teacher)
                                      ?.schedule[0].get(day(), hour) === null),
                              )}
                            >
                              {({ id, slot: newSlot }) => (
                                <option
                                  value={JSON.stringify({
                                    type: "slot",
                                    slotId: id,
                                  })}
                                  selected={newSlot === slot}
                                >
                                  {newSlot.subject} with {newSlot.teacher}
                                </option>
                              )}
                            </For>
                          </optgroup>
                          <optgroup label="Unavailable">
                            <For
                              each={slots().filter(
                                ({ slot: newSlot }) =>
                                  slot !== newSlot &&
                                  newSlot.class === selector()?.value &&
                                  schedules
                                    .find(o => o.teacher === newSlot.teacher)!
                                    .schedule[0].get(day(), hour) !== null,
                              )}
                            >
                              {({ id, slot }) => (
                                <option
                                  value={JSON.stringify({
                                    type: "slot",
                                    slotId: id,
                                  })}
                                >
                                  {slot.subject} with {slot.teacher}
                                </option>
                              )}
                            </For>
                          </optgroup>
                          <optgroup label="Free Time">
                            <For
                              each={teachers.filter(
                                teacher =>
                                  schedules
                                    .find(o => o.teacher === teacher)!
                                    .schedule[0].get(day(), hour) === null,
                              )}
                            >
                              {teacher => (
                                <option
                                  value={JSON.stringify({
                                    type: "free",
                                    teacher,
                                  })}
                                >
                                  Free time with {teacher}
                                </option>
                              )}
                            </For>
                          </optgroup>
                        </select>
                      </td>
                    </Match>
                    <Match when={selector()?.type === "teacher"}>
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

export const Home: Component = () => {
  return <WeekTimeTable />;
};
export default Home;
