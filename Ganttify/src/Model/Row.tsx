interface Row {
    idx: string;
    name: string;
    duration: string;
    start_date: string;
    end_date: string;
    hours: string;
    worker_id: string;
    parent_idx: string;
    previous: string;
    description: string | null | undefined;
  }

export {Row};