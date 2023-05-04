import WeekTimeTable from "./home";
import Template from "./template";

import { render } from "solid-js/web";
import { Route, Router, Routes } from "@solidjs/router";

render(
  () => (
    <Router>
      <Routes>
        <Route
          path="/"
          element={
            <Template>
              <WeekTimeTable />
            </Template>
          }
        />
      </Routes>
    </Router>
  ),
  document.getElementById("app")!,
);
