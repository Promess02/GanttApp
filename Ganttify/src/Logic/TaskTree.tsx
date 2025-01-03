import { Row } from "../Model/Row.tsx";
import { incrementIndex, decrementIndex, generateRow } from "../Util/UtilFunctions.tsx";

class TaskNode {
  rowIdx: string; 
  rowNumber: number; 
  row: Row; 
  children: TaskNode[]; 
  level: number;
  parent: TaskNode | null; 

  constructor(row: Row, rownumber: number, parent: TaskNode | null = null) {
    this.rowIdx = row.idx;
    this.rowNumber = rownumber;
    this.row = row;
    this.parent = parent;
    this.children = [];
    this.level = row.idx.split(".").length;
  }

  // Add a child to the node
  addChild(newChild: TaskNode) {
    this.children.push(newChild);
    this.orderChildrenByIndex();
  }

  // Remove a child along with all its subtasks
  removeChild(index: string) {
    const childIndex = this.children.findIndex(
      (child) => child.rowIdx === index
    );
    if (childIndex !== -1) {
      this.children.splice(childIndex, 1);
    }
    this.orderChildrenByIndex();
  }

  addChildren(numberOfChildren: number) {
    const baseIndex = this.rowIdx;
    const existingChildrenCount = this.children.length;
    let startIndex = existingChildrenCount + 1;

    for (let i = 0; i < numberOfChildren; i++) {
      const newIndex = `${baseIndex}.${startIndex + i}`;
      const newTask = new TaskNode(
        generateRow(newIndex, this.row.start_date, this.row.end_date, this.row.worker_id, this.row.idx),
        this.rowNumber + i + 1,
        this
      );
      this.children.push(newTask);
    }
    this.orderChildrenByIndex();
  }

  addGivenChild(child: TaskNode) {
    const baseIndex = this.rowIdx;
    const existingChildrenCount = this.children.length;
    let startIndex = existingChildrenCount + 1;
    let newIndex = `${baseIndex}.${startIndex}`;
    child.row.idx = newIndex;
    child.rowIdx = newIndex;
    child.rowNumber = this.rowNumber + 1;
    child.orderChildrenByIndex();
    let childIndex = `${newIndex}.1`;
    for (let i = 0; i < child.children.length; i++) {
      child.children[i].updateChildIndexRecursive(newIndex);
      child.children[i].row.idx = childIndex;
      child.children[i].rowIdx = childIndex;
      child.children[i].row.parent_idx = child.children[i].parent?.rowIdx || "";
      childIndex = incrementIndex(childIndex);
    }
    this.children.push(child);
    child.row.parent_idx = this.rowIdx;
    this.orderChildrenByIndex();
  }

  // Recursively update the indices of children
  updateChildIndexRecursive(newIndex: string) {
    this.rowIdx = newIndex;
    this.row.idx = newIndex;

    for (let child of this.children) {
      const childOldParts = child.rowIdx.split(".");
      const childNewParts = newIndex.split(".");
      childNewParts.push(
        String(Number(childOldParts[childOldParts.length - 1])
      ));
    
      const childNewIndex = childNewParts.join(".");

      // Recursively update the child's index and its descendants
      child.updateChildIndexRecursive(childNewIndex);
    }
  }

  orderChildrenByIndex() {
    this.children.sort((a, b) => {
      const aParts = a.rowIdx.split('.').map(Number);
      const bParts = b.rowIdx.split('.').map(Number);
  
      for (let i = 0; i < Math.min(aParts.length, bParts.length); i++) {
        if (aParts[i] !== bParts[i]) {
          return aParts[i] - bParts[i];
        }
      }
  
      return aParts.length - bParts.length;
    });
  
    for (let child of this.children) {
      child.orderChildrenByIndex();
    }
  }
}

export class TaskTree {
  public rows: Row[] = [];
  root: TaskNode;

  constructor(rows: Row[]) {
    this.root = new TaskNode(
      {
        idx: "0",
        name: "Root",
        duration: "",
        start_date: "",
        end_date: "",
        hours: "",
        worker_id: "",
        parent_idx: "",
        previous: "",
        description: ""
      },
      -1
    );
    this.rows = rows;
    this.buildTree();
  }

  // Find a node based on its index
  private findNode(
    index: string,
    currentNode: TaskNode = this.root
  ): TaskNode | null {
    const stack: TaskNode[] = [currentNode];

    // Perform depth-first search (DFS) iteratively using a stack
    while (stack.length > 0) {
      const node = stack.pop()!;

      if (node.rowIdx === index) {
        return node;
      }

      stack.push(...node.children.reverse());
    }

    // Return null if the node with the given index wasn't found
    return null;
  }

  private buildTree() {
    const nodeMap: { [key: string]: TaskNode } = {};
    let i = 0;
    for (const row of this.rows) {
      const taskNode = new TaskNode(row, i++);
      nodeMap[row.idx] = taskNode;
      if (taskNode.level === 1) {
        this.root.addChild(taskNode);
        taskNode.parent = this.root; // Set parent to root
      }
    }        

    for (const row of this.rows) {
      const taskNode = nodeMap[row.idx];
      if (taskNode.level === 1) continue;
      const parentIndex = row.idx.split(".").slice(0, -1).join(".");
      const parentNode = nodeMap[parentIndex];

      if (parentNode) {
        parentNode.addChild(taskNode);
        taskNode.parent = parentNode;
        parentNode.children.sort((a, b) => a.rowNumber - b.rowNumber);
      }
    }

    this.fixTreeAfterUpdate();
  }

