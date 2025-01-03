import { Row } from './Row';
interface Project {
    project_id: number;
    project_name: string;
    description: string;
    start_date: string;
    end_date: string;
    rows: Row[];
}

export { Project };