import { connectDB } from "@/lib/db";
import { TaskDependency } from "@/models/os/TaskDependency";

/**
 * Returns true if adding edge (taskId depends on dependsOnTaskId) would create a cycle.
 * Edge meaning: dependsOnTaskId must complete before taskId can start (dependsOn blocks task).
 */
export async function wouldCreateDependencyCycle(
  taskId: string,
  dependsOnTaskId: string
): Promise<boolean> {
  if (taskId === dependsOnTaskId) return true;
  await connectDB();

  // Walk from dependsOnTaskId following "who depends on me" inverted:
  // If taskId is reachable as an ancestor of dependsOnTaskId via existing deps, cycle.
  // Existing: A depends on B means edge B -> A (B blocks A).
  // Adding: taskId depends on dependsOnTaskId means edge dependsOnTaskId -> taskId.
  // Cycle if taskId can reach dependsOnTaskId in the graph of blockers.

  const deps = await TaskDependency.find({}).select("taskId dependsOnTaskId").lean();
  const blocks = new Map<string, string[]>();
  for (const d of deps) {
    const from = String(d.dependsOnTaskId);
    const to = String(d.taskId);
    const list = blocks.get(from) || [];
    list.push(to);
    blocks.set(from, list);
  }
  // Proposed edge
  const proposed = blocks.get(dependsOnTaskId) || [];
  proposed.push(taskId);
  blocks.set(dependsOnTaskId, proposed);

  const visited = new Set<string>();
  const stack = [taskId];
  while (stack.length) {
    const cur = stack.pop()!;
    if (cur === dependsOnTaskId) return true;
    if (visited.has(cur)) continue;
    visited.add(cur);
    for (const next of blocks.get(cur) || []) {
      stack.push(next);
    }
  }
  return false;
}

export function detectCycleInAdjacency(
  edges: { taskId: string; dependsOnTaskId: string }[],
  newEdge: { taskId: string; dependsOnTaskId: string }
): boolean {
  if (newEdge.taskId === newEdge.dependsOnTaskId) return true;
  const blocks = new Map<string, string[]>();
  for (const d of [...edges, newEdge]) {
    const from = d.dependsOnTaskId;
    const to = d.taskId;
    const list = blocks.get(from) || [];
    list.push(to);
    blocks.set(from, list);
  }
  const visited = new Set<string>();
  const stack = [newEdge.taskId];
  while (stack.length) {
    const cur = stack.pop()!;
    if (cur === newEdge.dependsOnTaskId) return true;
    if (visited.has(cur)) continue;
    visited.add(cur);
    for (const next of blocks.get(cur) || []) stack.push(next);
  }
  return false;
}
