import { jobCardApi } from '../../api/resources';
import { CrudListPage } from '../crud/CrudListPage';
import type { JobCard } from '../../types/entities';

export default function JobCardList() {
  return (
    <CrudListPage<JobCard>
      title="Job Cards"
      basePath="/job-cards"
      rowKey={(r) => r.job_card_id}
      list={jobCardApi.list}
      remove={jobCardApi.remove}
      columns={[
        { key: 'job_card_no', header: 'Job Card No', sortable: true },
        { key: 'job_card_type', header: 'Type' },
        { key: 'defect_summary', header: 'Defect Summary' },
        { key: 'priority', header: 'Priority' },
        { key: 'status', header: 'Status', sortable: true },
        { key: 'opened_at', header: 'Opened At', render: (r) => new Date(r.opened_at).toLocaleDateString() },
      ]}
    />
  );
}
