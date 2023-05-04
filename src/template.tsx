import "/styles/template.scss";
import logo from "/static/logo.png";
import { ParentComponent } from "solid-js";

export const Template: ParentComponent = ({ children }) => {
  return <div id="template">{children}</div>;
};
export default Template;