  // Add a new task as a sibling to the task with the given index
  addTask(index: string) {
    const node = this.findNode(index);
    if (node && node.parent) {
      const parent = node.parent;
      parent.orderChildrenByIndex();
      const rowNumberIndex = this.rows.findIndex(
        (child) => child.idx === node.rowIdx
      );
      const childIndex = parent.children.findIndex(
        (child) => child.rowIdx === index
      );
      let newIndex = incrementIndex(index);

      // Generate a new row with a new index and default values
      const newTask = new TaskNode(
        generateRow(newIndex, parent.row.start_date, parent.row.end_date, parent.row.worker_id, parent.row.idx),
        rowNumberIndex + 1,
        parent
      );

      // Insert the new task as a sibling
      parent.children.splice(childIndex + 1, 0, newTask);

      // Shift the indices of subsequent tasks
      for (let i = childIndex + 1; i < parent.children.length; i++) {
        parent.children[i].updateChildIndexRecursive(newIndex);
        newIndex = incrementIndex(newIndex);
      }
      // Update the last-child flag
      this.fixTreeAfterUpdate();
    }
  }

  // Remove a task and its children from the tree and the rows array
  removeTask(index: string) {
    const node = this.findNode(index);
    if (node && node.parent) {
      const parent = node.parent;
      parent.orderChildrenByIndex();
      const childIndex = parent.children.findIndex(
        (child) => child.rowIdx === index
      );

      node.parent.removeChild(index);
      // Shift the indices of subsequent tasks
      for (let i = childIndex; i < parent.children.length; i++) {
        const child = parent.children[i];
        const childNewIndex = decrementIndex(child.rowIdx);
        child.rowIdx = childNewIndex;
        child.row.idx = childNewIndex;
        child.updateChildIndexRecursive(childNewIndex);
      }

      this.fixTreeAfterUpdate();
    }
  }

  addSubtasks(index: string, numSubtasks: number) {
    const node = this.findNode(index);
    if (node && node.parent) {
      node.addChildren(numSubtasks);
      this.fixTreeAfterUpdate();
    }
  }

  // make the task with selected index a child of the task with the index of the previous sibling
  indentTask(index: string) {
    const node = this.findNode(index);
    if (node && node.parent) {
      const parent = node.parent;
      parent.orderChildrenByIndex();
      const childIndex = parent.children.findIndex(
        (child) => child.rowIdx === index
      );
      const previousSiblingIndex = childIndex - 1;

      if (previousSiblingIndex >= 0) {
        const previousSibling = parent.children[previousSiblingIndex];
        for (let i = childIndex+1; i < parent.children.length; i++) {
          const child = parent.children[i];
          const childNewIndex = decrementIndex(child.rowIdx);
          child.rowIdx = childNewIndex;
          child.row.idx = childNewIndex;
          child.updateChildIndexRecursive(childNewIndex);
        }
        previousSibling.addGivenChild(node);
        parent.children.splice(childIndex,1);
      }
      this.fixTreeAfterUpdate();
    }
  }

  // make the task with selected index a sibling of the parent task 
  outdentTask(index: string) {
    const node = this.findNode(index);
    if (node && node.parent) {
      const parent = node.parent;
      parent.orderChildrenByIndex();
      const grandParent = parent.parent;

      if (grandParent) {
        grandParent.orderChildrenByIndex();
        const parentIndex = grandParent.children.findIndex((child) => child.rowIdx === parent.rowIdx);
        const childIndex = parent.children.findIndex((child) => child.rowIdx === index);
        for (let i = childIndex+1; i < parent.children.length; i++) {
          const child = parent.children[i];
          const childNewIndex = decrementIndex(child.rowIdx);
          child.rowIdx = childNewIndex;
          child.row.idx = childNewIndex;
          child.updateChildIndexRecursive(childNewIndex);
        }
        for (let i=parentIndex+1; i<grandParent.children.length; i++) {
          const child = grandParent.children[i];
          const childNewIndex = incrementIndex(child.rowIdx);
          child.rowIdx = childNewIndex;
          child.row.idx = childNewIndex;
          child.updateChildIndexRecursive(childNewIndex);
        }
        const newIndex = incrementIndex(parent.rowIdx);
        node.rowIdx = newIndex;
        node.row.idx = newIndex;
        node.parent = grandParent;
        node.row.parent_idx = grandParent.rowIdx;
        node.updateChildIndexRecursive(node.rowIdx);
        grandParent.children.splice(parentIndex+1,0, node);
        parent.children.splice(childIndex,1);
        this.fixTreeAfterUpdate();
      }
    }
  }

  private fixTreeAfterUpdate() {
    this.root.orderChildrenByIndex();
    this.assignRowNumbers();
    this.mapTreeToRows();
  }

  assignRowNumbers() {
    let currentRowNumber = 0;

    const assignRowNumberRecursive = (node: TaskNode) => {
      node.rowNumber = currentRowNumber++;
      for (let child of node.children) {
        assignRowNumberRecursive(child);
      }
    };

    assignRowNumberRecursive(this.root);
  }

  mapTreeToRows() {
    const rows: Row[] = [];

    const mapTreeToRowsRecursive = (node: TaskNode) => {
      if (node.row.idx !== "0") rows.push(node.row);
      node.children.sort((a, b) => a.rowNumber - b.rowNumber);
      for (let child of node.children) {
        mapTreeToRowsRecursive(child);
      }
    };

    mapTreeToRowsRecursive(this.root);
    this.rows = rows;
  }
}
