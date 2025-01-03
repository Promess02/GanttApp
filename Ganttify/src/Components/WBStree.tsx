import React from 'react';
import { Tooltip } from '@mui/material';
import TaskInfo from '../Components/TaskInfo.tsx';
import { Row } from '../Model/Row.tsx';
import Tree from 'react-d3-tree';
import '../styles/WBStree.css';

interface TreeNode {
    name: string;
    children: TreeNode[];
    task: Row;
}

const buildTree = (tasks: Row[]): TreeNode => {
    const rootTask: Row = {
        idx: '', name: 'Root', duration: '', start_date: '', end_date: '', hours: '', worker_id: '', parent_idx: '', previous: '', description: ''
    };

    const root: TreeNode = { name: 'Root', children: [], task: rootTask };
    const map: { [key: string]: TreeNode } = { '': root };

    tasks.forEach(task => {
        const parts = task.idx.split('.');
        let current = root;

        parts.forEach((part, index) => {
            const id = parts.slice(0, index + 1).join('.');
            if (!map[id]) {
                map[id] = { name: task.name, children: [], task: task };
                current.children.push(map[id]);
            }
            current = map[id];
        });
    });

    return root;
};

const renderNode = (rd3tProps) => {
    const { nodeDatum } = rd3tProps;
    if (rd3tProps.nodeDatum.name !== 'Root') {
      return (
        <Tooltip title={<TaskInfo task={nodeDatum.task} />} arrow>
            <g>
                <circle r={13} />
                <text fill="black" strokeWidth="1" x="-25" y="50">
                    {nodeDatum.name.length > 15 ? `${nodeDatum.name.substring(0, 18)}...` : nodeDatum.name}
                </text>
            </g>
        </Tooltip>
      );
    } else {
      return (
        <g>
            <circle r={13} />
            <text fill="black" strokeWidth="1" x="-25" y="50">
                {nodeDatum.name}
            </text>
        </g>
      );
    }
    
};

interface WBStreeProps {
    tasks: Row[];
}

const WBStree: React.FC<WBStreeProps> = ({ tasks }) => {
    const treeData = buildTree(tasks);

    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
            <div id="treeWrapper" style={{ width: '95vw', height: '80vh' }}>
                <Tree
                    data={treeData}
                    translate={{ x: (window.innerWidth / 2) - 200, y: 20 }}
                    orientation="vertical"
                    rootNodeClassName="root-node"
                    branchNodeClassName="branch-node"
                    leafNodeClassName="leaf-node"
                    pathClassFunc={() => 'link'}
                    nodeSize={{ x: 150, y: 200 }}
                    renderCustomNodeElement={renderNode}
                />
            </div>
        </div>
    );
};

export default WBStree;