export const noneTag = "none";
export const teacherTag = "teach";
export const classTag = "cls";
export const subjectTag = "subj";

export function tag(tag: string, value: string) {
  return `${tag}:value`;
}
export function untag(tagged: string): [tag: string, value: string] | null {
  const split: string[] = tagged.split(":", 2);
  if (split.length < 2) {
    return null;
  } else {
    return split as [string, string];
  }
}

export function none(value?: string) {
  return tag(noneTag, value ?? "");
}
export function teacher(teacher: string) {
  return tag(teacherTag, teacher);
}
export function class_(class_: string) {
  return tag(classTag, class_);
}
export function subject(subject: string) {
  return tag(subjectTag, subject);
}

export function isNone(tagged: string) {
  return untag(tagged)?.[0] === noneTag;
}
export function isTeacher(tagged: string) {
  return untag(tagged)?.[0] === teacherTag;
}
export function isClass(tagged: string) {
  return untag(tagged)?.[0] === classTag;
}
export function isSubject(tagged: string) {
  return untag(tagged)?.[0] === subjectTag;
}
