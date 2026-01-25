'use client';

import { useCallback } from 'react';
import ReactFlow, {
  Node,
  Edge,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  ConnectionMode,
} from 'reactflow';

interface MindMapFlowProps {
  nodes: Node[];
  edges: Edge[];
}

export default function MindMapFlow({ nodes: initialNodes, edges: initialEdges }: MindMapFlowProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  // Custom node styles
  const nodeStyles = {
    input: {
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: 'white',
      border: '2px solid rgba(255, 255, 255, 0.3)',
      borderRadius: '12px',
      padding: '16px 24px',
      fontSize: '18px',
      fontWeight: 'bold',
      boxShadow: '0 8px 32px rgba(102, 126, 234, 0.4)',
      maxWidth: '300px',
      wordWrap: 'break-word' as const,
    },
    default: {
      background: 'rgba(255, 255, 255, 0.05)',
      color: 'white',
      border: '1px solid rgba(255, 255, 255, 0.2)',
      borderRadius: '10px',
      padding: '12px 16px',
      fontSize: '13px',
      backdropFilter: 'blur(10px)',
      boxShadow: '0 4px 16px rgba(0, 0, 0, 0.2)',
      maxWidth: '250px',
      minHeight: '60px',
      wordWrap: 'break-word' as const,
      overflow: 'hidden' as const,
      textOverflow: 'ellipsis' as const,
      display: 'flex' as const,
      alignItems: 'center' as const,
    },
    output: {
      background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
      color: 'white',
      border: '2px solid rgba(255, 255, 255, 0.3)',
      borderRadius: '12px',
      padding: '16px 24px',
      fontSize: '16px',
      fontWeight: 'bold',
      boxShadow: '0 8px 32px rgba(240, 147, 251, 0.4)',
      maxWidth: '300px',
      wordWrap: 'break-word' as const,
    },
  };

  // Apply styles to nodes
  const styledNodes = nodes.map(node => ({
    ...node,
    style: nodeStyles[node.type as keyof typeof nodeStyles] || nodeStyles.default,
  }));

  return (
    <div className="w-full h-[800px] rounded-2xl overflow-hidden border border-white/20">
      <ReactFlow
        nodes={styledNodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        connectionMode={ConnectionMode.Loose}
        fitView
        attributionPosition="bottom-left"
        className="bg-gradient-to-br from-slate-900 via-purple-900/50 to-slate-900"
      >
        <Background 
          color="rgba(255, 255, 255, 0.1)" 
          gap={16} 
          size={1}
        />
        <Controls 
          className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg"
        />
        <MiniMap 
          nodeColor={(node) => {
            if (node.type === 'input') return '#667eea';
            if (node.type === 'output') return '#f093fb';
            return 'rgba(255, 255, 255, 0.2)';
          }}
          className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg"
          maskColor="rgba(0, 0, 0, 0.6)"
        />
      </ReactFlow>
    </div>
  );
}