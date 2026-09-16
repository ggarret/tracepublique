import { readFile } from "node:fs/promises";

let tasks;
try {
  tasks = JSON.parse(await readFile("agents/backlog.json", "utf8"));
} catch (error) {
  if (error?.code !== "ENOENT") throw error;
  console.log("Backlog local des agents absent : aucun lot à afficher dans ce clone public.");
}

if (tasks) {
  const done = new Set(tasks.filter((task) => task.status === "done").map((task) => task.id));
  const ready = tasks.filter((task) => task.status === "ready" && task.dependsOn.every((dependency) => done.has(dependency)));
  const queued = tasks.filter((task) => task.status === "queued");

  if (queued.length > 0) {
    console.log("Lots en attente de confirmation du thread :");
    for (const task of queued) console.log(`- ${task.id} ${task.delegatedTo ?? "(référence absente)"}`);
  }

  if (ready.length === 0) {
    console.log("Aucun lot prêt : les tâches en cours ou les dépendances doivent être finalisées.");
  } else {
    console.log("Lots prêts à déléguer :");
    for (const task of ready) console.log(`- ${task.id} [${task.priority}] ${task.role}: ${task.title}`);
  }
}
