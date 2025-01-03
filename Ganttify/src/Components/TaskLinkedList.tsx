import React from 'react';
import ReactFlow, { ReactFlowProvider, MiniMap, Controls, Background, Node, Edge, useNodesState, useEdgesState, MarkerType } from 'react-flow-renderer';
import * as dagre from 'dagre';
import { Row } from "../Model/Row";

interface TaskLinkedListProps {
  tasks: Row[];
}

const dagreGraph = new dagre.graphlib.Graph();
dagreGraph.setDefaultEdgeLabel(() => ({}));

const nodeWidth = 172;
const nodeHeight = 36;

const getLayoutedElements = (nodes: Node[], edges: Edge[]) => {
  dagreGraph.setGraph({ rankdir: 'R' });

  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight });
  });

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  nodes.forEach((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    node.position = {
      x: nodeWithPosition.x - nodeWidth / 2,
      y: nodeWithPosition.y - nodeHeight / 2,
    };
  });

  return { nodes, edges };
};

const TaskLinkedList: React.FC<TaskLinkedListProps> = ({ tasks }) => {
  const taskMap = new Map(tasks.map(task => [task.idx, task]));

  const initialNodes: Node[] = tasks.map(task => ({
    id: task.idx,
    data: { label: `${task.name} (${task.duration} days)` },
    position: { x: 0, y: 0 },
    draggable: true,
  }));

  const initialEdges: Edge[] = tasks
    .filter(task => task.previous)
    .map(task => ({
      id: `e${task.previous}-${task.idx}`,
      source: task.previous,
      target: task.idx,
      type: 'smoothstep',
      markerEnd: {
        type: MarkerType.ArrowClosed,
        color: '#6a6c8a',
      },
    }));

  const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(initialNodes, initialEdges);

  const [nodes, setNodes, onNodesChange] = useNodesState(layoutedNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(layoutedEdges);

  return (
    <ReactFlowProvider>
      <div style={{ height: 1000 }}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          fitView
        >
          <MiniMap />
          <Controls />
          <Background />
        </ReactFlow>
      </div>
    </ReactFlowProvider>
  );
};

export default TaskLinkedList;