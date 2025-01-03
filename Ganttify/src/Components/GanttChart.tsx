import React, { useEffect, useRef} from 'react';
import mermaid from 'mermaid';
import { Row } from '../Model/Row';

interface GanttChartProps {
  rows: Row[];
  project_name: string;
}

const GanttChart: React.FC<GanttChartProps> = ({ rows, project_name }) => {
  const chartRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    mermaid.initialize({
      startOnLoad: true,
      gantt: {
        titleTopMargin: 28,
        barHeight: 30,
        barGap: 15,
        fontSize: 20,
        tickInterval: '1 month',
        axisFormat: '%d-%m-%Y',
        weekday: 'monday',
        gridLineStartPadding: 0.5
      },
    });

    const renderChart = async () => {
      if (chartRef.current) {
        const ganttTasks = rows.map(row => {
          if (row.name && row.start_date && row.duration) {
            return `
            ${!row.idx.includes('.') ? `section ${row.name}` : ''}
            ${row.name} :${row.idx}, ${row.start_date}, ${row.duration}d
            `;
          }
          return '';
        }).filter(task => task !== '').join('\n');

        const ganttChart = `
          gantt
            title       ${project_name}
            dateFormat  YYYY-MM-DD
            ${ganttTasks}
        `;

        try {
          const { svg, bindFunctions } = await mermaid.render('ganttChart', ganttChart);
          if (chartRef.current) {
            chartRef.current.innerHTML = svg;
            bindFunctions?.(chartRef.current);
          }
        } catch (error) {
          console.error('Error rendering Gantt chart:', error);
        }
      }
    };

    renderChart();
  });

  return <div ref={chartRef}></div>;
};

export default GanttChart;
