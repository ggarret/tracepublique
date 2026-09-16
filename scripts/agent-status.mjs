import { readFile } from "node:fs/promises";

let tasks;
try {
  tasks = JSON.parse(await readFile("agents/backlog.json", "utf8"));
} catch (error) {
  if (error?.code !== "ENOENT") throw error;
  console.log("Backlog local des agents absent : aucun état à afficher dans ce clone public.");
}

if (tasks) {
  const counts = tasks.reduce((accumulator, task) => {
    accumulator[task.status] = (accumulator[task.status] ?? 0) + 1;
    return accumulator;
  }, {});

  console.log("État du backlog agents :");
  for (const status of ["queued", "in_progress", "review", "ready", "blocked", "done"]) {
    if (counts[status]) console.log(`- ${status}: ${counts[status]}`);
  }

  for (const task of tasks.filter((item) => item.status !== "done")) {
    const delegated = task.delegatedTo ? ` · ${task.delegatedTo}` : "";
    console.log(`${task.id} [${task.status}] ${task.role}: ${task.title}${delegated}`);
  }
}
